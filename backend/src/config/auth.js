'use strict';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set in production');
}

const authConfig = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRY: process.env.JWT_EXPIRY || process.env.JWT_EXPIRES_IN || '1h',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'refresh-change-me-in-production',
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
  passwordResetExpiry: 60 * 60 * 1000,
  otpExpiry: 5 * 60 * 1000,
};

// Legacy aliases for backward compat
authConfig.jwtSecret = authConfig.JWT_SECRET;
authConfig.jwtExpiresIn = authConfig.JWT_EXPIRY;
authConfig.refreshTokenSecret = authConfig.REFRESH_TOKEN_SECRET;
authConfig.refreshTokenExpiresIn = authConfig.REFRESH_TOKEN_EXPIRY;
authConfig.bcryptRounds = authConfig.BCRYPT_ROUNDS;

module.exports = authConfig;
