'use strict';

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontendDir = path.resolve(__dirname, '..', '..', 'frontend');
const env = Object.fromEntries(Object.entries({
  ...process.env,
  VITE_API_URL: 'http://127.0.0.1:5000/api',
  VITE_SOCKET_URL: 'http://127.0.0.1:5000',
  VITE_BASE_PATH: './',
}).filter(([, value]) => value !== undefined));

function run(command, args, cwd, childEnv = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: childEnv,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`));
      }
    });
    child.on('error', reject);
  });
}

function hasFrontendDependenciesInstalled() {
  const viteBin = process.platform === 'win32'
    ? path.join(frontendDir, 'node_modules', '.bin', 'vite.cmd')
    : path.join(frontendDir, 'node_modules', '.bin', 'vite');
  return fs.existsSync(viteBin);
}

function writeDesktopRuntimeConfig() {
  const distDir = path.join(frontendDir, 'dist');
  const runtimeConfigPath = path.join(distDir, 'runtime-config.js');
  const runtimeConfig = {
    apiBaseUrl: env.VITE_API_URL,
    socketBaseUrl: env.VITE_SOCKET_URL,
    authStorageKey: 'devibe_oms_auth',
  };

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(
    runtimeConfigPath,
    `window.__DEVIBE_RUNTIME_CONFIG__ = ${JSON.stringify(runtimeConfig, null, 2)};\n`,
    'utf8'
  );
  console.log(`[desktop] Wrote ${runtimeConfigPath}`);
}

async function main() {
  if (!hasFrontendDependenciesInstalled()) {
    console.log('[desktop] frontend dependencies missing; running npm ci...');
    await run(npmCmd, ['ci', '--no-audit', '--no-fund'], frontendDir);
  }

  await run(npmCmd, ['run', 'build'], frontendDir, env);
  writeDesktopRuntimeConfig();
}

main().catch((err) => {
  console.error('[desktop] build:renderer failed:', err.message);
  process.exit(1);
});
