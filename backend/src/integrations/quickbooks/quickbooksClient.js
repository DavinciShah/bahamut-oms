'use strict';

const axios = require('axios');

const QB_BASE_URLS = {
  sandbox: 'https://sandbox-quickbooks.api.intuit.com/v3/company',
  production: 'https://quickbooks.api.intuit.com/v3/company'
};

const QB_AUTH_BASE = 'https://oauth.platform.intuit.com/oauth2/v1';

class QuickBooksClient {
  constructor({ accessToken, refreshToken, realmId, environment, clientId, clientSecret }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.realmId = realmId;
    this.environment = environment || process.env.QB_ENVIRONMENT || 'sandbox';
    this.clientId = clientId || process.env.QB_CLIENT_ID;
    this.clientSecret = clientSecret || process.env.QB_CLIENT_SECRET;
    this.baseUrl = `${QB_BASE_URLS[this.environment]}/${this.realmId}`;

    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    });

    this.http.interceptors.request.use(cfg => {
      cfg.headers['Authorization'] = `Bearer ${this.accessToken}`;
      return cfg;
    });

    this.http.interceptors.response.use(
      res => res,
      async err => {
        if (err.response && err.response.status === 401 && this.refreshToken) {
          await this.refreshAccessToken();
          err.config.headers['Authorization'] = `Bearer ${this.accessToken}`;
          return this.http.request(err.config);
        }
        return Promise.reject(err);
      }
    );
  }

  async refreshAccessToken() {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await axios.post(`${QB_AUTH_BASE}/tokens/bearer`, {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken
    }, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    this.accessToken = response.data.access_token;
    if (response.data.refresh_token) {
      this.refreshToken = response.data.refresh_token;
    }
    return response.data;
  }

  async query(sql) {
    const response = await this.http.get('/query', {
      params: { query: sql, minorversion: 65 }
    });
    return response.data.QueryResponse;
  }

  async createInvoice(data) {
    const response = await this.http.post('/invoice', data, {
      params: { minorversion: 65 }
    });
    return response.data.Invoice;
  }

  async updateInvoice(data) {
    const response = await this.http.post('/invoice', data, {
      params: { minorversion: 65 }
    });
    return response.data.Invoice;
  }

  async createCustomer(data) {
    const response = await this.http.post('/customer', data, {
      params: { minorversion: 65 }
    });
    return response.data.Customer;
  }

  async createPayment(data) {
    const response = await this.http.post('/payment', data, {
      params: { minorversion: 65 }
    });
    return response.data.Payment;
  }

  async createItem(data) {
    const response = await this.http.post('/item', data, {
      params: { minorversion: 65 }
    });
    return response.data.Item;
  }

  async createJournalEntry(data) {
    const response = await this.http.post('/journalentry', data, {
      params: { minorversion: 65 }
    });
    return response.data.JournalEntry;
  }

  async getCompanyInfo() {
    const response = await this.http.get(`/companyinfo/${this.realmId}`, {
      params: { minorversion: 65 }
    });
    return response.data.CompanyInfo;
  }

  async testConnection() {
    const info = await this.getCompanyInfo();
    return { connected: true, company: info };
  }
}

module.exports = QuickBooksClient;
