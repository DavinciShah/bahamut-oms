'use strict';

const axios = require('axios');
const crypto = require('crypto');
const net = require('net');
const Webhook = require('../models/Webhook');
const logger = require('../config/logger');

function isPrivateIp(hostname) {
  if (net.isIP(hostname) === 4) {
    const [a, b] = hostname.split('.').map(Number);
    return (
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }
  if (net.isIP(hostname) === 6) {
    const normalized = hostname.toLowerCase();
    return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:');
  }
  return false;
}

function validateWebhookUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    throw Object.assign(new Error('Invalid webhook URL'), { status: 400 });
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw Object.assign(new Error('Webhook URL must use HTTP or HTTPS'), { status: 400 });
  }
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.local') || isPrivateIp(hostname)) {
    throw Object.assign(new Error('Webhook URL targets a restricted host'), { status: 400 });
  }
  return parsed.toString();
}

async function registerWebhook({ userId, integrationId, url, events, secret }) {
  if (!url || !events || !Array.isArray(events) || events.length === 0) {
    throw Object.assign(new Error('URL and events array are required'), { status: 400 });
  }

  const normalizedUrl = validateWebhookUrl(url);
  const generatedSecret = secret || crypto.randomBytes(24).toString('hex');
  return Webhook.create({ integrationId: integrationId || null, userId, url: normalizedUrl, events, secret: generatedSecret });
}

async function listWebhooks(userId) {
  return Webhook.findByUserId(userId);
}

async function deleteWebhook(id, userId) {
  const webhook = await Webhook.findById(id);
  if (!webhook) throw Object.assign(new Error('Webhook not found'), { status: 404 });
  if (webhook.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  await Webhook.delete(id, userId);
  return { deleted: true };
}

async function testWebhook(id, userId) {
  const webhook = await Webhook.findById(id);
  if (!webhook) throw Object.assign(new Error('Webhook not found'), { status: 404 });
  if (webhook.user_id !== userId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const testPayload = {
    event: 'test',
    timestamp: new Date().toISOString(),
    data: { message: 'This is a test event from De Vibe OMS' }
  };

  const result = await deliverWebhook(webhook, testPayload);
  return { sent: true, statusCode: result.statusCode };
}

async function handleAccountingEvent(event) {
  const { type, data } = event;
  if (!type) throw Object.assign(new Error('Event type is required'), { status: 400 });

  logger.info(`Handling accounting event: ${type}`, { data });
  await triggerWebhooks(type, data);
  return { processed: true, eventType: type };
}

async function triggerWebhooks(eventType, data) {
  let webhooks;
  try {
    webhooks = await Webhook.findByEvent(eventType);
  } catch (err) {
    logger.error('Failed to fetch webhooks for event', { eventType, error: err.message });
    return;
  }

  const payload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data
  };

  const results = await Promise.allSettled(
    webhooks.map(webhook => deliverWebhook(webhook, payload))
  );

  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      logger.error(`Failed to deliver webhook ${webhooks[i].id}`, { error: result.reason });
    }
  });
}

async function deliverWebhook(webhook, payload) {
  const body = JSON.stringify(payload);
  const headers = {
    'Content-Type': 'application/json',
    'X-Bahamut-Event': payload.event,
    'X-Bahamut-Timestamp': payload.timestamp
  };

  if (webhook.secret) {
    const sig = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');
    headers['X-Bahamut-Signature'] = `sha256=${sig}`;
  }

  try {
    const targetUrl = validateWebhookUrl(webhook.url);
    const response = await axios.post(targetUrl, payload, { headers, timeout: 10000 });
    await Webhook.updateLastTriggered(webhook.id, 'success');
    return { statusCode: response.status };
  } catch (err) {
    await Webhook.updateLastTriggered(webhook.id, 'failed');
    throw err;
  }
}

module.exports = {
  registerWebhook,
  listWebhooks,
  deleteWebhook,
  testWebhook,
  handleAccountingEvent,
  triggerWebhooks
};
