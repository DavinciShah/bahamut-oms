'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/accountingReportsController');

router.get('/profit-loss', auth, ctrl.getProfitLoss);
router.get('/balance-sheet', auth, ctrl.getBalanceSheet);
router.get('/cash-flow', auth, ctrl.getCashFlow);
router.get('/trial-balance', auth, ctrl.getTrialBalance);
router.get('/journal', auth, ctrl.getJournalEntries);
router.get('/ledger', auth, ctrl.getGeneralLedger);
router.get('/accounts', auth, ctrl.getChartOfAccounts);

module.exports = router;
