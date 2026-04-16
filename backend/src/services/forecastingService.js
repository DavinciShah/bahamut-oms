const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });

function linearRegression(xs, ys) {
  const n = xs.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

const forecastingService = {
  async forecastRevenue(tenantId, periods = 6) {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', created_at) AS month,
              COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders
       WHERE tenant_id = $1 AND status = 'completed'
       GROUP BY month ORDER BY month`,
      [tenantId]
    );

    const rows = result.rows;
    if (rows.length < 2) return { historical: rows, forecast: [] };

    const xs = rows.map((_, i) => i);
    const ys = rows.map(r => parseFloat(r.revenue));
    const { slope, intercept } = linearRegression(xs, ys);

    const lastDate = new Date(rows[rows.length - 1].month);
    const forecast = [];
    for (let i = 1; i <= periods; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      const predicted = Math.max(0, intercept + slope * (rows.length - 1 + i));
      forecast.push({ month: futureDate.toISOString().slice(0, 7), revenue: parseFloat(predicted.toFixed(2)) });
    }

    return { historical: rows, forecast };
  },

  async forecastDemand(tenantId, productId, periods = 6) {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', o.created_at) AS month,
              COALESCE(SUM(oi.quantity), 0) AS quantity
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.tenant_id = $1 AND oi.product_id = $2 AND o.status = 'completed'
       GROUP BY month ORDER BY month`,
      [tenantId, productId]
    );

    const rows = result.rows;
    if (rows.length < 2) return { historical: rows, forecast: [] };

    const xs = rows.map((_, i) => i);
    const ys = rows.map(r => parseFloat(r.quantity));
    const { slope, intercept } = linearRegression(xs, ys);

    const lastDate = new Date(rows[rows.length - 1].month);
    const forecast = [];
    for (let i = 1; i <= periods; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + i);
      const predicted = Math.max(0, intercept + slope * (rows.length - 1 + i));
      forecast.push({ month: futureDate.toISOString().slice(0, 7), quantity: Math.round(predicted) });
    }

    return { historical: rows, forecast };
  },

  async getSeasonalTrends(tenantId) {
    const result = await pool.query(
      `SELECT
         EXTRACT(MONTH FROM created_at) AS month_num,
         TO_CHAR(created_at, 'Month') AS month_name,
         COALESCE(AVG(total_amount), 0) AS avg_revenue,
         COUNT(*) AS order_count
       FROM orders
       WHERE tenant_id = $1 AND status = 'completed'
       GROUP BY month_num, month_name
       ORDER BY month_num`,
      [tenantId]
    );

    const monthly = result.rows;
    if (monthly.length === 0) return { monthly, peak_month: null, low_month: null };

    const peak = monthly.reduce((a, b) => parseFloat(a.avg_revenue) > parseFloat(b.avg_revenue) ? a : b);
    const low = monthly.reduce((a, b) => parseFloat(a.avg_revenue) < parseFloat(b.avg_revenue) ? a : b);

    return { monthly, peak_month: peak, low_month: low };
  }
};

module.exports = forecastingService;
