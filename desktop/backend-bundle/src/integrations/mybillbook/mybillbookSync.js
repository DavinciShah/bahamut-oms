'use strict';

const BaseIntegration = require('../base/BaseIntegration');
const MyBillBookClient = require('./mybillbookClient');
const { omsInvoiceToMyBillBook, omsCustomerToMyBillBook, omsProductToMyBillBook } = require('./mybillbookMapper');
const { validateInvoice, validatePayment, validateCustomer } = require('./mybillbookValidation');

class MyBillBookSync extends BaseIntegration {
  constructor(config) {
    super(config);
    this.integrationName = 'mybillbook';
    this.client = new MyBillBookClient({
      apiKey: config.apiKey,
      organizationId: config.organizationId,
      baseUrl: config.baseUrl
    });
  }

  async authenticate() {
    return this.testConnection();
  }

  async testConnection() {
    try {
      const result = await this.client.testConnection();
      return { success: true, message: 'Connected to MyBillBook', ...result };
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

        const mbInvoice = omsInvoiceToMyBillBook(invoice);

        if (invoice.externalId) {
          await this.withRetry(() => this.client.updateInvoice(invoice.externalId, mbInvoice));
        } else {
          await this.withRetry(() => this.client.createInvoice(mbInvoice));
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

        await this.withRetry(() => this.client.createPayment({
          invoice_id: payment.invoiceId || payment.externalInvoiceId,
          amount: payment.amount,
          payment_date: payment.date,
          payment_mode: payment.method || 'bank_transfer',
          reference: payment.reference || payment.id
        }));
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

        const mbCustomer = omsCustomerToMyBillBook(customer);

        if (customer.externalId) {
          await this.withRetry(() => this.client.updateCustomer(customer.externalId, mbCustomer));
        } else {
          await this.withRetry(() => this.client.createCustomer(mbCustomer));
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
        const mbProduct = omsProductToMyBillBook(product);
        await this.withRetry(() => this.client.createProduct(mbProduct));
        synced++;
      } catch (err) {
        errors.push({ id: product.id, error: err.message });
        failed++;
      }
    }

    return this.formatResult(failed === 0, synced, failed, errors);
  }
}

module.exports = MyBillBookSync;
