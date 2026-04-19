'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');

/**
 * Middleware: verify JWT from Authorization header and attach req.user.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
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
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Legacy alias
const authenticate = authenticateJWT;

/**
 * Alias for routes that use authenticateJWT naming convention.
 */
const authenticateJWT = authenticateToken;

/**
 * Middleware: allow only users with the 'admin' role (use after authenticateToken).
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

module.exports = {
  authenticateToken,
  authenticateJWT,
  adminOnly,
  // Backward-compatible aliases
  authMiddleware: authenticateJWT,
  adminMiddleware: adminOnly,
};
