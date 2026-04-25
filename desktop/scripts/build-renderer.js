'use strict';

const { spawn } = require('child_process');
const path = require('path');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontendDir = path.resolve(__dirname, '..', '..', 'frontend');
const env = Object.fromEntries(Object.entries({
  ...process.env,
  VITE_API_URL: 'http://127.0.0.1:5000/api',
  VITE_SOCKET_URL: 'http://127.0.0.1:5000',
}).filter(([, value]) => value !== undefined));

const child = spawn(npmCmd, ['run', 'build'], {
  cwd: frontendDir,
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
