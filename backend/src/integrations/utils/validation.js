'use strict';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isPositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

function isNonNegativeNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}

function isValidDate(date) {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
}

function validateRequiredFields(obj, fields) {
  const missing = [];
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missing.push(field);
    }
  }
  return missing.length > 0 ? `Missing required fields: ${missing.join(', ')}` : null;
}

function validateLineItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'At least one line item is required';
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.name) return `Line item ${i + 1}: name is required`;
    if (!isNonNegativeNumber(item.amount) && !isNonNegativeNumber(item.rate)) {
      return `Line item ${i + 1}: valid amount or rate is required`;
    }
  }
  return null;
}

function sanitizeString(str, maxLength = 255) {
  if (!str) return '';
  return String(str).trim().slice(0, maxLength);
}

module.exports = {
  isValidEmail,
  isValidUrl,
  isPositiveNumber,
  isNonNegativeNumber,
  isValidDate,
  validateRequiredFields,
  validateLineItems,
  sanitizeString
};
