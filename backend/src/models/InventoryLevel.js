'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const InventoryLevel = {
  async findAll({ warehouseId, productId, limit = 50, offset = 0 } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;

    if (warehouseId) { conditions.push(`il.warehouse_id = $${i++}`); values.push(warehouseId); }
    if (productId)   { conditions.push(`il.product_id = $${i++}`);   values.push(productId); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT il.*, p.name AS product_name, p.sku, w.name AS warehouse_name
       FROM inventory_levels il
       LEFT JOIN products p ON p.id = il.product_id
       LEFT JOIN warehouses w ON w.id = il.warehouse_id
       ${where}
       ORDER BY il.updated_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      values
    );
    return rows;
  },

  async findOne(productId, warehouseId) {
    const { rows } = await pool.query(
      `SELECT * FROM inventory_levels WHERE product_id = $1 AND warehouse_id = $2`,
      [productId, warehouseId]
    );
    return rows[0] || null;
  },

  async upsert(productId, warehouseId, quantity, reservedQuantity = 0, reorderPoint = 0) {
    const { rows } = await pool.query(
      `INSERT INTO inventory_levels
         (product_id, warehouse_id, quantity, reserved_quantity, reorder_point, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (product_id, warehouse_id)
       DO UPDATE SET
         quantity          = EXCLUDED.quantity,
         reserved_quantity = EXCLUDED.reserved_quantity,
         reorder_point     = EXCLUDED.reorder_point,
         updated_at        = NOW()
       RETURNING *`,
      [productId, warehouseId, quantity, reservedQuantity, reorderPoint]
    );
    return rows[0];
  },

  async adjustQuantity(productId, warehouseId, delta) {
    const { rows } = await pool.query(
      `UPDATE inventory_levels
       SET quantity = GREATEST(0, quantity + $3), updated_at = NOW()
       WHERE product_id = $1 AND warehouse_id = $2
       RETURNING *`,
      [productId, warehouseId, delta]
    );
    return rows[0] || null;
  },

  async findLowStock(threshold) {
    const { rows } = await pool.query(
      `SELECT il.*, p.name AS product_name, p.sku, w.name AS warehouse_name
       FROM inventory_levels il
       LEFT JOIN products p ON p.id = il.product_id
       LEFT JOIN warehouses w ON w.id = il.warehouse_id
       WHERE il.quantity <= COALESCE(il.reorder_point, $1)`,
      [threshold]
    );
    return rows;
  },

  async count({ warehouseId, productId } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;
    if (warehouseId) { conditions.push(`warehouse_id = $${i++}`); values.push(warehouseId); }
    if (productId)   { conditions.push(`product_id = $${i++}`);   values.push(productId); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(`SELECT COUNT(*) AS count FROM inventory_levels ${where}`, values);
    return parseInt(rows[0].count, 10);
  },
};

module.exports = InventoryLevel;
