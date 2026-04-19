'use strict';

// Use a simple, ReDoS-safe email pattern: local@domain.tld
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
function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  return true;
}

// Backward-compatible alias (min 6 chars, no complexity requirement kept for compat)
const isStrongPassword = (password) => typeof password === 'string' && password.length >= 6;

/**
 * Returns true when the string is a plausible phone number.
 */
function validatePhone(phone) {
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
