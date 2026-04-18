const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });

const analyticsService = {
  async trackEvent(tenantId, userId, eventType, data) {
    const result = await pool.query(
      `INSERT INTO analytics_events (tenant_id, user_id, event_type, data)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [tenantId, userId, eventType, JSON.stringify(data)]
    );
    return result.rows[0];
  },

  async getOrderAnalytics(tenantId, dateRange = {}) {
    const { from = new Date(Date.now() - 30 * 86400000), to = new Date() } = dateRange;
    const result = await pool.query(
      `SELECT
         COUNT(*) AS total_orders,
         COUNT(*) FILTER (WHERE status = 'completed') AS completed_orders,
         COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
         COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,
         COALESCE(AVG(total_amount), 0) AS avg_order_value,
         DATE_TRUNC('day', created_at) AS day,
         COUNT(*) AS daily_count
       FROM orders
       WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
       GROUP BY DATE_TRUNC('day', created_at)
       ORDER BY day`,
      [tenantId, from, to]
    );

    const summary = await pool.query(
      `SELECT
         COUNT(*) AS total_orders,
         COUNT(*) FILTER (WHERE status = 'completed') AS completed_orders,
         COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
         COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,
         COALESCE(SUM(total_amount), 0) AS total_revenue,
         COALESCE(AVG(total_amount), 0) AS avg_order_value
       FROM orders
       WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3`,
      [tenantId, from, to]
    );

    return { summary: summary.rows[0], daily: result.rows };
  },

  async getRevenueAnalytics(tenantId, dateRange = {}) {
    const { from = new Date(Date.now() - 30 * 86400000), to = new Date() } = dateRange;
    const daily = await pool.query(
      `SELECT
         DATE_TRUNC('day', created_at) AS day,
         COALESCE(SUM(total_amount), 0) AS revenue,
         COUNT(*) AS order_count
       FROM orders
       WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3 AND status = 'completed'
       GROUP BY DATE_TRUNC('day', created_at)
       ORDER BY day`,
      [tenantId, from, to]
    );

    const monthly = await pool.query(
      `SELECT
         DATE_TRUNC('month', created_at) AS month,
         COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders
       WHERE tenant_id = $1 AND status = 'completed'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month DESC
       LIMIT 12`,
      [tenantId]
    );

    const total = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
       FROM orders WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3 AND status = 'completed'`,
      [tenantId, from, to]
    );

    return { daily: daily.rows, monthly: monthly.rows, total: total.rows[0].total_revenue };
  },

  async getProductAnalytics(tenantId, dateRange = {}) {
    const { from = new Date(Date.now() - 30 * 86400000), to = new Date() } = dateRange;
    const result = await pool.query(
      `SELECT
         p.id, p.name, p.sku,
         COALESCE(SUM(oi.quantity), 0) AS units_sold,
         COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue,
         COUNT(DISTINCT o.id) AS order_count
       FROM products p
       LEFT JOIN order_items oi ON oi.product_id = p.id
       LEFT JOIN orders o ON o.id = oi.order_id AND o.created_at BETWEEN $2 AND $3
       WHERE p.tenant_id = $1
       GROUP BY p.id, p.name, p.sku
       ORDER BY revenue DESC
       LIMIT 20`,
      [tenantId, from, to]
    );
    return result.rows;
  },

  async getCustomerAnalytics(tenantId, dateRange = {}) {
    const { from = new Date(Date.now() - 30 * 86400000), to = new Date() } = dateRange;
    const newCustomers = await pool.query(
      `SELECT COUNT(*) AS new_customers
       FROM users
       WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3 AND role = 'customer'`,
      [tenantId, from, to]
    );

    const topCustomers = await pool.query(
      `SELECT
         u.id, u.name, u.email,
         COUNT(o.id) AS order_count,
         COALESCE(SUM(o.total_amount), 0) AS lifetime_value
       FROM users u
       LEFT JOIN orders o ON o.customer_id = u.id AND o.status = 'completed'
       WHERE u.tenant_id = $1
       GROUP BY u.id, u.name, u.email
       ORDER BY lifetime_value DESC
       LIMIT 10`,
      [tenantId]
    );

    return {
      new_customers: newCustomers.rows[0].new_customers,
      top_customers: topCustomers.rows
    };
  },

  async getDashboardMetrics(tenantId) {
    const today = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const prevThirty = new Date(Date.now() - 60 * 86400000);

    const current = await pool.query(
      `SELECT
         COUNT(*) AS orders,
         COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders
       WHERE tenant_id = $1 AND created_at >= $2 AND status = 'completed'`,
      [tenantId, thirtyDaysAgo]
    );

    const previous = await pool.query(
      `SELECT
         COUNT(*) AS orders,
         COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders
       WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3 AND status = 'completed'`,
      [tenantId, prevThirty, thirtyDaysAgo]
    );

    const customers = await pool.query(
      `SELECT COUNT(*) AS total FROM users WHERE tenant_id = $1 AND role = 'customer'`,
      [tenantId]
    );

    const lowStock = await pool.query(
      `SELECT COUNT(*) AS count FROM inventory_levels il
       JOIN products p ON p.id = il.product_id
       WHERE p.tenant_id = $1 AND il.quantity <= p.reorder_point`,
      [tenantId]
    );

    const curr = current.rows[0];
    const prev = previous.rows[0];
    const revenueGrowth = prev.revenue > 0
      ? ((curr.revenue - prev.revenue) / prev.revenue * 100).toFixed(2)
      : 0;
    const ordersGrowth = prev.orders > 0
      ? ((curr.orders - prev.orders) / prev.orders * 100).toFixed(2)
      : 0;

    return {
      revenue: { value: curr.revenue, growth: revenueGrowth },
      orders: { value: curr.orders, growth: ordersGrowth },
      customers: { value: customers.rows[0].total },
      low_stock_alerts: lowStock.rows[0].count
    };
  }
};

module.exports = analyticsService;
