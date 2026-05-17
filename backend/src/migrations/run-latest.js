'use strict';

require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations');
const VERSIONED_FILE_PATTERN = /^\d+_.*\.sql$/;

function checksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getOrderedMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => VERSIONED_FILE_PATTERN.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function ensureMigrationTables(client) {
  await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function applyMigration(client, file) {
  const filePath = path.join(MIGRATIONS_DIR, file);
  const sql = fs.readFileSync(filePath, 'utf8');
  const fileChecksum = checksum(sql);

  const existing = await client.query(
    'SELECT checksum FROM schema_migrations WHERE filename = $1',
    [file]
  );

  if (existing.rowCount > 0) {
    if (existing.rows[0].checksum !== fileChecksum) {
      throw new Error(
        `Checksum mismatch for applied migration "${file}". Refusing to continue.`
      );
    }
    logger.info(`Skipping already applied migration: ${file}`);
    return;
  }

  logger.info(`Applying migration: ${file}`);
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query(
      'INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)',
      [file, fileChecksum]
    );
    await client.query('COMMIT');
    logger.info(`Migration applied: ${file}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function runMigrations() {
  const client = await pool.connect();
  try {
    await ensureMigrationTables(client);
    const files = getOrderedMigrationFiles();
    for (const file of files) {
      await applyMigration(client, file);
    }
    logger.info('All versioned migrations completed successfully');
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMigrations()
    .then(async () => {
      logger.info('Database setup complete');
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error('Database setup failed:', err);
      await pool.end();
      process.exit(1);
    });
}

module.exports = { runMigrations };
