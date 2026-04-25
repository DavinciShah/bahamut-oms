'use strict';

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');
const ctrl = require('../controllers/webhookController');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

router.post('/register', apiLimiter, authenticateToken, ctrl.registerWebhook);
router.get('/', apiLimiter, authenticateToken, ctrl.listWebhooks);
router.delete('/:id', apiLimiter, authenticateToken, ctrl.deleteWebhook);
router.post('/test/:id', apiLimiter, authenticateToken, ctrl.testWebhook);
// Public endpoint for receiving accounting events (verified by signature in service layer)
router.post('/accounting-events', ctrl.handleAccountingEvent);

module.exports = router;
