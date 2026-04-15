'use strict';

const axios = require('axios');

class MyBillBookClient {
  constructor({ apiKey, organizationId, baseUrl }) {
    this.apiKey = apiKey;
    this.organizationId = organizationId;
    this.baseUrl = baseUrl || process.env.MYBILLBOOK_API_BASE_URL || 'https://api.mybillbook.com/v1';
    this.http = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Organization-Id': this.organizationId || ''
      },
      timeout: 30000
    });
  }

  async getInvoices(params = {}) {
    const response = await this.http.get('/invoices', { params });
    return response.data;
  }

  async getInvoice(id) {
    const response = await this.http.get(`/invoices/${id}`);
    return response.data;
  }

  async createInvoice(data) {
    const response = await this.http.post('/invoices', data);
    return response.data;
  }

  async updateInvoice(id, data) {
    const response = await this.http.put(`/invoices/${id}`, data);
    return response.data;
  }

  async deleteInvoice(id) {
    const response = await this.http.delete(`/invoices/${id}`);
    return response.data;
  }

  async getCustomers(params = {}) {
    const response = await this.http.get('/customers', { params });
    return response.data;
  }

  async getCustomer(id) {
    const response = await this.http.get(`/customers/${id}`);
    return response.data;
  }

  async createCustomer(data) {
    const response = await this.http.post('/customers', data);
    return response.data;
  }

  async updateCustomer(id, data) {
    const response = await this.http.put(`/customers/${id}`, data);
    return response.data;
  }

  async getProducts(params = {}) {
    const response = await this.http.get('/products', { params });
    return response.data;
  }

  async createProduct(data) {
    const response = await this.http.post('/products', data);
    return response.data;
  }

  async getPayments(params = {}) {
    const response = await this.http.get('/payments', { params });
    return response.data;
  }

  async createPayment(data) {
    const response = await this.http.post('/payments', data);
    return response.data;
  }

  async testConnection() {
    const response = await this.http.get('/profile');
    return { connected: true, data: response.data };
  }
}

module.exports = MyBillBookClient;
