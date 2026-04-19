'use strict';

const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class JournalEntry {
  static async create({ integrationId, userId, date, reference, description, currency = 'INR', details = [] }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const totalDebit = details.reduce((s, d) => s + (parseFloat(d.debit) || 0), 0);
      const totalCredit = details.reduce((s, d) => s + (parseFloat(d.credit) || 0), 0);

      const id = uuidv4();
      const entryResult = await client.query(
        `INSERT INTO journal_entries (id, integration_id, user_id, date, reference, description, currency, total_debit, total_credit, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft', NOW(), NOW())
         RETURNING *`,
        [id, integrationId, userId, date, reference, description, currency, totalDebit, totalCredit]
      );

      const entry = entryResult.rows[0];

      for (const detail of details) {
        const detailId = uuidv4();
        await client.query(
          `INSERT INTO journal_entry_details (id, journal_entry_id, account_id, account_name, debit, credit, description, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [detailId, id, detail.accountId, detail.accountName, detail.debit || 0, detail.credit || 0, detail.description || null]
        );
      }

      await client.query('COMMIT');
      return entry;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    const entryResult = await pool.query('SELECT * FROM journal_entries WHERE id = $1', [id]);
    const entry = entryResult.rows[0];
    if (!entry) return null;

    const detailsResult = await pool.query(
      'SELECT * FROM journal_entry_details WHERE journal_entry_id = $1 ORDER BY created_at',
      [id]
    );
    entry.details = detailsResult.rows;
    return entry;
  }

  static async findByIntegrationId(integrationId, limit = 50, offset = 0) {
    const result = await pool.query(
      'SELECT * FROM journal_entries WHERE integration_id = $1 ORDER BY date DESC, created_at DESC LIMIT $2 OFFSET $3',
      [integrationId, limit, offset]
    );
    return result.rows;
  }

  static async findByUserId(userId, filters = {}) {
    const values = [userId];
    let idx = 2;
    const conditions = ['je.user_id = $1'];

    if (filters.from) {
      conditions.push(`je.date >= $${idx++}`);
      values.push(filters.from);
    }
    if (filters.to) {
      conditions.push(`je.date <= $${idx++}`);
      values.push(filters.to);
    }
    if (filters.status) {
      conditions.push(`je.status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters.reference) {
      conditions.push(`je.reference ILIKE $${idx++}`);
      values.push(`%${filters.reference}%`);
    }

    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    values.push(limit, offset);

    const result = await pool.query(
      `SELECT je.* FROM journal_entries je
       WHERE ${conditions.join(' AND ')}
       ORDER BY je.date DESC, je.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values
    );
    return result.rows;
  }

  static async findByDateRange(userId, from, to) {
    const result = await pool.query(
      'SELECT * FROM journal_entries WHERE user_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date',
      [userId, from, to]
    );
    return result.rows;
  }

  static async markAsSynced(id, externalId = null) {
    const result = await pool.query(
      "UPDATE journal_entries SET status = 'synced', external_id = COALESCE($2, external_id), synced_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *",
      [id, externalId]
    );
    return result.rows[0] || null;
  }

  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE journal_entries SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  }
}

module.exports = JournalEntry;
