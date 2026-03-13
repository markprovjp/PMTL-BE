import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';

const appRoot = process.cwd();
const cacheDir = path.join(appRoot, '.tmp', 'i18n');
const cachePath = path.join(cacheDir, 'vi-schema-signature.json');
const viPath = path.join(appRoot, 'src', 'admin', 'extensions', 'translations', 'vi.json');
const mergedPath = path.join(appRoot, 'src', 'admin', 'extensions', 'translations', 'vi.merged.json');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

function getSchemaFiles() {
  const roots = [
    path.join(appRoot, 'src', 'api'),
    path.join(appRoot, 'src', 'components'),
    path.join(appRoot, 'src', 'extensions'),
  ];

  return roots
    .flatMap((root) => walk(root))
    .filter((filePath) => filePath.endsWith('schema.json'))
    .sort();
}

function computeSchemaHash(schemaFiles) {
  const hash = crypto.createHash('sha256');
  for (const filePath of schemaFiles) {
    const relative = path.relative(appRoot, filePath).replace(/\\/g, '/');
    hash.update(relative);
    hash.update('\n');
    hash.update(fs.readFileSync(filePath));
    hash.update('\n');
  }
  return hash.digest('hex');
}

function loadPreviousHash() {
  if (!fs.existsSync(cachePath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    return typeof parsed?.schemaHash === 'string' ? parsed.schemaHash : null;
  } catch {
    return null;
  }
}

function saveHash(schemaHash, fileCount) {
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(
    cachePath,
    JSON.stringify(
      {
        schemaHash,
        fileCount,
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    ),
    'utf8'
  );
}

function runNodeScript(relativeScriptPath) {
  const scriptPath = path.join(appRoot, relativeScriptPath);
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: 'inherit',
    cwd: appRoot,
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runI18nBuild() {
  runNodeScript(path.join('scripts', 'generate-admin-vi-fields.mjs'));
  runNodeScript(path.join('scripts', 'build-admin-vi.mjs'));
}

function main() {
  const schemaFiles = getSchemaFiles();
  const schemaHash = computeSchemaHash(schemaFiles);
  const previousHash = loadPreviousHash();
  const translationsReady = fs.existsSync(viPath) && fs.existsSync(mergedPath);

  if (previousHash === schemaHash && translationsReady) {
    console.log('[i18n:vi] schema unchanged. skip.');
    return;
  }

  console.log(`[i18n:vi] schema changed (${schemaFiles.length} schema files). regenerate translations...`);
  runI18nBuild();
  saveHash(schemaHash, schemaFiles.length);
  console.log('[i18n:vi] done.');
}

main();
