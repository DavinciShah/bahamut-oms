'use strict';

const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Integration {
  static async create({ userId, type, name, config, status = 'active' }) {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO integrations (id, user_id, type, name, config, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [id, userId, type, name, JSON.stringify(config), status]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM integrations WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM integrations WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async update(id, userId, fields) {
    const allowedFields = ['name', 'config', 'status'];
    const updates = [];
    const values = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(field === 'config' ? JSON.stringify(fields[field]) : fields[field]);
      }
    }

    if (updates.length === 0) return null;

    updates.push(`updated_at = NOW()`);
    values.push(id, userId);

    const result = await pool.query(
      `UPDATE integrations SET ${updates.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM integrations WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rowCount > 0;
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE integrations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  }

  static async updateLastSync(id) {
    const result = await pool.query(
      'UPDATE integrations SET last_sync_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findActiveByType(type) {
    const result = await pool.query(
      "SELECT * FROM integrations WHERE type = $1 AND status = 'active'",
      [type]
    );
    return result.rows;
  }

  static async findAllActive() {
    const result = await pool.query(
      "SELECT * FROM integrations WHERE status = 'active'"
    );
    return result.rows;
  }
}

module.exports = Integration;
