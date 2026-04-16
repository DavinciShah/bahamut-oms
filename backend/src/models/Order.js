'use strict';

const pool = require('../config/database');

const Order = {
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY id');
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async findByUserId(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY id',
      [userId]
    );
    return rows;
  },

  async create({ user_id, total = 0, status = 'pending' }) {
    const { rows } = await pool.query(
      `INSERT INTO orders (user_id, total, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_id, total, status]
    );
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let i = 1;

    if (data.total  !== undefined) { fields.push(`total = $${i++}`);  values.push(data.total); }
    if (data.status !== undefined) { fields.push(`status = $${i++}`); values.push(data.status); }

    if (fields.length === 0) return Order.findById(id);

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = Order;
