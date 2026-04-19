'use strict';

const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

const syncHandler = (type) => async (req, res, next) => {
  try {
    const { integration_id } = req.body;
    const parsedId = integration_id != null ? parseInt(integration_id, 10) : null;
    if (integration_id != null && (isNaN(parsedId) || parsedId <= 0)) {
      return res.status(400).json({ error: 'integration_id must be a positive integer' });
    }
    // If integration_id provided, verify it exists
    if (parsedId) {
      const { rowCount } = await req.app.locals.db.query(
        'SELECT 1 FROM integrations WHERE id = $1', [parsedId]
      );
      if (!rowCount) return res.status(404).json({ error: 'Integration not found' });
    }
    await req.app.locals.db.query(
      `INSERT INTO sync_logs (integration_id, type, status, records_synced)
       VALUES ($1, $2, 'pending', 0)`,
      [parsedId, type]
    );
    res.json({ message: `${type} sync initiated`, type, status: 'pending' });
  } catch (err) {
    next(err);
  }
};

router.post('/invoices', syncHandler('invoices'));
router.post('/payments', syncHandler('payments'));
router.post('/expenses', syncHandler('expenses'));
router.post('/customers', syncHandler('customers'));
router.post('/products', syncHandler('products'));

router.get('/status', async (req, res, next) => {
  try {
    const { rows } = await req.app.locals.db.query(
      `SELECT sl.*, i.name AS integration_name, i.type AS integration_type
       FROM sync_logs sl
       LEFT JOIN integrations i ON sl.integration_id = i.id
       ORDER BY sl.created_at DESC LIMIT 50`
    );
    res.json({ syncStatus: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/logs', async (req, res, next) => {
  try {
    const { rows } = await req.app.locals.db.query(
      'SELECT * FROM sync_logs ORDER BY created_at DESC LIMIT 200'
    );
    res.json({ logs: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/retry', async (req, res, next) => {
  try {
    const { log_id } = req.body;
    if (!log_id) return res.status(400).json({ error: 'log_id is required' });
    const { rows } = await req.app.locals.db.query(
      `UPDATE sync_logs SET status = 'pending', error_message = NULL
       WHERE id = $1 RETURNING *`,
      [log_id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Sync log not found' });
    res.json({ message: 'Sync retry initiated', log: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
