'use strict';

const pool = require('../config/database');

const OrderItem = {
  async findByOrderId(orderId) {
    const { rows } = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id',
      [orderId]
    );
    return rows;
  },

  async create({ order_id, product_id, quantity, price }) {
    const { rows } = await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [order_id, product_id, quantity, price]
    );
    return rows[0];
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM order_items WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = OrderItem;
