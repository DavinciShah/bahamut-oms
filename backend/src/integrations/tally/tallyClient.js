'use strict';

const axios = require('axios');
const xml2js = require('xml2js');

class TallyClient {
  constructor({ host, port, company }) {
    this.host = host || process.env.TALLY_HOST || 'localhost';
    this.port = port || process.env.TALLY_PORT || 9000;
    this.company = company || '';
    this.baseUrl = `http://${this.host}:${this.port}`;
    this.parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });
  }

  async sendXmlRequest(xmlData) {
    const response = await axios.post(this.baseUrl, xmlData, {
      headers: { 'Content-Type': 'text/xml' },
      timeout: 30000
    });
    return response.data;
  }

  async parseXmlResponse(xmlString) {
    return new Promise((resolve, reject) => {
      this.parser.parseString(xmlString, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  async getCompanyInfo() {
    const xml = `<ENVELOPE>
      <HEADER>
        <TALLYREQUEST>Export Data</TALLYREQUEST>
      </HEADER>
      <BODY>
        <EXPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>List of Companies</REPORTNAME>
          </REQUESTDESC>
        </EXPORTDATA>
      </BODY>
    </ENVELOPE>`;

    const rawResponse = await this.sendXmlRequest(xml);
    return this.parseXmlResponse(rawResponse);
  }

  async testConnection() {
    const xml = `<ENVELOPE>
      <HEADER>
        <TALLYREQUEST>Export Data</TALLYREQUEST>
      </HEADER>
      <BODY>
        <EXPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>List of Companies</REPORTNAME>
          </REQUESTDESC>
        </EXPORTDATA>
      </BODY>
    </ENVELOPE>`;

    const response = await this.sendXmlRequest(xml);
    return { connected: true, response };
  }

  async postVoucher(xmlData) {
    const rawResponse = await this.sendXmlRequest(xmlData);
    return this.parseXmlResponse(rawResponse);
  }

  formatTallyDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  async fetchVouchers({ fromDate, toDate, voucherType = 'Sales' } = {}) {
    const fromFormatted = fromDate ? this.formatTallyDate(fromDate) : '20000101';
    const toFormatted = toDate ? this.formatTallyDate(toDate) : this.formatTallyDate(new Date());
    const xml = `<ENVELOPE>
      <HEADER>
        <TALLYREQUEST>Export Data</TALLYREQUEST>
      </HEADER>
      <BODY>
        <EXPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>Voucher Register</REPORTNAME>
            <STATICVARIABLES>
              <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              <SVFROMDATE>${fromFormatted}</SVFROMDATE>
              <SVTODATE>${toFormatted}</SVTODATE>
              <VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME>
              ${this.company ? `<SVCURRENTCOMPANY>${this.company}</SVCURRENTCOMPANY>` : ''}
            </STATICVARIABLES>
          </REQUESTDESC>
        </EXPORTDATA>
      </BODY>
    </ENVELOPE>`;

    const rawResponse = await this.sendXmlRequest(xml);
    return this.parseXmlResponse(rawResponse);
  }

  async fetchLedgers() {
    const xml = `<ENVELOPE>
      <HEADER>
        <TALLYREQUEST>Export Data</TALLYREQUEST>
      </HEADER>
      <BODY>
        <EXPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>List of Ledgers</REPORTNAME>
            <STATICVARIABLES>
              <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              ${this.company ? `<SVCURRENTCOMPANY>${this.company}</SVCURRENTCOMPANY>` : ''}
            </STATICVARIABLES>
          </REQUESTDESC>
        </EXPORTDATA>
      </BODY>
    </ENVELOPE>`;

    const rawResponse = await this.sendXmlRequest(xml);
    return this.parseXmlResponse(rawResponse);
  }

  async fetchStockItems() {
    const xml = `<ENVELOPE>
      <HEADER>
        <TALLYREQUEST>Export Data</TALLYREQUEST>
      </HEADER>
      <BODY>
        <EXPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>List of Stock Items</REPORTNAME>
            <STATICVARIABLES>
              <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              ${this.company ? `<SVCURRENTCOMPANY>${this.company}</SVCURRENTCOMPANY>` : ''}
            </STATICVARIABLES>
          </REQUESTDESC>
        </EXPORTDATA>
      </BODY>
    </ENVELOPE>`;

    const rawResponse = await this.sendXmlRequest(xml);
    return this.parseXmlResponse(rawResponse);
  }
}

module.exports = TallyClient;
