import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const strapiBin = path.join(rootDir, 'node_modules', '@strapi', 'strapi', 'bin', 'strapi.js');

const mode = process.argv[2] ?? 'develop';
const allowedModes = new Set(['develop', 'start']);

if (!allowedModes.has(mode)) {
  console.error('[Lite Mode] Invalid mode. Use "develop" or "start".');
  process.exit(1);
}

const env = {
  ...process.env,
  REDIS_ENABLED: 'false',
  BULLMQ_ENABLED: 'false',
};

console.log('[Lite Mode] Redis and BullMQ disabled for local FE/BE testing.');
console.log(`[Lite Mode] Starting Strapi in "${mode}" mode.`);

const child = spawn(process.execPath, ['--max-old-space-size=4096', strapiBin, mode], {
  cwd: rootDir,
  env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

