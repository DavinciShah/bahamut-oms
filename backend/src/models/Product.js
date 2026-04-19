'use strict';

const pool = require('../config/database');

const Product = {
  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async findBySku(sku) {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE sku = $1 LIMIT 1',
      [sku]
    );
    return rows[0] || null;
  },

  async findAll({ category, active, search, limit = 50, offset = 0 } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;

    if (category !== undefined) { conditions.push(`category = $${i++}`); values.push(category); }
    if (active   !== undefined) { conditions.push(`active = $${i++}`);   values.push(active); }
    if (search) {
      conditions.push(`(name ILIKE $${i} OR sku ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT * FROM products ${where}
       ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      values
    );
    return rows;
  },

  async create({ name, description = null, sku = null, price, stock_quantity, stock, category = null, active = true }) {
    const qty = stock_quantity != null ? stock_quantity : (stock != null ? stock : 0);
    const { rows } = await pool.query(
      `INSERT INTO products (name, description, sku, price, stock_quantity, category, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [name, description, sku, price, qty, category, active]
    );
    return rows[0];
  },

  async update(id, fields) {
    const mapping = {
      name: 'name', description: 'description', sku: 'sku', price: 'price',
      stock_quantity: 'stock_quantity', stock: 'stock_quantity',
      category: 'category', active: 'active',
    };
    const sets = [];
    const values = [];
    let i = 1;

    for (const [key, val] of Object.entries(fields)) {
      const col = mapping[key];
      if (col) {
        sets.push(`${col} = $${i++}`);
        values.push(val);
      }
    }

    if (!sets.length) return Product.findById(id);

    sets.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await pool.query(
      `UPDATE products SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return rowCount > 0;
  },

  async updateStock(id, quantityDelta) {
    const { rows } = await pool.query(
      `UPDATE products
       SET stock_quantity = GREATEST(0, stock_quantity + $2), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, quantityDelta]
    );
    return rows[0] || null;
  },

  async count({ category, active } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;
    if (category !== undefined) { conditions.push(`category = $${i++}`); values.push(category); }
    if (active   !== undefined) { conditions.push(`active = $${i++}`);   values.push(active); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await pool.query(`SELECT COUNT(*) AS count FROM products ${where}`, values);
    return parseInt(rows[0].count, 10);
  },
};

module.exports = Product;
