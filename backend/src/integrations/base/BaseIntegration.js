'use strict';

const logger = require('../../config/logger');

class BaseIntegration {
  constructor(config) {
    if (new.target === BaseIntegration) {
      throw new Error('BaseIntegration is abstract and cannot be instantiated directly');
    }
    this.config = config || {};
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.integrationName = 'base';
  }

  async authenticate() {
    throw new Error(`authenticate() must be implemented by ${this.constructor.name}`);
  }

  async testConnection() {
    throw new Error(`testConnection() must be implemented by ${this.constructor.name}`);
  }

  async syncInvoices(data) {
    throw new Error(`syncInvoices() must be implemented by ${this.constructor.name}`);
  }

  async syncPayments(data) {
    throw new Error(`syncPayments() must be implemented by ${this.constructor.name}`);
  }

  async syncCustomers(data) {
    throw new Error(`syncCustomers() must be implemented by ${this.constructor.name}`);
  }

  async syncProducts(data) {
    throw new Error(`syncProducts() must be implemented by ${this.constructor.name}`);
  }

  async syncExpenses(data) {
    throw new Error(`syncExpenses() must be implemented by ${this.constructor.name}`);
  }

  async handleError(error, context = {}) {
    this.log('error', `Error in ${this.integrationName}: ${error.message}`, { context, stack: error.stack });

    const retryableStatuses = [429, 500, 502, 503, 504];
    const isRetryable = error.response && retryableStatuses.includes(error.response.status);

    if (isRetryable && context.attempt && context.attempt < this.retryAttempts) {
      const delay = this.retryDelay * Math.pow(2, context.attempt - 1);
      this.log('info', `Retrying after ${delay}ms (attempt ${context.attempt}/${this.retryAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return true;
    }

    return false;
  }

  async withRetry(fn, context = {}) {
    let lastError;
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await fn(attempt);
      } catch (err) {
        lastError = err;
        const shouldRetry = await this.handleError(err, { ...context, attempt });
        if (!shouldRetry) break;
      }
    }
    throw lastError;
  }

  log(level, message, data = {}) {
    logger[level] ? logger[level](message, { integration: this.integrationName, ...data })
      : logger.info(message, { integration: this.integrationName, ...data });
  }

  formatResult(success, synced, failed, errors = []) {
    return { success, synced, failed, errors, timestamp: new Date().toISOString() };
  }
}

module.exports = BaseIntegration;
