'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/webhookController');

router.post('/register', auth, ctrl.registerWebhook);
router.get('/', auth, ctrl.listWebhooks);
router.delete('/:id', auth, ctrl.deleteWebhook);
router.post('/test/:id', auth, ctrl.testWebhook);
// Public endpoint for receiving accounting events (verified by signature in service layer)
router.post('/accounting-events', ctrl.handleAccountingEvent);

module.exports = router;
