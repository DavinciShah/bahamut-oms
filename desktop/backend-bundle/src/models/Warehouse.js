'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const Warehouse = {
  async findAll({ activeOnly = false } = {}) {
    const where = activeOnly ? 'WHERE active = true' : '';
    const { rows } = await pool.query(
      `SELECT * FROM warehouses ${where} ORDER BY name`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM warehouses WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  async findByCode(code) {
    const { rows } = await pool.query(
      'SELECT * FROM warehouses WHERE code = $1',
      [code]
    );
    return rows[0] || null;
  },

  async create({ name, code, address, city, country, managerId = null }) {
    const { rows } = await pool.query(
      `INSERT INTO warehouses (name, code, address, city, country, manager_id, active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
       RETURNING *`,
      [name, code, address, city, country, managerId]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['name', 'code', 'address', 'city', 'country', 'manager_id', 'active'];
    const sets = [];
    const values = [];
    let i = 1;

    for (const [key, val] of Object.entries(fields)) {
      const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowed.includes(col)) {
        sets.push(`${col} = $${i++}`);
        values.push(val);
      }
    }

    if (!sets.length) throw new Error('No valid fields to update');

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE warehouses SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rowCount } = await pool.query(
      'DELETE FROM warehouses WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  },
};

module.exports = Warehouse;
