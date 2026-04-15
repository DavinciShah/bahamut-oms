'use strict';

const integrationService = require('../services/integrationService');

async function listIntegrations(req, res, next) {
  try {
    const integrations = await integrationService.listIntegrations(req.user.id);
    res.json({ success: true, data: integrations });
  } catch (err) {
    next(err);
  }
}

async function connectIntegration(req, res, next) {
  try {
    const { type, config } = req.body;
    if (!type || !config) {
      return res.status(400).json({ success: false, message: 'type and config are required' });
    }
    const integration = await integrationService.connectIntegration(req.user.id, type, config);
    res.status(201).json({ success: true, data: integration });
  } catch (err) {
    next(err);
  }
}

async function getIntegration(req, res, next) {
  try {
    const integration = await integrationService.getIntegration(req.params.id, req.user.id);
    res.json({ success: true, data: integration });
  } catch (err) {
    next(err);
  }
}

async function updateIntegration(req, res, next) {
  try {
    const integration = await integrationService.updateIntegration(req.params.id, req.user.id, req.body);
    if (!integration) return res.status(404).json({ success: false, message: 'Integration not found' });
    res.json({ success: true, data: integration });
  } catch (err) {
    next(err);
  }
}

async function deleteIntegration(req, res, next) {
  try {
    const result = await integrationService.deleteIntegration(req.params.id, req.user.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function getIntegrationStatus(req, res, next) {
  try {
    const status = await integrationService.getIntegrationStatus(req.params.id, req.user.id);
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}

async function testIntegration(req, res, next) {
  try {
    const result = await integrationService.testIntegration(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listIntegrations,
  connectIntegration,
  getIntegration,
  updateIntegration,
  deleteIntegration,
  getIntegrationStatus,
  testIntegration
};
