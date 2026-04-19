'use strict';

const BaseIntegration = require('../base/BaseIntegration');
const QuickBooksClient = require('./quickbooksClient');
const { omsInvoiceToQB, omsCustomerToQB, omsPaymentToQB, omsProductToQB } = require('./quickbooksMapper');
const { validateInvoice, validatePayment, validateCustomer } = require('./quickbooksValidation');

class QuickBooksSync extends BaseIntegration {
  constructor(config) {
    super(config);
    this.integrationName = 'quickbooks';
    this.client = new QuickBooksClient({
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      realmId: config.realmId,
      environment: config.environment,
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
      return { success: true, message: 'Connected to QuickBooks Online', ...result };
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

        const qbInvoice = omsInvoiceToQB(invoice);

        if (invoice.qbInvoiceId) {
          qbInvoice.Id = invoice.qbInvoiceId;
          qbInvoice.SyncToken = invoice.qbSyncToken || '0';
          await this.withRetry(() => this.client.updateInvoice(qbInvoice));
        } else {
          await this.withRetry(() => this.client.createInvoice(qbInvoice));
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

        const qbPayment = omsPaymentToQB(payment);
        await this.withRetry(() => this.client.createPayment(qbPayment));
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

        const qbCustomer = omsCustomerToQB(customer);
        await this.withRetry(() => this.client.createCustomer(qbCustomer));
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
        const qbProduct = omsProductToQB(product);
        await this.withRetry(() => this.client.createItem(qbProduct));
        synced++;
      } catch (err) {
        errors.push({ id: product.id, error: err.message });
        failed++;
      }
    }

    return this.formatResult(failed === 0, synced, failed, errors);
  }
}

module.exports = QuickBooksSync;
