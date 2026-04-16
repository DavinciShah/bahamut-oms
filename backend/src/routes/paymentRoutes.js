'use strict';

const { Router } = require('express');
const router = Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');
const stripeWebhook = require('../webhooks/stripeWebhook');

// Stripe webhook – raw body needed, no JWT auth
router.post(
  '/webhook',
  require('express').raw({ type: 'application/json' }),
  stripeWebhook.handleWebhook
);

router.use(authenticate);

router.post('/create',       paymentController.createPayment);
router.get('/',              paymentController.getPayments);
router.get('/:id',           paymentController.getPaymentById);
router.post('/:id/refund',   paymentController.refundPayment);

module.exports = router;
