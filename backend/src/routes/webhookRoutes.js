'use strict';

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');
const verifyWebhookSignature = require('../middleware/webhookSignature');
const ctrl = require('../controllers/webhookController');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

router.post('/register', apiLimiter, authenticateToken, ctrl.registerWebhook);
router.get('/', apiLimiter, authenticateToken, ctrl.listWebhooks);
router.delete('/:id', apiLimiter, authenticateToken, ctrl.deleteWebhook);
router.post('/test/:id', apiLimiter, authenticateToken, ctrl.testWebhook);
// Public endpoint for receiving accounting events — signature-verified by HMAC-SHA256.
router.post(
  '/accounting-events',
  express.raw({ type: '*/*' }),
  verifyWebhookSignature('ACCOUNTING_WEBHOOK_SECRET', 'x-webhook-signature'),
  ctrl.handleAccountingEvent
);

module.exports = router;
