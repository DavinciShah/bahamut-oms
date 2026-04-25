'use strict';

const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let backendProcess;

function getBackendEntry() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend', 'server.js');
  }
  return path.resolve(__dirname, '..', 'backend', 'server.js');
}

function getBackendCwd() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend');
  }
  return path.resolve(__dirname, '..', 'backend');
}

function getRendererEntry() {
  if (process.env.ELECTRON_RENDERER_URL) {
    return process.env.ELECTRON_RENDERER_URL;
  }
  if (app.isPackaged) {
    return `file://${path.join(process.resourcesPath, 'frontend-dist', 'index.html')}`;
  }
  return `file://${path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html')}`;
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function ensureRuntimeConfig() {
  const configPath = path.join(app.getPath('userData'), 'runtime-config.json');
  const existing = readJson(configPath) || {};

  const runtimeConfig = {
    port: existing.port || 5000,
    db: {
      host: existing.db?.host || 'localhost',
      port: existing.db?.port || 5432,
      name: existing.db?.name || 'bahamut_oms',
      user: existing.db?.user || 'postgres',
      password: existing.db?.password || 'password',
    },
    corsOrigin: existing.corsOrigin || 'http://localhost:3000,null',
    frontendUrl: existing.frontendUrl || 'app://local',
    apiUrl: existing.apiUrl || 'http://127.0.0.1:5000',
    jwtSecret: existing.jwtSecret || crypto.randomBytes(48).toString('hex'),
    jwtRefreshSecret: existing.jwtRefreshSecret || crypto.randomBytes(48).toString('hex'),
  };

  writeJson(configPath, runtimeConfig);
  return runtimeConfig;
}

function waitForBackend(port, timeoutMs = 30000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(`http://127.0.0.1:${port}/health`, (res) => {
        res.resume();
        if (res.statusCode === 200) {
          resolve();
        } else if (Date.now() - start > timeoutMs) {
          reject(new Error(`Backend unhealthy (status ${res.statusCode})`));
        } else {
          setTimeout(attempt, 800);
        }
      });

      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Backend did not start within timeout'));
        } else {
          setTimeout(attempt, 800);
        }
      });
    };

    attempt();
  });
}

function startBackend() {
  const runtimeConfig = ensureRuntimeConfig();
  const backendEntry = getBackendEntry();

  backendProcess = spawn(process.execPath, [backendEntry], {
    cwd: getBackendCwd(),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      NODE_ENV: 'production',
      PORT: String(runtimeConfig.port),
      DB_HOST: runtimeConfig.db.host,
      DB_PORT: String(runtimeConfig.db.port),
      DB_NAME: runtimeConfig.db.name,
      DB_USER: runtimeConfig.db.user,
      DB_PASSWORD: runtimeConfig.db.password,
      JWT_SECRET: runtimeConfig.jwtSecret,
      JWT_REFRESH_SECRET: runtimeConfig.jwtRefreshSecret,
      CORS_ORIGIN: runtimeConfig.corsOrigin,
      FRONTEND_URL: runtimeConfig.frontendUrl,
      API_URL: runtimeConfig.apiUrl,
    },
    stdio: 'inherit',
  });

  backendProcess.on('exit', (code) => {
    backendProcess = null;
    if (!app.isQuitting) {
      dialog.showErrorBox('Backend stopped', `Local API exited with code ${code ?? 'unknown'}.`);
    }
  });
  return waitForBackend(runtimeConfig.port);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(getRendererEntry());

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(async () => {
  try {
    await startBackend();
  } catch (err) {
    dialog.showErrorBox('Backend startup failed', `${err.message}\n\nCheck runtime-config.json in the app data folder.`);
    app.quit();
    return;
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
  }
});
