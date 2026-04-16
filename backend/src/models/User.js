'use strict';

const pool = require('../config/database');

const User = {
  /**
   * Find a user by email.
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by id.
   * @param {number|string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, email, username, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user.
   * @param {{ email: string, username: string, password: string, role?: string }} data
   * @returns {Promise<Object>}
   */
  async create({ email, username, password, role = 'user' }) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, username, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, role, created_at, updated_at`,
      [email, username, password, role]
    );
    return rows[0];
  },

  /**
   * Return all users (excluding passwords).
   * @returns {Promise<Object[]>}
   */
  async findAll() {
    const { rows } = await pool.query(
      'SELECT id, email, username, role, created_at, updated_at FROM users ORDER BY id'
    );
    return rows;
  },

  /**
   * Update a user by id.
   * @param {number|string} id
   * @param {{ email?: string, username?: string, role?: string }} data
   * @returns {Promise<Object|null>}
   */
  async update(id, data) {
    const fields = [];
    const values = [];
    let i = 1;

    if (data.email    !== undefined) { fields.push(`email = $${i++}`);    values.push(data.email); }
    if (data.username !== undefined) { fields.push(`username = $${i++}`); values.push(data.username); }
    if (data.role     !== undefined) { fields.push(`role = $${i++}`);     values.push(data.role); }

    if (fields.length === 0) return User.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i}
       RETURNING id, email, username, role, created_at, updated_at`,
      values
    );
    return rows[0] || null;
  },

  /**
   * Delete a user by id.
   * @param {number|string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = User;
