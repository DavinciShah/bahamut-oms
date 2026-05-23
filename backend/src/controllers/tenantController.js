'use strict';

const tenantService = require('../services/tenantService');

const tenantController = {
  async getCurrent(req, res) {
    try {
      const tenant = await tenantService.getCurrentTenant(req.user);
      res.json({ success: true, data: tenant });
    } catch (err) {
      console.error('[tenantController.getCurrent]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async updateCurrent(req, res) {
    try {
      const tenant = await tenantService.updateCurrentTenant(req.user, req.body || {});
      res.json({ success: true, data: tenant });
    } catch (err) {
      console.error('[tenantController.updateCurrent]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

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

  async getTeam(req, res) {
    try {
      const users = await tenantService.getCurrentTeam(req.user);
      res.json({ success: true, data: users });
    } catch (err) {
      console.error('[tenantController.getTeam]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async inviteTeamMember(req, res) {
    try {
      const member = await tenantService.inviteTeamMember(req.user, req.body || {});
      res.status(201).json({ success: true, data: member });
    } catch (err) {
      console.error('[tenantController.inviteTeamMember]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async updateTeamMember(req, res) {
    try {
      const { role } = req.body || {};
      const member = await tenantService.updateTeamMember(req.user, req.params.memberId, role);
      res.json({ success: true, data: member });
    } catch (err) {
      console.error('[tenantController.updateTeamMember]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async removeTeamMember(req, res) {
    try {
      await tenantService.removeTeamMember(req.user, req.params.memberId);
      res.json({ success: true, message: 'Team member removed' });
    } catch (err) {
      console.error('[tenantController.removeTeamMember]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getSettings(req, res) {
    try {
      const settings = await tenantService.getCurrentSettings(req.user);
      res.json({ success: true, data: settings });
    } catch (err) {
      console.error('[tenantController.getSettings]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async updateSettings(req, res) {
    try {
      const tenant = await tenantService.updateCurrentSettings(req.user, req.body || {});
      res.json({ success: true, data: tenant.settings || {} });
    } catch (err) {
      console.error('[tenantController.updateSettings]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async getDomains(req, res) {
    try {
      const domains = await tenantService.getCurrentDomains(req.user);
      res.json({ success: true, data: domains });
    } catch (err) {
      console.error('[tenantController.getDomains]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async addDomain(req, res) {
    try {
      const domains = await tenantService.addCurrentDomain(req.user, req.body?.domain);
      res.status(201).json({ success: true, data: domains });
    } catch (err) {
      console.error('[tenantController.addDomain]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },
};

module.exports = tenantController;
