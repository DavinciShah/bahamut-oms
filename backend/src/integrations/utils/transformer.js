'use strict';

function transformInvoice(invoice, rules = {}) {
  const result = { ...invoice };

  if (rules.dateFormat) {
    if (result.date) result.date = formatDate(result.date, rules.dateFormat);
    if (result.dueDate) result.dueDate = formatDate(result.dueDate, rules.dateFormat);
  }

  if (rules.currencyMultiplier) {
    if (result.total !== undefined) result.total = result.total * rules.currencyMultiplier;
    if (result.subtotal !== undefined) result.subtotal = result.subtotal * rules.currencyMultiplier;
    if (result.taxTotal !== undefined) result.taxTotal = result.taxTotal * rules.currencyMultiplier;
    if (result.items) {
      result.items = result.items.map(item => ({
        ...item,
        amount: item.amount !== undefined ? item.amount * rules.currencyMultiplier : item.amount,
        rate: item.rate !== undefined ? item.rate * rules.currencyMultiplier : item.rate
      }));
    }
  }

  if (rules.fieldMapping) {
    for (const [from, to] of Object.entries(rules.fieldMapping)) {
      if (result[from] !== undefined) {
        result[to] = result[from];
        if (from !== to) delete result[from];
      }
    }
  }

  return result;
}

function formatDate(date, format = 'ISO') {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;

  if (format === 'ISO') return d.toISOString().split('T')[0];
  if (format === 'US') {
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  }
  if (format === 'UK') {
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
  if (format === 'TALLY') {
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  }
  return d.toISOString().split('T')[0];
}

function transformAmount(amount, fromCurrency, toCurrency, rates = {}) {
  if (fromCurrency === toCurrency) return amount;
  const rate = rates[`${fromCurrency}_${toCurrency}`] || 1;
  return Math.round(amount * rate * 100) / 100;
}

function batchTransform(items, transformFn, batchSize = 100) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    results.push(...batch.map(transformFn));
  }
  return results;
}

function flattenObject(obj, prefix = '', separator = '.') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey, separator));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

module.exports = {
  transformInvoice,
  formatDate,
  transformAmount,
  batchTransform,
  flattenObject
};
