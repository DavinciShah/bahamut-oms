'use strict';

const jwt = require('jsonwebtoken');

/**
 * Verify JWT from Authorization header and attach req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = {
      id: decoded.id || decoded.userId || decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Require one of the listed roles (use after authenticate).
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
