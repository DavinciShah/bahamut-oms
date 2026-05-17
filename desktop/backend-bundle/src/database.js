require('dotenv').config();
const { pool, query } = require('./config/database');
const logger = require('./utils/logger');
const { runMigrations } = require('./migrations/run-latest');

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

module.exports = { pool, query, runMigrations };
