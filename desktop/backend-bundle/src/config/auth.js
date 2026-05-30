'use strict';

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
}

const authConfig = {
  JWT_SECRET:            process.env.JWT_SECRET               || 'default-jwt-secret-change-in-production',
  JWT_EXPIRES_IN:        process.env.JWT_EXPIRES_IN
                      || process.env.JWT_EXPIRATION
                      || process.env.JWT_EXPIRY               || '1h',
  JWT_REFRESH_SECRET:    process.env.JWT_REFRESH_SECRET       || 'refresh-change-me-in-production',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN  || '7d',
  BCRYPT_ROUNDS:         parseInt(process.env.BCRYPT_SALT_ROUNDS || process.env.BCRYPT_ROUNDS || '10', 10),
  BCRYPT_SALT_ROUNDS:    parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  passwordResetExpiry:   60 * 60 * 1000,
  otpExpiry:             5  * 60 * 1000,
};

// Legacy/alias properties consumed by older service files
authConfig.jwtSecret        = authConfig.JWT_SECRET;
authConfig.jwtExpiration    = authConfig.JWT_EXPIRES_IN;
authConfig.jwtExpiresIn     = authConfig.JWT_EXPIRES_IN;
authConfig.bcryptSaltRounds = authConfig.BCRYPT_ROUNDS;
authConfig.bcryptRounds     = authConfig.BCRYPT_ROUNDS;
authConfig.refreshTokenSecret     = authConfig.JWT_REFRESH_SECRET;
authConfig.refreshTokenExpiresIn  = authConfig.JWT_REFRESH_EXPIRES_IN;

module.exports = authConfig;
