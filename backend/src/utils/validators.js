// Linear email validation — avoids catastrophic backtracking (ReDoS)
const validateEmail = (email) => {
  if (!email || typeof email !== 'string' || email.length > 254) return false;
  const at = email.indexOf('@');
  if (at < 1) return false;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!local || !domain) return false;
  if (local.length > 64) return false;
  if (!domain.includes('.')) return false;
  // Only allow safe characters — no nested quantifiers
  return /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local) &&
         /^[a-zA-Z0-9.-]+$/.test(domain);
};

// At least 8 chars, one uppercase, one lowercase, one digit, one special char
const validatePassword = (password) => {
  if (!password || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  return hasUpper && hasLower && hasDigit && hasSpecial;
};

// Accepts E.164 format (+1234567890) or 10-15 digit strings
const validatePhone = (phone) => {
  const re = /^\+?[1-9]\d{9,14}$/;
  return re.test(String(phone).replace(/[\s\-().]/g, ''));
};

const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

module.exports = { validateEmail, validatePassword, validatePhone, validateAmount };
