'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const Tenant = {
  async findAll({ activeOnly = false } = {}) {
    const where = activeOnly ? 'WHERE active = true' : '';
    const { rows } = await pool.query(`SELECT * FROM tenants ${where} ORDER BY name`);
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM tenants WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async findBySlug(slug) {
    const { rows } = await pool.query('SELECT * FROM tenants WHERE slug = $1', [slug]);
    return rows[0] || null;
  },

  async findByDomain(domain) {
    const { rows } = await pool.query('SELECT * FROM tenants WHERE domain = $1', [domain]);
    return rows[0] || null;
  },

  async create({ name, slug, domain = null, settings = {}, plan = 'free' }) {
    const { rows } = await pool.query(
      `INSERT INTO tenants (name, slug, domain, settings, plan, active, created_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       RETURNING *`,
      [name, slug, domain, JSON.stringify(settings), plan]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['name', 'slug', 'domain', 'settings', 'plan', 'active'];
    const sets = [];
    const values = [];
    let i = 1;

    for (const [key, val] of Object.entries(fields)) {
      if (allowed.includes(key)) {
        sets.push(`${key} = $${i++}`);
        values.push(key === 'settings' ? JSON.stringify(val) : val);
      }
    }

    if (!sets.length) throw new Error('No valid fields to update');

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE tenants SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM tenants WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = Tenant;
