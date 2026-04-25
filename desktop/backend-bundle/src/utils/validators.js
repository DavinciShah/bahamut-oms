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
 * Returns true when the password meets minimum requirements:
 *   - at least 8 characters
 *   - at least one letter
 *   - at least one digit
 */
function validatePassword(password, opts = {}) {
  if (opts.detailed) {
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

  if (typeof password !== 'string' || password.length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/\d/.test(password))       return false;
  return true;
}

// Backward-compatible alias (min 6 chars, no complexity requirement kept for compat)
const isStrongPassword = (password) => typeof password === 'string' && password.length >= 6;

/**
 * Returns true when the string is a plausible phone number.
 */
function validatePhone(phone, opts = {}) {
  if (opts.detailed) {
    if (!phone) return { valid: true, errors: [] }; // optional field
    const cleaned = String(phone).replace(/\s/g, '');
    if (!/^\+?[1-9]\d{6,14}$/.test(cleaned)) {
      return { valid: false, errors: ['Invalid phone number format'] };
    }
    return { valid: true, errors: [] };
  }
  if (typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
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

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateAmount,
  isValidEmail,
  isStrongPassword,
  isPositiveNumber,
};
