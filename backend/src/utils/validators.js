'use strict';

// ReDoS-safe email pattern: local@domain.tld
const EMAIL_RE = /^[^@\s]{1,64}@[^@\s]{1,255}\.[a-zA-Z]{2,}$/;

/**
 * Returns true when the string looks like a valid e-mail address.
 */
function validateEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

// Backward-compatible alias
const isValidEmail = validateEmail;

/**
 * Returns { valid, errors } describing whether the password meets requirements:
 *   - at least 8 characters
 *   - at least one uppercase letter
 *   - at least one lowercase letter
 *   - at least one digit
 */
function validatePassword(password, opts = {}) {
  const errors = [];
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { valid: false, errors };
  }
  if (password.length < 8)     errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/\d/.test(password))    errors.push('Password must contain at least one number');
  return { valid: errors.length === 0, errors };
}

// Backward-compatible alias (min 6 chars, no complexity requirement kept for compat)
const isStrongPassword = (password) => typeof password === 'string' && password.length >= 6;

/**
 * Returns true when the string is a plausible phone number.
 */
function validatePhone(phone, opts = {}) {
  if (typeof phone !== 'string') return false;
  const cleaned = phone.replace(/\s/g, '');
  const digits = cleaned.replace(/\D/g, '');

  // E.164 phone numbers have between 7 and 15 digits
  if (digits.length < 7 || digits.length > 15) return false;

  // Indian phone validation:
  // Indian mobile numbers are strictly 10 digits.
  // With country code (+91 or 91), they are 12 digits.
  // Reject 13 digits starting with +91 or 91 (e.g. +91XXXXXXXXXXX or 91XXXXXXXXXXX).
  if (cleaned.startsWith('+91')) {
    if (digits.length !== 12) return false;
  } else if (digits.startsWith('91') && digits.length > 10) {
    if (digits.length !== 12) return false;
  } else if (digits.length === 13) {
    if (digits.startsWith('91')) return false;
  }

  if (opts.detailed) {
    if (!/^\+?[1-9]\d{6,14}$/.test(cleaned)) {
      return { valid: false, errors: ['Invalid phone number format'] };
    }
    return { valid: true, errors: [] };
  }
  return true;
}

/**
 * Returns true when the value is a finite number greater than zero.
 */
function validateAmount(amount) {
  const n = Number(amount);
  return Number.isFinite(n) && n > 0;
}

// Backward-compatible alias
const isPositiveNumber = (value) => typeof value === 'number' && value > 0;

/**
 * Returns { valid, errors } for order data.
 */
function validateOrderData(data = {}) {
  const errors = [];
  if (!data.customer_id) errors.push('customer_id is required');
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('items must be a non-empty array');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Returns { valid, errors } for product data.
 */
function validateProductData(data = {}) {
  const errors = [];
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.push('name is required');
  }
  if (data.price === undefined || data.price === null || Number(data.price) < 0) {
    errors.push('price must be a non-negative number');
  }
  return { valid: errors.length === 0, errors };
}

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateAmount,
  validateOrderData,
  validateProductData,
  isValidEmail,
  isStrongPassword,
  isPositiveNumber,
};
