'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/integrationController');

router.get('/', auth, ctrl.listIntegrations);
router.post('/connect', auth, ctrl.connectIntegration);
router.get('/:id', auth, ctrl.getIntegration);
router.put('/:id', auth, ctrl.updateIntegration);
router.delete('/:id', auth, ctrl.deleteIntegration);
router.get('/:id/status', auth, ctrl.getIntegrationStatus);
router.post('/:id/test', auth, ctrl.testIntegration);

module.exports = router;
