'use strict';

const BaseIntegration = require('../base/BaseIntegration');
const TallyClient = require('./tallyClient');
const {
  invoiceToTallyXml,
  paymentToTallyXml,
  tallyResponseToInvoice,
  tallyVoucherToOmsInvoice,
  tallyLedgerToOmsCustomer,
  tallyStockItemToOmsProduct
} = require('./tallyMapper');
const { validateInvoice, validatePayment } = require('./tallyValidation');

class TallySync extends BaseIntegration {
  constructor(config) {
    super(config);
    this.integrationName = 'tally';
    this.client = new TallyClient({
      host: config.host,
      port: config.port,
      company: config.company
    });
  }

  async authenticate() {
    return this.testConnection();
  }

  async testConnection() {
    try {
      const result = await this.client.testConnection();
      return { success: true, message: 'Connected to Tally', ...result };
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

        const xml = invoiceToTallyXml({ ...invoice, company: this.config.company });
        await this.withRetry(() => this.client.postVoucher(xml), { invoiceId: invoice.id });
        synced++;
        this.log('info', `Invoice ${invoice.invoiceNumber} synced to Tally`);
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

        const xml = paymentToTallyXml(payment);
        await this.withRetry(() => this.client.postVoucher(xml), { paymentId: payment.id });
        synced++;
        this.log('info', `Payment ${payment.id} synced to Tally`);
      } catch (err) {
        errors.push({ id: payment.id, error: err.message });
        failed++;
        this.log('error', `Failed to sync payment ${payment.id}: ${err.message}`);
      }
    }

    return this.formatResult(failed === 0, synced, failed, errors);
  }

  async syncCustomers(customers) {
    const errors = [];
    let synced = 0;

    for (const customer of customers) {
      try {
        const xml = `<ENVELOPE>
          <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
          <BODY>
            <IMPORTDATA>
              <REQUESTDESC><REPORTNAME>Masters</REPORTNAME></REQUESTDESC>
              <REQUESTDATA>
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                  <LEDGER NAME="${customer.name}" ACTION="Create">
                    <NAME>${customer.name}</NAME>
                    <PARENT>Sundry Debtors</PARENT>
                    <ISBILLWISEON>Yes</ISBILLWISEON>
                    <MAILINGNAME>${customer.name}</MAILINGNAME>
                  </LEDGER>
                </TALLYMESSAGE>
              </REQUESTDATA>
            </IMPORTDATA>
          </BODY>
        </ENVELOPE>`;

        await this.withRetry(() => this.client.postVoucher(xml));
        synced++;
      } catch (err) {
        errors.push({ id: customer.id, error: err.message });
      }
    }

    return this.formatResult(errors.length === 0, synced, errors.length, errors);
  }

  async syncProducts(products) {
    const errors = [];
    let synced = 0;

    for (const product of products) {
      try {
        const xml = `<ENVELOPE>
          <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
          <BODY>
            <IMPORTDATA>
              <REQUESTDESC><REPORTNAME>Masters</REPORTNAME></REQUESTDESC>
              <REQUESTDATA>
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                  <STOCKITEM NAME="${product.name}" ACTION="Create">
                    <NAME>${product.name}</NAME>
                    <BASEUNITS>${product.unit || 'Nos'}</BASEUNITS>
                    <OPENINGRATE>${product.price || 0}</OPENINGRATE>
                  </STOCKITEM>
                </TALLYMESSAGE>
              </REQUESTDATA>
            </IMPORTDATA>
          </BODY>
        </ENVELOPE>`;

        await this.withRetry(() => this.client.postVoucher(xml));
        synced++;
      } catch (err) {
        errors.push({ id: product.id, error: err.message });
      }
    }

    return this.formatResult(errors.length === 0, synced, errors.length, errors);
  }

  async fetchFromTally({ fromDate, toDate } = {}) {
    const result = { invoices: [], customers: [], products: [], errors: [] };

    try {
      const voucherData = await this.client.fetchVouchers({ fromDate, toDate, voucherType: 'Sales' });
      const vouchers = this._extractList(voucherData, 'VOUCHER');
      result.invoices = vouchers
        .map(v => tallyVoucherToOmsInvoice(v))
        .filter(Boolean);
    } catch (err) {
      this.log('error', `fetchFromTally: failed to fetch vouchers: ${err.message}`);
      result.errors.push({ type: 'vouchers', error: err.message });
    }

    try {
      const ledgerData = await this.client.fetchLedgers();
      const ledgers = this._extractList(ledgerData, 'LEDGER');
      result.customers = ledgers
        .map(l => tallyLedgerToOmsCustomer(l))
        .filter(Boolean);
    } catch (err) {
      this.log('error', `fetchFromTally: failed to fetch ledgers: ${err.message}`);
      result.errors.push({ type: 'ledgers', error: err.message });
    }

    try {
      const stockData = await this.client.fetchStockItems();
      const items = this._extractList(stockData, 'STOCKITEM');
      result.products = items
        .map(i => tallyStockItemToOmsProduct(i))
        .filter(Boolean);
    } catch (err) {
      this.log('error', `fetchFromTally: failed to fetch stock items: ${err.message}`);
      result.errors.push({ type: 'stock_items', error: err.message });
    }

    return result;
  }

  _extractList(parsedXml, tagName) {
    try {
      const envelope = parsedXml && parsedXml.ENVELOPE;
      if (!envelope) return [];
      const body = envelope.BODY || envelope.body;
      if (!body) return [];
      const bodyNode = Array.isArray(body) ? body[0] : body;
      const exportResult = bodyNode.EXPORTRESULT || bodyNode.exportresult || bodyNode.DATA || {};
      const exportNode = Array.isArray(exportResult) ? exportResult[0] : exportResult;
      const found = exportNode[tagName] || exportNode[tagName.toLowerCase()] || [];
      return [].concat(found);
    } catch {
      return [];
    }
  }
}

module.exports = TallySync;
