'use strict';

const Tenant = require('../models/Tenant');
const TenantUser = require('../models/TenantUser');

/**
 * Extract tenant identifier from request.
 * Priority: X-Tenant-ID header > subdomain
 */
function extractTenantFromRequest(req) {
  // Explicit header takes priority
  const headerId = req.headers['x-tenant-id'];
  if (headerId) return { type: 'id', value: headerId };

  // Subdomain extraction: tenant.example.com
  const host = req.hostname || req.headers.host || '';
  const parts = host.split('.');
  if (parts.length >= 3) {
    return { type: 'slug', value: parts[0] };
  }

  return null;
}

/**
 * Convert a display name into a URL-safe slug.
 */
function generateTenantSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const VALID_PLANS = ['free', 'starter', 'pro', 'enterprise'];

/**
 * Validate that a plan name is known.
 */
function validateTenantPlan(plan) {
  if (!VALID_PLANS.includes(plan)) {
    throw Object.assign(
      new Error(`Invalid plan '${plan}'. Valid plans: ${VALID_PLANS.join(', ')}`),
      { status: 400 }
    );
  }
  return true;
}

module.exports = { extractTenantFromRequest, generateTenantSlug, validateTenantPlan };
