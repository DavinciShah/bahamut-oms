const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });
const DataWarehouseFact = require('../models/DataWarehouseFact');

const etlService = {
  async extractOrders(tenantId, dateRange = {}) {
    const { from = new Date(Date.now() - 86400000), to = new Date() } = dateRange;
    const result = await pool.query(
      `SELECT o.id, o.tenant_id, o.customer_id, o.total_amount, o.status, o.created_at,
              oi.product_id, oi.quantity, oi.price,
              COALESCE(p.cost_price, 0) AS cost_price
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON p.id = oi.product_id
       WHERE o.tenant_id = $1 AND o.created_at BETWEEN $2 AND $3
         AND o.status = 'completed'`,
      [tenantId, from, to]
    );
    return result.rows;
  },

  transformOrder(order) {
    const revenue = parseFloat(order.price) * order.quantity;
    const cost = parseFloat(order.cost_price) * order.quantity;
    return {
      tenant_id: order.tenant_id,
      order_id: order.id,
      product_id: order.product_id,
      customer_id: order.customer_id,
      date_key: order.created_at instanceof Date
        ? order.created_at.toISOString().slice(0, 10)
        : new Date(order.created_at).toISOString().slice(0, 10),
      quantity: order.quantity,
      revenue: parseFloat(revenue.toFixed(2)),
      cost: parseFloat(cost.toFixed(2)),
      profit: parseFloat((revenue - cost).toFixed(2))
    };
  },

  async loadFacts(facts) {
    return DataWarehouseFact.createMany(facts);
  },

  async runETL(tenantId, dateRange = {}) {
    console.log(`[ETL] Starting ETL for tenant ${tenantId}`);
    const orders = await etlService.extractOrders(tenantId, dateRange);
    const facts = orders.map(etlService.transformOrder);
    const loaded = await etlService.loadFacts(facts);
    console.log(`[ETL] Loaded ${loaded.length} facts for tenant ${tenantId}`);
    return { extracted: orders.length, transformed: facts.length, loaded: loaded.length };
  }
};

module.exports = etlService;
