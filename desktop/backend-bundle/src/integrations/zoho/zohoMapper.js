'use strict';

function omsInvoiceToZoho(invoice) {
  return {
    customer_id: invoice.zohoCustomerId || null,
    customer_name: invoice.customerName,
    invoice_number: invoice.invoiceNumber || invoice.id,
    date: invoice.date,
    due_date: invoice.dueDate,
    currency_code: invoice.currency || 'INR',
    line_items: (invoice.items || []).map(item => ({
      item_id: item.zohoItemId || null,
      name: item.name,
      description: item.description || '',
      quantity: parseFloat(item.quantity) || 1,
      rate: parseFloat(item.rate || item.price || 0),
      amount: parseFloat(item.amount) || 0,
      tax_id: item.taxId || null
    })),
    sub_total: parseFloat(invoice.subtotal) || 0,
    tax_total: parseFloat(invoice.taxTotal) || 0,
    total: parseFloat(invoice.total) || 0,
    notes: invoice.notes || '',
    terms: invoice.terms || '',
    status: invoice.status === 'paid' ? 'sent' : 'draft'
  };
}

function zohoInvoiceToOms(zohoInvoice) {
  return {
    externalId: zohoInvoice.invoice_id,
    invoiceNumber: zohoInvoice.invoice_number,
    customerId: zohoInvoice.customer_id,
    customerName: zohoInvoice.customer_name,
    date: zohoInvoice.date,
    dueDate: zohoInvoice.due_date,
    currency: zohoInvoice.currency_code,
    items: (zohoInvoice.line_items || []).map(item => ({
      externalId: item.line_item_id,
      productId: item.item_id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.item_total
    })),
    subtotal: zohoInvoice.sub_total,
    taxTotal: zohoInvoice.tax_total,
    total: zohoInvoice.total,
    status: zohoInvoice.status,
    notes: zohoInvoice.notes
  };
}

function omsCustomerToZoho(customer) {
  return {
    contact_name: customer.name,
    contact_type: 'customer',
    email: customer.email || '',
    phone: customer.phone || '',
    billing_address: {
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zip: customer.postalCode || '',
      country: customer.country || 'India'
    },
    gst_no: customer.taxId || customer.gstin || ''
  };
}

function omsProductToZoho(product) {
  return {
    name: product.name,
    description: product.description || '',
    rate: parseFloat(product.price || product.rate) || 0,
    unit: product.unit || '',
    product_type: product.type || 'goods',
    hsn_or_sac: product.hsnCode || ''
  };
}

function omsPaymentToZoho(payment) {
  return {
    customer_id: payment.zohoCustomerId,
    invoice_id: payment.zohoInvoiceId || payment.externalInvoiceId,
    date: payment.date,
    amount: parseFloat(payment.amount) || 0,
    payment_mode: payment.method || 'bank_transfer',
    reference_number: payment.reference || payment.id,
    description: payment.notes || ''
  };
}

module.exports = {
  omsInvoiceToZoho,
  zohoInvoiceToOms,
  omsCustomerToZoho,
  omsProductToZoho,
  omsPaymentToZoho
};
