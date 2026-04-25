'use strict';

const TallySync = require('../tally/tallySync');
const MyBillBookSync = require('../mybillbook/mybillbookSync');
const ZohoSync = require('../zoho/zohoSync');
const QuickBooksSync = require('../quickbooks/quickbooksSync');
const WaveSync = require('../wave/waveSync');

const INTEGRATION_TYPES = {
  tally: TallySync,
  mybillbook: MyBillBookSync,
  zoho: ZohoSync,
  quickbooks: QuickBooksSync,
  wave: WaveSync
};

class IntegrationFactory {
  static create(type, config) {
    const IntegrationClass = INTEGRATION_TYPES[type];
    if (!IntegrationClass) {
      throw new Error(`Unknown integration type: ${type}. Supported types: ${Object.keys(INTEGRATION_TYPES).join(', ')}`);
    }
    return new IntegrationClass(config);
  }

  static getSupportedTypes() {
    return Object.keys(INTEGRATION_TYPES);
  }

  static isSupported(type) {
    return type in INTEGRATION_TYPES;
  }

  static register(type, IntegrationClass) {
    INTEGRATION_TYPES[type] = IntegrationClass;
  }
}

module.exports = IntegrationFactory;
