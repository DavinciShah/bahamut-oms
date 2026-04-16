class Order {
  static async findAll(pool, filters = {}) {
    let query = `
      SELECT o.*, u.name AS user_name, u.email AS user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (filters.status) {
      params.push(filters.status);
      conditions.push(`o.status = $${params.length}`);
    }
    if (filters.user_id) {
      params.push(filters.user_id);
      conditions.push(`o.user_id = $${params.length}`);
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY o.created_at DESC';

    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async findById(pool, id) {
    const { rows } = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  static async create(pool, orderData) {
    const { user_id, status = 'pending', total_amount, notes } = orderData;
    const { rows } = await pool.query(
      `INSERT INTO orders (user_id, status, total_amount, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, status, total_amount, notes]
    );
    return rows[0];
  }

  static async updateStatus(pool, id, status) {
    const { rows } = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    return rows[0] || null;
  }

  static async delete(pool, id) {
    const { rowCount } = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

module.exports = Order;
