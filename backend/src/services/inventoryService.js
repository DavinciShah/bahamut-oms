'use strict';

const { Pool } = require('pg');
const InventoryLevel = require('../models/InventoryLevel');
const StockTransfer = require('../models/StockTransfer');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const inventoryService = {
  async getStockLevels(warehouseId, options = {}) {
    const { limit = 50, offset = 0, productId } = options;
    const [items, total] = await Promise.all([
      InventoryLevel.findAll({ warehouseId, productId, limit, offset }),
      InventoryLevel.count({ warehouseId, productId }),
    ]);
    return { items, total, limit, offset };
  },

  async adjustStock(warehouseId, productId, quantity, reason, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Ensure inventory level row exists
      await client.query(
        `INSERT INTO inventory_levels (product_id, warehouse_id, quantity, reserved_quantity, reorder_point, created_at, updated_at)
         VALUES ($1, $2, 0, 0, 0, NOW(), NOW())
         ON CONFLICT (product_id, warehouse_id) DO NOTHING`,
        [productId, warehouseId]
      );

      const { rows } = await client.query(
        `UPDATE inventory_levels
         SET quantity = GREATEST(0, quantity + $3), updated_at = NOW()
         WHERE product_id = $1 AND warehouse_id = $2
         RETURNING *`,
        [productId, warehouseId, quantity]
      );

      await client.query(
        `INSERT INTO stock_adjustments
           (product_id, warehouse_id, quantity_change, reason, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [productId, warehouseId, quantity, reason, userId]
      );

      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async transferStock(fromWarehouseId, toWarehouseId, productId, quantity, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check source stock
      const { rows: srcRows } = await client.query(
        `SELECT quantity FROM inventory_levels
         WHERE product_id = $1 AND warehouse_id = $2
         FOR UPDATE`,
        [productId, fromWarehouseId]
      );

      const available = srcRows[0] ? srcRows[0].quantity : 0;
      if (available < quantity) {
        throw Object.assign(
          new Error(`Insufficient stock: available ${available}, requested ${quantity}`),
          { status: 422 }
        );
      }

      // Deduct from source
      await client.query(
        `UPDATE inventory_levels
         SET quantity = quantity - $3, updated_at = NOW()
         WHERE product_id = $1 AND warehouse_id = $2`,
        [productId, fromWarehouseId, quantity]
      );

      // Add to destination (upsert)
      await client.query(
        `INSERT INTO inventory_levels (product_id, warehouse_id, quantity, reserved_quantity, reorder_point, created_at, updated_at)
         VALUES ($1, $2, $3, 0, 0, NOW(), NOW())
         ON CONFLICT (product_id, warehouse_id)
         DO UPDATE SET quantity = inventory_levels.quantity + EXCLUDED.quantity, updated_at = NOW()`,
        [productId, toWarehouseId, quantity]
      );

      // Create transfer record
      const { rows } = await client.query(
        `INSERT INTO stock_transfers
           (from_warehouse_id, to_warehouse_id, product_id, quantity, status, created_by, created_at)
         VALUES ($1, $2, $3, $4, 'completed', $5, NOW())
         RETURNING *`,
        [fromWarehouseId, toWarehouseId, productId, quantity, userId]
      );

      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getLowStockAlerts(threshold = 10) {
    return InventoryLevel.findLowStock(threshold);
  },

  async getStockHistory(productId, warehouseId) {
    const conditions = ['sa.product_id = $1'];
    const values = [productId];
    let i = 2;

    if (warehouseId) {
      conditions.push(`sa.warehouse_id = $${i++}`);
      values.push(warehouseId);
    }

    const { rows } = await pool.query(
      `SELECT sa.*, u.email AS created_by_email
       FROM stock_adjustments sa
       LEFT JOIN users u ON u.id = sa.created_by
       WHERE ${conditions.join(' AND ')}
       ORDER BY sa.created_at DESC
       LIMIT 200`,
      values
    );
    return rows;
  },
};

module.exports = inventoryService;
