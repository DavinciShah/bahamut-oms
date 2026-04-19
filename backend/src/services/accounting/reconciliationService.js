'use strict';

const pool = require('../../config/db');
const logger = require('../../config/logger');

async function reconcileInvoices(userId, integrationId, externalInvoices) {
  const localResult = await pool.query(
    `SELECT id, invoice_number, total, status, external_id
     FROM invoices WHERE user_id = $1
     ORDER BY created_at DESC LIMIT 1000`,
    [userId]
  );

  const localInvoices = localResult.rows;
  const localMap = {};
  for (const inv of localInvoices) {
    if (inv.external_id) localMap[inv.external_id] = inv;
    localMap[inv.invoice_number] = inv;
  }

  const mismatches = [];
  const missing = [];
  let matched = 0;

  for (const extInv of externalInvoices) {
    const local = localMap[extInv.externalId] || localMap[extInv.invoiceNumber];
    if (!local) {
      missing.push({ externalId: extInv.externalId, invoiceNumber: extInv.invoiceNumber });
      continue;
    }

    const localTotal = parseFloat(local.total) || 0;
    const extTotal = parseFloat(extInv.total) || 0;

    if (Math.abs(localTotal - extTotal) > 0.01 || local.status !== extInv.status) {
      mismatches.push({
        localId: local.id,
        externalId: extInv.externalId,
        invoiceNumber: extInv.invoiceNumber,
        localTotal,
        externalTotal: extTotal,
        localStatus: local.status,
        externalStatus: extInv.status
      });
    } else {
      matched++;
    }
  }

  const report = {
    integrationId,
    reconciledAt: new Date().toISOString(),
    totalExternal: externalInvoices.length,
    matched,
    mismatches: mismatches.length,
    missing: missing.length,
    details: { mismatches, missing }
  };

  logger.info('Reconciliation completed', { userId, integrationId, ...report });
  return report;
}

async function reconcilePayments(userId, integrationId, externalPayments) {
  const localResult = await pool.query(
    `SELECT id, amount, status, external_id, reference
     FROM payments WHERE user_id = $1
     ORDER BY created_at DESC LIMIT 1000`,
    [userId]
  );

  const localPayments = localResult.rows;
  const localMap = {};
  for (const pmt of localPayments) {
    if (pmt.external_id) localMap[pmt.external_id] = pmt;
    if (pmt.reference) localMap[pmt.reference] = pmt;
  }

  const mismatches = [];
  const missing = [];
  let matched = 0;

  for (const extPmt of externalPayments) {
    const local = localMap[extPmt.externalId] || localMap[extPmt.reference];
    if (!local) {
      missing.push({ externalId: extPmt.externalId, reference: extPmt.reference });
      continue;
    }

    const localAmt = parseFloat(local.amount) || 0;
    const extAmt = parseFloat(extPmt.amount) || 0;

    if (Math.abs(localAmt - extAmt) > 0.01) {
      mismatches.push({
        localId: local.id,
        externalId: extPmt.externalId,
        localAmount: localAmt,
        externalAmount: extAmt
      });
    } else {
      matched++;
    }
  }

  return {
    integrationId,
    reconciledAt: new Date().toISOString(),
    totalExternal: externalPayments.length,
    matched,
    mismatches: mismatches.length,
    missing: missing.length,
    details: { mismatches, missing }
  };
}

async function getDailyReconciliationSummary(userId, date) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  const invoiceResult = await pool.query(
    `SELECT COUNT(*) AS total, SUM(total) AS total_amount,
            COUNT(CASE WHEN status = 'paid' THEN 1 END) AS paid_count
     FROM invoices WHERE user_id = $1 AND DATE(created_at) = $2`,
    [userId, targetDate]
  );

  const paymentResult = await pool.query(
    `SELECT COUNT(*) AS total, SUM(amount) AS total_amount
     FROM payments WHERE user_id = $1 AND DATE(created_at) = $2`,
    [userId, targetDate]
  );

  return {
    date: targetDate,
    invoices: invoiceResult.rows[0],
    payments: paymentResult.rows[0]
  };
}

module.exports = { reconcileInvoices, reconcilePayments, getDailyReconciliationSummary };
