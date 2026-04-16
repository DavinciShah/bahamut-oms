'use strict';

const pool = require('../config/database');

const Product = {
  async findAll() {
    const { rows } = await pool.query(
      'SELECT * FROM products ORDER BY id'
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE id = $1 LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, description = null, price, stock = 0 }) {
    const { rows } = await pool.query(
      `INSERT INTO products (name, description, price, stock)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, price, stock]
    );
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let i = 1;

    if (data.name        !== undefined) { fields.push(`name = $${i++}`);        values.push(data.name); }
    if (data.description !== undefined) { fields.push(`description = $${i++}`); values.push(data.description); }
    if (data.price       !== undefined) { fields.push(`price = $${i++}`);       values.push(data.price); }
    if (data.stock       !== undefined) { fields.push(`stock = $${i++}`);       values.push(data.stock); }

    if (fields.length === 0) return Product.findById(id);

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = Product;
