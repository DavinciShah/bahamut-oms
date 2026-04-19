'use strict';

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

/**
 * Middleware: verify JWT from Authorization header and attach req.user.
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = {
      id:    decoded.id    || decoded.userId || decoded.sub,
      email: decoded.email,
      role:  decoded.role,
    };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware: allow only users with the 'admin' role (use after authenticateJWT).
 */
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
}

module.exports = {
  authenticateJWT,
  adminOnly,
  // Backward-compatible aliases used by existing route files
  authMiddleware: authenticateJWT,
  adminMiddleware: adminOnly,
};
