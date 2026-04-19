'use strict';

const logger = require('../utils/logger');

/**
 * Global error-handling middleware.
 * Must be registered AFTER all routes (4-arg Express signature).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (status >= 500) {
    logger.error(err.stack || message);
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({ error: message });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced resource does not exist' });
  }

  res.status(status).json({ error: message });
};

module.exports = errorHandler;
