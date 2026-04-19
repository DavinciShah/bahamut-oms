'use strict';

function omsInvoiceToQB(invoice) {
  return {
    Line: (invoice.items || []).map((item, idx) => ({
      Id: String(idx + 1),
      LineNum: idx + 1,
      Amount: parseFloat(item.amount) || 0,
      DetailType: 'SalesItemLineDetail',
      SalesItemLineDetail: {
        ItemRef: { name: item.name, value: item.qbItemId || '1' },
        Qty: parseFloat(item.quantity) || 1,
        UnitPrice: parseFloat(item.rate || item.price || 0)
      }
    })),
    CustomerRef: { name: invoice.customerName, value: invoice.qbCustomerId || null },
    DocNumber: invoice.invoiceNumber || invoice.id,
    TxnDate: invoice.date,
    DueDate: invoice.dueDate || null,
    CurrencyRef: { value: invoice.currency || 'USD' },
    PrivateNote: invoice.notes || ''
  };
}

function qbInvoiceToOms(qbInvoice) {
  return {
    externalId: qbInvoice.Id,
    invoiceNumber: qbInvoice.DocNumber,
    customerId: qbInvoice.CustomerRef && qbInvoice.CustomerRef.value,
    customerName: qbInvoice.CustomerRef && qbInvoice.CustomerRef.name,
    date: qbInvoice.TxnDate,
    dueDate: qbInvoice.DueDate,
    currency: qbInvoice.CurrencyRef && qbInvoice.CurrencyRef.value,
    items: (qbInvoice.Line || [])
      .filter(l => l.DetailType === 'SalesItemLineDetail')
      .map(l => ({
        name: l.SalesItemLineDetail && l.SalesItemLineDetail.ItemRef && l.SalesItemLineDetail.ItemRef.name,
        quantity: l.SalesItemLineDetail && l.SalesItemLineDetail.Qty,
        rate: l.SalesItemLineDetail && l.SalesItemLineDetail.UnitPrice,
        amount: l.Amount
      })),
    total: qbInvoice.TotalAmt,
    balance: qbInvoice.Balance,
    status: qbInvoice.Balance === 0 ? 'paid' : 'pending',
    notes: qbInvoice.PrivateNote
  };
}

function omsCustomerToQB(customer) {
  return {
    DisplayName: customer.name,
    PrimaryEmailAddr: customer.email ? { Address: customer.email } : undefined,
    PrimaryPhone: customer.phone ? { FreeFormNumber: customer.phone } : undefined,
    BillAddr: {
      Line1: customer.address || '',
      City: customer.city || '',
      CountrySubDivisionCode: customer.state || '',
      PostalCode: customer.postalCode || '',
      Country: customer.country || 'US'
    },
    TaxIdentifier: customer.taxId || undefined
  };
}

function omsPaymentToQB(payment) {
  return {
    CustomerRef: { value: payment.qbCustomerId },
    TotalAmt: parseFloat(payment.amount) || 0,
    TxnDate: payment.date,
    PaymentMethodRef: { value: '1' },
    PrivateNote: payment.reference || payment.id,
    Line: payment.qbInvoiceId ? [{
      Amount: parseFloat(payment.amount) || 0,
      LinkedTxn: [{ TxnId: payment.qbInvoiceId, TxnType: 'Invoice' }]
    }] : []
  };
}

function omsProductToQB(product) {
  return {
    Name: product.name,
    Description: product.description || '',
    Type: product.type === 'service' ? 'Service' : 'NonInventory',
    UnitPrice: parseFloat(product.price || product.rate) || 0,
    IncomeAccountRef: { value: '79' }
  };
}

module.exports = { omsInvoiceToQB, qbInvoiceToOms, omsCustomerToQB, omsPaymentToQB, omsProductToQB };
