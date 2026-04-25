'use strict';

const { query } = require('../config/database');
const { encryptCredentials } = require('./integrationService');

const GOOGLE_OAUTH_TYPE = 'google_oauth';
const GOOGLE_OAUTH_NAME = 'Google OAuth';

function parseClientIds(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item !== 'your-google-client-id' && item !== 'your-google-client-id.apps.googleusercontent.com');
}

function isValidGoogleClientId(clientId) {
  return /\.apps\.googleusercontent\.com$/.test(String(clientId || '').trim());
}

async function getStoredGoogleIntegration(includeInactive = false) {
  const sql = includeInactive
    ? 'SELECT * FROM integrations WHERE type = $1 ORDER BY updated_at DESC LIMIT 1'
    : "SELECT * FROM integrations WHERE type = $1 AND status = 'active' ORDER BY updated_at DESC LIMIT 1";
  const result = await query(sql, [GOOGLE_OAUTH_TYPE]);
  return result.rows[0] || null;
}

function getEnvClientIds() {
  const multi = parseClientIds(process.env.GOOGLE_CLIENT_IDS);
  const single = parseClientIds(process.env.GOOGLE_CLIENT_ID);
  return [...new Set([...multi, ...single])];
}

async function getGoogleAudiences() {
  const audiences = new Set(getEnvClientIds());
  const integration = await getStoredGoogleIntegration(false);

  if (integration?.config?.clientId) {
    for (const clientId of parseClientIds(integration.config.clientId)) {
      audiences.add(clientId);
    }
  }

  return Array.from(audiences);
}

async function getPublicGoogleConfig() {
  const integration = await getStoredGoogleIntegration(false);
  const clientId = integration?.config?.clientId || getEnvClientIds()[0] || '';

  return {
    clientId,
    configured: Boolean(clientId),
    source: integration?.config?.clientId ? 'database' : 'environment',
  };
}

async function getAdminGoogleConfig() {
  const integration = await getStoredGoogleIntegration(true);
  const envClientId = getEnvClientIds()[0] || '';

  return {
    clientId: integration?.config?.clientId || envClientId,
    hasClientSecret: Boolean(integration?.config?.clientSecret_encrypted),
    status: integration?.status || 'inactive',
    source: integration?.config?.clientId ? 'database' : (envClientId ? 'environment' : 'unset'),
  };
}

async function upsertGoogleConfig(userId, { clientId, clientSecret, status = 'active' }) {
  const nextClientId = String(clientId || '').trim();
  const nextClientSecret = String(clientSecret || '').trim();

  if (!isValidGoogleClientId(nextClientId)) {
    const err = new Error('Google Client ID must end with .apps.googleusercontent.com');
    err.status = 400;
    throw err;
  }

  const existing = await getStoredGoogleIntegration(true);
  const nextConfig = { ...(existing?.config || {}), clientId: nextClientId };

  if (nextClientSecret) {
    nextConfig.clientSecret_encrypted = encryptCredentials(nextClientSecret);
  }

  if (existing) {
    const result = await query(
      `UPDATE integrations
       SET config = $1, status = $2, name = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [JSON.stringify(nextConfig), status, GOOGLE_OAUTH_NAME, existing.id]
    );
    return result.rows[0];
  }

  const result = await query(
    `INSERT INTO integrations (user_id, type, name, config, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, GOOGLE_OAUTH_TYPE, GOOGLE_OAUTH_NAME, JSON.stringify(nextConfig), status]
  );

  return result.rows[0];
}

module.exports = {
  getGoogleAudiences,
  getPublicGoogleConfig,
  getAdminGoogleConfig,
  upsertGoogleConfig,
  isValidGoogleClientId,
};