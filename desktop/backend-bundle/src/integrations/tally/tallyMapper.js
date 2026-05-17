'use strict';

const xml2js = require('xml2js');

function escapeXml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function invoiceToTallyXml(invoice) {
  const date = formatDate(invoice.date || new Date());
  const items = (invoice.items || []).map(item => `
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${escapeXml(item.name)}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>-${parseFloat(item.amount || 0).toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>`).join('');

  return `<ENVELOPE>
    <HEADER>
      <TALLYREQUEST>Import Data</TALLYREQUEST>
    </HEADER>
    <BODY>
      <IMPORTDATA>
        <REQUESTDESC>
          <REPORTNAME>Vouchers</REPORTNAME>
          <STATICVARIABLES>
            <SVCURRENTCOMPANY>${escapeXml(invoice.company || '')}</SVCURRENTCOMPANY>
          </STATICVARIABLES>
        </REQUESTDESC>
        <REQUESTDATA>
          <TALLYMESSAGE xmlns:UDF="TallyUDF">
            <VOUCHER VCHTYPE="Sales" ACTION="Create">
              <DATE>${date}</DATE>
              <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
              <VOUCHERNUMBER>${escapeXml(invoice.invoiceNumber || invoice.id)}</VOUCHERNUMBER>
              <PARTYLEDGERNAME>${escapeXml(invoice.customerName || '')}</PARTYLEDGERNAME>
              <ALLLEDGERENTRIES.LIST>
                <LEDGERNAME>${escapeXml(invoice.customerName || '')}</LEDGERNAME>
                <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                <AMOUNT>${parseFloat(invoice.total || 0).toFixed(2)}</AMOUNT>
              </ALLLEDGERENTRIES.LIST>
              ${items}
            </VOUCHER>
          </TALLYMESSAGE>
        </REQUESTDATA>
      </IMPORTDATA>
    </BODY>
  </ENVELOPE>`;
}

function paymentToTallyXml(payment) {
  const date = formatDate(payment.date || new Date());

  return `<ENVELOPE>
    <HEADER>
      <TALLYREQUEST>Import Data</TALLYREQUEST>
    </HEADER>
    <BODY>
      <IMPORTDATA>
        <REQUESTDESC>
          <REPORTNAME>Vouchers</REPORTNAME>
        </REQUESTDESC>
        <REQUESTDATA>
          <TALLYMESSAGE xmlns:UDF="TallyUDF">
            <VOUCHER VCHTYPE="Receipt" ACTION="Create">
              <DATE>${date}</DATE>
              <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
              <VOUCHERNUMBER>${escapeXml(payment.paymentNumber || payment.id)}</VOUCHERNUMBER>
              <PARTYLEDGERNAME>${escapeXml(payment.customerName || '')}</PARTYLEDGERNAME>
              <ALLLEDGERENTRIES.LIST>
                <LEDGERNAME>${escapeXml(payment.bankAccount || 'Bank Account')}</LEDGERNAME>
                <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                <AMOUNT>${parseFloat(payment.amount || 0).toFixed(2)}</AMOUNT>
              </ALLLEDGERENTRIES.LIST>
              <ALLLEDGERENTRIES.LIST>
                <LEDGERNAME>${escapeXml(payment.customerName || '')}</LEDGERNAME>
                <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                <AMOUNT>-${parseFloat(payment.amount || 0).toFixed(2)}</AMOUNT>
              </ALLLEDGERENTRIES.LIST>
            </VOUCHER>
          </TALLYMESSAGE>
        </REQUESTDATA>
      </IMPORTDATA>
    </BODY>
  </ENVELOPE>`;
}

async function tallyResponseToInvoice(xmlResponse) {
  const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });
  return new Promise((resolve, reject) => {
    parser.parseString(xmlResponse, (err, result) => {
      if (err) return reject(err);
      const body = result && result.ENVELOPE && result.ENVELOPE.BODY;
      const importResult = body && body[0] && body[0].IMPORTRESULT;
      if (importResult) {
        resolve({ success: true, result: importResult });
      } else {
        resolve({ success: true, raw: result });
      }
    });
  });
}

module.exports = { invoiceToTallyXml, paymentToTallyXml, tallyResponseToInvoice };
