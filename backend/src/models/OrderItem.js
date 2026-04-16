'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const OrderItem = {
  async findByOrderId(orderId) {
    const { rows } = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.sku AS product_sku
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1
       ORDER BY oi.id`,
      [orderId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM order_items WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ order_id, product_id, quantity, unit_price }) {
    const total_price = Number(quantity) * Number(unit_price);
    const { rows } = await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [order_id, product_id, quantity, unit_price, total_price]
    );
    return rows[0];
  },

  async createMany(orderItems) {
    if (!orderItems || orderItems.length === 0) return [];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      for (const item of orderItems) {
        const total_price = Number(item.quantity) * Number(item.unit_price);
        const { rows } = await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           RETURNING *`,
          [item.order_id, item.product_id, item.quantity, item.unit_price, total_price]
        );
        results.push(rows[0]);
      }
      await client.query('COMMIT');
      return results;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async update(id, { quantity, unit_price }) {
    const sets = [];
    const values = [];
    let i = 1;

    if (quantity !== undefined) { sets.push(`quantity = $${i++}`);   values.push(quantity); }
    if (unit_price !== undefined) { sets.push(`unit_price = $${i++}`); values.push(unit_price); }

    if (!sets.length) throw new Error('No valid fields to update');

    // Recompute total_price if either qty or price changed
    sets.push(`total_price = quantity * unit_price`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE order_items SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM order_items WHERE id = $1', [id]);
    return rowCount > 0;
  },

  async deleteByOrderId(orderId) {
    const { rowCount } = await pool.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
    return rowCount;
  },
};

module.exports = OrderItem;
