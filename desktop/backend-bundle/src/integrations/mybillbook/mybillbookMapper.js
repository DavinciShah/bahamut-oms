'use strict';

function omsInvoiceToMyBillBook(invoice) {
  return {
    customer_id: invoice.customerId || null,
    customer_name: invoice.customerName,
    invoice_number: invoice.invoiceNumber || invoice.id,
    invoice_date: invoice.date,
    due_date: invoice.dueDate || null,
    currency: invoice.currency || 'INR',
    line_items: (invoice.items || []).map(item => ({
      product_id: item.productId || null,
      name: item.name,
      description: item.description || '',
      quantity: parseFloat(item.quantity) || 1,
      rate: parseFloat(item.rate || item.price || item.amount) || 0,
      amount: parseFloat(item.amount) || 0,
      tax_percent: parseFloat(item.taxPercent || item.tax) || 0
    })),
    sub_total: parseFloat(invoice.subtotal) || 0,
    tax_total: parseFloat(invoice.taxTotal) || 0,
    total: parseFloat(invoice.total) || 0,
    notes: invoice.notes || '',
    terms: invoice.terms || '',
    status: invoice.status || 'draft'
  };
}

function myBillBookInvoiceToOms(mbInvoice) {
  return {
    externalId: mbInvoice.id,
    invoiceNumber: mbInvoice.invoice_number,
    customerId: mbInvoice.customer_id,
    customerName: mbInvoice.customer_name,
    date: mbInvoice.invoice_date,
    dueDate: mbInvoice.due_date,
    currency: mbInvoice.currency || 'INR',
    items: (mbInvoice.line_items || []).map(item => ({
      externalId: item.id,
      productId: item.product_id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
      taxPercent: item.tax_percent
    })),
    subtotal: mbInvoice.sub_total,
    taxTotal: mbInvoice.tax_total,
    total: mbInvoice.total,
    status: mbInvoice.status,
    notes: mbInvoice.notes
  };
}

function omsCustomerToMyBillBook(customer) {
  return {
    name: customer.name,
    email: customer.email || '',
    phone: customer.phone || '',
    gstin: customer.gstin || customer.taxId || '',
    address: customer.address || '',
    city: customer.city || '',
    state: customer.state || '',
    pincode: customer.pincode || customer.postalCode || '',
    country: customer.country || 'India'
  };
}

function myBillBookCustomerToOms(mbCustomer) {
  return {
    externalId: mbCustomer.id,
    name: mbCustomer.name,
    email: mbCustomer.email,
    phone: mbCustomer.phone,
    taxId: mbCustomer.gstin,
    address: mbCustomer.address,
    city: mbCustomer.city,
    state: mbCustomer.state,
    postalCode: mbCustomer.pincode,
    country: mbCustomer.country
  };
}

function omsProductToMyBillBook(product) {
  return {
    name: product.name,
    description: product.description || '',
    unit: product.unit || 'Nos',
    rate: parseFloat(product.price || product.rate) || 0,
    hsn_code: product.hsnCode || '',
    tax_percent: parseFloat(product.taxPercent) || 0
  };
}

module.exports = {
  omsInvoiceToMyBillBook,
  myBillBookInvoiceToOms,
  omsCustomerToMyBillBook,
  myBillBookCustomerToOms,
  omsProductToMyBillBook
};
