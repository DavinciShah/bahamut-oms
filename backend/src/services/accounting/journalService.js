'use strict';

const JournalEntry = require('../../models/JournalEntry');
const AccountingAccount = require('../../models/AccountingAccount');
const pool = require('../../config/db');

async function createJournalEntry(userId, { integrationId, date, reference, description, currency, details }) {
  if (!details || details.length < 2) {
    throw Object.assign(new Error('Journal entry must have at least two lines'), { status: 400 });
  }

  const totalDebit = details.reduce((s, d) => s + (parseFloat(d.debit) || 0), 0);
  const totalCredit = details.reduce((s, d) => s + (parseFloat(d.credit) || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw Object.assign(new Error(`Journal entry is unbalanced: debit ${totalDebit} ≠ credit ${totalCredit}`), { status: 400 });
  }

  return JournalEntry.create({ integrationId, userId, date, reference, description, currency, details });
}

async function getJournalEntry(id, userId) {
  const entry = await JournalEntry.findById(id);
  if (!entry) throw Object.assign(new Error('Journal entry not found'), { status: 404 });
  if (entry.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  return entry;
}

async function listJournalEntries(userId, filters = {}) {
  return JournalEntry.findByUserId(userId, filters);
}

async function postJournalEntry(id, userId) {
  const entry = await getJournalEntry(id, userId);
  if (entry.status === 'posted') throw Object.assign(new Error('Entry already posted'), { status: 400 });

  await JournalEntry.updateStatus(id, 'posted');
  await updateAccountBalances(entry);
  return JournalEntry.findById(id);
}

async function updateAccountBalances(entry) {
  const detailsResult = await pool.query(
    'SELECT * FROM journal_entry_details WHERE journal_entry_id = $1',
    [entry.id]
  );

  for (const detail of detailsResult.rows) {
    if (!detail.account_id) continue;

    const account = await AccountingAccount.findById(detail.account_id);
    if (!account) continue;

    const debit = parseFloat(detail.debit) || 0;
    const credit = parseFloat(detail.credit) || 0;

    let balanceChange = 0;
    if (['asset', 'expense'].includes(account.type)) {
      balanceChange = debit - credit;
    } else {
      balanceChange = credit - debit;
    }

    const newBalance = (parseFloat(account.balance) || 0) + balanceChange;
    await AccountingAccount.updateBalance(detail.account_id, newBalance);
  }
}

async function voidJournalEntry(id, userId) {
  const entry = await getJournalEntry(id, userId);
  if (entry.status === 'void') throw Object.assign(new Error('Entry already voided'), { status: 400 });

  await JournalEntry.updateStatus(id, 'void');
  return { voided: true, id };
}

module.exports = {
  createJournalEntry,
  getJournalEntry,
  listJournalEntries,
  postJournalEntry,
  voidJournalEntry
};
