import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const action = process.argv[2] ?? 'generate';
const passthroughArgs = process.argv.slice(3);
const require = createRequire(import.meta.url);
const ts = require('typescript');
const outputDir = process.env.STRAPI_TYPES_OUTPUT
  ? path.resolve(process.cwd(), process.env.STRAPI_TYPES_OUTPUT)
  : path.resolve(process.cwd(), '..', 'fe-pmtl', 'types', 'generated', 'strapi-client');
const appDir = process.cwd();
const srcDir = path.join(appDir, 'src');
const watchIntervalMs = Number.parseInt(process.env.STRAPI_TYPES_WATCH_INTERVAL_MS ?? '15000', 10);

const typedClientRoot = path.resolve(appDir, 'node_modules', 'strapi-typed-client', 'dist');
const moduleUrl = (...segments) => pathToFileURL(path.join(...segments)).href;

const { transformSchema } = await import(moduleUrl(typedClientRoot, 'core', 'schema-transformer.js'));
const { TypesGenerator } = await import(moduleUrl(typedClientRoot, 'generator', 'types-generator.js'));
const { ClientGenerator } = await import(moduleUrl(typedClientRoot, 'generator', 'client-generator.js'));
const { IndexGenerator } = await import(moduleUrl(typedClientRoot, 'generator', 'index-generator.js'));
const endpointsServiceFactory = (await import(
  moduleUrl(typedClientRoot, 'plugin', 'server', 'src', 'services', 'endpoints.js')
)).default;
const { computeSchemaHash } = await import(moduleUrl(typedClientRoot, 'shared', 'schema-hash.js'));
const {
  generateSchemaMetaContent,
  getSchemaMetaPath,
  readLocalSchemaHash,
} = await import(moduleUrl(typedClientRoot, 'cli', 'utils', 'file-writer.js'));

function hasGeneratedFiles() {
  return ['types.d.ts', 'client.d.ts', 'index.d.ts']
    .every((fileName) => fs.existsSync(path.join(outputDir, fileName)));
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function compileGeneratedFiles(files) {
  const compilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
    declaration: true,
    esModuleInterop: true,
    skipLibCheck: true,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  };

  const host = ts.createCompilerHost(compilerOptions);
  const fileNames = Object.keys(files);
  const originalGetSourceFile = host.getSourceFile;
  const originalFileExists = host.fileExists;
  const outputs = {};

  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
    if (files[fileName]) {
      return ts.createSourceFile(fileName, files[fileName], languageVersion, true);
    }

    return originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
  };

  host.fileExists = (fileName) => {
    if (files[fileName]) {
      return true;
    }

    return originalFileExists(fileName);
  };

  host.writeFile = (fileName, data) => {
    outputs[fileName] = data;
  };

  const program = ts.createProgram(fileNames, compilerOptions, host);
  program.emit();

  ensureDir(outputDir);

  for (const [fileName, data] of Object.entries(outputs)) {
    fs.writeFileSync(path.join(outputDir, fileName), data, 'utf-8');
  }
}

async function emitGeneratedContracts(parsedSchema, endpoints, extraTypes) {
  const typesContent = new TypesGenerator().generate(parsedSchema);
  const clientContent = new ClientGenerator().generate(parsedSchema, endpoints, extraTypes);
  const indexContent = new IndexGenerator().generate();
  const files = {
    'types.ts': typesContent,
    'client.ts': clientContent,
    'index.ts': indexContent,
  };

  compileGeneratedFiles(files);

  // `types.ts` is declaration-only content already; keep an explicit .d.ts for consumers.
  if (!fs.existsSync(path.join(outputDir, 'types.d.ts'))) {
    fs.writeFileSync(path.join(outputDir, 'types.d.ts'), typesContent, 'utf-8');
  }
}

