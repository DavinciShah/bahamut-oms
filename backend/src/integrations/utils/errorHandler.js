'use strict';

const logger = require('../../config/logger');

class IntegrationError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'IntegrationError';
    this.code = code;
    this.details = details;
  }
}

class AuthenticationError extends IntegrationError {
  constructor(message, details = {}) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

class RateLimitError extends IntegrationError {
  constructor(message, retryAfter = null, details = {}) {
    super(message, 'RATE_LIMIT', details);
    this.name = 'RateLimitError';
    this.status = 429;
    this.retryAfter = retryAfter;
  }
}

class ValidationError extends IntegrationError {
  constructor(message, fields = [], details = {}) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    this.status = 422;
    this.fields = fields;
  }
}

function parseAxiosError(err) {
  if (!err.response) {
    return new IntegrationError(
      err.code === 'ECONNREFUSED' ? 'Connection refused' : err.message,
      'NETWORK_ERROR'
    );
  }

  const { status, data } = err.response;
  const message = (data && (data.message || data.error || data.Message)) || err.message;

  if (status === 401 || status === 403) return new AuthenticationError(message);
  if (status === 429) {
    const retryAfter = err.response.headers['retry-after'];
    return new RateLimitError(message, retryAfter);
  }
  if (status === 422 || status === 400) return new ValidationError(message);

  return new IntegrationError(message, `HTTP_${status}`, { status });
}

function isRetryable(err) {
  if (err instanceof RateLimitError) return true;
  if (err instanceof IntegrationError && err.code) {
    const retryableCodes = ['NETWORK_ERROR', 'HTTP_500', 'HTTP_502', 'HTTP_503', 'HTTP_504'];
    return retryableCodes.includes(err.code);
  }
  return false;
}

function logError(integration, operation, err) {
  logger.error(`[${integration}] Error in ${operation}`, {
    errorName: err.name,
    errorCode: err.code,
    message: err.message,
    stack: err.stack
  });
}

module.exports = {
  IntegrationError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  parseAxiosError,
  isRetryable,
  logError
};
