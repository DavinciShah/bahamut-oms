'use strict';

const pool = require('../config/db');
const JournalEntry = require('../models/JournalEntry');
const AccountingAccount = require('../models/AccountingAccount');

async function getProfitLoss(userId, { from, to }) {
  const revenueResult = await pool.query(
    `SELECT SUM(jed.credit - jed.debit) AS revenue
     FROM journal_entry_details jed
     JOIN journal_entries je ON jed.journal_entry_id = je.id
     JOIN accounting_accounts aa ON jed.account_id = aa.id
     WHERE je.user_id = $1 AND aa.type = 'revenue'
       AND je.date BETWEEN $2 AND $3 AND je.status != 'void'`,
    [userId, from, to]
  );

  const expenseResult = await pool.query(
    `SELECT SUM(jed.debit - jed.credit) AS expenses
     FROM journal_entry_details jed
     JOIN journal_entries je ON jed.journal_entry_id = je.id
     JOIN accounting_accounts aa ON jed.account_id = aa.id
     WHERE je.user_id = $1 AND aa.type = 'expense'
       AND je.date BETWEEN $2 AND $3 AND je.status != 'void'`,
    [userId, from, to]
  );

  const revenue = parseFloat(revenueResult.rows[0]?.revenue) || 0;
  const expenses = parseFloat(expenseResult.rows[0]?.expenses) || 0;

  const breakdown = await pool.query(
    `SELECT aa.name, aa.type, aa.subtype,
            SUM(CASE WHEN aa.type = 'revenue' THEN jed.credit - jed.debit ELSE jed.debit - jed.credit END) AS amount
     FROM journal_entry_details jed
     JOIN journal_entries je ON jed.journal_entry_id = je.id
     JOIN accounting_accounts aa ON jed.account_id = aa.id
     WHERE je.user_id = $1 AND aa.type IN ('revenue', 'expense')
       AND je.date BETWEEN $2 AND $3 AND je.status != 'void'
     GROUP BY aa.id, aa.name, aa.type, aa.subtype
     ORDER BY aa.type, amount DESC`,
    [userId, from, to]
  );

  return {
    period: { from, to },
    revenue,
    expenses,
    netIncome: revenue - expenses,
    breakdown: breakdown.rows
  };
}

async function getBalanceSheet(userId, date) {
  const assetResult = await pool.query(
    `SELECT SUM(aa.balance) AS total
     FROM accounting_accounts aa
     WHERE aa.user_id = $1 AND aa.type = 'asset' AND aa.active = TRUE`,
    [userId]
  );

  const liabilityResult = await pool.query(
    `SELECT SUM(aa.balance) AS total
     FROM accounting_accounts aa
     WHERE aa.user_id = $1 AND aa.type = 'liability' AND aa.active = TRUE`,
    [userId]
  );

  const equityResult = await pool.query(
    `SELECT SUM(aa.balance) AS total
     FROM accounting_accounts aa
     WHERE aa.user_id = $1 AND aa.type = 'equity' AND aa.active = TRUE`,
    [userId]
  );

  const assets = await AccountingAccount.findByType(userId, 'asset');
  const liabilities = await AccountingAccount.findByType(userId, 'liability');
  const equity = await AccountingAccount.findByType(userId, 'equity');

  const totalAssets = parseFloat(assetResult.rows[0]?.total) || 0;
  const totalLiabilities = parseFloat(liabilityResult.rows[0]?.total) || 0;
  const totalEquity = parseFloat(equityResult.rows[0]?.total) || 0;

  return {
    date: date || new Date().toISOString().split('T')[0],
    assets: { total: totalAssets, accounts: assets },
    liabilities: { total: totalLiabilities, accounts: liabilities },
    equity: { total: totalEquity, accounts: equity },
    totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
  };
}

