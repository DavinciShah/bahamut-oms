'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const TenantUser = {
  async findByTenant(tenantId, { activeOnly = true } = {}) {
    const where = activeOnly
      ? 'WHERE tu.tenant_id = $1 AND tu.active = true'
      : 'WHERE tu.tenant_id = $1';
    const { rows } = await pool.query(
      `SELECT tu.*, u.email, u.name
       FROM tenant_users tu
       LEFT JOIN users u ON u.id = tu.user_id
       ${where}
       ORDER BY tu.joined_at DESC`,
      [tenantId]
    );
    return rows;
  },

  async findByUser(userId) {
    const { rows } = await pool.query(
      `SELECT tu.*, t.name AS tenant_name, t.slug, t.plan
       FROM tenant_users tu
       LEFT JOIN tenants t ON t.id = tu.tenant_id
       WHERE tu.user_id = $1 AND tu.active = true
       ORDER BY tu.joined_at DESC`,
      [userId]
    );
    return rows;
  },

  async findOne(tenantId, userId) {
    const { rows } = await pool.query(
      'SELECT * FROM tenant_users WHERE tenant_id = $1 AND user_id = $2',
      [tenantId, userId]
    );
    return rows[0] || null;
  },

  async create({ tenantId, userId, role = 'member' }) {
    const { rows } = await pool.query(
      `INSERT INTO tenant_users (tenant_id, user_id, role, active, joined_at)
       VALUES ($1, $2, $3, true, NOW())
       ON CONFLICT (tenant_id, user_id) DO UPDATE SET active = true, role = EXCLUDED.role
       RETURNING *`,
      [tenantId, userId, role]
    );
    return rows[0];
  },

  async updateRole(tenantId, userId, role) {
    const { rows } = await pool.query(
      `UPDATE tenant_users SET role = $3
       WHERE tenant_id = $1 AND user_id = $2
       RETURNING *`,
      [tenantId, userId, role]
    );
    return rows[0] || null;
  },

  async deactivate(tenantId, userId) {
    const { rows } = await pool.query(
      `UPDATE tenant_users SET active = false
       WHERE tenant_id = $1 AND user_id = $2
       RETURNING *`,
      [tenantId, userId]
    );
    return rows[0] || null;
  },
};

module.exports = TenantUser;
