'use strict';

function omsInvoiceToWave(invoice, businessId) {
  return {
    customerId: invoice.waveCustomerId,
    invoiceDate: invoice.date,
    dueDate: invoice.dueDate || null,
    memo: invoice.notes || '',
    items: (invoice.items || []).map(item => ({
      productId: item.waveProductId || null,
      description: item.description || item.name,
      quantity: parseFloat(item.quantity) || 1,
      unitPrice: parseFloat(item.rate || item.price || 0)
    }))
  };
}

function waveInvoiceToOms(waveInvoice) {
  return {
    externalId: waveInvoice.id,
    invoiceNumber: waveInvoice.invoiceNumber,
    customerId: waveInvoice.customer && waveInvoice.customer.id,
    customerName: waveInvoice.customer && waveInvoice.customer.name,
    date: waveInvoice.invoiceDate,
    dueDate: waveInvoice.dueDate,
    total: waveInvoice.total && waveInvoice.total.value,
    amountDue: waveInvoice.amountDue && waveInvoice.amountDue.value,
    amountPaid: waveInvoice.amountPaid && waveInvoice.amountPaid.value,
    currency: waveInvoice.total && waveInvoice.total.currency && waveInvoice.total.currency.code,
    status: waveInvoice.status
  };
}

function omsCustomerToWave(customer) {
  return {
    name: customer.name,
    email: customer.email || null,
    phone: customer.phone || null,
    address: customer.address ? {
      addressLine1: customer.address,
      city: customer.city || '',
      province: customer.state || '',
      postalCode: customer.postalCode || '',
      countryCode: customer.countryCode || 'US'
    } : null
  };
}

function waveCustomerToOms(waveCustomer) {
  const addr = waveCustomer.address || {};
  return {
    externalId: waveCustomer.id,
    name: waveCustomer.name,
    email: waveCustomer.email,
    phone: waveCustomer.phone,
    address: addr.addressLine1,
    city: addr.city,
    state: addr.province,
    postalCode: addr.postalCode,
    country: addr.country && addr.country.code
  };
}

function omsProductToWave(product) {
  return {
    name: product.name,
    description: product.description || '',
    unitPrice: parseFloat(product.price || product.rate) || 0,
    isSold: true,
    isBought: false
  };
}

module.exports = {
  omsInvoiceToWave,
  waveInvoiceToOms,
  omsCustomerToWave,
  waveCustomerToOms,
  omsProductToWave
};
