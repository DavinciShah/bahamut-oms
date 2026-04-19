'use strict';

const logger = require('../utils/logger');

/**
 * Global error-handling middleware.
 * Must be registered AFTER all routes (4-arg Express signature).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status  = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code    = err.code || 'INTERNAL_ERROR';

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    status = 401; message = 'Invalid token';  code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    status = 401; message = 'Token expired';  code = 'TOKEN_EXPIRED';
  } else if (err.name === 'ValidationError' || code === 'VALIDATION_ERROR') {
    status = 422; code = 'VALIDATION_ERROR';
  } else if (typeof err.code === 'string') {
    // PostgreSQL error codes
    switch (err.code) {
      case '23505': status = 409; message = 'A record with that value already exists'; code = 'DUPLICATE_ENTRY'; break;
      case '23503': status = 409; message = 'Related record not found';                code = 'FOREIGN_KEY_VIOLATION'; break;
      case '23502': status = 422; message = `Missing required field: ${err.column || ''}`; code = 'NOT_NULL_VIOLATION'; break;
      case '22P02': status = 422; message = 'Invalid data format';                     code = 'INVALID_FORMAT'; break;
    }
  } else if (status === 404) {
    code = 'NOT_FOUND';
  }

  if (status >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} → ${status} ${message}`, {
      stack: err.stack, body: req.body,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} → ${status} ${message}`);
  }

  const body = { error: message };
  if (err.errors) body.details = err.errors;

  return res.status(status).json(body);
}

module.exports = errorHandler;
