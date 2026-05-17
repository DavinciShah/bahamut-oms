const { query } = require('../config/database');

class User {
  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async create({ name, email, password, role = 'user' }) {
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, password, role]
    );
    return result.rows[0];
  }

  static async update(id, { name, email, role }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
    if (role !== undefined) { fields.push(`role = $${idx++}`); values.push(role); }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  static async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const result = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    const countResult = await query('SELECT COUNT(*) FROM users');
    return {
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    };
  }

  static async search(searchQuery) {
    const result = await query(
      "SELECT id, name, email, role, created_at, updated_at FROM users WHERE name ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC",
      [`%${searchQuery}%`]
    );
    return result.rows;
  }

  static async updateRefreshToken(id, refreshToken) {
    const result = await query(
      'UPDATE users SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [refreshToken, id]
    );
    return result.rows[0] || null;
  }

  static async findByRefreshToken(token) {
    const result = await query('SELECT * FROM users WHERE refresh_token = $1', [token]);
    return result.rows[0] || null;
  }
}

module.exports = User;
