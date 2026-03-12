import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

async function loadTranslation(filePath) {
  if (filePath.endsWith('.mjs')) {
    const mod = await import(pathToFileURL(filePath).href);
    return mod.default ?? mod.vi ?? {};
  }
  if (filePath.endsWith('.js')) {
    const mod = require(filePath);
    return mod.default ?? mod.vi ?? {};
  }
  return {};
}

async function main() {
  const appRoot = path.resolve(__dirname, '..');
  const nodeModules = path.join(appRoot, 'node_modules', '@strapi');

  const coreViPath = path.join(
    nodeModules,
    'admin',
    'dist',
    'admin',
    'admin',
    'src',
    'translations',
    'vi.json.js'
  );
  const coreEnPath = path.join(
    nodeModules,
    'admin',
    'dist',
    'admin',
    'admin',
    'src',
    'translations',
    'en.json.js'
  );

  const allFiles = walk(nodeModules);
  const pluginViFiles = allFiles.filter((p) =>
    p.includes(path.join('dist', 'admin', 'translations')) &&
    (p.endsWith('vi.json.mjs') || p.endsWith('vi.json.js'))
  );
  const pluginEnFiles = allFiles.filter((p) =>
    p.includes(path.join('dist', 'admin', 'translations')) &&
    (p.endsWith('en.json.mjs') || p.endsWith('en.json.js'))
  );

  const merged = {};
  const english = {};

  if (fs.existsSync(coreEnPath)) {
    Object.assign(english, await loadTranslation(coreEnPath));
  }

  for (const filePath of pluginEnFiles) {
    try {
      Object.assign(english, await loadTranslation(filePath));
    } catch {
      // ignore broken plugin translations
    }
  }

  if (fs.existsSync(coreViPath)) {
    Object.assign(merged, await loadTranslation(coreViPath));
  }

  for (const filePath of pluginViFiles) {
    try {
      Object.assign(merged, await loadTranslation(filePath));
    } catch {
      // ignore broken plugin translations
    }
  }

  // Fill missing keys with English to avoid MISSING_TRANSLATION noise
  Object.assign(merged, english, merged);

  const customPath = path.join(appRoot, 'src', 'admin', 'extensions', 'translations', 'vi.json');
  if (fs.existsSync(customPath)) {
    const custom = JSON.parse(fs.readFileSync(customPath, 'utf8'));
    Object.assign(merged, custom);
  }

  const outPath = path.join(appRoot, 'src', 'admin', 'extensions', 'translations', 'vi.merged.json');
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`Merged vi translations: ${Object.keys(merged).length} keys -> ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
