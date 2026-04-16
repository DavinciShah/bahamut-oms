'use strict';

const Payment = require('../models/Payment');
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
