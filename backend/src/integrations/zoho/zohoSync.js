'use strict';

const BaseIntegration = require('../base/BaseIntegration');
const ZohoClient = require('./zohoClient');
const { omsInvoiceToZoho, omsCustomerToZoho, omsProductToZoho, omsPaymentToZoho } = require('./zohoMapper');
const { validateInvoice, validatePayment, validateCustomer } = require('./zohoValidation');

class ZohoSync extends BaseIntegration {
  constructor(config) {
    super(config);
    this.integrationName = 'zoho';
    this.client = new ZohoClient({
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      organizationId: config.organizationId,
      clientId: config.clientId,
      clientSecret: config.clientSecret
    });
  }

  async authenticate() {
    return this.testConnection();
  }

  async testConnection() {
    try {
      const result = await this.client.testConnection();
      return { success: true, message: 'Connected to Zoho Books', ...result };
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

        const zohoInvoice = omsInvoiceToZoho(invoice);

        if (invoice.zohoInvoiceId) {
          await this.withRetry(() => this.client.updateInvoice(invoice.zohoInvoiceId, zohoInvoice));
        } else {
          await this.withRetry(() => this.client.createInvoice(zohoInvoice));
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
    const errors = [];
    let synced = 0;
    let failed = 0;

    for (const payment of payments) {
      try {
        const validationError = validatePayment(payment);
        if (validationError) {
          errors.push({ id: payment.id, error: validationError });
          failed++;
          continue;
        }

        const zohoPayment = omsPaymentToZoho(payment);
        await this.withRetry(() => this.client.createPayment(zohoPayment));
        synced++;
      } catch (err) {
        errors.push({ id: payment.id, error: err.message });
        failed++;
      }
    }

    return this.formatResult(failed === 0, synced, failed, errors);
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

        const zohoCustomer = omsCustomerToZoho(customer);

        if (customer.zohoContactId) {
          await this.withRetry(() => this.client.updateCustomer(customer.zohoContactId, zohoCustomer));
        } else {
          await this.withRetry(() => this.client.createCustomer(zohoCustomer));
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
        const zohoProduct = omsProductToZoho(product);
        await this.withRetry(() => this.client.createItem(zohoProduct));
        synced++;
      } catch (err) {
        errors.push({ id: product.id, error: err.message });
        failed++;
      }
    }

    return this.formatResult(failed === 0, synced, failed, errors);
  }
}

module.exports = ZohoSync;
