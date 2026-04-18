'use strict';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set in production');
}

module.exports = {
  jwtSecret:        process.env.JWT_SECRET           || 'changeme-jwt-secret',
  jwtExpiration:    process.env.JWT_EXPIRATION        || '1h',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
};
