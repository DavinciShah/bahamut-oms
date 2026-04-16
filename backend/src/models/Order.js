'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_TRANSITIONS = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered', 'cancelled'],
  delivered:  [],
  cancelled:  [],
};

const Order = {
  VALID_STATUSES,
  STATUS_TRANSITIONS,

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async findAll({ customer_id, status, limit = 50, offset = 0 } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;

    if (customer_id !== undefined) { conditions.push(`customer_id = $${i++}`); values.push(customer_id); }
    if (status !== undefined)      { conditions.push(`status = $${i++}`);      values.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT * FROM orders ${where}
       ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      values
    );
    return rows;
  },

  async create({ order_number, customer_id, total_amount, status = 'pending', shipping_address = null, notes = null }) {
    const { rows } = await pool.query(
      `INSERT INTO orders (order_number, customer_id, total_amount, status, shipping_address, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [order_number, customer_id, total_amount, status,
       shipping_address ? JSON.stringify(shipping_address) : null, notes]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['total_amount', 'shipping_address', 'notes'];
    const sets = [];
    const values = [];
    let i = 1;

    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        sets.push(`${key} = $${i++}`);
        values.push(key === 'shipping_address' && val ? JSON.stringify(val) : val);
      }
    }

    if (!sets.length) throw new Error('No valid fields to update');

    sets.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE orders SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async updateStatus(id, newStatus) {
    if (!VALID_STATUSES.includes(newStatus)) {
      throw Object.assign(new Error(`Invalid status: ${newStatus}`), { status: 422 });
    }

    const existing = await Order.findById(id);
    if (!existing) throw Object.assign(new Error('Order not found'), { status: 404 });

    const allowed = STATUS_TRANSITIONS[existing.status];
    if (!allowed.includes(newStatus)) {
      throw Object.assign(
        new Error(`Cannot transition from '${existing.status}' to '${newStatus}'`),
        { status: 422 }
      );
    }

    const { rows } = await pool.query(
      `UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, newStatus]
    );
    return rows[0] || null;
  },

  async count({ customer_id, status } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;
    if (customer_id !== undefined) { conditions.push(`customer_id = $${i++}`); values.push(customer_id); }
    if (status !== undefined)      { conditions.push(`status = $${i++}`);      values.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(`SELECT COUNT(*) AS count FROM orders ${where}`, values);
    return parseInt(rows[0].count, 10);
  },
};

module.exports = Order;
