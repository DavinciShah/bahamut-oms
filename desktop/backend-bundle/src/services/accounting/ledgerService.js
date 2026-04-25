'use strict';

const pool = require('../../config/db');
const AccountingAccount = require('../../models/AccountingAccount');

async function getLedgerEntries(userId, accountId, filters = {}) {
  const account = await AccountingAccount.findById(accountId);
  if (!account) throw Object.assign(new Error('Account not found'), { status: 404 });
  if (account.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const conditions = ['je.user_id = $1', 'jed.account_id = $2'];
  const values = [userId, accountId];
  let idx = 3;

  if (filters.from) { conditions.push(`je.date >= $${idx++}`); values.push(filters.from); }
  if (filters.to) { conditions.push(`je.date <= $${idx++}`); values.push(filters.to); }

  const result = await pool.query(
    `SELECT
       je.id AS journal_entry_id,
       je.date,
       je.reference,
       je.description AS entry_description,
       jed.description AS line_description,
       jed.debit,
       jed.credit,
       SUM(jed.debit - jed.credit) OVER (ORDER BY je.date, je.created_at ROWS UNBOUNDED PRECEDING) AS running_balance
     FROM journal_entry_details jed
     JOIN journal_entries je ON jed.journal_entry_id = je.id
     WHERE ${conditions.join(' AND ')} AND je.status NOT IN ('void', 'draft')
     ORDER BY je.date, je.created_at`,
    values
  );

  return {
    account,
    entries: result.rows,
    totalDebit: result.rows.reduce((s, r) => s + parseFloat(r.debit || 0), 0),
    totalCredit: result.rows.reduce((s, r) => s + parseFloat(r.credit || 0), 0)
  };
}

async function getAccountSummary(userId, filters = {}) {
  const result = await pool.query(
    `SELECT
       aa.id, aa.code, aa.name, aa.type, aa.subtype,
       COALESCE(SUM(jed.debit), 0) AS total_debit,
       COALESCE(SUM(jed.credit), 0) AS total_credit,
       aa.balance
     FROM accounting_accounts aa
     LEFT JOIN journal_entry_details jed ON jed.account_id = aa.id
     LEFT JOIN journal_entries je ON jed.journal_entry_id = je.id
       AND je.status NOT IN ('void', 'draft')
       ${filters.from ? 'AND je.date >= $2' : ''}
       ${filters.to ? `AND je.date <= $${filters.from ? 3 : 2}` : ''}
     WHERE aa.user_id = $1 AND aa.active = TRUE
     GROUP BY aa.id, aa.code, aa.name, aa.type, aa.subtype, aa.balance
     ORDER BY aa.code`,
    [userId, ...(filters.from ? [filters.from] : []), ...(filters.to ? [filters.to] : [])]
  );

  return result.rows;
}

module.exports = { getLedgerEntries, getAccountSummary };
