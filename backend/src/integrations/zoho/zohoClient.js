'use strict';

const axios = require('axios');

const ZOHO_API_BASE = 'https://books.zoho.com/api/v3';
const ZOHO_AUTH_BASE = 'https://accounts.zoho.com/oauth/v2';

class ZohoClient {
  constructor({ accessToken, refreshToken, organizationId, clientId, clientSecret }) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.organizationId = organizationId;
    this.clientId = clientId || process.env.ZOHO_CLIENT_ID;
    this.clientSecret = clientSecret || process.env.ZOHO_CLIENT_SECRET;

    this.http = axios.create({
      baseURL: ZOHO_API_BASE,
      timeout: 30000
    });

    this.http.interceptors.request.use(cfg => {
      cfg.headers['Authorization'] = `Zoho-oauthtoken ${this.accessToken}`;
      if (this.organizationId) {
        cfg.params = { ...cfg.params, organization_id: this.organizationId };
      }
      return cfg;
    });

    this.http.interceptors.response.use(
      res => res,
      async err => {
        if (err.response && err.response.status === 401 && this.refreshToken) {
          await this.refreshAccessToken();
          err.config.headers['Authorization'] = `Zoho-oauthtoken ${this.accessToken}`;
          return this.http.request(err.config);
        }
        return Promise.reject(err);
      }
    );
  }

  async refreshAccessToken() {
    const response = await axios.post(`${ZOHO_AUTH_BASE}/token`, null, {
      params: {
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token'
      }
    });
    this.accessToken = response.data.access_token;
    return response.data;
  }

  async getInvoices(params = {}) {
    const response = await this.http.get('/invoices', { params });
    return response.data;
  }

  async getInvoice(id) {
    const response = await this.http.get(`/invoices/${id}`);
    return response.data.invoice;
  }

  async createInvoice(data) {
    const response = await this.http.post('/invoices', { JSONString: JSON.stringify(data) });
    return response.data.invoice;
  }

  async updateInvoice(id, data) {
    const response = await this.http.put(`/invoices/${id}`, { JSONString: JSON.stringify(data) });
    return response.data.invoice;
  }

  async getCustomers(params = {}) {
    const response = await this.http.get('/contacts', { params });
    return response.data;
  }

  async createCustomer(data) {
    const response = await this.http.post('/contacts', { JSONString: JSON.stringify(data) });
    return response.data.contact;
  }

  async updateCustomer(id, data) {
    const response = await this.http.put(`/contacts/${id}`, { JSONString: JSON.stringify(data) });
    return response.data.contact;
  }

  async getItems(params = {}) {
    const response = await this.http.get('/items', { params });
    return response.data;
  }

  async createItem(data) {
    const response = await this.http.post('/items', { JSONString: JSON.stringify(data) });
    return response.data.item;
  }

  async createPayment(data) {
    const response = await this.http.post('/customerpayments', { JSONString: JSON.stringify(data) });
    return response.data.payment;
  }

  async getExpenses(params = {}) {
    const response = await this.http.get('/expenses', { params });
    return response.data;
  }

  async createJournalEntry(data) {
    const response = await this.http.post('/journals', { JSONString: JSON.stringify(data) });
    return response.data.journal;
  }

  async testConnection() {
    const response = await this.http.get('/organizations');
    return { connected: true, data: response.data };
  }
}

module.exports = ZohoClient;