async function getCashFlow(userId, { from, to }) {
  const operatingResult = await pool.query(
    `SELECT SUM(jed.credit - jed.debit) AS net
     FROM journal_entry_details jed
     JOIN journal_entries je ON jed.journal_entry_id = je.id
     JOIN accounting_accounts aa ON jed.account_id = aa.id
     WHERE je.user_id = $1 AND aa.subtype = 'operating'
       AND je.date BETWEEN $2 AND $3 AND je.status != 'void'`,
    [userId, from, to]
  );

  const investingResult = await pool.query(
    `SELECT SUM(jed.credit - jed.debit) AS net
     FROM journal_entry_details jed
     JOIN journal_entries je ON jed.journal_entry_id = je.id
     JOIN accounting_accounts aa ON jed.account_id = aa.id
     WHERE je.user_id = $1 AND aa.subtype = 'investing'
       AND je.date BETWEEN $2 AND $3 AND je.status != 'void'`,
    [userId, from, to]
  );

  const financingResult = await pool.query(
    `SELECT SUM(jed.credit - jed.debit) AS net
     FROM journal_entry_details jed
     JOIN journal_entries je ON jed.journal_entry_id = je.id
     JOIN accounting_accounts aa ON jed.account_id = aa.id
     WHERE je.user_id = $1 AND aa.subtype = 'financing'
       AND je.date BETWEEN $2 AND $3 AND je.status != 'void'`,
    [userId, from, to]
  );

  const operating = parseFloat(operatingResult.rows[0]?.net) || 0;
  const investing = parseFloat(investingResult.rows[0]?.net) || 0;
  const financing = parseFloat(financingResult.rows[0]?.net) || 0;

  return {
    period: { from, to },
    operating,
    investing,
    financing,
    netCashFlow: operating + investing + financing
  };
}

async function getTrialBalance(userId, date) {
  const result = await pool.query(
    `SELECT aa.code, aa.name, aa.type,
            SUM(jed.debit) AS total_debit,
            SUM(jed.credit) AS total_credit,
            SUM(jed.debit) - SUM(jed.credit) AS balance
     FROM journal_entry_details jed
     JOIN journal_entries je ON jed.journal_entry_id = je.id
     JOIN accounting_accounts aa ON jed.account_id = aa.id
     WHERE je.user_id = $1
       AND ($2::date IS NULL OR je.date <= $2)
       AND je.status != 'void'
     GROUP BY aa.id, aa.code, aa.name, aa.type
     ORDER BY aa.code`,
    [userId, date || null]
  );

  const rows = result.rows;
  const totalDebit = rows.reduce((s, r) => s + parseFloat(r.total_debit || 0), 0);
  const totalCredit = rows.reduce((s, r) => s + parseFloat(r.total_credit || 0), 0);

  return {
    date: date || new Date().toISOString().split('T')[0],
    accounts: rows,
    totals: {
      debit: totalDebit,
      credit: totalCredit,
      balanced: Math.abs(totalDebit - totalCredit) < 0.01
    }
  };
}

async function getJournalEntries(userId, filters = {}) {
  return JournalEntry.findByUserId(userId, filters);
}

async function getGeneralLedger(userId, filters = {}) {
  const conditions = ['je.user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (filters.accountId) {
    conditions.push(`jed.account_id = $${idx++}`);
    values.push(filters.accountId);
  }
  if (filters.from) {
    conditions.push(`je.date >= $${idx++}`);
    values.push(filters.from);
  }
  if (filters.to) {
    conditions.push(`je.date <= $${idx++}`);
    values.push(filters.to);
  }

  const result = await pool.query(
    `SELECT je.date, je.reference, je.description,
            jed.account_id, jed.account_name, jed.debit, jed.credit, jed.description AS line_description,
            SUM(jed.debit - jed.credit) OVER (PARTITION BY jed.account_id ORDER BY je.date, je.created_at) AS running_balance
     FROM journal_entry_details jed
     JOIN journal_entries je ON jed.journal_entry_id = je.id
     WHERE ${conditions.join(' AND ')} AND je.status != 'void'
     ORDER BY jed.account_id, je.date, je.created_at`,
    values
  );

  return result.rows;
}

async function getChartOfAccounts(userId) {
  return AccountingAccount.findByUserId(userId);
}

module.exports = {
  getProfitLoss,
  getBalanceSheet,
  getCashFlow,
  getTrialBalance,
  getJournalEntries,
  getGeneralLedger,
  getChartOfAccounts
};
