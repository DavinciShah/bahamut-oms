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
};

module.exports = paymentController;
