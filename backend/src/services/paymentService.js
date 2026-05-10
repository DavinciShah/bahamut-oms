'use strict';

const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const stripeService = require('./stripeService');

const paymentService = {
  async createPayment(orderId, amount, currency = 'usd', method = 'stripe', extra = {}) {
    const tenantId = extra.tenantId || null;
    let providerPaymentId = null;
    let status = 'pending';

    if (method === 'stripe') {
      try {
        const intent = await stripeService.createPaymentIntent(amount, currency, {
          orderId: String(orderId),
          ...(extra.metadata || {}),
        });
        providerPaymentId = intent.id;
        status = intent.status === 'succeeded' ? 'succeeded' : 'pending';
      } catch (err) {
        console.error('[paymentService.createPayment] Stripe error:', err.message);
        status = 'failed';
      }
    }

    const payment = await Payment.create({
      tenantId,
      orderId,
      amount,
      currency,
      status,
      provider: method,
      providerPaymentId,
      metadata: extra.metadata || null,
    });

    return payment;
  },

  async getPayments(tenantId, options = {}) {
    const { limit = 50, offset = 0, orderId, status } = options;
    const [payments, total] = await Promise.all([
      Payment.findAll({ tenantId, orderId, status, limit, offset }),
      Payment.count({ tenantId }),
    ]);
    return { payments, total, limit, offset };
  },

  async getPaymentById(id) {
    const payment = await Payment.findById(id);
    if (!payment) throw Object.assign(new Error('Payment not found'), { status: 404 });
    return payment;
  },

  async getSubscription(tenantId) {
    const rows = await Subscription.findByTenant(tenantId);
    if (!rows || rows.length === 0) {
      return { status: 'active', plan_name: 'free' };
    }
    const sub = rows[0];
    return {
      status: sub.status,
      plan_name: sub.plan,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
    };
  },

  getPlans() {
    return [
      { id: 'free',       name: 'Free',       price: 0,    currency: 'usd', features: ['Up to 5 orders/month'] },
      { id: 'starter',    name: 'Starter',    price: 29,   currency: 'usd', features: ['Up to 100 orders/month'] },
      { id: 'growth',     name: 'Growth',     price: 99,   currency: 'usd', features: ['Unlimited orders'] },
      { id: 'enterprise', name: 'Enterprise', price: null, currency: 'usd', features: ['Custom pricing'] },
    ];
  },

  async getInvoices(tenantId) {
    return Invoice.findAll({ tenantId });
  },

  async getHistory(tenantId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    return Payment.findAll({ tenantId, limit, offset });
  },

  async refundPayment(paymentId, amount) {
    const payment = await this.getPaymentById(paymentId);

    if (payment.provider === 'stripe' && payment.provider_payment_id) {
      await stripeService.createRefund(payment.provider_payment_id, amount);
    }

    const updated = await Payment.updateStatus(paymentId, 'refunded');
    return updated;
  },
};

module.exports = paymentService;
