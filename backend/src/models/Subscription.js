'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const Subscription = {
  async findByTenant(tenantId) {
    const { rows } = await pool.query(
      'SELECT * FROM subscriptions WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM subscriptions WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async findByStripeId(stripeSubscriptionId) {
    const { rows } = await pool.query(
      'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1',
      [stripeSubscriptionId]
    );
    return rows[0] || null;
  },

  async create({ tenantId, plan, status, stripeSubscriptionId, currentPeriodStart, currentPeriodEnd }) {
    const { rows } = await pool.query(
      `INSERT INTO subscriptions
         (tenant_id, plan, status, stripe_subscription_id, current_period_start, current_period_end, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [tenantId, plan, status || 'active', stripeSubscriptionId, currentPeriodStart, currentPeriodEnd]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['plan', 'status', 'current_period_start', 'current_period_end', 'stripe_subscription_id'];
    const sets = [];
    const values = [];
    let i = 1;

    for (const [key, val] of Object.entries(fields)) {
      const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowed.includes(col)) {
        sets.push(`${col} = $${i++}`);
        values.push(val);
      }
    }

    if (!sets.length) throw new Error('No valid fields to update');

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE subscriptions SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] || null;
  },
};

module.exports = Subscription;
