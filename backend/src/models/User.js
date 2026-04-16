class User {
  static async findAll(pool) {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(pool, id) {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  static async findByEmail(pool, email) {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  }

  static async create(pool, userData) {
    const { name, email, password, role = 'user' } = userData;
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, password, role]
    );
    return rows[0];
  }

  static async update(pool, id, userData) {
    const { name, email, role } = userData;
    const { rows } = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email),
       role = COALESCE($3, role), updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, role, id]
    );
    return rows[0] || null;
  }

  static async delete(pool, id) {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

module.exports = User;
