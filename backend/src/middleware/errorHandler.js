'use strict';

const logger = require('../utils/logger');

/**
 * Global error-handling middleware.
 * Must be registered AFTER all routes.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(message, { status, stack: err.stack });

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
