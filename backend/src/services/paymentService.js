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
      return { status: 'active', plan_name: 'free', plan_id: 'free', interval: 'monthly' };
    }
    const sub = rows[0];
    return {
      status: sub.status,
      plan_name: sub.plan,
      plan_id: sub.plan,
      interval: 'monthly',
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
    };
  },

  getPlans() {
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'usd',
        prices: { usd: 0, inr: 0, aed: 0 },
        order_limit: 20,
        features: ['1 user', '1 warehouse', 'Basic stock tracking'],
      },
      {
        id: 'standard',
        name: 'Standard',
        price: 29,
        currency: 'usd',
        prices: { usd: 29, inr: 2400, aed: 106 },
        order_limit: 500,
        features: ['2 users', 'Multiple integrations', 'Composite items'],
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 79,
        currency: 'usd',
        prices: { usd: 79, inr: 6550, aed: 290 },
        order_limit: 3000,
        features: ['2 warehouses', 'Serial/batch tracking'],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 149,
        currency: 'usd',
        prices: { usd: 149, inr: 12350, aed: 547 },
        order_limit: 15000,
        features: ['7 warehouses', 'Advanced analytics'],
      },
    ];
  },

  async getInvoices(tenantId) {
    return Invoice.findAll({ tenantId });
  },

  async getInvoiceById(id) {
    const invoice = await Invoice.findById(id);
    if (!invoice) throw Object.assign(new Error('Invoice not found'), { status: 404 });
    return invoice;
  },

  async getHistory(tenantId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    return Payment.findAll({ tenantId, limit, offset });
  },

  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw Object.assign(new Error('amount must be a positive number'), { status: 400 });
    }

    const intent = await stripeService.createPaymentIntent(numericAmount, currency, metadata);
    return {
      id: intent.id,
      client_secret: intent.client_secret,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
    };
  },

  async updateSubscription(tenantId, planId) {
    const plan = this.getPlans().find((item) => item.id === planId);
    if (!plan) {
      throw Object.assign(new Error('Invalid plan id'), { status: 400 });
    }

    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const rows = await Subscription.findByTenant(tenantId);
    const existing = rows[0];
    const status = plan.id === 'free' ? 'active' : 'active';

    if (existing) {
      await Subscription.update(existing.id, {
        plan: plan.id,
        status,
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
      });
    } else {
      await Subscription.create({
        tenantId,
        plan: plan.id,
        status,
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth,
      });
    }

    return this.getSubscription(tenantId);
  },

  async cancelSubscription(tenantId) {
    const rows = await Subscription.findByTenant(tenantId);
    const existing = rows[0];
    const now = new Date();

    if (existing) {
      await Subscription.update(existing.id, {
        status: 'cancelled',
        currentPeriodEnd: now,
      });
      return this.getSubscription(tenantId);
    }

    await Subscription.create({
      tenantId,
      plan: 'free',
      status: 'cancelled',
      currentPeriodStart: now,
      currentPeriodEnd: now,
    });
    return this.getSubscription(tenantId);
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
