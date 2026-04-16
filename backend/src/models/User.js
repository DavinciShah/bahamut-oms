'use strict';

const pool = require('../config/database');

const User = {
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT id, email, username, password, role, created_at, updated_at FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, email, username, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ email, username, password, role = 'user' }) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, username, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, role, created_at, updated_at`,
      [email, username || null, password, role]
    );
    return rows[0];
  },

  async emailExists(email) {
    const { rows } = await pool.query(
      'SELECT 1 FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return rows.length > 0;
  },
};

module.exports = User;
