import fs from 'node:fs/promises';
import path from 'node:path';

const targetPath = path.join(
  process.cwd(),
  'node_modules',
  'strapi-plugin-soft-delete-contents',
  'dist',
  'server',
  'index.js'
);

const search = `const getSoftDeletedByAuth = (auth) => {
  const id = auth.credentials?.id || null;
  const strategy = auth.strategy.name;
  return { id, strategy };
};`;

const replacement = `const getSoftDeletedByAuth = (auth) => {
  if (!auth) {
    return { id: null, strategy: "guest" };
  }
  const id = auth.credentials?.id || null;
  const strategy = auth.strategy?.name || "guest";
  return { id, strategy };
};`;

async function main() {
  try {
    const source = await fs.readFile(targetPath, 'utf8');

    if (source.includes(replacement)) {
      console.log('[patch-soft-delete-plugin] already patched.');
      return;
    }

    if (!source.includes(search)) {
      throw new Error('expected soft-delete auth snippet not found');
    }

    await fs.writeFile(targetPath, source.replace(search, replacement), 'utf8');
    console.log('[patch-soft-delete-plugin] patched soft-delete auth guard.');
  } catch (error) {
    console.error('[patch-soft-delete-plugin] failed:', error);
    process.exitCode = 1;
  }
}

await main();
