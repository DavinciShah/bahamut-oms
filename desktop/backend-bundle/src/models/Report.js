const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });

class Report {
  static async create({ tenant_id, name, type, config, created_by }) {
    const result = await pool.query(
      `INSERT INTO reports (tenant_id, name, type, config, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tenant_id, name, type, JSON.stringify(config), created_by]
    );
    return result.rows[0];
  }

  static async findByTenant(tenant_id) {
    const result = await pool.query(
      `SELECT * FROM reports WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenant_id]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(`SELECT * FROM reports WHERE id = $1`, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(`DELETE FROM reports WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
  }

  static async update(id, fields) {
    const sets = Object.keys(fields).map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...Object.values(fields)];
    const result = await pool.query(
      `UPDATE reports SET ${sets} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0];
  }
}

module.exports = Report;
