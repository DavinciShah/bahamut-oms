'use strict';

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
}

const secret = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';

module.exports = {
  // Used by most routes and tests
  JWT_SECRET: secret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRY || '1h',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
  BCRYPT_SALT_ROUNDS: 10,
  // Alias for auth.api.test.js compatibility
  jwtSecret:        secret,
  jwtExpiration:    process.env.JWT_EXPIRATION || '1h',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
};
