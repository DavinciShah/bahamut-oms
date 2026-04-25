'use strict';

const REQUIRED_IN_PROD = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER'];

function isWeakSecret(value) {
  if (!value) return true;
  const normalized = String(value).toLowerCase();
  return normalized.includes('change-in-production') || normalized.includes('your-super-secret') || normalized === 'secret';
}

function validateEnv() {
  const warnings = [];

  if ((process.env.NODE_ENV || 'development') === 'production') {
    for (const key of REQUIRED_IN_PROD) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable in production: ${key}`);
      }
    }

    if (isWeakSecret(process.env.JWT_SECRET)) {
      throw new Error('JWT_SECRET is missing or weak for production.');
    }

    if (process.env.JWT_REFRESH_SECRET && isWeakSecret(process.env.JWT_REFRESH_SECRET)) {
      throw new Error('JWT_REFRESH_SECRET is weak for production.');
    }
  } else {
    if (!process.env.JWT_SECRET || isWeakSecret(process.env.JWT_SECRET)) {
      warnings.push('Using default/weak JWT secret for non-production environment.');
    }
  }

  return warnings;
}

module.exports = { validateEnv };
