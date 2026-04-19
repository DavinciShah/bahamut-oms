'use strict';

function validateInvoice(invoice) {
  if (!invoice) return 'Invoice is required';
  if (!invoice.customerName && !invoice.customerId) return 'Customer name or ID is required';
  if (!invoice.items || invoice.items.length === 0) return 'Invoice must have at least one item';
  if (invoice.total === undefined || isNaN(parseFloat(invoice.total))) return 'Valid total is required';
  if (!invoice.date) return 'Invoice date is required';
  return null;
}

function validatePayment(payment) {
  if (!payment) return 'Payment is required';
  if (!payment.amount || isNaN(parseFloat(payment.amount))) return 'Valid amount is required';
  if (parseFloat(payment.amount) <= 0) return 'Amount must be positive';
  if (!payment.date) return 'Payment date is required';
  return null;
}

function validateCustomer(customer) {
  if (!customer) return 'Customer is required';
  if (!customer.name) return 'Customer name is required';
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    return 'Invalid email address';
  }
  return null;
}

function validateProduct(product) {
  if (!product) return 'Product is required';
  if (!product.name) return 'Product name is required';
  if (product.price !== undefined && isNaN(parseFloat(product.price))) return 'Invalid price';
  return null;
}

module.exports = { validateInvoice, validatePayment, validateCustomer, validateProduct };
