'use strict';

const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class SyncLog {
  static async create({ integrationId, type, status, recordsTotal = 0, recordsSynced = 0, recordsFailed = 0, details = null, error = null }) {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO sync_logs (id, integration_id, type, status, records_total, records_synced, records_failed, details, error, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [id, integrationId, type, status, recordsTotal, recordsSynced, recordsFailed,
        details ? JSON.stringify(details) : null, error]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM sync_logs WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByIntegrationId(integrationId, limit = 50, offset = 0) {
    const result = await pool.query(
      'SELECT * FROM sync_logs WHERE integration_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [integrationId, limit, offset]
    );
    return result.rows;
  }

  static async findByStatus(status, limit = 50) {
    const result = await pool.query(
      'SELECT * FROM sync_logs WHERE status = $1 ORDER BY created_at DESC LIMIT $2',
      [status, limit]
    );
    return result.rows;
  }

  static async updateStatus(id, status, { recordsSynced, recordsFailed, error, details } = {}) {
    const result = await pool.query(
      `UPDATE sync_logs SET
         status = $1,
         records_synced = COALESCE($2, records_synced),
         records_failed = COALESCE($3, records_failed),
         error = COALESCE($4, error),
         details = COALESCE($5, details),
         completed_at = CASE WHEN $1 IN ('completed', 'failed') THEN NOW() ELSE completed_at END,
         updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [status, recordsSynced, recordsFailed, error,
        details ? JSON.stringify(details) : null, id]
    );
    return result.rows[0] || null;
  }

  static async findByUserIntegrations(userId, filters = {}) {
    const values = [userId];
    let idx = 2;
    const conditions = ['i.user_id = $1'];

    if (filters.type) {
      conditions.push(`sl.type = $${idx++}`);
      values.push(filters.type);
    }
    if (filters.status) {
      conditions.push(`sl.status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters.from) {
      conditions.push(`sl.created_at >= $${idx++}`);
      values.push(filters.from);
    }
    if (filters.to) {
      conditions.push(`sl.created_at <= $${idx++}`);
      values.push(filters.to);
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    values.push(limit, offset);

    const result = await pool.query(
      `SELECT sl.*, i.name AS integration_name, i.type AS integration_type
       FROM sync_logs sl
       JOIN integrations i ON sl.integration_id = i.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY sl.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values
    );
    return result.rows;
  }
}

module.exports = SyncLog;
