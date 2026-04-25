'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const Invoice = {
  async findAll({ tenantId, customerId, status, limit = 50, offset = 0 } = {}) {
    try {
      const conditions = [];
      const values = [];
      let i = 1;

      if (tenantId)    { conditions.push(`tenant_id = $${i++}`);    values.push(tenantId); }
      if (customerId)  { conditions.push(`customer_id = $${i++}`);  values.push(customerId); }
      if (status)      { conditions.push(`status = $${i++}`);       values.push(status); }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      values.push(limit, offset);

      const { rows } = await pool.query(
        `SELECT * FROM invoices ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
        values
      );
      return rows;
    } catch (err) {
      // Backward compatibility for legacy schemas that do not have tenant_id.
      if (err.code === '42703' && /tenant_id/.test(err.message)) {
        const values = [limit, offset];
        const { rows } = await pool.query(
          'SELECT * FROM invoices ORDER BY created_at DESC LIMIT $1 OFFSET $2',
          values
        );
        return rows;
      }
      throw err;
    }
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create({ tenantId, customerId, items, subtotal, tax, total, status, dueDate }) {
    const { rows } = await pool.query(
      `INSERT INTO invoices
         (tenant_id, customer_id, items, subtotal, tax, total, status, due_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [tenantId, customerId, JSON.stringify(items), subtotal, tax, total,
       status || 'draft', dueDate || null]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['status', 'paid_at', 'due_date', 'items', 'subtotal', 'tax', 'total'];
    const sets = [];
    const values = [];
    let i = 1;

    for (const [key, val] of Object.entries(fields)) {
      const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowed.includes(col)) {
        sets.push(`${col} = $${i++}`);
        values.push(col === 'items' ? JSON.stringify(val) : val);
      }
    }

    if (!sets.length) throw new Error('No valid fields to update');

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE invoices SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] || null;
  },
};

module.exports = Invoice;
