'use strict';

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

/**
 * Middleware: verify JWT from Authorization header and attach req.user.
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
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
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Middleware: allow only users with the 'admin' role (use after authenticateJWT).
 */
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
}

// Export authenticateJWT as default (for routes using `auth` directly)
// and also expose named exports for destructured imports.
module.exports = authenticateJWT;
module.exports.authenticateJWT = authenticateJWT;
module.exports.adminOnly = adminOnly;

