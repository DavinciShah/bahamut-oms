const { query } = require('../config/database');

const getStats = async () => {
  const [usersResult, ordersResult, revenueResult, productsResult, pendingResult] = await Promise.all([
    query('SELECT COUNT(*) FROM users'),
    query('SELECT COUNT(*) FROM orders'),
    query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'cancelled'"),
    query('SELECT COUNT(*) FROM products'),
    query("SELECT COUNT(*) FROM orders WHERE status = 'pending'")
  ]);

  return {
    totalUsers: parseInt(usersResult.rows[0].count),
    totalOrders: parseInt(ordersResult.rows[0].count),
    totalRevenue: parseFloat(revenueResult.rows[0].total),
    totalProducts: parseInt(productsResult.rows[0].count),
    pendingOrders: parseInt(pendingResult.rows[0].count)
  };
};

const getOrdersReport = async (startDate, endDate) => {
  const result = await query(
    `SELECT o.*, u.name as user_name, u.email as user_email
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     WHERE o.created_at BETWEEN $1 AND $2
     ORDER BY o.created_at DESC`,
    [startDate || '1970-01-01', endDate || new Date().toISOString()]
  );

  const aggregate = await query(
    `SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_revenue, AVG(total_amount) as avg_order_value
     FROM orders WHERE created_at BETWEEN $1 AND $2`,
    [startDate || '1970-01-01', endDate || new Date().toISOString()]
  );

  return { orders: result.rows, summary: aggregate.rows[0] };
};

const getInventoryReport = async () => {
  const result = await query(
    'SELECT id, name, sku, category, price, stock FROM products ORDER BY stock ASC'
  );
  return result.rows;
};

const getRevenueReport = async (startDate, endDate) => {
  const result = await query(
    `SELECT DATE(created_at) as date, COUNT(*) as order_count, COALESCE(SUM(total_amount), 0) as revenue
     FROM orders
     WHERE created_at BETWEEN $1 AND $2 AND status != 'cancelled'
     GROUP BY DATE(created_at)
     ORDER BY date`,
    [startDate || '1970-01-01', endDate || new Date().toISOString()]
  );
  return result.rows;
};

const getUserActivity = async () => {
  const result = await query(
    `SELECT u.id, u.name, u.email, u.created_at, COUNT(o.id) as order_count, COALESCE(SUM(o.total_amount), 0) as total_spent
     FROM users u
     LEFT JOIN orders o ON u.id = o.user_id
     GROUP BY u.id, u.name, u.email, u.created_at
     ORDER BY total_spent DESC`
  );
  return result.rows;
};

module.exports = { getStats, getOrdersReport, getInventoryReport, getRevenueReport, getUserActivity };
