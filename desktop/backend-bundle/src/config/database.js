const { Pool } = require('pg');
const logger = require('../utils/logger');

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.SUPABASE_DATABASE_URL;

const isSupabaseUrl = /supabase\.(co|in)/i.test(databaseUrl || '');
const sslExplicitlyEnabled = process.env.DB_SSL === 'true';
const sslMode = (process.env.DB_SSLMODE || '').toLowerCase();
const useSsl = sslExplicitlyEnabled || sslMode === 'require' || isSupabaseUrl;

const pool = new Pool(
  databaseUrl
    ? {
        connectionString: databaseUrl,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        allowExitOnIdle: process.env.NODE_ENV === 'test',
      }
    : {
        host:     process.env.DB_HOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT || '5432', 10),
        user:     process.env.DB_USER     || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME     || 'devibe_oms',
        ssl: useSsl ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        allowExitOnIdle: process.env.NODE_ENV === 'test',
      }
);

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(-1);
  }
});

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
