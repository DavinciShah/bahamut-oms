'use strict';

const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

/**
 * Verify JWT from Authorization header and attach req.user.
 * Identical contract to authMiddleware.js but pulls config from config/auth.js.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    req.user = {
      id:    decoded.id || decoded.userId || decoded.sub,
      email: decoded.email,
      role:  decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Require one of the listed roles (must be used after authenticate).
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
