const DataWarehouseFact = require('../models/DataWarehouseFact');

const dataWarehouseService = {
  async loadFactSales(tenantId, dateRange = {}) {
    const { from = new Date(Date.now() - 30 * 86400000), to = new Date() } = dateRange;
    const { Pool } = require('pg');
    const pool = new (require('pg').Pool)({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });

    const orders = await pool.query(
      `SELECT o.id, o.tenant_id, o.customer_id, o.total_amount, o.created_at,
              oi.product_id, oi.quantity, oi.price,
              p.cost_price
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.tenant_id = $1 AND o.created_at BETWEEN $2 AND $3
         AND o.status = 'completed'`,
      [tenantId, from, to]
    );

    const facts = orders.rows.map(row => ({
      tenant_id: row.tenant_id,
      order_id: row.id,
      product_id: row.product_id,
      customer_id: row.customer_id,
      date_key: row.created_at.toISOString().slice(0, 10),
      quantity: row.quantity,
      revenue: parseFloat(row.price) * row.quantity,
      cost: parseFloat(row.cost_price || 0) * row.quantity,
      profit: (parseFloat(row.price) - parseFloat(row.cost_price || 0)) * row.quantity
    }));

    return DataWarehouseFact.createMany(facts);
  },

  async getFactsByDateRange(tenantId, from, to) {
    return DataWarehouseFact.findByDateRange(tenantId, from, to);
  },

  async aggregateByDimension(tenantId, dimension, metric) {
    return DataWarehouseFact.aggregateByDimension(tenantId, dimension, metric);
  }
};

module.exports = dataWarehouseService;
