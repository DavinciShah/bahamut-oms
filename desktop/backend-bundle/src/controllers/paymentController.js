'use strict';

const paymentService = require('../services/paymentService');

function resolveTenantId(req) {
  return req.tenant?.id || req.user?.tenantId || req.user?.tenant_id || null;
}

const paymentController = {
  async createPayment(req, res) {
    try {
      const { orderId, amount, currency, method } = req.body;
      if (!orderId || amount === undefined) {
        return res.status(400).json({ success: false, error: 'orderId and amount are required' });
      }
      const payment = await paymentService.createPayment(orderId, amount, currency, method, {
        tenantId: req.tenant?.id,
        metadata: req.body.metadata,
      });
      res.status(201).json({ success: true, data: payment });
    } catch (err) {
      console.error('[paymentController.createPayment]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getPayments(req, res) {
    try {
      const tenantId = req.tenant?.id;
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
      if (!/^\d+$/.test(String(req.params.id))) {
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
      const subscription = await paymentService.getSubscription(resolveTenantId(req));
      res.json(subscription);
    } catch (err) {
      console.error('[paymentController.getSubscription]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async updateSubscription(req, res) {
    try {
      const { planId } = req.body;
      if (!planId) {
        return res.status(400).json({ success: false, error: 'planId is required' });
      }
      const subscription = await paymentService.updateSubscription(resolveTenantId(req), planId);
      res.json(subscription);
    } catch (err) {
      console.error('[paymentController.updateSubscription]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async cancelSubscription(req, res) {
    try {
      const subscription = await paymentService.cancelSubscription(resolveTenantId(req));
      res.json(subscription);
    } catch (err) {
      console.error('[paymentController.cancelSubscription]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getPlans(req, res) {
    try {
      const plans = await paymentService.getPlans();
      res.json(plans);
    } catch (err) {
      console.error('[paymentController.getPlans]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getInvoices(req, res) {
    try {
      const tenantId = resolveTenantId(req);
      const { limit, offset } = req.query;
      const invoices = await paymentService.getInvoices(tenantId, {
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      });
      res.json(invoices);
    } catch (err) {
      console.error('[paymentController.getInvoices]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getInvoiceById(req, res) {
    try {
      if (!/^\d+$/.test(String(req.params.id))) {
        return res.status(400).json({ success: false, error: 'Invalid invoice id' });
      }
      const invoice = await paymentService.getInvoiceById(req.params.id);
      res.json(invoice);
    } catch (err) {
      console.error('[paymentController.getInvoiceById]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getPaymentHistory(req, res) {
    try {
      const tenantId = resolveTenantId(req);
      const { limit, offset } = req.query;
      const history = await paymentService.getPaymentHistory(tenantId, {
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      });
      res.json(history);
    } catch (err) {
      console.error('[paymentController.getPaymentHistory]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },
};

module.exports = paymentController;
