'use strict';

const express = require('express');
const router = express.Router();
// Rate limiting for this router is applied upstream in app.js (Redis-backed apiLimiter).
// Do NOT add a local express-rate-limit here — it would use in-memory storage and break
// multi-instance deployments.
const { authenticateToken } = require('../middleware/auth');
const verifyWebhookSignature = require('../middleware/webhookSignature');
const ctrl = require('../controllers/webhookController');

router.post('/register', authenticateToken, ctrl.registerWebhook);
router.get('/', authenticateToken, ctrl.listWebhooks);
router.delete('/:id', authenticateToken, ctrl.deleteWebhook);
router.post('/test/:id', authenticateToken, ctrl.testWebhook);
// Public endpoint for receiving accounting events — signature-verified by HMAC-SHA256.
router.post(
  '/accounting-events',
  express.raw({ type: '*/*' }),
  verifyWebhookSignature('ACCOUNTING_WEBHOOK_SECRET', 'x-webhook-signature'),
  ctrl.handleAccountingEvent
);

module.exports = router;
