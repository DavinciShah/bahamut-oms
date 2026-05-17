import fs from 'node:fs';
import path from 'node:path';

const androidRoot = path.resolve(import.meta.dirname, '..');
const targetConfigPath = path.resolve(androidRoot, 'runtime-config.json');
const profile = (process.argv[2] || '').trim().toLowerCase();

if (!profile || !['staging', 'production'].includes(profile)) {
  console.error('Usage: node ./scripts/use-runtime-config.mjs <staging|production>');
  process.exit(1);
}

const sourceConfigPath = path.resolve(androidRoot, `runtime-config.${profile}.json`);

if (!fs.existsSync(sourceConfigPath)) {
  console.error(`Config profile not found: ${sourceConfigPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(sourceConfigPath, 'utf8');
JSON.parse(raw);

fs.writeFileSync(targetConfigPath, `${raw.trim()}\n`, 'utf8');
console.log(`Activated Android runtime config profile: ${profile}`);
console.log(`Wrote ${targetConfigPath}`);
