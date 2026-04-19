'use strict';

// ReDoS-safe email pattern: local@domain.tld
const EMAIL_RE = /^[^@\s]{1,64}@[^@\s]{1,255}\.[a-zA-Z]{2,}$/;

/**
 * Returns true when the string looks like a valid e-mail address.
 */
function validateEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

/**
 * Returns true when the password meets minimum requirements:
 *   - at least 8 characters
 *   - at least one letter
 *   - at least one digit
 * Also supports returning a detailed { valid, errors } object when called with (password, { detailed: true }).
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

/**
 * Returns true when the string is a plausible phone number
 * (7–15 digits total).
 * Also supports returning a detailed { valid, errors } object when called with (phone, { detailed: true }).
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

/**
 * Validate user registration/update data.
 */
function validateUserData(data) {
  const errors = [];
  if (!data.name || String(data.name).trim().length < 2)
    errors.push('Name must be at least 2 characters');
  if (!validateEmail(data.email))
    errors.push('Invalid email address');
  if (data.password !== undefined) {
    const pwResult = validatePassword(data.password, { detailed: true });
    errors.push(...pwResult.errors);
  }
  if (data.phone !== undefined) {
    const phoneResult = validatePhone(data.phone, { detailed: true });
    errors.push(...phoneResult.errors);
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validate product data.
 */
function validateProductData(data) {
  const errors = [];
  if (!data.name || String(data.name).trim().length < 2)
    errors.push('Product name must be at least 2 characters');
  if (data.price === undefined || data.price === null)
    errors.push('Price is required');
  else if (isNaN(Number(data.price)) || Number(data.price) < 0)
    errors.push('Price must be a non-negative number');
  if (data.stock_quantity !== undefined && (isNaN(Number(data.stock_quantity)) || Number(data.stock_quantity) < 0))
    errors.push('Stock quantity must be a non-negative integer');
  if (data.sku && String(data.sku).trim().length < 2)
    errors.push('SKU must be at least 2 characters');
  return { valid: errors.length === 0, errors };
}

/**
 * Validate order data.
 */
function validateOrderData(data) {
  const errors = [];
  const custId = data.customer_id || data.user_id;
  if (!custId) errors.push('customer_id is required');
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0)
    errors.push('At least one order item is required');
  else {
    data.items.forEach((item, idx) => {
      if (!item.product_id) errors.push(`Item ${idx + 1}: product_id is required`);
      if (!item.quantity || Number(item.quantity) < 1)
        errors.push(`Item ${idx + 1}: quantity must be at least 1`);
    });
  }
  if (data.shipping_address) {
    const addr = data.shipping_address;
    if (!addr.street || !addr.city || !addr.country)
      errors.push('shipping_address must include street, city, and country');
  }
  return { valid: errors.length === 0, errors };
}

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateAmount,
  validateUserData,
  validateProductData,
  validateOrderData,
};
