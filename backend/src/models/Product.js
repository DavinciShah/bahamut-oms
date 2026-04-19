const { query } = require('../config/database');

class Product {
  static async findById(id) {
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findAll({ page = 1, limit = 10, category, search } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (category) { conditions.push(`category = $${idx++}`); values.push(category); }
    if (search) { conditions.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`); values.push(`%${search}%`); idx++; }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const result = await query(
      `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      values
    );

    const countValues = conditions.length > 0 ? values.slice(0, -2) : [];
    const countResult = await query(`SELECT COUNT(*) FROM products ${where}`, countValues);

    return {
      products: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit
    };
  }

  static async create({ name, description, price, stock = 0, category, sku }) {
    const result = await query(
      'INSERT INTO products (name, description, price, stock, category, sku) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, stock, category, sku]
    );
    return result.rows[0];
  }

  static async update(id, { name, description, price, stock, category, sku }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (price !== undefined) { fields.push(`price = $${idx++}`); values.push(price); }
    if (stock !== undefined) { fields.push(`stock = $${idx++}`); values.push(stock); }
    if (category !== undefined) { fields.push(`category = $${idx++}`); values.push(category); }
    if (sku !== undefined) { fields.push(`sku = $${idx++}`); values.push(sku); }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  static async updateStock(id, quantity) {
    const result = await query(
      'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    return result.rows[0] || null;
  }

  static async findBySku(sku) {
    const result = await query('SELECT * FROM products WHERE sku = $1', [sku]);
    return result.rows[0] || null;
  }
}

module.exports = Product;
