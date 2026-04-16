'use strict';

const Tenant = require('../models/Tenant');
const { extractTenantFromRequest } = require('../utils/tenantUtils');

/**
 * Resolve and attach req.tenant from X-Tenant-ID header or subdomain.
 * If no tenant hint is present, passes through (req.tenant = null).
 */
async function tenantMiddleware(req, res, next) {
  try {
    const hint = extractTenantFromRequest(req);
    if (!hint) {
      req.tenant = null;
      return next();
    }

    let tenant;
    if (hint.type === 'id') {
      tenant = await Tenant.findById(hint.value);
    } else {
      tenant = await Tenant.findBySlug(hint.value);
    }

    if (tenant && !tenant.active) {
      return res.status(403).json({ error: 'Tenant is inactive' });
    }

    req.tenant = tenant || null;
    next();
  } catch (err) {
    console.error('[tenantMiddleware]', err);
    next(err);
  }
}

/**
 * Require that req.tenant is set (use after tenantMiddleware).
 */
function requireTenant(req, res, next) {
  if (!req.tenant) {
    return res.status(400).json({ error: 'Tenant context is required' });
  }
  next();
}

module.exports = { tenantMiddleware, requireTenant };
