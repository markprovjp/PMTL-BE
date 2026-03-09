const { spawn } = require('child_process');

function runScript(script, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: { ...process.env, ...extraEnv },
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${script} exited with code ${code}`));
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedFull() {
  const blogCount = Number(process.env.SEED_BLOG_COUNT || 300);

  console.log('\n=============================================');
  console.log('--- STARTING PMTL FULL SEED ---');
  console.log(`--- BULK BLOG COUNT: ${blogCount} ---`);
  console.log('=============================================\n');

  await runScript('scripts/seed-test.js');
  await wait(3000);
  await runScript('scripts/seed-rich.js');
  await wait(3000);
  await runScript('scripts/seed-internal.js', {
    SEED_BLOG_COUNT: String(blogCount),
  });

  console.log('\n=============================================');
  console.log('--- PMTL FULL SEED COMPLETE ---');
  console.log('=============================================\n');
}

if (require.main === module) {
  seedFull()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n❌ FULL SEED FAILED:', err);
      process.exit(1);
    });
}

module.exports = { seedFull };
