'use strict';

const tenantService = require('../services/tenantService');

const tenantController = {
  async getAll(req, res) {
    try {
      const activeOnly = req.query.active === 'true';
      const tenants = await tenantService.getAll({ activeOnly });
      res.json({ success: true, data: tenants });
    } catch (err) {
      console.error('[tenantController.getAll]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const tenant = await tenantService.getById(req.params.id);
      res.json({ success: true, data: tenant });
    } catch (err) {
      console.error('[tenantController.getById]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { name, slug, domain, settings, plan } = req.body;
      if (!name) return res.status(400).json({ success: false, error: 'name is required' });
      const tenant = await tenantService.create({ name, slug, domain, settings, plan });
      res.status(201).json({ success: true, data: tenant });
    } catch (err) {
      console.error('[tenantController.create]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async update(req, res) {
    try {
      const tenant = await tenantService.update(req.params.id, req.body);
      res.json({ success: true, data: tenant });
    } catch (err) {
      console.error('[tenantController.update]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async delete(req, res) {
    try {
      await tenantService.delete(req.params.id);
      res.json({ success: true, message: 'Tenant deleted' });
    } catch (err) {
      console.error('[tenantController.delete]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async addUser(req, res) {
    try {
      const { userId, role } = req.body;
      if (!userId) return res.status(400).json({ success: false, error: 'userId is required' });
      const membership = await tenantService.addUser(req.params.id, userId, role);
      res.status(201).json({ success: true, data: membership });
    } catch (err) {
      console.error('[tenantController.addUser]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async removeUser(req, res) {
    try {
      await tenantService.removeUser(req.params.id, req.params.userId);
      res.json({ success: true, message: 'User removed from tenant' });
    } catch (err) {
      console.error('[tenantController.removeUser]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getUsers(req, res) {
    try {
      const users = await tenantService.getTenantUsers(req.params.id);
      res.json({ success: true, data: users });
    } catch (err) {
      console.error('[tenantController.getUsers]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },
};

module.exports = tenantController;
