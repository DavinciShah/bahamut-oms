'use strict';

const crypto = require('crypto');
const Integration = require('../models/Integration');
const IntegrationFactory = require('../integrations/base/IntegrationFactory');
const IntegrationRegistry = require('../integrations/base/IntegrationRegistry');
const logger = require('../config/logger');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY || '';
  return Buffer.from(key.padEnd(32, '0').slice(0, 32));
}

function encryptCredentials(credentials) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const text = typeof credentials === 'string' ? credentials : JSON.stringify(credentials);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptCredentials(encrypted) {
  const [ivHex, dataHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
}

async function listIntegrations(userId) {
  const available = IntegrationRegistry.getAll();
  const connected = await Integration.findByUserId(userId);

  const connectedMap = {};
  for (const c of connected) {
    connectedMap[c.type] = c;
  }

  return available.map(integ => ({
    ...integ,
    connected: !!connectedMap[integ.type],
    connectionId: connectedMap[integ.type] ? connectedMap[integ.type].id : null,
    status: connectedMap[integ.type] ? connectedMap[integ.type].status : 'not_connected',
    lastSyncAt: connectedMap[integ.type] ? connectedMap[integ.type].last_sync_at : null
  }));
}

async function connectIntegration(userId, type, config) {
  if (!IntegrationRegistry.isRegistered(type)) {
    throw Object.assign(new Error(`Unknown integration type: ${type}`), { status: 400 });
  }

  const sensitiveFields = ['apiKey', 'accessToken', 'refreshToken', 'clientSecret', 'password'];
  const configToStore = { ...config };

  for (const field of sensitiveFields) {
    if (configToStore[field]) {
      configToStore[`${field}_encrypted`] = encryptCredentials(configToStore[field]);
      delete configToStore[field];
    }
  }

  const integration = await Integration.create({
    userId,
    type,
    name: config.name || IntegrationRegistry.get(type).name,
    config: configToStore,
    status: 'active'
  });

  return { ...integration, config: undefined };
}

async function getIntegration(id, userId) {
  const integration = await Integration.findById(id);
  if (!integration) throw Object.assign(new Error('Integration not found'), { status: 404 });
  if (integration.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });
  return { ...integration, config: undefined };
}

async function updateIntegration(id, userId, data) {
  const integration = await Integration.findById(id);
  if (!integration) throw Object.assign(new Error('Integration not found'), { status: 404 });
  if (integration.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const updated = await Integration.update(id, userId, { name: data.name, status: data.status });
  return updated;
}

async function deleteIntegration(id, userId) {
  const integration = await Integration.findById(id);
  if (!integration) throw Object.assign(new Error('Integration not found'), { status: 404 });
  if (integration.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const deleted = await Integration.delete(id, userId);
  return { deleted };
}

async function getIntegrationStatus(id, userId) {
  const integration = await Integration.findById(id);
  if (!integration) throw Object.assign(new Error('Integration not found'), { status: 404 });
  if (integration.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  return {
    id: integration.id,
    type: integration.type,
    status: integration.status,
    lastSyncAt: integration.last_sync_at,
    updatedAt: integration.updated_at
  };
}

async function testIntegration(id, userId) {
  const integration = await Integration.findById(id);
  if (!integration) throw Object.assign(new Error('Integration not found'), { status: 404 });
  if (integration.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const config = integration.config || {};

  const decryptedConfig = {};
  for (const [key, value] of Object.entries(config)) {
    if (key.endsWith('_encrypted') && typeof value === 'string') {
      try {
        const originalKey = key.replace('_encrypted', '');
        decryptedConfig[originalKey] = decryptCredentials(value);
      } catch {
        decryptedConfig[key] = value;
      }
    } else {
      decryptedConfig[key] = value;
    }
  }

  const instance = IntegrationFactory.create(integration.type, decryptedConfig);
  const result = await instance.testConnection();
  return result;
}

function getDecryptedConfig(integration) {
  const config = integration.config || {};
  const decryptedConfig = {};

  for (const [key, value] of Object.entries(config)) {
    if (key.endsWith('_encrypted') && typeof value === 'string') {
      try {
        const originalKey = key.replace('_encrypted', '');
        decryptedConfig[originalKey] = decryptCredentials(value);
      } catch {
        decryptedConfig[key] = value;
      }
    } else {
      decryptedConfig[key] = value;
    }
  }

  return decryptedConfig;
}

module.exports = {
  listIntegrations,
  connectIntegration,
  getIntegration,
  updateIntegration,
  deleteIntegration,
  getIntegrationStatus,
  testIntegration,
  encryptCredentials,
  decryptCredentials,
  getDecryptedConfig
};
