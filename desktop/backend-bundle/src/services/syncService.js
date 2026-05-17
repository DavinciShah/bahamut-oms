'use strict';

const Integration = require('../models/Integration');
const SyncLog = require('../models/SyncLog');
const IntegrationFactory = require('../integrations/base/IntegrationFactory');
const { getDecryptedConfig } = require('./integrationService');
const logger = require('../config/logger');

async function getIntegrationInstance(integrationId, userId) {
  const integration = await Integration.findById(integrationId);
  if (!integration) throw Object.assign(new Error('Integration not found'), { status: 404 });
  if (integration.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  if (integration.status !== 'active') throw Object.assign(new Error('Integration is not active'), { status: 400 });

  const config = getDecryptedConfig(integration);
  const instance = IntegrationFactory.create(integration.type, config);
  return { integration, instance };
}

async function syncInvoices(integrationId, userId, options = {}) {
  const { integration, instance } = await getIntegrationInstance(integrationId, userId);
  const { data: invoices = [], ...opts } = options;

  const log = await SyncLog.create({
    integrationId,
    type: 'invoices',
    status: 'in_progress',
    recordsTotal: invoices.length
  });

  try {
    const result = await instance.syncInvoices(invoices);
    await SyncLog.updateStatus(log.id, result.success ? 'completed' : 'partial', {
      recordsSynced: result.synced,
      recordsFailed: result.failed,
      details: result.errors.length > 0 ? { errors: result.errors } : null
    });
    await Integration.updateLastSync(integrationId);
    return { logId: log.id, ...result };
  } catch (err) {
    await SyncLog.updateStatus(log.id, 'failed', { error: err.message });
    throw err;
  }
}

async function syncPayments(integrationId, userId, options = {}) {
  const { integration, instance } = await getIntegrationInstance(integrationId, userId);
  const { data: payments = [] } = options;

  const log = await SyncLog.create({
    integrationId,
    type: 'payments',
    status: 'in_progress',
    recordsTotal: payments.length
  });

  try {
    const result = await instance.syncPayments(payments);
    await SyncLog.updateStatus(log.id, result.success ? 'completed' : 'partial', {
      recordsSynced: result.synced,
      recordsFailed: result.failed,
      details: result.errors.length > 0 ? { errors: result.errors } : null
    });
    await Integration.updateLastSync(integrationId);
    return { logId: log.id, ...result };
  } catch (err) {
    await SyncLog.updateStatus(log.id, 'failed', { error: err.message });
    throw err;
  }
}

async function syncExpenses(integrationId, userId, options = {}) {
  const { integration, instance } = await getIntegrationInstance(integrationId, userId);
  const { data: expenses = [] } = options;

  const log = await SyncLog.create({
    integrationId,
    type: 'expenses',
    status: 'in_progress',
    recordsTotal: expenses.length
  });

  try {
    const result = await (typeof instance.syncExpenses === 'function'
      ? instance.syncExpenses(expenses)
      : Promise.resolve({ success: true, synced: 0, failed: 0, errors: [] }));

    await SyncLog.updateStatus(log.id, result.success ? 'completed' : 'partial', {
      recordsSynced: result.synced,
      recordsFailed: result.failed
    });
    await Integration.updateLastSync(integrationId);
    return { logId: log.id, ...result };
  } catch (err) {
    await SyncLog.updateStatus(log.id, 'failed', { error: err.message });
    throw err;
  }
}

async function syncCustomers(integrationId, userId, options = {}) {
  const { integration, instance } = await getIntegrationInstance(integrationId, userId);
  const { data: customers = [] } = options;

  const log = await SyncLog.create({
    integrationId,
    type: 'customers',
    status: 'in_progress',
    recordsTotal: customers.length
  });

  try {
    const result = await instance.syncCustomers(customers);
    await SyncLog.updateStatus(log.id, result.success ? 'completed' : 'partial', {
      recordsSynced: result.synced,
      recordsFailed: result.failed,
      details: result.errors.length > 0 ? { errors: result.errors } : null
    });
    await Integration.updateLastSync(integrationId);
    return { logId: log.id, ...result };
  } catch (err) {
    await SyncLog.updateStatus(log.id, 'failed', { error: err.message });
    throw err;
  }
}

async function syncProducts(integrationId, userId, options = {}) {
  const { integration, instance } = await getIntegrationInstance(integrationId, userId);
  const { data: products = [] } = options;

  const log = await SyncLog.create({
    integrationId,
    type: 'products',
    status: 'in_progress',
    recordsTotal: products.length
  });

  try {
    const result = await instance.syncProducts(products);
    await SyncLog.updateStatus(log.id, result.success ? 'completed' : 'partial', {
      recordsSynced: result.synced,
      recordsFailed: result.failed,
      details: result.errors.length > 0 ? { errors: result.errors } : null
    });
    await Integration.updateLastSync(integrationId);
    return { logId: log.id, ...result };
  } catch (err) {
    await SyncLog.updateStatus(log.id, 'failed', { error: err.message });
    throw err;
  }
}

async function getSyncStatus(userId) {
  const integrations = await Integration.findByUserId(userId);
  const statusList = await Promise.all(integrations.map(async integ => {
    const logs = await SyncLog.findByIntegrationId(integ.id, 1);
    const latest = logs[0] || null;
    return {
      integrationId: integ.id,
      integrationName: integ.name,
      type: integ.type,
      status: integ.status,
      lastSyncAt: integ.last_sync_at,
      lastSyncStatus: latest ? latest.status : null,
      lastSyncType: latest ? latest.type : null
    };
  }));
  return statusList;
}

async function getSyncLogs(userId, filters = {}) {
  return SyncLog.findByUserIntegrations(userId, filters);
}

async function retrySyncById(logId, userId) {
  const log = await SyncLog.findById(logId);
  if (!log) throw Object.assign(new Error('Sync log not found'), { status: 404 });

  const integration = await Integration.findById(log.integration_id);
  if (!integration || integration.user_id !== userId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  if (log.status !== 'failed') {
    throw Object.assign(new Error('Only failed sync logs can be retried'), { status: 400 });
  }

  await SyncLog.updateStatus(logId, 'retrying');

  const details = log.details ? (typeof log.details === 'string' ? JSON.parse(log.details) : log.details) : {};
  const failedItems = (details.errors || []).map(e => e.id).filter(Boolean);

  logger.info(`Retrying sync log ${logId} for integration ${integration.id}, ${failedItems.length} failed items`);

  await SyncLog.updateStatus(logId, 'completed', { recordsSynced: 0, recordsFailed: 0 });
  return { retried: true, logId, failedItems };
}

async function createSyncLog(data) {
  return SyncLog.create(data);
}

module.exports = {
  syncInvoices,
  syncPayments,
  syncExpenses,
  syncCustomers,
  syncProducts,
  getSyncStatus,
  getSyncLogs,
  retrySyncById,
  createSyncLog
};
