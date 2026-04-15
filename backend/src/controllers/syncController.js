'use strict';

const syncService = require('../services/syncService');

async function syncInvoices(req, res, next) {
  try {
    const { integrationId, data, options } = req.body;
    if (!integrationId) return res.status(400).json({ success: false, message: 'integrationId is required' });
    const result = await syncService.syncInvoices(integrationId, req.user.id, { data: data || [], ...options });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function syncPayments(req, res, next) {
  try {
    const { integrationId, data, options } = req.body;
    if (!integrationId) return res.status(400).json({ success: false, message: 'integrationId is required' });
    const result = await syncService.syncPayments(integrationId, req.user.id, { data: data || [], ...options });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function syncExpenses(req, res, next) {
  try {
    const { integrationId, data, options } = req.body;
    if (!integrationId) return res.status(400).json({ success: false, message: 'integrationId is required' });
    const result = await syncService.syncExpenses(integrationId, req.user.id, { data: data || [], ...options });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function syncCustomers(req, res, next) {
  try {
    const { integrationId, data, options } = req.body;
    if (!integrationId) return res.status(400).json({ success: false, message: 'integrationId is required' });
    const result = await syncService.syncCustomers(integrationId, req.user.id, { data: data || [], ...options });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function syncProducts(req, res, next) {
  try {
    const { integrationId, data, options } = req.body;
    if (!integrationId) return res.status(400).json({ success: false, message: 'integrationId is required' });
    const result = await syncService.syncProducts(integrationId, req.user.id, { data: data || [], ...options });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getSyncStatus(req, res, next) {
  try {
    const status = await syncService.getSyncStatus(req.user.id);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}

async function getSyncLogs(req, res, next) {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      from: req.query.from,
      to: req.query.to,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };
    const logs = await syncService.getSyncLogs(req.user.id, filters);
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

async function retrySyncById(req, res, next) {
  try {
    const result = await syncService.retrySyncById(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  syncInvoices,
  syncPayments,
  syncExpenses,
  syncCustomers,
  syncProducts,
  getSyncStatus,
  getSyncLogs,
  retrySyncById
};
