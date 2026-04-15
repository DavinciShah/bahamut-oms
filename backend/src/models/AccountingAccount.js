'use strict';

const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class AccountingAccount {
  static async create({ integrationId, userId, code, name, type, subtype = null, balance = 0, currency = 'INR', description = null, active = true }) {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO accounting_accounts (id, integration_id, user_id, code, name, type, subtype, balance, currency, description, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [id, integrationId, userId, code, name, type, subtype, balance, currency, description, active]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM accounting_accounts WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByIntegrationId(integrationId) {
    const result = await pool.query(
      'SELECT * FROM accounting_accounts WHERE integration_id = $1 AND active = TRUE ORDER BY code',
      [integrationId]
    );
    return result.rows;
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM accounting_accounts WHERE user_id = $1 AND active = TRUE ORDER BY code',
      [userId]
    );
    return result.rows;
  }

  static async findByType(userId, type) {
    const result = await pool.query(
      'SELECT * FROM accounting_accounts WHERE user_id = $1 AND type = $2 AND active = TRUE ORDER BY code',
      [userId, type]
    );
    return result.rows;
  }

  static async update(id, userId, fields) {
    const allowed = ['code', 'name', 'type', 'subtype', 'description', 'active'];
    const updates = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }
    if (updates.length === 0) return null;
    updates.push('updated_at = NOW()');
    values.push(id, userId);

    const result = await pool.query(
      `UPDATE accounting_accounts SET ${updates.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async updateBalance(id, balance) {
    const result = await pool.query(
      'UPDATE accounting_accounts SET balance = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [balance, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM accounting_accounts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rowCount > 0;
  }

  static async upsertByCode(integrationId, userId, account) {
    const existing = await pool.query(
      'SELECT * FROM accounting_accounts WHERE integration_id = $1 AND code = $2',
      [integrationId, account.code]
    );
    if (existing.rows[0]) {
      return this.update(existing.rows[0].id, userId, account);
    }
    return this.create({ integrationId, userId, ...account });
  }
}

module.exports = AccountingAccount;
