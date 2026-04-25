'use strict';

const { spawn } = require('child_process');
const path = require('path');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const desktopDir = path.resolve(__dirname, '..');

function run(command, args, cwd, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`));
    });

    child.on('error', reject);
  });
}

async function main() {
  await run(npmCmd, ['run', 'prepare:backend'], desktopDir);
  await run(npmCmd, ['run', 'build:renderer'], desktopDir);

  const env = {
    ...process.env,
    CSC_IDENTITY_AUTO_DISCOVERY: 'false',
  };

  await run(npmCmd, ['exec', 'electron-builder', '--', '--win', 'nsis'], desktopDir, env);
}

main().catch((err) => {
  console.error('[desktop] dist:win failed:', err.message);
  process.exit(1);
});
