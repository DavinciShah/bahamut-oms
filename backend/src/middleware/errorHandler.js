'use strict';

const logger = require('../utils/logger');

/**
 * Categorise errors and return a consistent JSON error response.
 * Must be registered as the last middleware in Express (4 args).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Determine HTTP status
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    status = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Validation errors (e.g. from validators.js or express-validator)
  else if (err.name === 'ValidationError' || code === 'VALIDATION_ERROR') {
    status = 422;
    code = 'VALIDATION_ERROR';
  }

  // PostgreSQL errors
  else if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        status = 409;
        message = 'A record with that value already exists';
        code = 'DUPLICATE_ENTRY';
        break;
      case '23503': // foreign_key_violation
        status = 409;
        message = 'Related record not found';
        code = 'FOREIGN_KEY_VIOLATION';
        break;
      case '23502': // not_null_violation
        status = 422;
        message = `Missing required field: ${err.column || ''}`;
        code = 'NOT_NULL_VIOLATION';
        break;
      case '22P02': // invalid_text_representation
        status = 422;
        message = 'Invalid data format';
        code = 'INVALID_FORMAT';
        break;
      default:
        // fall through to 500
        break;
    }
  }

  // 404 Not Found (set by route handlers)
  else if (status === 404) {
    code = 'NOT_FOUND';
  }

  // Log server errors
  if (status >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} → ${status} ${message}`, {
      stack: err.stack,
      body: req.body,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} → ${status} ${message}`);
  }

  const body = { error: { code, message } };
  if (err.errors) body.error.details = err.errors; // validation error array

  return res.status(status).json(body);
}

module.exports = errorHandler;
