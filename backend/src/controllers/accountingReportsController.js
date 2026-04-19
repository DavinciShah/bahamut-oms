'use strict';

const accountingReportsService = require('../services/accountingReportsService');

async function getProfitLoss(req, res, next) {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ success: false, message: 'from and to date params are required' });
    const report = await accountingReportsService.getProfitLoss(req.user.id, { from, to });
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

async function getBalanceSheet(req, res, next) {
  try {
    const report = await accountingReportsService.getBalanceSheet(req.user.id, req.query.date);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

async function getCashFlow(req, res, next) {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ success: false, message: 'from and to date params are required' });
    const report = await accountingReportsService.getCashFlow(req.user.id, { from, to });
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

async function getTrialBalance(req, res, next) {
  try {
    const report = await accountingReportsService.getTrialBalance(req.user.id, req.query.date);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

async function getJournalEntries(req, res, next) {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      status: req.query.status,
      reference: req.query.reference,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };
    const entries = await accountingReportsService.getJournalEntries(req.user.id, filters);
    res.json({ success: true, data: entries });
  } catch (err) {
    next(err);
  }
}

async function getGeneralLedger(req, res, next) {
  try {
    const filters = {
      accountId: req.query.accountId,
      from: req.query.from,
      to: req.query.to
    };
    const ledger = await accountingReportsService.getGeneralLedger(req.user.id, filters);
    res.json({ success: true, data: ledger });
  } catch (err) {
    next(err);
  }
}

async function getChartOfAccounts(req, res, next) {
  try {
    const accounts = await accountingReportsService.getChartOfAccounts(req.user.id);
    res.json({ success: true, data: accounts });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfitLoss,
  getBalanceSheet,
  getCashFlow,
  getTrialBalance,
  getJournalEntries,
  getGeneralLedger,
  getChartOfAccounts
};
