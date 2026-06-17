'use strict';

const paymentService = require('../services/paymentService');

const paymentController = {
  _resolveTenantId(req) {
    return req.tenant?.id || req.user?.tenant_id || null;
  },

  async createPayment(req, res) {
    try {
      const { orderId, amount, currency, method } = req.body;
      if (!orderId || amount === undefined) {
        return res.status(400).json({ success: false, error: 'orderId and amount are required' });
      }
      const payment = await paymentService.createPayment(orderId, amount, currency, method, {
        tenantId: paymentController._resolveTenantId(req),
        metadata: req.body.metadata,
      });
      res.status(201).json({ success: true, data: payment });
    } catch (err) {
      console.error('[paymentController.createPayment]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async createPaymentIntent(req, res) {
    try {
      const { amount, currency, metadata } = req.body;
      const intent = await paymentService.createPaymentIntent(amount, currency, metadata || {});
      res.status(201).json(intent);
    } catch (err) {
      console.error('[paymentController.createPaymentIntent]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getPayments(req, res) {
    try {
      const tenantId = paymentController._resolveTenantId(req);
      const { limit, offset, orderId, status } = req.query;
      const result = await paymentService.getPayments(tenantId, {
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
        orderId,
        status,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      console.error('[paymentController.getPayments]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getPaymentById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid payment id' });
      }
      const payment = await paymentService.getPaymentById(req.params.id);
      res.json({ success: true, data: payment });
    } catch (err) {
      console.error('[paymentController.getPaymentById]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async refundPayment(req, res) {
    try {
      const { amount } = req.body;
      const updated = await paymentService.refundPayment(req.params.id, amount);
      res.json({ success: true, data: updated });
    } catch (err) {
      console.error('[paymentController.refundPayment]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getSubscription(req, res) {
    try {
      const tenantId = paymentController._resolveTenantId(req);
      const subscription = await paymentService.getSubscription(tenantId);
      res.json(subscription);
    } catch (err) {
      console.error('[paymentController.getSubscription]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async updateSubscription(req, res) {
    try {
      const tenantId = paymentController._resolveTenantId(req);
      if (!tenantId) {
        return res.status(400).json({ success: false, error: 'Tenant context is required' });
      }
      const { planId } = req.body;
      if (!planId) {
        return res.status(400).json({ success: false, error: 'planId is required' });
      }
      const subscription = await paymentService.updateSubscription(tenantId, planId);
      res.json(subscription);
    } catch (err) {
      console.error('[paymentController.updateSubscription]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async cancelSubscription(req, res) {
    try {
      const tenantId = paymentController._resolveTenantId(req);
      if (!tenantId) {
        return res.status(400).json({ success: false, error: 'Tenant context is required' });
      }
      const subscription = await paymentService.cancelSubscription(tenantId);
      res.json(subscription);
    } catch (err) {
      console.error('[paymentController.cancelSubscription]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getPlans(req, res) {
    try {
      const plans = paymentService.getPlans();
      res.json(plans);
    } catch (err) {
      console.error('[paymentController.getPlans]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getInvoices(req, res) {
    try {
      const tenantId = paymentController._resolveTenantId(req);
      const invoices = await paymentService.getInvoices(tenantId);
      res.json(invoices);
    } catch (err) {
      console.error('[paymentController.getInvoices]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getInvoiceById(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid invoice id' });
      }
      const invoice = await paymentService.getInvoiceById(id);
      res.json(invoice);
    } catch (err) {
      console.error('[paymentController.getInvoiceById]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getHistory(req, res) {
    try {
      const tenantId = paymentController._resolveTenantId(req);
      const rawLimit = parseInt(req.query.limit, 10);
      const rawOffset = parseInt(req.query.offset, 10);
      const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 50;
      const offset = Number.isInteger(rawOffset) && rawOffset >= 0 ? rawOffset : 0;
      const history = await paymentService.getHistory(tenantId, { limit, offset });
      res.json(history);
    } catch (err) {
      console.error('[paymentController.getHistory]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async createRazorpayOrder(req, res) {
    try {
      const { amount, currency, planId } = req.body;
      if (amount === undefined || !planId) {
        return res.status(400).json({ success: false, error: 'amount and planId are required' });
      }

      const tenantId = paymentController._resolveTenantId(req);
      const razorpayService = require('../services/razorpayService');
      
      const order = await razorpayService.createOrder(amount, currency || 'INR');
      
      // Create a local payment record representing the transaction
      const Payment = require('../models/Payment');
      await Payment.create({
        tenantId,
        orderId: null, // subscription, not a product order
        amount,
        currency: currency || 'INR',
        status: 'pending',
        provider: 'razorpay',
        providerPaymentId: order.id,
        metadata: { planId, razorpay_order_id: order.id }
      });

      res.status(201).json({ success: true, order });
    } catch (err) {
      console.error('[paymentController.createRazorpayOrder]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async verifyRazorpayPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
        return res.status(400).json({ success: false, error: 'Missing required verification fields' });
      }

      const razorpayService = require('../services/razorpayService');
      const isVerified = razorpayService.verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isVerified) {
        return res.status(400).json({ success: false, error: 'Signature verification failed' });
      }

      const tenantId = paymentController._resolveTenantId(req);
      if (!tenantId) {
        return res.status(400).json({ success: false, error: 'Tenant context is required' });
      }

      const { query } = require('../config/database');
      const Payment = require('../models/Payment');
      const Subscription = require('../models/Subscription');

      // Update payment record
      const { rows } = await query(
        'SELECT * FROM payments WHERE provider_payment_id = $1',
        [razorpay_order_id]
      );
      
      if (rows[0]) {
        await Payment.updateStatus(rows[0].id, 'succeeded');
        // also store the actual payment ID as provider payment ID
        await query(
          'UPDATE payments SET provider_payment_id = $1 WHERE id = $2',
          [razorpay_payment_id, rows[0].id]
        );
      }

      // Update/Create subscription
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const subRows = await Subscription.findByTenant(tenantId);
      const existing = subRows[0];

      let sub;
      if (existing) {
        sub = await Subscription.update(existing.id, {
          plan: planId,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: nextMonth,
          razorpaySubscriptionId: null,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
        });
      } else {
        sub = await Subscription.create({
          tenantId,
          plan: planId,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: nextMonth,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
        });
      }

      res.json({
        success: true,
        message: 'Payment verified and subscription activated',
        subscription: {
          status: sub.status,
          plan_name: sub.plan,
          plan_id: sub.plan,
          current_period_start: sub.current_period_start,
          current_period_end: sub.current_period_end,
        }
      });
    } catch (err) {
      console.error('[paymentController.verifyRazorpayPayment]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

module.exports = paymentController;
