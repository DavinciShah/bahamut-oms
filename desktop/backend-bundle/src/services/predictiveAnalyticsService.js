const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });
const columnCache = new Map();

async function hasColumn(tableName, columnName) {
  const key = `${tableName}.${columnName}`;
  if (columnCache.has(key)) return columnCache.get(key);

  const result = await pool.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
     LIMIT 1`,
    [tableName, columnName]
  );
  const exists = result.rowCount > 0;
  columnCache.set(key, exists);
  return exists;
}

function linearRegression(xs, ys) {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: ys[0] || 0 };
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

const predictiveAnalyticsService = {
  async predictChurn(tenantId) {
    const hasUsersTenant = await hasColumn('users', 'tenant_id');
    const hasOrdersCustomerId = await hasColumn('orders', 'customer_id');
    const userOrderKey = hasOrdersCustomerId ? 'o.customer_id' : 'o.user_id';
    const tenantFilter = hasUsersTenant && tenantId ? 'u.tenant_id = $1 AND ' : '';
    const params = hasUsersTenant && tenantId ? [tenantId] : [];

    const result = await pool.query(
      `SELECT
         u.id, u.name, u.email,
         MAX(o.created_at) AS last_order_date,
         COUNT(o.id) AS order_count,
         COALESCE(SUM(o.total_amount), 0) AS lifetime_value,
         EXTRACT(DAY FROM NOW() - MAX(o.created_at)) AS days_since_last_order
       FROM users u
       LEFT JOIN orders o ON ${userOrderKey} = u.id AND o.status = 'completed'
       WHERE ${tenantFilter}u.role != 'admin'
       GROUP BY u.id, u.name, u.email
       HAVING MAX(o.created_at) IS NOT NULL`,
      params
    );

    return result.rows.map(c => {
      const days = parseFloat(c.days_since_last_order || 0);
      let churnRisk;
      if (days > 180) churnRisk = 'high';
      else if (days > 90) churnRisk = 'medium';
      else churnRisk = 'low';

      return { ...c, churn_risk: churnRisk, churn_score: Math.min(100, Math.round(days / 2)) };
    }).sort((a, b) => b.churn_score - a.churn_score);
  },

  async predictRevenue(tenantId, months = 6) {
    const hasOrdersTenant = await hasColumn('orders', 'tenant_id');
    const tenantFilter = hasOrdersTenant && tenantId ? 'WHERE tenant_id = $1 AND status = \'completed\'' : 'WHERE status = \'completed\'';
    const params = hasOrdersTenant && tenantId ? [tenantId] : [];

    const result = await pool.query(
      `SELECT DATE_TRUNC('month', created_at) AS month,
              COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders
       ${tenantFilter}
       GROUP BY month ORDER BY month`,
      params
    );

    const rows = result.rows;
    if (rows.length < 2) return { historical: rows, predictions: [] };

    const xs = rows.map((_, i) => i);
    const ys = rows.map(r => parseFloat(r.revenue));
    const { slope, intercept } = linearRegression(xs, ys);

    const lastDate = new Date(rows[rows.length - 1].month);
    const predictions = [];
    for (let i = 1; i <= months; i++) {
      const d = new Date(lastDate);
      d.setMonth(d.getMonth() + i);
      const predicted = Math.max(0, intercept + slope * (rows.length - 1 + i));
      predictions.push({
        month: d.toISOString().slice(0, 7),
        predicted_revenue: parseFloat(predicted.toFixed(2)),
        confidence: Math.max(0.5, 1 - (i * 0.08))
      });
    }

    return { historical: rows, predictions };
  },

  async getProductRecommendations(customerId) {
    const purchased = await pool.query(
      `SELECT DISTINCT oi.product_id
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.customer_id = $1 AND o.status = 'completed'`,
      [customerId]
    );

    const purchasedIds = purchased.rows.map(r => r.product_id);
    if (!purchasedIds.length) return [];

    const result = await pool.query(
      `SELECT DISTINCT oi2.product_id, p.name, p.price, COUNT(*) AS frequency
       FROM order_items oi1
       JOIN orders o1 ON o1.id = oi1.order_id
       JOIN order_items oi2 ON oi2.order_id = o1.id AND oi2.product_id != oi1.product_id
       JOIN products p ON p.id = oi2.product_id
       WHERE oi1.product_id = ANY($1::bigint[])
         AND oi2.product_id != ALL($1::bigint[])
       GROUP BY oi2.product_id, p.name, p.price
       ORDER BY frequency DESC
       LIMIT 10`,
      [purchasedIds]
    );

    return result.rows;
  }
};

module.exports = predictiveAnalyticsService;
