'use strict';

const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const stripeService = require('./stripeService');

const BILLING_PLANS = [
  { id: 'free', name: 'Free', price: 0, features: ['Basic usage', 'Community support'] },
  { id: 'starter', name: 'Starter', price: 29, features: ['Up to 1,000 orders', 'Email support'] },
  { id: 'pro', name: 'Pro', price: 99, features: ['Up to 10,000 orders', 'Priority support', 'Advanced analytics'] },
  { id: 'enterprise', name: 'Enterprise', price: 299, features: ['Unlimited orders', 'Dedicated support', 'Custom integrations'] },
];

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

  async refundPayment(paymentId, amount) {
    const payment = await this.getPaymentById(paymentId);

    if (payment.provider === 'stripe' && payment.provider_payment_id) {
      await stripeService.createRefund(payment.provider_payment_id, amount);
    }

    const updated = await Payment.updateStatus(paymentId, 'refunded');
    return updated;
  },

  async getSubscription(tenantId) {
    if (!tenantId) {
      return {
        plan_id: 'free',
        plan: 'Free',
        plan_name: 'Free',
        status: 'active',
        interval: 'Monthly',
        current_period_end: null,
      };
    }

    const subscriptions = await Subscription.findByTenant(tenantId);
    const current = subscriptions[0];

    if (!current) {
      return {
        plan_id: 'free',
        plan: 'Free',
        plan_name: 'Free',
        status: 'active',
        interval: 'Monthly',
        current_period_end: null,
      };
    }

    const matchingPlan = BILLING_PLANS.find((plan) => plan.id === current.plan);
    return {
      ...current,
      plan_id: current.plan,
      plan_name: matchingPlan?.name || current.plan,
      interval: 'Monthly',
      current_period_end: current.current_period_end,
    };
  },

  async getPlans() {
    return BILLING_PLANS;
  },

  async updateSubscription(tenantId, planId) {
    const selectedPlan = BILLING_PLANS.find((plan) => plan.id === planId);
    if (!selectedPlan) {
      throw Object.assign(new Error('Invalid plan selected'), { status: 400 });
    }

    if (!tenantId) {
      throw Object.assign(new Error('Unable to resolve tenant for subscription update'), { status: 400 });
    }

    const now = new Date();
    const nextCycle = new Date(now);
    nextCycle.setDate(nextCycle.getDate() + 30);

    const subscriptions = await Subscription.findByTenant(tenantId);
    const existing = subscriptions[0];
    let updated;

    if (existing) {
      updated = await Subscription.update(existing.id, {
        plan: selectedPlan.id,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: nextCycle,
      });
    } else {
      updated = await Subscription.create({
        tenantId,
        plan: selectedPlan.id,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: nextCycle,
      });
    }

    return {
      ...updated,
      plan_id: selectedPlan.id,
      plan_name: selectedPlan.name,
      interval: 'Monthly',
      current_period_end: updated.current_period_end,
    };
  },

  async cancelSubscription(tenantId) {
    if (!tenantId) {
      throw Object.assign(new Error('Unable to resolve tenant for subscription cancellation'), { status: 400 });
    }

    const subscriptions = await Subscription.findByTenant(tenantId);
    const existing = subscriptions[0];

    if (!existing) {
      return {
        plan_id: 'free',
        plan: 'Free',
        plan_name: 'Free',
        status: 'canceled',
        interval: 'Monthly',
        current_period_end: new Date(),
      };
    }

    const updated = await Subscription.update(existing.id, {
      status: 'canceled',
      currentPeriodEnd: new Date(),
    });

    const selectedPlan = BILLING_PLANS.find((plan) => plan.id === updated.plan);
    return {
      ...updated,
      plan_id: updated.plan,
      plan_name: selectedPlan?.name || updated.plan,
      interval: 'Monthly',
      current_period_end: updated.current_period_end,
    };
  },

  async getInvoices(tenantId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    return Invoice.findAll({ tenantId, limit, offset });
  },

  async getInvoiceById(id) {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      throw Object.assign(new Error('Invoice not found'), { status: 404 });
    }
    return invoice;
  },

  async getPaymentHistory(tenantId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    const payments = await Payment.findAll({ tenantId, limit, offset });
    return payments.map((payment) => ({
      ...payment,
      payment_method: payment.provider || 'Card',
      description: payment.description || 'Payment',
    }));
  },
};

module.exports = paymentService;
