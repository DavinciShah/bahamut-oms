'use strict';

const axios = require('axios');

const WAVE_GRAPHQL_URL = 'https://gql.waveapps.com/graphql/public';

class WaveClient {
  constructor({ apiKey, businessId }) {
    this.apiKey = apiKey;
    this.businessId = businessId;

    this.http = axios.create({
      baseURL: WAVE_GRAPHQL_URL,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async executeQuery(query, variables = {}) {
    const response = await this.http.post('', { query, variables });
    if (response.data.errors) {
      throw new Error(response.data.errors.map(e => e.message).join(', '));
    }
    return response.data.data;
  }

  async getBusiness() {
    const query = `
      query GetBusiness($businessId: ID!) {
        business(id: $businessId) {
          id
          name
          currency { code }
        }
      }
    `;
    return this.executeQuery(query, { businessId: this.businessId });
  }

  async getCustomers(params = {}) {
    const query = `
      query GetCustomers($businessId: ID!, $page: Int, $pageSize: Int) {
        business(id: $businessId) {
          customers(page: $page, pageSize: $pageSize) {
            pageInfo { currentPage totalPages totalCount }
            edges {
              node { id name email phone address { addressLine1 city province postalCode country { code } } }
            }
          }
        }
      }
    `;
    return this.executeQuery(query, { businessId: this.businessId, ...params });
  }

  async createCustomer(data) {
    const mutation = `
      mutation CreateCustomer($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          didSucceed
          inputErrors { code message path }
          customer { id name email }
        }
      }
    `;
    return this.executeQuery(mutation, { input: { businessId: this.businessId, ...data } });
  }

  async getInvoices(params = {}) {
    const query = `
      query GetInvoices($businessId: ID!, $page: Int, $pageSize: Int) {
        business(id: $businessId) {
          invoices(page: $page, pageSize: $pageSize) {
            pageInfo { currentPage totalPages totalCount }
            edges {
              node {
                id invoiceNumber status
                customer { id name }
                invoiceDate dueDate
                amountDue { value currency { code } }
                amountPaid { value }
                total { value }
              }
            }
          }
        }
      }
    `;
    return this.executeQuery(query, { businessId: this.businessId, ...params });
  }

  async createInvoice(data) {
    const mutation = `
      mutation CreateInvoice($input: InvoiceCreateInput!) {
        invoiceCreate(input: $input) {
          didSucceed
          inputErrors { code message path }
          invoice { id invoiceNumber status }
        }
      }
    `;
    return this.executeQuery(mutation, { input: { businessId: this.businessId, ...data } });
  }

  async getProducts(params = {}) {
    const query = `
      query GetProducts($businessId: ID!, $page: Int, $pageSize: Int) {
        business(id: $businessId) {
          products(page: $page, pageSize: $pageSize) {
            pageInfo { currentPage totalPages totalCount }
            edges {
              node { id name description unitPrice defaultTaxes { id } }
            }
          }
        }
      }
    `;
    return this.executeQuery(query, { businessId: this.businessId, ...params });
  }

  async createProduct(data) {
    const mutation = `
      mutation CreateProduct($input: ProductCreateInput!) {
        productCreate(input: $input) {
          didSucceed
          inputErrors { code message path }
          product { id name }
        }
      }
    `;
    return this.executeQuery(mutation, { input: { businessId: this.businessId, ...data } });
  }

  async testConnection() {
    const data = await this.getBusiness();
    return { connected: true, business: data.business };
  }
}

module.exports = WaveClient;
