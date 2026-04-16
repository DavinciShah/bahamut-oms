'use strict';

const Tenant = require('../models/Tenant');
const TenantUser = require('../models/TenantUser');
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
};

module.exports = tenantService;
