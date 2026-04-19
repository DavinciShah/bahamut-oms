'use strict';

const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Webhook {
  static async create({ integrationId, userId, url, events, secret = null, active = true }) {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO webhooks (id, integration_id, user_id, url, events, secret, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [id, integrationId, userId, url, JSON.stringify(events), secret, active]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM webhooks WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM webhooks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findByIntegrationId(integrationId) {
    const result = await pool.query(
      'SELECT * FROM webhooks WHERE integration_id = $1 AND active = TRUE ORDER BY created_at DESC',
      [integrationId]
    );
    return result.rows;
  }

  static async findByEvent(eventType) {
    const result = await pool.query(
      "SELECT * FROM webhooks WHERE active = TRUE AND events @> $1::jsonb",
      [JSON.stringify([eventType])]
    );
    return result.rows;
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM webhooks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rowCount > 0;
  }

  static async updateLastTriggered(id, status) {
    const result = await pool.query(
      'UPDATE webhooks SET last_triggered_at = NOW(), last_trigger_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  }

  static async update(id, userId, fields) {
    const allowed = ['url', 'events', 'active', 'secret'];
    const updates = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(key === 'events' ? JSON.stringify(fields[key]) : fields[key]);
      }
    }
    if (updates.length === 0) return null;
    updates.push('updated_at = NOW()');
    values.push(id, userId);

    const result = await pool.query(
      `UPDATE webhooks SET ${updates.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }
}

module.exports = Webhook;
