'use strict';

function validateInvoice(invoice) {
  if (!invoice) return 'Invoice is required';
  if (!invoice.customerName && !invoice.qbCustomerId) return 'Customer name or QB customer ID is required';
  if (!invoice.items || invoice.items.length === 0) return 'At least one line item is required';
  if (!invoice.date) return 'Invoice date is required';
  return null;
}

function validatePayment(payment) {
  if (!payment) return 'Payment is required';
  if (!payment.qbCustomerId) return 'QB customer ID is required';
  if (!payment.amount || isNaN(parseFloat(payment.amount))) return 'Valid amount is required';
  if (parseFloat(payment.amount) <= 0) return 'Amount must be positive';
  if (!payment.date) return 'Payment date is required';
  return null;
}

function validateCustomer(customer) {
  if (!customer) return 'Customer is required';
  if (!customer.name) return 'Customer name is required';
  return null;
}

module.exports = { validateInvoice, validatePayment, validateCustomer };
