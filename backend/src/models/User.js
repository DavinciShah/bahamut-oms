'use strict';

const pool = require('../config/database');

const User = {
  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, name, email, username, role, phone, active, email_verified, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [String(email).toLowerCase()]
    );
    return rows[0] || null;
  },

  async emailExists(email) {
    const { rows } = await pool.query(
      'SELECT 1 FROM users WHERE email = $1 LIMIT 1',
      [String(email).toLowerCase()]
    );
    return rows.length > 0;
  },

  async create({ name, email, username, password, password_hash, role = 'user', phone = null }) {
    const pwdValue = password_hash || password;
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, username, password, role, phone, active, email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, false, NOW(), NOW())
       RETURNING id, name, email, username, role, phone, active, email_verified, created_at, updated_at`,
      [name || null, String(email).toLowerCase(), username || null, pwdValue, role, phone]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['name', 'email', 'username', 'role', 'phone', 'active', 'email_verified'];
    const sets = [];
    const values = [];
    let i = 1;

    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        sets.push(`${key} = $${i++}`);
        values.push(key === 'email' ? String(val).toLowerCase() : val);
      }
    }

    if (!sets.length) throw new Error('No valid fields to update');
    sets.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${i}
       RETURNING id, name, email, username, role, phone, active, email_verified, created_at, updated_at`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return rowCount > 0;
  },

  async updatePassword(id, passwordHash) {
    const { rows } = await pool.query(
      `UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, email, updated_at`,
      [passwordHash, id]
    );
    return rows[0] || null;
  },

  async findAll({ role, active, limit = 50, offset = 0 } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;

    if (role !== undefined)   { conditions.push(`role = $${i++}`);   values.push(role); }
    if (active !== undefined) { conditions.push(`active = $${i++}`); values.push(active); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT id, name, email, username, role, phone, active, email_verified, created_at, updated_at
       FROM users ${where}
       ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      values
    );
    return rows;
  },

  async count({ role, active } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;
    if (role !== undefined)   { conditions.push(`role = $${i++}`);   values.push(role); }
    if (active !== undefined) { conditions.push(`active = $${i++}`); values.push(active); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(`SELECT COUNT(*) AS count FROM users ${where}`, values);
    return parseInt(rows[0].count, 10);
  },
};

module.exports = User;
