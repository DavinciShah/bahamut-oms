'use strict';

const AccountingAccount = require('../../models/AccountingAccount');

const DEFAULT_ACCOUNTS = [
  { code: '1000', name: 'Cash', type: 'asset', subtype: 'current' },
  { code: '1100', name: 'Accounts Receivable', type: 'asset', subtype: 'current' },
  { code: '1200', name: 'Inventory', type: 'asset', subtype: 'current' },
  { code: '1500', name: 'Fixed Assets', type: 'asset', subtype: 'non_current' },
  { code: '2000', name: 'Accounts Payable', type: 'liability', subtype: 'current' },
  { code: '2100', name: 'Short-term Loans', type: 'liability', subtype: 'current' },
  { code: '2500', name: 'Long-term Loans', type: 'liability', subtype: 'non_current' },
  { code: '3000', name: 'Owner Equity', type: 'equity', subtype: 'capital' },
  { code: '3100', name: 'Retained Earnings', type: 'equity', subtype: 'retained' },
  { code: '4000', name: 'Sales Revenue', type: 'revenue', subtype: 'operating' },
  { code: '4100', name: 'Service Revenue', type: 'revenue', subtype: 'operating' },
  { code: '5000', name: 'Cost of Goods Sold', type: 'expense', subtype: 'operating' },
  { code: '5100', name: 'Salaries Expense', type: 'expense', subtype: 'operating' },
  { code: '5200', name: 'Rent Expense', type: 'expense', subtype: 'operating' },
  { code: '5300', name: 'Utilities Expense', type: 'expense', subtype: 'operating' }
];

async function getChartOfAccounts(userId) {
  const accounts = await AccountingAccount.findByUserId(userId);
  return groupByType(accounts);
}

async function createAccount(userId, data) {
  return AccountingAccount.create({ ...data, userId, integrationId: data.integrationId || null });
}

async function updateAccount(id, userId, data) {
  const account = await AccountingAccount.findById(id);
  if (!account) throw Object.assign(new Error('Account not found'), { status: 404 });
  if (account.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  return AccountingAccount.update(id, userId, data);
}

async function deleteAccount(id, userId) {
  const account = await AccountingAccount.findById(id);
  if (!account) throw Object.assign(new Error('Account not found'), { status: 404 });
  if (account.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  await AccountingAccount.delete(id, userId);
  return { deleted: true };
}

async function seedDefaultAccounts(userId, integrationId = null) {
  const created = [];
  for (const account of DEFAULT_ACCOUNTS) {
    try {
      const result = await AccountingAccount.create({ ...account, userId, integrationId, balance: 0 });
      created.push(result);
    } catch (err) {
      if (!err.message.includes('duplicate') && !err.message.includes('unique')) throw err;
    }
  }
  return created;
}

function groupByType(accounts) {
  const grouped = { asset: [], liability: [], equity: [], revenue: [], expense: [] };
  for (const account of accounts) {
    if (grouped[account.type]) grouped[account.type].push(account);
    else grouped[account.type] = [account];
  }
  return grouped;
}

module.exports = {
  getChartOfAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  seedDefaultAccounts,
  DEFAULT_ACCOUNTS
};
