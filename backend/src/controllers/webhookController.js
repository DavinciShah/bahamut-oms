'use strict';

const webhookService = require('../services/webhookService');

async function registerWebhook(req, res, next) {
  try {
    const { url, events, integrationId, secret } = req.body;
    const webhook = await webhookService.registerWebhook({
      userId: req.user.id,
      integrationId: integrationId || null,
      url,
      events,
      secret
    });
    res.status(201).json({ success: true, data: webhook });
  } catch (err) {
    next(err);
  }
}

async function listWebhooks(req, res, next) {
  try {
    const webhooks = await webhookService.listWebhooks(req.user.id);
    res.json({ success: true, data: webhooks });
  } catch (err) {
    next(err);
  }
}

async function deleteWebhook(req, res, next) {
  try {
    const result = await webhookService.deleteWebhook(req.params.id, req.user.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function testWebhook(req, res, next) {
  try {
    const result = await webhookService.testWebhook(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function handleAccountingEvent(req, res, next) {
  try {
    const result = await webhookService.handleAccountingEvent(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerWebhook,
  listWebhooks,
  deleteWebhook,
  testWebhook,
  handleAccountingEvent
};
