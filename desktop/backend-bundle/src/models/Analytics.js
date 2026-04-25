const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });

class Analytics {
  static async create({ tenant_id, event_type, data, user_id }) {
    const result = await pool.query(
      `INSERT INTO analytics_events (tenant_id, event_type, data, user_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [tenant_id, event_type, JSON.stringify(data), user_id]
    );
    return result.rows[0];
  }

  static async findByTenant(tenant_id, options = {}) {
    const { limit = 100, offset = 0, event_type } = options;
    let query = `SELECT * FROM analytics_events WHERE tenant_id = $1`;
    const params = [tenant_id];
    if (event_type) {
      params.push(event_type);
      query += ` AND event_type = $${params.length}`;
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findByDateRange(tenant_id, from, to) {
    const result = await pool.query(
      `SELECT * FROM analytics_events
       WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
       ORDER BY created_at DESC`,
      [tenant_id, from, to]
    );
    return result.rows;
  }

  static async countByEventType(tenant_id, from, to) {
    const result = await pool.query(
      `SELECT event_type, COUNT(*) as count
       FROM analytics_events
       WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
       GROUP BY event_type`,
      [tenant_id, from, to]
    );
    return result.rows;
  }
}

module.exports = Analytics;
