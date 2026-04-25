'use strict';

const { Router, raw } = require('express');
const router = Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');
const rateLimit = require('../middleware/rateLimitMiddleware');
const stripeWebhook = require('../webhooks/stripeWebhook');

// Stripe webhook – raw body needed, no JWT auth
router.post('/webhook', raw({ type: 'application/json' }), stripeWebhook.handleWebhook);

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
router.use(authenticate);
router.use(limiter);

router.get('/subscription',   paymentController.getSubscription);
router.put('/subscription',   paymentController.updateSubscription);
router.post('/subscription/cancel', paymentController.cancelSubscription);
router.get('/plans',          paymentController.getPlans);
router.get('/invoices',       paymentController.getInvoices);
router.get('/invoices/:id',   paymentController.getInvoiceById);
router.get('/history',        paymentController.getPaymentHistory);

router.post('/create',       paymentController.createPayment);
router.get('/',              paymentController.getPayments);
router.get('/:id',           paymentController.getPaymentById);
router.post('/:id/refund',   paymentController.refundPayment);

module.exports = router;
