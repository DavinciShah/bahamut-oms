const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}` });

class TrackingEvent {
  static async create({ shipment_id, status, location, description, timestamp }) {
    const result = await pool.query(
      `INSERT INTO tracking_events (shipment_id, status, location, description, timestamp)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [shipment_id, status, location, description, timestamp || new Date()]
    );
    return result.rows[0];
  }

  static async findByShipment(shipment_id) {
    const result = await pool.query(
      `SELECT * FROM tracking_events WHERE shipment_id = $1 ORDER BY timestamp DESC`,
      [shipment_id]
    );
    return result.rows;
  }

  static async createMany(events) {
    const results = [];
    for (const event of events) {
      results.push(await TrackingEvent.create(event));
    }
    return results;
  }
}

module.exports = TrackingEvent;
