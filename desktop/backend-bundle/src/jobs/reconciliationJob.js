'use strict';

const cron = require('node-cron');
const Integration = require('../models/Integration');
const { reconcileInvoices, getDailyReconciliationSummary } = require('../services/accounting/reconciliationService');
const logger = require('../config/logger');

let task = null;

async function runDailyReconciliation() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = yesterday.toISOString().split('T')[0];

  logger.info(`Reconciliation job started for ${date}`);

  let integrations;
  try {
    integrations = await Integration.findAllActive();
  } catch (err) {
    logger.error('Reconciliation: failed to fetch integrations', { error: err.message });
    return;
  }

  for (const integration of integrations) {
    try {
      const summary = await getDailyReconciliationSummary(integration.user_id, date);
      logger.info('Daily reconciliation summary', {
        integrationId: integration.id,
        userId: integration.user_id,
        date,
        ...summary
      });
    } catch (err) {
      logger.error(`Reconciliation: failed for integration ${integration.id}`, { error: err.message });
    }
  }

  logger.info('Reconciliation job completed');
}

function start() {
  // Run daily at 2:00 AM
  task = cron.schedule('0 2 * * *', async () => {
    try {
      await runDailyReconciliation();
    } catch (err) {
      logger.error('Reconciliation job error', { error: err.message, stack: err.stack });
    }
  }, { scheduled: false });

  task.start();
  logger.info('Reconciliation cron job scheduled (daily at 2 AM)');
  return task;
}

function stop() {
  if (task) {
    task.stop();
    logger.info('Reconciliation cron job stopped');
  }
}

module.exports = { start, stop, runDailyReconciliation };
