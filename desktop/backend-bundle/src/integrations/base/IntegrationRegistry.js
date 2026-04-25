'use strict';

const INTEGRATIONS = {
  tally: {
    name: 'Tally',
    description: 'Sync with Tally ERP accounting software via XML-based API',
    authType: 'host_port',
    icon: 'tally',
    supportedFeatures: ['invoices', 'payments', 'customers', 'ledger'],
    requiredConfig: ['host', 'port'],
    optionalConfig: ['company']
  },
  mybillbook: {
    name: 'MyBillBook',
    description: 'Integrate with MyBillBook cloud accounting',
    authType: 'api_key',
    icon: 'mybillbook',
    supportedFeatures: ['invoices', 'payments', 'customers', 'products', 'expenses'],
    requiredConfig: ['apiKey'],
    optionalConfig: ['organizationId']
  },
  zoho: {
    name: 'Zoho Books',
    description: 'Connect to Zoho Books via OAuth2',
    authType: 'oauth2',
    icon: 'zoho',
    supportedFeatures: ['invoices', 'payments', 'customers', 'products', 'expenses', 'journalEntries'],
    requiredConfig: ['accessToken', 'organizationId'],
    optionalConfig: ['refreshToken']
  },
  quickbooks: {
    name: 'QuickBooks Online',
    description: 'Sync with QuickBooks Online via OAuth2',
    authType: 'oauth2',
    icon: 'quickbooks',
    supportedFeatures: ['invoices', 'payments', 'customers', 'products', 'expenses', 'journalEntries'],
    requiredConfig: ['accessToken', 'realmId'],
    optionalConfig: ['refreshToken', 'environment']
  },
  wave: {
    name: 'Wave',
    description: 'Connect to Wave accounting via GraphQL API',
    authType: 'api_key',
    icon: 'wave',
    supportedFeatures: ['invoices', 'customers', 'products'],
    requiredConfig: ['apiKey', 'businessId'],
    optionalConfig: []
  }
};

class IntegrationRegistry {
  static getAll() {
    return Object.entries(INTEGRATIONS).map(([type, meta]) => ({ type, ...meta }));
  }

  static get(type) {
    return INTEGRATIONS[type] ? { type, ...INTEGRATIONS[type] } : null;
  }

  static isRegistered(type) {
    return type in INTEGRATIONS;
  }

  static getAuthType(type) {
    return INTEGRATIONS[type] ? INTEGRATIONS[type].authType : null;
  }

  static getSupportedFeatures(type) {
    return INTEGRATIONS[type] ? INTEGRATIONS[type].supportedFeatures : [];
  }

  static register(type, metadata) {
    INTEGRATIONS[type] = metadata;
  }
}

module.exports = IntegrationRegistry;
