import fs from 'node:fs/promises';
import path from 'node:path';

const serverPath = path.join(
  process.cwd(),
  'node_modules',
  'tree-menus',
  'dist',
  'server',
  'index.js'
);

const adminPath = path.join(
  process.cwd(),
  'node_modules',
  'tree-menus',
  'dist',
  '_chunks',
  'TreeInput-B4_FLdq4.js'
);

async function patchServer() {
  const source = await fs.readFile(serverPath, 'utf8');

  let next = source;

  next = next.replace(
    /pluginOptions:\s*\{\s*i18n:\s*\{\s*localized:\s*true\s*\}\s*\},\s*type:\s*"string"/g,
    'type: "string"'
  );

  next = next.replace(
    /pluginOptions:\s*\{\s*i18n:\s*\{\s*localized:\s*true\s*\}\s*\},\s*type:\s*"uid"/g,
    'type: "uid"'
  );

  next = next.replace(
    /items:\s*\{\s*pluginOptions:\s*\{\s*i18n:\s*\{\s*localized:\s*true\s*\}\s*\},/g,
    'items: {'
  );

  if (next !== source) {
    await fs.writeFile(serverPath, next, 'utf8');
    return true;
  }

  return false;
}

async function patchAdmin() {
  const source = await fs.readFile(adminPath, 'utf8');
  const search = `  ({ hint, disabled = false, labelAction, label, name, required = false, onChange, value = [], error, ...props }, forwardedRef) => {
    const {
      attribute: {
        options: { schemas }
      }
    } = props;
    let _schemas;
    if (!schemas) {
      console.log("no schema");
      _schemas = index.fieldSchema;
    } else {
      console.log("schema from options");
      _schemas = JSON.parse(schemas);
    }`;

  const replacement = `  ({ hint, disabled = false, labelAction, label, name, required = false, onChange, value = [], error, ...props }, forwardedRef) => {
    const schemas = props?.attribute?.options?.schemas;
    let _schemas = index.fieldSchema;
    if (schemas) {
      try {
        _schemas = typeof schemas === "string" ? JSON.parse(schemas) : schemas;
      } catch (error) {
        console.warn("tree-menus: invalid schemas option, fallback to default", error);
      }
    }
    if (!_schemas || !Array.isArray(_schemas.attributes)) {
      _schemas = index.fieldSchema;
    }`;

  if (!source.includes(search) && source.includes(replacement)) {
    return false;
  }

  if (!source.includes(search)) {
    throw new Error('expected tree-menus admin snippet not found');
  }

  await fs.writeFile(adminPath, source.replace(search, replacement), 'utf8');
  return true;
}

async function main() {
  try {
    const [serverPatched, adminPatched] = await Promise.all([patchServer(), patchAdmin()]);
    console.log(
      `[patch-tree-menus-plugin] server=${serverPatched ? 'patched' : 'ok'} admin=${adminPatched ? 'patched' : 'ok'}`
    );
  } catch (error) {
    console.error('[patch-tree-menus-plugin] failed:', error);
    process.exitCode = 1;
  }
}

await main();
