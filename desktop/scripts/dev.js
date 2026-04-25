'use strict';

const { spawn } = require('child_process');
const path = require('path');

const electronBin = path.resolve(__dirname, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'electron.cmd' : 'electron');
const env = Object.fromEntries(Object.entries({
  ...process.env,
  ELECTRON_RENDERER_URL: 'http://localhost:3000',
}).filter(([, value]) => value !== undefined));

const child = spawn(electronBin, ['.'], {
  cwd: path.resolve(__dirname, '..'),
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
