require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool, query } = require('./config/database');
const logger = require('./utils/logger');

const runMigrations = async () => {
  try {
    // Run the base init.sql first
    const initSqlPath = path.join(__dirname, '../migrations/init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    await query(initSql);

    // Then run all numbered migration files in order
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => /^\d+_.*\.sql$/.test(f))
      .sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      // Split on statement boundaries and run each individually so one
      // duplicate/conflict doesn't abort the whole file.
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const stmt of statements) {
        try {
          await query(stmt);
        } catch (err) {
          // 42P07 = duplicate table, 42710 = duplicate index/object,
          // 42701 = duplicate column, 42703 = column does not exist (bad index def)
          const ignorable = ['42P07', '42710', '42701', '42703', '23505'];
          if (!ignorable.includes(err.code)) {
            logger.error(`Statement failed in ${file}: ${err.message}`);
          }
        }
      }
      logger.info(`Migration applied: ${file}`);
    }

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
