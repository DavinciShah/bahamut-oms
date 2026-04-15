'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/syncController');

router.post('/invoices', auth, ctrl.syncInvoices);
router.post('/payments', auth, ctrl.syncPayments);
router.post('/expenses', auth, ctrl.syncExpenses);
router.post('/customers', auth, ctrl.syncCustomers);
router.post('/products', auth, ctrl.syncProducts);
router.get('/status', auth, ctrl.getSyncStatus);
router.get('/logs', auth, ctrl.getSyncLogs);
router.post('/retry/:id', auth, ctrl.retrySyncById);

module.exports = router;
