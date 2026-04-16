'use strict';

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
  const errors = [];
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { valid: false, errors };
  }
  if (password.length < 8)          errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password))      errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password))      errors.push('Password must contain at least one lowercase letter');
  if (!/\d/.test(password))         errors.push('Password must contain at least one number');
  if (!/[!@#$%^&*()_+\-=[\]{}|;:'",.<>?/\\`~]/.test(password))
    errors.push('Password must contain at least one special character');
  return { valid: errors.length === 0, errors };
}

function validatePhone(phone) {
  if (!phone) return { valid: true, errors: [] }; // optional field
  const cleaned = String(phone).replace(/\s/g, '');
  const re = /^\+?[1-9]\d{6,14}$/;
  if (!re.test(cleaned)) {
    return { valid: false, errors: ['Invalid phone number format'] };
  }
  return { valid: true, errors: [] };
}

function validateUserData(data) {
  const errors = [];
  if (!data.name || String(data.name).trim().length < 2)
    errors.push('Name must be at least 2 characters');
  if (!validateEmail(data.email))
    errors.push('Invalid email address');
  if (data.password !== undefined) {
    const pwResult = validatePassword(data.password);
    errors.push(...pwResult.errors);
  }
  if (data.phone !== undefined) {
    const phoneResult = validatePhone(data.phone);
    errors.push(...phoneResult.errors);
  }
  return { valid: errors.length === 0, errors };
}

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

function validateOrderData(data) {
  const errors = [];
  if (!data.customer_id) errors.push('customer_id is required');
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
  validateUserData,
  validateProductData,
  validateOrderData,
};
