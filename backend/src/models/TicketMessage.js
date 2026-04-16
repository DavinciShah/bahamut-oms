const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });

class TicketMessage {
  static async create({ ticket_id, sender_id, message, attachments }) {
    const result = await pool.query(
      `INSERT INTO ticket_messages (ticket_id, sender_id, message, attachments)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [ticket_id, sender_id, message, JSON.stringify(attachments || [])]
    );
    await pool.query(
      `UPDATE tickets SET updated_at = NOW() WHERE id = $1`,
      [ticket_id]
    );
    return result.rows[0];
  }

  static async findByTicket(ticket_id) {
    const result = await pool.query(
      `SELECT tm.*, u.name AS sender_name, u.email AS sender_email
       FROM ticket_messages tm
       LEFT JOIN users u ON u.id = tm.sender_id
       WHERE tm.ticket_id = $1
       ORDER BY tm.created_at ASC`,
      [ticket_id]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(`SELECT * FROM ticket_messages WHERE id = $1`, [id]);
    return result.rows[0];
  }
}

module.exports = TicketMessage;
