'use strict';

const BaseIntegration = require('../base/BaseIntegration');
const WaveClient = require('./waveClient');
const { omsInvoiceToWave, omsCustomerToWave, omsProductToWave } = require('./waveMapper');
const { validateInvoice, validateCustomer } = require('./waveValidation');

class WaveSync extends BaseIntegration {
  constructor(config) {
    super(config);
    this.integrationName = 'wave';
    this.client = new WaveClient({
      apiKey: config.apiKey,
      businessId: config.businessId
    });
  }

  async authenticate() {
    return this.testConnection();
  }

  async testConnection() {
    try {
      const result = await this.client.testConnection();
      return { success: true, message: 'Connected to Wave', ...result };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async syncInvoices(invoices) {
    const errors = [];
    let synced = 0;
    let failed = 0;

    for (const invoice of invoices) {
      try {
        const validationError = validateInvoice(invoice);
        if (validationError) {
          errors.push({ id: invoice.id, error: validationError });
          failed++;
          continue;
        }

        const waveInvoice = omsInvoiceToWave(invoice, this.config.businessId);
        const result = await this.withRetry(() => this.client.createInvoice(waveInvoice));

        if (result.invoiceCreate && !result.invoiceCreate.didSucceed) {
          const errMsg = (result.invoiceCreate.inputErrors || []).map(e => e.message).join(', ');
          throw new Error(errMsg || 'Wave invoice creation failed');
        }
        synced++;
      } catch (err) {
        errors.push({ id: invoice.id, error: err.message });
        failed++;
        this.log('error', `Failed to sync invoice ${invoice.id}: ${err.message}`);
      }
    }

    return this.formatResult(failed === 0, synced, failed, errors);
  }

  async syncPayments(payments) {
    this.log('warn', 'Wave payment sync not fully supported via GraphQL API');
    return this.formatResult(true, 0, 0, []);
  }

  async syncCustomers(customers) {
    const errors = [];
    let synced = 0;
    let failed = 0;

    for (const customer of customers) {
      try {
        const validationError = validateCustomer(customer);
        if (validationError) {
          errors.push({ id: customer.id, error: validationError });
          failed++;
          continue;
        }

        const waveCustomer = omsCustomerToWave(customer);
        const result = await this.withRetry(() => this.client.createCustomer(waveCustomer));

        if (result.customerCreate && !result.customerCreate.didSucceed) {
          const errMsg = (result.customerCreate.inputErrors || []).map(e => e.message).join(', ');
          throw new Error(errMsg || 'Wave customer creation failed');
        }
        synced++;
      } catch (err) {
        errors.push({ id: customer.id, error: err.message });
        failed++;
      }
    }

    return this.formatResult(failed === 0, synced, failed, errors);
  }

  async syncProducts(products) {
    const errors = [];
    let synced = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const waveProduct = omsProductToWave(product);
        const result = await this.withRetry(() => this.client.createProduct(waveProduct));

        if (result.productCreate && !result.productCreate.didSucceed) {
          const errMsg = (result.productCreate.inputErrors || []).map(e => e.message).join(', ');
          throw new Error(errMsg || 'Wave product creation failed');
        }
        synced++;
      } catch (err) {
        errors.push({ id: product.id, error: err.message });
        failed++;
      }
    }

    return this.formatResult(failed === 0, synced, failed, errors);
  }
}

module.exports = WaveSync;