function walkFiles(dirPath, matcher, results = []) {
  if (!fs.existsSync(dirPath)) {
    return results;
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      walkFiles(fullPath, matcher, results);
      continue;
    }

    if (matcher(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function buildContentTypes() {
  const contentTypes = {};
  const apiSchemaFiles = walkFiles(
    path.join(srcDir, 'api'),
    (filePath) => /content-types[\\/][^\\/]+[\\/]schema\.json$/.test(filePath),
  );

  for (const filePath of apiSchemaFiles) {
    const match = filePath.match(/src[\\/]api[\\/]([^\\/]+)[\\/]content-types[\\/]([^\\/]+)[\\/]schema\.json$/);

    if (!match) {
      continue;
    }

    const [, apiName, contentTypeName] = match;
    const schema = readJsonFile(filePath);
    const uid = `api::${apiName}.${contentTypeName}`;

    contentTypes[uid] = {
      uid,
      kind: schema.kind ?? 'collectionType',
      collectionName: schema.collectionName,
      info: {
        singularName: schema.info?.singularName ?? contentTypeName,
        pluralName: schema.info?.pluralName ?? `${contentTypeName}s`,
        displayName: schema.info?.displayName ?? contentTypeName,
        description: schema.info?.description,
      },
      attributes: schema.attributes ?? {},
    };
  }

  const usersPermissionsUser = require(
    path.join(
      appDir,
      'node_modules',
      '@strapi',
      'plugin-users-permissions',
      'server',
      'content-types',
      'user',
      'index.js',
    ),
  );

  contentTypes['plugin::users-permissions.user'] = {
    uid: 'plugin::users-permissions.user',
    kind: 'collectionType',
    collectionName: usersPermissionsUser.collectionName,
    info: {
      singularName: usersPermissionsUser.info?.singularName ?? 'user',
      pluralName: usersPermissionsUser.info?.pluralName ?? 'users',
      displayName: usersPermissionsUser.info?.displayName ?? 'User',
      description: usersPermissionsUser.info?.description,
    },
    attributes: usersPermissionsUser.attributes ?? {},
  };

  return contentTypes;
}

function buildComponents() {
  const components = {};
  const componentSchemaFiles = walkFiles(
    path.join(srcDir, 'components'),
    (filePath) => filePath.endsWith('.json'),
  );

  for (const filePath of componentSchemaFiles) {
    const relativePath = path.relative(path.join(srcDir, 'components'), filePath);
    const segments = relativePath.split(path.sep);

    if (segments.length < 2) {
      continue;
    }

    const category = segments[0];
    const componentName = path.basename(filePath, '.json');
    const uid = `${category}.${componentName}`;
    const schema = readJsonFile(filePath);

    components[uid] = {
      uid,
      category,
      info: {
        displayName: schema.info?.displayName ?? componentName,
        description: schema.info?.description,
      },
      attributes: schema.attributes ?? {},
    };
  }

  return components;
}

async function loadSchemaSnapshot() {
  const schema = {
    contentTypes: buildContentTypes(),
    components: buildComponents(),
  };

  const fakeStrapi = {
    dirs: {
      app: {
        root: appDir,
      },
    },
    api: {},
    contentTypes: schema.contentTypes,
    log: {
      debug() {},
    },
    plugin() {
      return undefined;
    },
  };

  const endpointsService = endpointsServiceFactory({ strapi: fakeStrapi });
  const endpointsResult = endpointsService.extractEndpoints();
  const endpoints = endpointsResult.endpoints ?? [];
  const extraTypes = endpointsResult.extraTypes ?? [];
  const hash = computeSchemaHash({ schema, endpoints, extraTypes });

  return {
    schema,
    endpoints,
    pluginEndpoints: [],
    extraTypes,
    hash,
    generatedAt: new Date().toISOString(),
  };
}

async function generateTypes({ force = false, silent = false } = {}) {
  const localHash = readLocalSchemaHash(outputDir);
  const snapshot = await loadSchemaSnapshot();

  if (!force && localHash && localHash === snapshot.hash && hasGeneratedFiles()) {
    if (!silent) {
      console.log(`Types are up to date (hash: ${snapshot.hash.slice(0, 8)}...)`);
    }

    return { changed: false, hash: snapshot.hash };
  }

  if (!silent) {
    console.log('Generating Strapi typed contracts from local schema...');
    console.log(`  Content types: ${Object.keys(snapshot.schema.contentTypes).length}`);
    console.log(`  Components: ${Object.keys(snapshot.schema.components).length}`);
    console.log(
      `  Custom endpoints: ${[...(snapshot.endpoints ?? []), ...(snapshot.pluginEndpoints ?? [])].length}`,
    );
  }

  const parsedSchema = transformSchema(snapshot.schema);
  await emitGeneratedContracts(
    parsedSchema,
    [...(snapshot.endpoints ?? []), ...(snapshot.pluginEndpoints ?? [])],
    snapshot.extraTypes ?? [],
  );

  fs.writeFileSync(
    getSchemaMetaPath(outputDir),
    generateSchemaMetaContent(snapshot.hash, snapshot.generatedAt),
    'utf-8',
  );

  if (!silent) {
    console.log(`Generated contracts -> ${outputDir}`);
    console.log(`Schema hash: ${snapshot.hash.slice(0, 8)}...`);
  }

  return { changed: true, hash: snapshot.hash };
}

async function checkTypes() {
  const localHash = readLocalSchemaHash(outputDir);

  if (!localHash || !hasGeneratedFiles()) {
    console.error('Typed contracts are missing. Run `npm run types:generate`.');
    process.exit(1);
  }

  const snapshot = await loadSchemaSnapshot();

  if (snapshot.hash !== localHash) {
    console.error(
      `Typed contracts are stale (${localHash.slice(0, 8)}... -> ${snapshot.hash.slice(0, 8)}...).`,
    );
    process.exit(1);
  }

  console.log(`Typed contracts are current (hash: ${snapshot.hash.slice(0, 8)}...).`);
}

async function watchTypes() {
  console.log(`Watching Strapi schema every ${watchIntervalMs}ms...`);
  await generateTypes({ silent: false });

  const timer = setInterval(async () => {
    try {
      const result = await generateTypes({ silent: true });

      if (result.changed) {
        console.log(`Regenerated typed contracts (hash: ${result.hash.slice(0, 8)}...)`);
      }
    } catch (error) {
      console.error('[strapi-types-runner] Watch cycle failed:', error);
    }
  }, watchIntervalMs);

  const stop = () => {
    clearInterval(timer);
    process.exit(0);
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

try {
  if (action === 'generate') {
    await generateTypes({ force: passthroughArgs.includes('--force') });
  } else if (action === 'check') {
    await checkTypes();
  } else if (action === 'watch') {
    await watchTypes();
  } else {
    console.error(`Unsupported action: ${action}`);
    process.exit(1);
  }
} catch (error) {
  console.error('[strapi-types-runner] Failed:', error);
  process.exit(1);
}
