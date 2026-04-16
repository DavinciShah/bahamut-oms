'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const Notification = {
  async findAll(userId, { limit = 50, offset = 0, unreadOnly = false } = {}) {
    const conditions = ['user_id = $1'];
    const values = [userId];
    let paramIndex = 2;

    if (unreadOnly) {
      conditions.push(`read = false`);
    }

    const where = conditions.join(' AND ');
    const query = `
      SELECT * FROM notifications
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);
    return rows;
  },

  async findById(id, userId) {
    const { rows } = await pool.query(
      'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rows[0] || null;
  },

  async create({ userId, type, title, message, data = null }) {
    const { rows } = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data, read, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW())
       RETURNING *`,
      [userId, type, title, message, data ? JSON.stringify(data) : null]
    );
    return rows[0];
  },

  async markRead(id, userId) {
    const { rows } = await pool.query(
      `UPDATE notifications SET read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return rows[0] || null;
  },

  async markAllRead(userId) {
    const { rowCount } = await pool.query(
      `UPDATE notifications SET read = true
       WHERE user_id = $1 AND read = false`,
      [userId]
    );
    return rowCount;
  },

  async deleteById(id, userId) {
    const { rowCount } = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return rowCount > 0;
  },

  async deleteAll(userId) {
    const { rowCount } = await pool.query(
      'DELETE FROM notifications WHERE user_id = $1',
      [userId]
    );
    return rowCount;
  },

  async countUnread(userId) {
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    );
    return parseInt(rows[0].count, 10);
  },

  async countAll(userId) {
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1',
      [userId]
    );
    return parseInt(rows[0].count, 10);
  },
};

module.exports = Notification;
