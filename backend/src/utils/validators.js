const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isStrongPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

const isPositiveNumber = (value) => {
  return typeof value === 'number' && value > 0;
};

module.exports = { isValidEmail, isStrongPassword, isPositiveNumber };
