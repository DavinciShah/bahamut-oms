'use strict';

const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const SYNC_TYPES = ['invoices', 'payments', 'expenses', 'customers', 'products'];

async function recordSyncEvent(type, status, message, meta = {}) {
  try {
    await pool.query(
      `INSERT INTO sync_history (sync_type, status, message, meta, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [type, status, message, JSON.stringify(meta)]
    );
  } catch (_) {
    // Sync history table may not exist yet; log and continue
    logger.warn(`Could not record sync event for ${type}: ${_.message}`);
  }
}

const syncController = {
  async syncInvoices(req, res, next) {
    try {
      logger.info('Starting invoice sync');
      // Placeholder: integrate with external accounting API
      const result = { synced: 0, errors: 0, message: 'Invoice sync not yet configured' };
      await recordSyncEvent('invoices', 'success', result.message, result);
      res.json({ success: true, data: result });
    } catch (err) {
      await recordSyncEvent('invoices', 'error', err.message);
      next(err);
    }
  },

  async syncPayments(req, res, next) {
    try {
      logger.info('Starting payment sync');
      const result = { synced: 0, errors: 0, message: 'Payment sync not yet configured' };
      await recordSyncEvent('payments', 'success', result.message, result);
      res.json({ success: true, data: result });
    } catch (err) {
      await recordSyncEvent('payments', 'error', err.message);
      next(err);
    }
  },

  async syncExpenses(req, res, next) {
    try {
      logger.info('Starting expense sync');
      const result = { synced: 0, errors: 0, message: 'Expense sync not yet configured' };
      await recordSyncEvent('expenses', 'success', result.message, result);
      res.json({ success: true, data: result });
    } catch (err) {
      await recordSyncEvent('expenses', 'error', err.message);
      next(err);
    }
  },

  async syncCustomers(req, res, next) {
    try {
      logger.info('Starting customer sync');
      const result = { synced: 0, errors: 0, message: 'Customer sync not yet configured' };
      await recordSyncEvent('customers', 'success', result.message, result);
      res.json({ success: true, data: result });
    } catch (err) {
      await recordSyncEvent('customers', 'error', err.message);
      next(err);
    }
  },

  async syncProducts(req, res, next) {
    try {
      logger.info('Starting product sync');
      const result = { synced: 0, errors: 0, message: 'Product sync not yet configured' };
      await recordSyncEvent('products', 'success', result.message, result);
      res.json({ success: true, data: result });
    } catch (err) {
      await recordSyncEvent('products', 'error', err.message);
      next(err);
    }
  },

  async syncAll(req, res, next) {
    try {
      logger.info('Starting full sync');
      const results = {};
      for (const type of SYNC_TYPES) {
        results[type] = { synced: 0, errors: 0, message: `${type} sync not yet configured` };
        await recordSyncEvent(type, 'success', results[type].message, results[type]);
      }
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  },

  async getSyncStatus(req, res, next) {
    try {
      const statuses = {};
      for (const type of SYNC_TYPES) {
        const { rows } = await pool.query(
          `SELECT status, message, created_at
           FROM sync_history
           WHERE sync_type = $1
           ORDER BY created_at DESC LIMIT 1`,
          [type]
        ).catch(() => ({ rows: [] }));
        statuses[type] = rows[0] || { status: 'never_run', message: null, created_at: null };
      }
      res.json({ success: true, data: statuses });
    } catch (err) {
      next(err);
    }
  },

  async getSyncHistory(req, res, next) {
    try {
      const { type, limit = 50, offset = 0 } = req.query;
      const conditions = [];
      const values = [];
      let i = 1;
      if (type) { conditions.push(`sync_type = $${i++}`); values.push(type); }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      values.push(Number(limit), Number(offset));

      const { rows } = await pool.query(
        `SELECT * FROM sync_history ${where}
         ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
        values
      ).catch(() => ({ rows: [] }));

      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = syncController;
