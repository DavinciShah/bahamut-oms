'use strict';

// Use a simple, ReDoS-safe email pattern: local@domain.tld
const EMAIL_RE = /^[^@\s]{1,64}@[^@\s]{1,255}\.[^@\s.]{2,}$/;

/**
 * Returns true when the string looks like a valid e-mail address.
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

/**
 * Returns true when the password meets minimum requirements:
 *   - at least 8 characters
 *   - at least one letter
 *   - at least one digit
 * @param {string} password
 * @returns {boolean}
 */
function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  return true;
}

/**
 * Returns true when the string is a plausible phone number
 * (digits, spaces, dashes, parentheses, optional leading +, 7–15 digits total).
 * @param {string} phone
 * @returns {boolean}
 */
function validatePhone(phone) {
  if (typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Returns true when the value is a finite number greater than zero.
 * @param {*} amount
 * @returns {boolean}
 */
function validateAmount(amount) {
  const n = Number(amount);
  return Number.isFinite(n) && n > 0;
}

module.exports = { validateEmail, validatePassword, validatePhone, validateAmount };
