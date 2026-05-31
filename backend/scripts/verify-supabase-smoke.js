'use strict';

require('dotenv').config();
const { Pool } = require('pg');

function normalizeConnectionString(input) {
  if (!input) return input;
  try {
    const parsed = new URL(input);
    if (!parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require');
    }
    if (!parsed.searchParams.has('uselibpqcompat')) {
      parsed.searchParams.set('uselibpqcompat', 'true');
    }
    return parsed.toString();
  } catch (_) {
    return input;
  }
}

function resolveConnectionString() {
  const raw = process.env.SUPABASE_DB_URL || process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || null;
  return normalizeConnectionString(raw);
}

async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sync_history (
      id BIGSERIAL PRIMARY KEY,
      sync_type VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'success',
      message TEXT,
      meta JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function insertVerificationRow(pool) {
  const marker = `supabase-verify-${Date.now()}`;
  const result = await pool.query(
    `INSERT INTO sync_history (sync_type, status, message, meta)
     VALUES ($1, 'success', $2, $3)
     RETURNING id, sync_type, status, message, meta, created_at`,
    [
      'supabase_verification',
      'Smoke validation marker. Do not delete if you want persistent proof of connection.',
      JSON.stringify({ marker, source: 'backend/scripts/verify-supabase-smoke.js' }),
    ]
  );
  return result.rows[0];
}

async function run() {
  const connectionString = resolveConnectionString();
  if (!connectionString) {
    throw new Error('Missing SUPABASE_DB_URL/SUPABASE_DATABASE_URL/DATABASE_URL. Set Supabase DB URL first.');
  }

  const pool = new Pool({ connectionString });

  try {
    const ping = await pool.query('SELECT NOW() AS now, current_database() AS db, current_user AS db_user');
    const info = ping.rows[0];
    console.log(`[verify] Connected: db=${info.db}, user=${info.db_user}, now=${info.now}`);

    await ensureSchema(pool);
    const row = await insertVerificationRow(pool);

    console.log('[verify] Inserted persistent verification row in sync_history:');
    console.log(JSON.stringify(row, null, 2));
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error(`[verify] Failed: ${err.message}`);
  process.exit(1);
});
