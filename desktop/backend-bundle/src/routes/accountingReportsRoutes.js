'use strict';

const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accountingController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/profit-loss', accountingController.getProfitLoss);
router.get('/balance-sheet', accountingController.getBalanceSheet);
router.get('/cash-flow', accountingController.getCashFlow);
router.get('/trial-balance', accountingController.getTrialBalance);
router.get('/journal', accountingController.getJournal);
router.get('/ledger', accountingController.getLedger);
router.get('/accounts', accountingController.getAccounts);

module.exports = router;
