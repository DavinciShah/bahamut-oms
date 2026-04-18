'use strict';

const paymentService = require('../services/paymentService');

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
};

module.exports = paymentController;
