export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

export function isRequired(value) {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

export function validateOrderForm(values) {
  const errors = {};
  if (!values.items || values.items.length === 0) {
    errors.items = 'At least one product is required.';
  }
  if (!isRequired(values.shippingAddress)) {
    errors.shippingAddress = 'Shipping address is required.';
  }
  return errors;
}

export function validateLoginForm(values) {
  const errors = {};
  if (!isRequired(values.email)) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!isRequired(values.password)) {
    errors.password = 'Password is required.';
  }
  return errors;
}

export function validateRegisterForm(values) {
  const errors = {};
  if (!isRequired(values.name)) {
    errors.name = 'Name is required.';
  }
  if (!isRequired(values.email)) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!isRequired(values.password)) {
    errors.password = 'Password is required.';
  } else if (!isValidPassword(values.password)) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}
