'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const logger = require('../config/logger');

const MIGRATION_FILES = [
  'integration_tables.sql',
  'accounting_tables.sql'
];

async function runMigrations() {
  const client = await pool.connect();
  try {
    for (const file of MIGRATION_FILES) {
      const filePath = path.join(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      logger.info(`Running migration: ${file}`);
      await client.query(sql);
      logger.info(`Migration completed: ${file}`);
    }
    logger.info('All migrations completed successfully');
  } catch (err) {
    logger.error('Migration failed', { error: err.message });
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
