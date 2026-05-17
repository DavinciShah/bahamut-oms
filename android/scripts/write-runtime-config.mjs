import fs from 'node:fs';
import path from 'node:path';

const androidRoot = path.resolve(import.meta.dirname, '..');
const frontendDistRoot = path.resolve(androidRoot, '..', 'frontend', 'dist');
const runtimeConfigPath = path.resolve(androidRoot, 'runtime-config.json');
const runtimeConfigExamplePath = path.resolve(androidRoot, 'runtime-config.example.json');
const outputPath = path.resolve(frontendDistRoot, 'runtime-config.js');

const inputPath = fs.existsSync(runtimeConfigPath) ? runtimeConfigPath : runtimeConfigExamplePath;

if (!fs.existsSync(frontendDistRoot)) {
  throw new Error(`Frontend build output not found at ${frontendDistRoot}. Run the frontend build first.`);
}

const rawConfig = fs.readFileSync(inputPath, 'utf8');
const runtimeConfig = JSON.parse(rawConfig);

const output = `window.__BAHAMUT_RUNTIME_CONFIG__ = ${JSON.stringify(runtimeConfig, null, 2)};\n`;

fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Wrote Android runtime config from ${path.basename(inputPath)} to ${outputPath}`);
