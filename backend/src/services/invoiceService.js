'use strict';

const Invoice = require('../models/Invoice');
const emailService = require('./emailService');

const invoiceService = {
  async createInvoice(data) {
    const { tenantId, customerId, items = [], tax = 0 } = data;

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + tax;

    return Invoice.create({ tenantId, customerId, items, subtotal, tax, total, ...data });
  },

  async getInvoices(tenantId, options = {}) {
    const { limit = 50, offset = 0, customerId, status } = options;
    const invoices = await Invoice.findAll({ tenantId, customerId, status, limit, offset });
    return { invoices, limit, offset };
  },

  async getById(id) {
    const invoice = await Invoice.findById(id);
    if (!invoice) throw Object.assign(new Error('Invoice not found'), { status: 404 });
    return invoice;
  },

  /**
   * Generate a PDF buffer for an invoice.
   * Uses pdfkit if available, falls back to a simple text buffer.
   */
  async generatePDF(invoiceId) {
    const invoice = await this.getById(invoiceId);

    let PDFDocument;
    try {
      PDFDocument = require('pdfkit');
    } catch {
      // pdfkit not installed – return plain-text buffer
      const text = [
        `INVOICE #${invoice.id}`,
        `Date: ${new Date(invoice.created_at).toDateString()}`,
        `Status: ${invoice.status}`,
        '',
        'Items:',
        ...(invoice.items || []).map(
          (i) => `  ${i.name}  x${i.quantity}  @ ${i.price}`
        ),
        '',
        `Subtotal: ${invoice.subtotal}`,
        `Tax:      ${invoice.tax}`,
        `Total:    ${invoice.total}`,
      ].join('\n');
      return Buffer.from(text, 'utf8');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(20).text(`Invoice #${invoice.id}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${new Date(invoice.created_at).toDateString()}`);
      doc.text(`Status: ${invoice.status}`);
      doc.moveDown();
      doc.text('Items:', { underline: true });

      (invoice.items || []).forEach((item) => {
        doc.text(`  ${item.name}  x${item.quantity}  @ ${item.price}`);
      });

      doc.moveDown();
      doc.text(`Subtotal: ${invoice.subtotal}`);
      doc.text(`Tax:      ${invoice.tax}`);
      doc.text(`Total:    ${invoice.total}`, { bold: true });

      doc.end();
    });
  },

  async sendInvoice(invoiceId, email) {
    const invoice = await this.getById(invoiceId);
    const pdfBuffer = await this.generatePDF(invoiceId);

    await emailService.sendEmail(
      email,
      `Invoice #${invoice.id}`,
      `<p>Please find your invoice #${invoice.id} attached.</p><p>Total: ${invoice.total}</p>`,
      undefined,
      [{ filename: `invoice-${invoice.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
    );

    return { sent: true };
  },
};

module.exports = invoiceService;
