'use strict';

function validateInvoice(invoice) {
  if (!invoice) return 'Invoice data is required';
  if (!invoice.id && !invoice.invoiceNumber) return 'Invoice ID or number is required';
  if (!invoice.customerName) return 'Customer name is required';
  if (invoice.total === undefined || invoice.total === null) return 'Invoice total is required';
  if (isNaN(parseFloat(invoice.total))) return 'Invoice total must be a number';
  if (parseFloat(invoice.total) < 0) return 'Invoice total cannot be negative';
  if (!invoice.date) return 'Invoice date is required';
  if (!invoice.items || !Array.isArray(invoice.items) || invoice.items.length === 0) {
    return 'Invoice must have at least one line item';
  }
  for (const item of invoice.items) {
    if (!item.name) return 'Each item must have a name';
    if (item.amount === undefined || isNaN(parseFloat(item.amount))) return 'Each item must have a valid amount';
  }
  return null;
}

function validatePayment(payment) {
  if (!payment) return 'Payment data is required';
  if (!payment.id && !payment.paymentNumber) return 'Payment ID or number is required';
  if (!payment.customerName) return 'Customer name is required';
  if (payment.amount === undefined || payment.amount === null) return 'Payment amount is required';
  if (isNaN(parseFloat(payment.amount))) return 'Payment amount must be a number';
  if (parseFloat(payment.amount) <= 0) return 'Payment amount must be positive';
  if (!payment.date) return 'Payment date is required';
  return null;
}

module.exports = { validateInvoice, validatePayment };
