'use strict';

function validateInvoice(invoice) {
  if (!invoice) return 'Invoice is required';
  if (!invoice.waveCustomerId) return 'Wave customer ID is required';
  if (!invoice.items || invoice.items.length === 0) return 'At least one item is required';
  if (!invoice.date) return 'Invoice date is required';
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
  return null;
}

module.exports = { validateInvoice, validateCustomer, validateProduct };
