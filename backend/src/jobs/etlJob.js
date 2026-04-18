const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });
const etlService = require('../services/etlService');

async function runDailyETL() {
  console.log('[ETLJob] Starting daily ETL run...');
  try {
    const tenants = await pool.query(`SELECT id FROM tenants WHERE active = true`);
    const yesterday = new Date(Date.now() - 86400000);
    const now = new Date();

    for (const tenant of tenants.rows) {
      try {
        const result = await etlService.runETL(tenant.id, { from: yesterday, to: now });
        console.log(`[ETLJob] Tenant ${tenant.id}: extracted=${result.extracted}, loaded=${result.loaded}`);
      } catch (err) {
        console.error(`[ETLJob] Error processing tenant ${tenant.id}:`, err.message);
      }
    }
    console.log(`[ETLJob] Completed daily ETL for ${tenants.rows.length} tenants`);
  } catch (err) {
    console.error('[ETLJob] Fatal error:', err.message);
  }
}

const DAY = 24 * 3600 * 1000;
runDailyETL();
setInterval(runDailyETL, DAY);

module.exports = { runDailyETL };
