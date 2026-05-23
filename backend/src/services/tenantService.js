'use strict';

const Tenant = require('../models/Tenant');
const TenantUser = require('../models/TenantUser');
const User = require('../models/User');
const { generateTenantSlug } = require('../utils/tenantUtils');

const tenantService = {
  async getAll(options = {}) {
    return Tenant.findAll(options);
  },

  async getById(id) {
    const tenant = await Tenant.findById(id);
    if (!tenant) throw Object.assign(new Error('Tenant not found'), { status: 404 });
    return tenant;
  },

  async getBySlug(slug) {
    const tenant = await Tenant.findBySlug(slug);
    if (!tenant) throw Object.assign(new Error('Tenant not found'), { status: 404 });
    return tenant;
  },

  async getByDomain(domain) {
    const tenant = await Tenant.findByDomain(domain);
    if (!tenant) throw Object.assign(new Error('Tenant not found'), { status: 404 });
    return tenant;
  },

  async create(data) {
    const slug = data.slug || generateTenantSlug(data.name);

    const existing = await Tenant.findBySlug(slug);
    if (existing) {
      throw Object.assign(new Error(`Tenant slug '${slug}' already in use`), { status: 409 });
    }

    return Tenant.create({ ...data, slug });
  },

  async update(id, data) {
    await this.getById(id);
    const updated = await Tenant.update(id, data);
    if (!updated) throw Object.assign(new Error('Tenant not found'), { status: 404 });
    return updated;
  },

  async delete(id) {
    await this.getById(id);
    return Tenant.delete(id);
  },

  async addUser(tenantId, userId, role = 'member') {
    await this.getById(tenantId);
    return TenantUser.create({ tenantId, userId, role });
  },

  async removeUser(tenantId, userId) {
    await this.getById(tenantId);
    const result = await TenantUser.deactivate(tenantId, userId);
    if (!result) throw Object.assign(new Error('User not found in tenant'), { status: 404 });
    return result;
  },

  async getUserTenants(userId) {
    return TenantUser.findByUser(userId);
  },

  async getTenantUsers(tenantId) {
    return TenantUser.findByTenant(tenantId);
  },

  async resolveCurrentTenantId(user = {}) {
    if (user.tenant_id) return user.tenant_id;

    if (user.id) {
      const currentUser = await User.findById(user.id);
      if (currentUser?.tenant_id) return currentUser.tenant_id;

      const memberships = await TenantUser.findByUser(user.id);
      if (memberships.length) return memberships[0].tenant_id;
    }

    throw Object.assign(new Error('No active tenant found for user'), { status: 404 });
  },

  async getCurrentTenant(user) {
    const tenantId = await this.resolveCurrentTenantId(user);
    return this.getById(tenantId);
  },

  async updateCurrentTenant(user, data) {
    const tenantId = await this.resolveCurrentTenantId(user);
    return this.update(tenantId, data);
  },

  async getCurrentTeam(user) {
    const tenantId = await this.resolveCurrentTenantId(user);
    return this.getTenantUsers(tenantId);
  },

  async inviteTeamMember(user, { email, role = 'member' }) {
    const tenantId = await this.resolveCurrentTenantId(user);
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw Object.assign(new Error('email is required'), { status: 400 });
    }

    const validRoles = ['owner', 'admin', 'manager', 'member'];
    if (!validRoles.includes(role)) {
      throw Object.assign(new Error('Invalid role'), { status: 400 });
    }

    let invitee = await User.findByEmail(normalizedEmail);
    if (!invitee) {
      invitee = await User.create({
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        password: null,
        role: 'user',
      });
    }

    await TenantUser.create({ tenantId, userId: invitee.id, role });
    const memberships = await TenantUser.findByTenant(tenantId);
    return memberships.find((m) => m.user_id === invitee.id) || null;
  },

  async updateTeamMember(user, membershipId, role) {
    const tenantId = await this.resolveCurrentTenantId(user);
    const validRoles = ['admin', 'manager', 'member'];
    if (!validRoles.includes(role)) {
      throw Object.assign(new Error('Invalid role'), { status: 400 });
    }

    const existing = await TenantUser.findByMembershipId(tenantId, membershipId);
    if (!existing) throw Object.assign(new Error('Team member not found'), { status: 404 });
    if (existing.role === 'owner') {
      throw Object.assign(new Error('Owner role cannot be changed'), { status: 400 });
    }

    const updated = await TenantUser.updateRoleByMembershipId(tenantId, membershipId, role);
    return { ...existing, ...updated };
  },

  async removeTeamMember(user, membershipId) {
    const tenantId = await this.resolveCurrentTenantId(user);
    const existing = await TenantUser.findByMembershipId(tenantId, membershipId);
    if (!existing) throw Object.assign(new Error('Team member not found'), { status: 404 });
    if (existing.role === 'owner') {
      throw Object.assign(new Error('Owner cannot be removed'), { status: 400 });
    }
    return TenantUser.deactivateByMembershipId(tenantId, membershipId);
  },

  async getCurrentSettings(user) {
    const tenant = await this.getCurrentTenant(user);
    return tenant.settings || {};
  },

  async updateCurrentSettings(user, updates = {}) {
    const tenant = await this.getCurrentTenant(user);
    const mergedSettings = {
      ...(tenant.settings || {}),
      ...(updates || {}),
    };
    return this.update(tenant.id, { settings: mergedSettings });
  },

  async getCurrentDomains(user) {
    const tenant = await this.getCurrentTenant(user);
    return tenant.domain ? [tenant.domain] : [];
  },

  async addCurrentDomain(user, domain) {
    if (!domain || !String(domain).trim()) {
      throw Object.assign(new Error('domain is required'), { status: 400 });
    }
    const tenant = await this.updateCurrentTenant(user, { domain: String(domain).trim() });
    return tenant.domain ? [tenant.domain] : [];
  },
};

module.exports = tenantService;
