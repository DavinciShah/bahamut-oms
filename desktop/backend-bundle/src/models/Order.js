const { query } = require('../config/database');

class Order {
  static async findById(id) {
    const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const result = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    const countResult = await query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [userId]);
    return {
      orders: result.rows,
      total: parseInt(countResult.rows[0]?.count || '0'),
      page,
      limit
    };
  }

  static async findAll({ page = 1, limit = 10, status, userId } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (status) { conditions.push(`status = $${idx++}`); values.push(status); }
    if (userId) { conditions.push(`user_id = $${idx++}`); values.push(userId); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const result = await query(
      `SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id ${where} ORDER BY o.created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      values
    );

    const countValues = conditions.length > 0 ? values.slice(0, -2) : [];
    const countResult = await query(`SELECT COUNT(*) FROM orders ${where}`, countValues);

    return {
      orders: result.rows,
      total: parseInt(countResult.rows[0]?.count || '0'),
      page,
      limit
    };
  }

  static async create({ userId, shippingAddress, notes }, client) {
    const db = client || { query: (text, params) => require('../config/database').query(text, params) };
    const result = await db.query(
      'INSERT INTO orders (user_id, shipping_address, notes) VALUES ($1, $2, $3) RETURNING *',
      [userId, shippingAddress, notes]
    );
    return result.rows[0];
  }

  static async update(id, { status, totalAmount, shippingAddress, notes }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
    if (totalAmount !== undefined) { fields.push(`total_amount = $${idx++}`); values.push(totalAmount); }
    if (shippingAddress !== undefined) { fields.push(`shipping_address = $${idx++}`); values.push(shippingAddress); }
    if (notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(notes); }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE orders SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }
}

module.exports = Order;
