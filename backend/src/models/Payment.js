'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const Payment = {
  async findAll({ tenantId, orderId, status, limit = 50, offset = 0 } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;

    if (tenantId) { conditions.push(`tenant_id = $${i++}`); values.push(tenantId); }
    if (orderId)  { conditions.push(`order_id = $${i++}`);  values.push(orderId); }
    if (status)   { conditions.push(`status = $${i++}`);    values.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT * FROM payments ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      values
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create({ tenantId, orderId, amount, currency, status, provider, providerPaymentId, metadata }) {
    const { rows } = await pool.query(
      `INSERT INTO payments
         (tenant_id, order_id, amount, currency, status, provider, provider_payment_id, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [tenantId, orderId, amount, currency, status || 'pending', provider, providerPaymentId,
       metadata ? JSON.stringify(metadata) : null]
    );
    return rows[0];
  },

  async updateStatus(id, status, extra = {}) {
    const sets = ['status = $2'];
    const values = [id, status];
    let i = 3;

    if (extra.providerPaymentId !== undefined) {
      sets.push(`provider_payment_id = $${i++}`);
      values.push(extra.providerPaymentId);
    }
    if (extra.metadata !== undefined) {
      sets.push(`metadata = $${i++}`);
      values.push(JSON.stringify(extra.metadata));
    }

    const { rows } = await pool.query(
      `UPDATE payments SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async count({ tenantId } = {}) {
    const where = tenantId ? 'WHERE tenant_id = $1' : '';
    const values = tenantId ? [tenantId] : [];
    const { rows } = await pool.query(`SELECT COUNT(*) AS count FROM payments ${where}`, values);
    return parseInt(rows[0].count, 10);
  },
};

module.exports = Payment;
