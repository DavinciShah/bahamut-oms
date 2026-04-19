'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
});

const accountingService = {
  /**
   * Record a double-entry journal entry.
   * debitAccount / creditAccount are account codes (e.g. 'cash', 'revenue').
   */
  async createJournalEntry({ date, description, amount, debitAccount, creditAccount, reference = null, createdBy = null }) {
    const { rows } = await pool.query(
      `INSERT INTO journal_entries
         (date, description, amount, debit_account, credit_account, reference, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [date || new Date(), description, amount, debitAccount, creditAccount, reference, createdBy]
    );
    return rows[0];
  },

  /**
   * Fetch journal entries with optional filters.
   */
  async getJournalEntries({ startDate, endDate, account, limit = 100, offset = 0 } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;

    if (startDate) { conditions.push(`date >= $${i++}`); values.push(startDate); }
    if (endDate)   { conditions.push(`date <= $${i++}`); values.push(endDate); }
    if (account)   {
      conditions.push(`(debit_account = $${i} OR credit_account = $${i})`);
      values.push(account);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT * FROM journal_entries ${where}
       ORDER BY date DESC, created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      values
    );
    return rows;
  },

  /**
   * Return a ledger view: running balance for a specific account.
   */
  async getLedger(account, { startDate, endDate } = {}) {
    const conditions = [`(debit_account = $1 OR credit_account = $1)`];
    const values = [account];
    let i = 2;

    if (startDate) { conditions.push(`date >= $${i++}`); values.push(startDate); }
    if (endDate)   { conditions.push(`date <= $${i++}`); values.push(endDate); }

    const { rows } = await pool.query(
      `SELECT *,
         CASE WHEN debit_account = $1 THEN amount ELSE 0 END AS debit,
         CASE WHEN credit_account = $1 THEN amount ELSE 0 END AS credit
       FROM journal_entries
       WHERE ${conditions.join(' AND ')}
       ORDER BY date ASC, created_at ASC`,
      values
    );

    let balance = 0;
    return rows.map((row) => {
      balance += Number(row.debit) - Number(row.credit);
      return { ...row, balance };
    });
  },

  /**
   * Trial balance: sum of debits and credits per account.
   */
  async getTrialBalance({ startDate, endDate } = {}) {
    const conditions = [];
    const values = [];
    let i = 1;
    if (startDate) { conditions.push(`date >= $${i++}`); values.push(startDate); }
    if (endDate)   { conditions.push(`date <= $${i++}`); values.push(endDate); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT account,
              SUM(debit)  AS total_debit,
              SUM(credit) AS total_credit
       FROM (
         SELECT debit_account AS account, amount AS debit, 0 AS credit FROM journal_entries ${where}
         UNION ALL
         SELECT credit_account AS account, 0 AS debit, amount AS credit FROM journal_entries ${where}
       ) t
       GROUP BY account
       ORDER BY account`,
      [...values, ...values]
    );
    return rows;
  },

  /**
   * Profit & Loss between two dates.
   */
  async generateProfitLoss({ startDate, endDate }) {
    const conditions = [];
    const values = [];
    let i = 1;
    if (startDate) { conditions.push(`date >= $${i++}`); values.push(startDate); }
    if (endDate)   { conditions.push(`date <= $${i++}`); values.push(endDate); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows: revenueRows } = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM journal_entries ${where ? where + ' AND' : 'WHERE'} credit_account = 'revenue'`,
      values
    );
    const { rows: expenseRows } = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM journal_entries ${where ? where + ' AND' : 'WHERE'} debit_account IN ('expenses','cost_of_goods')`,
      values
    );

    const revenue = Number(revenueRows[0].total);
    const expenses = Number(expenseRows[0].total);
    return { revenue, expenses, netProfit: revenue - expenses, startDate, endDate };
  },

  /**
   * Balance sheet snapshot at a given date.
   */
  async generateBalanceSheet(asOf = new Date()) {
    const { rows } = await pool.query(
      `SELECT account,
              SUM(debit)  AS total_debit,
              SUM(credit) AS total_credit
       FROM (
         SELECT debit_account AS account, amount AS debit, 0 AS credit FROM journal_entries WHERE date <= $1
         UNION ALL
         SELECT credit_account AS account, 0 AS debit, amount AS credit FROM journal_entries WHERE date <= $1
       ) t
       GROUP BY account`,
      [asOf]
    );

    const assets = rows.filter(r => ['cash', 'accounts_receivable', 'inventory'].includes(r.account));
    const liabilities = rows.filter(r => ['accounts_payable', 'loans'].includes(r.account));
    const equity = rows.filter(r => ['equity', 'retained_earnings'].includes(r.account));

    return { asOf, assets, liabilities, equity };
  },

  /**
   * Cash flow statement for a period.
   */
  async generateCashFlow({ startDate, endDate }) {
    const conditions = ['date BETWEEN $1 AND $2'];
    const values = [startDate || '1970-01-01', endDate || new Date()];

    const { rows } = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN debit_account = 'cash' THEN amount ELSE 0 END), 0)  AS cash_in,
         COALESCE(SUM(CASE WHEN credit_account = 'cash' THEN amount ELSE 0 END), 0) AS cash_out
       FROM journal_entries WHERE ${conditions.join(' AND ')}`,
      values
    );

    const cashIn  = Number(rows[0].cash_in);
    const cashOut = Number(rows[0].cash_out);
    return { cashIn, cashOut, netCashFlow: cashIn - cashOut, startDate, endDate };
  },
};

module.exports = accountingService;
