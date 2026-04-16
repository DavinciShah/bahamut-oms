const getDashboard = async (req, res, next) => {
  try {
    const pool = req.app.locals.db;
    const [users, orders, products, revenue] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM users'),
      pool.query('SELECT COUNT(*) AS count FROM orders'),
      pool.query('SELECT COUNT(*) AS count FROM products'),
      pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status != 'cancelled'"),
    ]);
    res.json({
      stats: {
        totalUsers: parseInt(users.rows[0].count, 10),
        totalOrders: parseInt(orders.rows[0].count, 10),
        totalProducts: parseInt(products.rows[0].count, 10),
        totalRevenue: parseFloat(revenue.rows[0].total),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getReports = async (req, res, next) => {
  try {
    const pool = req.app.locals.db;
    const { rows } = await pool.query(`
      SELECT
        status,
        COUNT(*) AS order_count,
        COALESCE(SUM(total_amount), 0) AS total_amount
      FROM orders
      GROUP BY status
      ORDER BY status
    `);
    res.json({ reports: rows });
  } catch (err) {
    next(err);
  }
};

const getInventory = async (req, res, next) => {
  try {
    const pool = req.app.locals.db;
    const { rows } = await pool.query(`
      SELECT id, name, sku, stock_quantity, price,
             (stock_quantity * price) AS inventory_value,
             category
      FROM products
      ORDER BY stock_quantity ASC
    `);
    const totalValue = rows.reduce((sum, p) => sum + parseFloat(p.inventory_value), 0);
    res.json({ inventory: rows, totalInventoryValue: totalValue });
  } catch (err) {
    next(err);
  }
};

const getRevenue = async (req, res, next) => {
  try {
    const pool = req.app.locals.db;
    const { rows } = await pool.query(`
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*) AS order_count,
        COALESCE(SUM(total_amount), 0) AS revenue
      FROM orders
      WHERE status != 'cancelled'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);
    res.json({ revenue: rows });
  } catch (err) {
    next(err);
  }
};

const getUserActivity = async (req, res, next) => {
  try {
    const pool = req.app.locals.db;
    const { rows } = await pool.query(`
      SELECT
        u.id, u.name, u.email,
        COUNT(o.id) AS order_count,
        COALESCE(SUM(o.total_amount), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id, u.name, u.email
      ORDER BY total_spent DESC
      LIMIT 50
    `);
    res.json({ activity: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getReports, getInventory, getRevenue, getUserActivity };
