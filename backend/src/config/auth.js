'use strict';

require('dotenv').config();

module.exports = {
  jwtSecret:        process.env.JWT_SECRET           || 'changeme-jwt-secret',
  jwtExpiration:    process.env.JWT_EXPIRATION        || '1h',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
};
