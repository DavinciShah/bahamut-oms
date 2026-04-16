'use strict';

const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh-change-me-in-production',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  passwordResetExpiry: 60 * 60 * 1000, // 1 hour in ms
  otpExpiry: 5 * 60 * 1000,            // 5 minutes in ms
};

module.exports = authConfig;
