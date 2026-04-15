'use strict';

function normalizeDate(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

function normalizeCurrency(amount) {
  if (amount === null || amount === undefined) return 0;
  return Math.round(parseFloat(amount) * 100) / 100;
}

function mapStatus(status, mapping) {
  return mapping[status] || status;
}

const INVOICE_STATUS_TO_EXTERNAL = {
  draft: 'draft',
  pending: 'sent',
  paid: 'paid',
  overdue: 'overdue',
  cancelled: 'void'
};

const INVOICE_STATUS_FROM_EXTERNAL = {
  draft: 'draft',
  sent: 'pending',
  paid: 'paid',
  overdue: 'overdue',
  void: 'cancelled'
};

function toExternalInvoiceStatus(status) {
  return mapStatus(status, INVOICE_STATUS_TO_EXTERNAL);
}

function fromExternalInvoiceStatus(status) {
  return mapStatus(status, INVOICE_STATUS_FROM_EXTERNAL);
}

function mergeFields(target, source, fields) {
  const result = { ...target };
  for (const field of fields) {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
  }
  return result;
}

function buildExternalIdMap(items, externalIdField = 'externalId') {
  const map = {};
  for (const item of items) {
    if (item[externalIdField]) {
      map[item[externalIdField]] = item;
    }
  }
  return map;
}

function omit(obj, keys) {
  const result = { ...obj };
  for (const key of keys) delete result[key];
  return result;
}

function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (obj[key] !== undefined) result[key] = obj[key];
  }
  return result;
}

module.exports = {
  normalizeDate,
  normalizeCurrency,
  mapStatus,
  toExternalInvoiceStatus,
  fromExternalInvoiceStatus,
  mergeFields,
  buildExternalIdMap,
  omit,
  pick
};
