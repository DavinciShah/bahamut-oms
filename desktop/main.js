'use strict';

const { app, BrowserWindow, dialog, protocol, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawn, exec } = require('child_process');
const http = require('http');

const APP_PROTOCOL = 'app';
const APP_HOST = 'local';

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_PROTOCOL,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

let mainWindow;
let backendProcess;

// Force single instance lock for DeVibe OMS
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Register custom protocol handler for deep linking (devibe-oms://)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('devibe-oms', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('devibe-oms');
}

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

function getFrontendDistDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'frontend-dist');
  }
  return path.resolve(__dirname, '..', 'frontend', 'dist');
}

function getRendererEntry() {
  if (process.env.ELECTRON_RENDERER_URL) {
    return process.env.ELECTRON_RENDERER_URL;
  }
  return `${APP_PROTOCOL}://${APP_HOST}/index.html`;
}

function registerRendererProtocol() {
  const frontendRoot = getFrontendDistDir();

  protocol.registerFileProtocol(APP_PROTOCOL, (request, callback) => {
    try {
      const requestUrl = new URL(request.url);
      let urlPath = decodeURIComponent(requestUrl.pathname || '/');

      if (urlPath === '/' || urlPath === '') {
        urlPath = '/index.html';
      }

      if (urlPath === '/runtime-config.js') {
        const configJsPath = path.join(app.getPath('userData'), 'runtime-config.js');
        if (fs.existsSync(configJsPath)) {
          callback({ path: configJsPath });
          return;
        }
      }

      const normalizedPath = path.normalize(path.join(frontendRoot, urlPath));
      const relativePath = path.relative(frontendRoot, normalizedPath);

      if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        callback({ error: -6 });
        return;
      }

      callback({ path: normalizedPath });
    } catch {
      callback({ error: -2 });
    }
  });
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

function readBackendEnvDefaults() {
  if (app.isPackaged) {
    return {};
  }

  const envPath = path.resolve(__dirname, '..', 'backend', '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const defaults = {};
  const content = fs.readFileSync(envPath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    defaults[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim();
  }

  return defaults;
}

function ensureRuntimeConfig() {
  const configPath = path.join(app.getPath('userData'), 'runtime-config.json');
  const existing = readJson(configPath) || {};
  const backendEnv = readBackendEnvDefaults();

  const runtimeConfig = {
    port: existing.port || Number(backendEnv.PORT) || 5000,
    db: {
      host: existing.db?.host || backendEnv.DB_HOST || 'localhost',
      port: existing.db?.port || Number(backendEnv.DB_PORT) || 5432,
      name: existing.db?.name || backendEnv.DB_NAME || 'devibe_oms',
      user: existing.db?.user || backendEnv.DB_USER || 'postgres',
      password: existing.db?.password || backendEnv.DB_PASSWORD || 'postgres',
    },
    corsOrigin: existing.corsOrigin || 'http://localhost:3000,http://127.0.0.1:3000,app://local,capacitor://localhost',
    frontendUrl: existing.frontendUrl || 'app://local',
    apiUrl: existing.apiUrl || 'http://127.0.0.1:5000',
    jwtSecret: existing.jwtSecret || crypto.randomBytes(48).toString('hex'),
    jwtRefreshSecret: existing.jwtRefreshSecret || crypto.randomBytes(48).toString('hex'),
  };

  writeJson(configPath, runtimeConfig);

  const configJsPath = path.join(app.getPath('userData'), 'runtime-config.js');
  const jsContent = `window.__DEVIBE_RUNTIME_CONFIG__ = {
  apiBaseUrl: "${runtimeConfig.apiUrl}/api",
  socketBaseUrl: "${runtimeConfig.apiUrl}",
  authStorageKey: "devibe_oms_auth"
};
`;
  fs.writeFileSync(configJsPath, jsContent, 'utf8');

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
  const logDir = path.join(app.getPath('userData'), 'logs');

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
      CORS_ALLOW_NULL_ORIGIN: 'true',
      FRONTEND_URL: runtimeConfig.frontendUrl,
      API_URL: runtimeConfig.apiUrl,
      LOG_DIR: logDir,
      RUN_MIGRATIONS_ON_START: 'true',
      DISABLE_JOBS: 'true',
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
  const frontendIndex = path.join(getFrontendDistDir(), 'index.html');
  if (!process.env.ELECTRON_RENDERER_URL && !fs.existsSync(frontendIndex)) {
    dialog.showErrorBox(
      'Frontend build missing',
      `Could not find ${frontendIndex}.\n\nRun "npm run build:renderer" in the desktop folder, then try again.`
    );
    app.quit();
    return;
  }

  if (!process.env.ELECTRON_RENDERER_URL) {
    registerRendererProtocol();
  }

  try {
    await startBackend();
  } catch (err) {
    const configPath = path.join(app.getPath('userData'), 'runtime-config.json');
    dialog.showErrorBox(
      'Backend startup failed',
      `${err.message}\n\nCommon fixes:\n- Start PostgreSQL (for example: npm run db:up)\n- Run migrations (npm run migrate)\n- Verify database settings in:\n  ${configPath}`
    );
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

// Windows Store Subscription Check Helpers
async function isSubscriptionActive() {
  if (!app.isPackaged) {
    const overridePath = path.join(app.getPath('userData'), '.dev-subscription-inactive');
    if (fs.existsSync(overridePath)) {
      console.log('[Subscription] Dev override active: Simulating INACTIVE subscription.');
      return false;
    }
    console.log('[Subscription] Dev mode: Simulating ACTIVE subscription.');
    return true;
  }

  const scriptPath = path.join(process.resourcesPath, 'scripts', 'check-sub.ps1');
  return new Promise((resolve) => {
    const cmd = `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`;
    exec(cmd, (error, stdout) => {
      if (error) {
        console.error('[Subscription] Check failed:', error);
        resolve(false);
        return;
      }
      const output = stdout.trim();
      console.log('[Subscription] Store response:', output);
      if (output.includes('ACTIVE')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// IPC registration
ipcMain.handle('check-subscription', async () => {
  return await isSubscriptionActive();
});

ipcMain.on('manage-subscription', () => {
  shell.openExternal('https://account.microsoft.com/services');
});
