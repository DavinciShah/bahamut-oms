const { pool } = require('../config/database');

class DataWarehouseFact {
  static async create({ tenant_id, order_id, product_id, customer_id, date_key, quantity, revenue, cost, profit }) {
    const result = await pool.query(
      `INSERT INTO fact_sales (tenant_id, order_id, product_id, customer_id, date_key, quantity, revenue, cost, profit)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [tenant_id, order_id, product_id, customer_id, date_key, quantity, revenue, cost, profit]
    );
    return result.rows[0];
  }

  static async findByTenant(tenant_id, options = {}) {
    const { limit = 100, offset = 0 } = options;
    const result = await pool.query(
      `SELECT fs.*, p.name AS product_name, u.name AS customer_name
       FROM fact_sales fs
       LEFT JOIN products p ON p.id = fs.product_id
       LEFT JOIN users u ON u.id = fs.customer_id
       WHERE fs.tenant_id = $1
       ORDER BY fs.date_key DESC
       LIMIT $2 OFFSET $3`,
      [tenant_id, limit, offset]
    );
    return result.rows;
  }

  static async findByDateRange(tenant_id, from, to) {
    const result = await pool.query(
      `SELECT * FROM fact_sales
       WHERE tenant_id = $1 AND date_key BETWEEN $2 AND $3
       ORDER BY date_key`,
      [tenant_id, from, to]
    );
    return result.rows;
  }

  static async aggregateByDimension(tenant_id, dimension, metric) {
    const validDimensions = { product: 'product_id', customer: 'customer_id', date: 'date_key' };
    const validMetrics = { revenue: 'SUM(revenue)', cost: 'SUM(cost)', profit: 'SUM(profit)', quantity: 'SUM(quantity)', orders: 'COUNT(DISTINCT order_id)' };

    // Strict whitelist — reject unknown values outright so they never reach the query.
    if (!validDimensions[dimension]) {
      throw Object.assign(new Error(`Invalid dimension: ${dimension}`), { status: 400 });
    }
    if (!validMetrics[metric]) {
      throw Object.assign(new Error(`Invalid metric: ${metric}`), { status: 400 });
    }

    // dim and met are resolved exclusively from the hardcoded lookup maps above;
    // no user-supplied string is interpolated into the SQL.
    const dim = validDimensions[dimension];
    const met = validMetrics[metric];

    const result = await pool.query(
      `SELECT ${dim} AS dimension, ${met} AS value
       FROM fact_sales
       WHERE tenant_id = $1
       GROUP BY ${dim}
       ORDER BY value DESC
       LIMIT 50`,
      [tenant_id]
    );
    return result.rows;
  }

  static async createMany(facts) {
    const results = [];
    for (const fact of facts) {
      try {
        results.push(await DataWarehouseFact.create(fact));
      } catch (err) {
        console.warn('[DW] Skipping duplicate fact:', err.message);
      }
    }
    return results;
  }
}

module.exports = DataWarehouseFact;
