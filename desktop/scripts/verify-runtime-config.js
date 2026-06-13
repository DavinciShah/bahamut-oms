const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');

// Define paths
const tempUserData = path.join(__dirname, 'verify-temp');
const configJsonPath = path.join(tempUserData, 'runtime-config.json');
const configJsPath = path.join(tempUserData, 'runtime-config.js');

// Clean up previous runs
if (fs.existsSync(tempUserData)) {
  fs.rmSync(tempUserData, { recursive: true, force: true });
}
fs.mkdirSync(tempUserData, { recursive: true });

// Mock function matching the main.js ensureRuntimeConfig()
function ensureRuntimeConfigMock(existingJson = null) {
  if (existingJson) {
    fs.mkdirSync(path.dirname(configJsonPath), { recursive: true });
    fs.writeFileSync(configJsonPath, JSON.stringify(existingJson, null, 2), 'utf8');
  }

  // Same logic as main.js
  const readJson = (filePath) => {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return null;
    }
  };

  const writeJson = (filePath, data) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  };

  const existing = readJson(configJsonPath) || {};
  const backendEnv = {}; // Empty since we're in packaged-like state or no local env

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

  writeJson(configJsonPath, runtimeConfig);

  const jsContent = `window.__DEVIBE_RUNTIME_CONFIG__ = {
  apiBaseUrl: "${runtimeConfig.apiUrl}/api",
  socketBaseUrl: "${runtimeConfig.apiUrl}",
  authStorageKey: "devibe_oms_auth"
};
`;
  fs.writeFileSync(configJsPath, jsContent, 'utf8');

  return runtimeConfig;
}

console.log('--- Running Runtime Config Verification Tests ---');

// Test 1: First-time generation
console.log('Test 1: Initializing configuration with defaults...');
const config1 = ensureRuntimeConfigMock();
assert.ok(fs.existsSync(configJsonPath), 'runtime-config.json should be created');
assert.ok(fs.existsSync(configJsPath), 'runtime-config.js should be created');
const jsContent1 = fs.readFileSync(configJsPath, 'utf8');
assert.ok(jsContent1.includes('apiBaseUrl: "http://127.0.0.1:5000/api"'), 'Default apiBaseUrl is incorrect');
assert.ok(jsContent1.includes('socketBaseUrl: "http://127.0.0.1:5000"'), 'Default socketBaseUrl is incorrect');
console.log('  -> Test 1 Passed');

// Test 2: Custom Port Editing
console.log('Test 2: Modifying port and apiUrl to 6000...');
const customConfig = {
  port: 6000,
  apiUrl: 'http://127.0.0.1:6000'
};
const config2 = ensureRuntimeConfigMock(customConfig);
assert.strictEqual(config2.port, 6000, 'Port should be updated to 6000');
assert.strictEqual(config2.apiUrl, 'http://127.0.0.1:6000', 'ApiUrl should be updated to port 6000');
const jsContent2 = fs.readFileSync(configJsPath, 'utf8');
assert.ok(jsContent2.includes('apiBaseUrl: "http://127.0.0.1:6000/api"'), 'Updated apiBaseUrl is incorrect');
assert.ok(jsContent2.includes('socketBaseUrl: "http://127.0.0.1:6000"'), 'Updated socketBaseUrl is incorrect');
console.log('  -> Test 2 Passed');

// Clean up
fs.rmSync(tempUserData, { recursive: true, force: true });
console.log('--- All Runtime Config Tests Passed ---');
process.exit(0);
