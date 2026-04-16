const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });

class Ticket {
  static async create({ tenant_id, customer_id, subject, status, priority, category, assigned_to }) {
    const result = await pool.query(
      `INSERT INTO tickets (tenant_id, customer_id, subject, status, priority, category, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [tenant_id, customer_id, subject, status || 'open', priority || 'medium', category, assigned_to]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT t.*, u.name AS customer_name, u.email AS customer_email,
              a.name AS assigned_to_name
       FROM tickets t
       LEFT JOIN users u ON u.id = t.customer_id
       LEFT JOIN users a ON a.id = t.assigned_to
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByTenant(tenant_id, options = {}) {
    const { status, priority, assigned_to, limit = 50, offset = 0 } = options;
    let query = `SELECT t.*, u.name AS customer_name, u.email AS customer_email
                 FROM tickets t
                 LEFT JOIN users u ON u.id = t.customer_id
                 WHERE t.tenant_id = $1`;
    const params = [tenant_id];
    if (status) { params.push(status); query += ` AND t.status = $${params.length}`; }
    if (priority) { params.push(priority); query += ` AND t.priority = $${params.length}`; }
    if (assigned_to) { params.push(assigned_to); query += ` AND t.assigned_to = $${params.length}`; }
    query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async update(id, fields) {
    const allowed = ['status', 'priority', 'category', 'assigned_to', 'subject'];
    const updates = Object.keys(fields).filter(k => allowed.includes(k));
    if (!updates.length) return Ticket.findById(id);
    const sets = updates.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = [id, ...updates.map(k => fields[k])];
    const result = await pool.query(
      `UPDATE tickets SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async close(id) {
    const result = await pool.query(
      `UPDATE tickets SET status = 'closed', closed_at = NOW(), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  static async assign(id, userId) {
    const result = await pool.query(
      `UPDATE tickets SET assigned_to = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, userId]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(`DELETE FROM tickets WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
  }
}

module.exports = Ticket;
