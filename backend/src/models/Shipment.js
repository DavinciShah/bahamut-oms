const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });

class Shipment {
  static async create({ tenant_id, order_id, carrier, tracking_number, status, from_address, to_address, weight, dimensions, label_url }) {
    const result = await pool.query(
      `INSERT INTO shipments (tenant_id, order_id, carrier, tracking_number, status, from_address, to_address, weight, dimensions, label_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [tenant_id, order_id, carrier, tracking_number, status || 'created',
       JSON.stringify(from_address), JSON.stringify(to_address), weight,
       JSON.stringify(dimensions), label_url]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(`SELECT * FROM shipments WHERE id = $1`, [id]);
    return result.rows[0];
  }

  static async findByTenant(tenant_id, options = {}) {
    const { limit = 50, offset = 0, status } = options;
    let query = `SELECT s.*, o.order_number FROM shipments s
                 LEFT JOIN orders o ON o.id = s.order_id
                 WHERE s.tenant_id = $1`;
    const params = [tenant_id];
    if (status) {
      params.push(status);
      query += ` AND s.status = $${params.length}`;
    }
    query += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE shipments SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, status]
    );
    return result.rows[0];
  }

  static async cancel(id) {
    return Shipment.updateStatus(id, 'cancelled');
  }

  static async findByTrackingNumber(tracking_number) {
    const result = await pool.query(
      `SELECT * FROM shipments WHERE tracking_number = $1`,
      [tracking_number]
    );
    return result.rows[0];
  }

  static async findActive() {
    const result = await pool.query(
      `SELECT * FROM shipments WHERE status NOT IN ('delivered', 'cancelled')
       ORDER BY created_at DESC`
    );
    return result.rows;
  }
}

module.exports = Shipment;
