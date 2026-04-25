'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const backendDir = path.join(root, 'backend');
const desktopDir = path.resolve(__dirname, '..');
const bundleDir = path.join(desktopDir, 'backend-bundle');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resetBundleDir(dirPath) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      fs.mkdirSync(dirPath, { recursive: true });
      return;
    } catch (err) {
      if (attempt === 4) {
        throw err;
      }
      await sleep(500 * attempt);
    }
  }
}

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} ${args.join(' ')} failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

function copy(srcRelPath) {
  const src = path.join(backendDir, srcRelPath);
  const dest = path.join(bundleDir, srcRelPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
}

async function main() {
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  console.log('[desktop] Preparing backend bundle...');
  await resetBundleDir(bundleDir);

  copy('server.js');
  copy('package.json');
  copy('package-lock.json');
  copy('src');

  console.log('[desktop] Installing backend production dependencies in bundle...');
  await run(npmCmd, ['ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'], bundleDir);

  console.log(`[desktop] Backend bundle prepared at ${bundleDir}`);
}

main().catch((err) => {
  console.error('[desktop] Failed to prepare backend bundle:', err.message);
  process.exit(1);
});
