require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool, query } = require('./config/database');
const logger = require('./utils/logger');

const runMigrations = async () => {
  try {
    const sqlPath = path.join(__dirname, '../migrations/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await query(sql);
    logger.info('Migrations completed successfully');
  } catch (err) {
    logger.error('Migration failed:', err);
    throw err;
  }
};

if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Database setup complete');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Database setup failed:', err);
      process.exit(1);
    });
}

module.exports = { pool, query, runMigrations };
