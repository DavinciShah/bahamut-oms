const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });

async function aggregateAnalytics() {
  console.log('[AnalyticsJob] Running hourly aggregation...');
  try {
    const tenants = await pool.query(`SELECT id FROM tenants WHERE active = true`);
    for (const tenant of tenants.rows) {
      const now = new Date();
      const hourAgo = new Date(now - 3600000);

      await pool.query(
        `INSERT INTO analytics_aggregates (tenant_id, period, period_start, metric, value)
         SELECT
           $1,
           'hourly',
           DATE_TRUNC('hour', $2::timestamptz),
           'order_count',
           COUNT(*)
         FROM orders
         WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
         ON CONFLICT (tenant_id, period, period_start, metric)
         DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [tenant.id, hourAgo, now]
      );

      await pool.query(
        `INSERT INTO analytics_aggregates (tenant_id, period, period_start, metric, value)
         SELECT
           $1,
           'hourly',
           DATE_TRUNC('hour', $2::timestamptz),
           'revenue',
           COALESCE(SUM(total_amount), 0)
         FROM orders
         WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3 AND status = 'completed'
         ON CONFLICT (tenant_id, period, period_start, metric)
         DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [tenant.id, hourAgo, now]
      );
    }
    console.log(`[AnalyticsJob] Aggregated data for ${tenants.rows.length} tenants`);
  } catch (err) {
    console.error('[AnalyticsJob] Error:', err.message);
  }
}

const HOUR = 3600 * 1000;
aggregateAnalytics();
setInterval(aggregateAnalytics, HOUR);

module.exports = { aggregateAnalytics };
