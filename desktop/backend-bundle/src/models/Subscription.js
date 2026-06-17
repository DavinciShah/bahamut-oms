'use strict';

const { pool } = require('../config/database');

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

  async findByRazorpayOrderId(razorpayOrderId) {
    const { rows } = await pool.query(
      'SELECT * FROM subscriptions WHERE razorpay_order_id = $1',
      [razorpayOrderId]
    );
    return rows[0] || null;
  },

  async findByRazorpaySubId(razorpaySubscriptionId) {
    const { rows } = await pool.query(
      'SELECT * FROM subscriptions WHERE razorpay_subscription_id = $1',
      [razorpaySubscriptionId]
    );
    return rows[0] || null;
  },

  async create({ tenantId, plan, status, stripeSubscriptionId, razorpaySubscriptionId, razorpayOrderId, razorpayPaymentId, razorpaySignature, currentPeriodStart, currentPeriodEnd }) {
    const { rows } = await pool.query(
      `INSERT INTO subscriptions
         (tenant_id, plan, status, stripe_subscription_id, razorpay_subscription_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, current_period_start, current_period_end, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [
        tenantId,
        plan,
        status || 'active',
        stripeSubscriptionId || null,
        razorpaySubscriptionId || null,
        razorpayOrderId || null,
        razorpayPaymentId || null,
        razorpaySignature || null,
        currentPeriodStart,
        currentPeriodEnd
      ]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = [
      'plan',
      'status',
      'current_period_start',
      'current_period_end',
      'stripe_subscription_id',
      'razorpay_subscription_id',
      'razorpay_order_id',
      'razorpay_payment_id',
      'razorpay_signature'
    ];
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
