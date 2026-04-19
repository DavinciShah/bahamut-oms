'use strict';

const cron = require('node-cron');
const Integration = require('../models/Integration');
const syncService = require('../services/syncService');
const logger = require('../config/logger');

let task = null;

async function runAutoSync() {
  logger.info('Auto-sync job started');

  let integrations;
  try {
    integrations = await Integration.findAllActive();
  } catch (err) {
    logger.error('Auto-sync: failed to fetch integrations', { error: err.message });
    return;
  }

  for (const integration of integrations) {
    try {
      logger.info(`Auto-sync: triggering for integration ${integration.id} (${integration.type})`);

      // Sync with empty data arrays to trigger incremental sync if supported
      await syncService.syncInvoices(integration.id, integration.user_id, { data: [] });
    } catch (err) {
      logger.error(`Auto-sync: failed for integration ${integration.id}`, { error: err.message });
    }
  }

  logger.info('Auto-sync job completed');
}

function start() {
  // Run every hour at :00
  task = cron.schedule('0 * * * *', async () => {
    try {
      await runAutoSync();
    } catch (err) {
      logger.error('Auto-sync job error', { error: err.message, stack: err.stack });
    }
  }, { scheduled: false });

  task.start();
  logger.info('Auto-sync cron job scheduled (every hour)');
  return task;
}

function stop() {
  if (task) {
    task.stop();
    logger.info('Auto-sync cron job stopped');
  }
}

module.exports = { start, stop, runAutoSync };
