'use strict';

const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const authService = require('../services/authService');
const googleOAuthConfigService = require('../services/googleOAuthConfigService');
const { jwtSecret, jwtExpiration } = require('../config/auth');

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, username, name, password, role } = req.body;
    const { user, token } = await authService.registerUser({ email, username, name, password, role });
    return res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });
    return res.status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  // Stateless JWT: instruct client to discard the token.
  return res.status(200).json({ message: 'Logged out successfully' });
}

/**
 * GET /api/auth/profile
 */
async function profile(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user: authService.sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/refresh
 */
async function refresh(req, res, next) {
  try {
    // req.user is already verified by authenticateJWT middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const token   = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpiration }
    );
    return res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/google
 */
async function googleAuth(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }
    const googleAuthService = require('../services/googleAuthService');
    const { user, token } = await googleAuthService.loginOrRegisterWithGoogle(credential);
    return res.status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/google-config
 */
async function getGoogleConfig(req, res, next) {
  try {
    const config = await googleOAuthConfigService.getPublicGoogleConfig();
    return res.status(200).json(config);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/google-settings
 */
async function getGoogleSettings(req, res, next) {
  try {
    const config = await googleOAuthConfigService.getAdminGoogleConfig();
    return res.status(200).json(config);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/auth/google-settings
 */
async function updateGoogleSettings(req, res, next) {
  try {
    const { clientId, clientSecret, status } = req.body;
    await googleOAuthConfigService.upsertGoogleConfig(req.user.id, { clientId, clientSecret, status });
    const config = await googleOAuthConfigService.getAdminGoogleConfig();
    return res.status(200).json(config);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, profile, refresh, googleAuth, getGoogleConfig, getGoogleSettings, updateGoogleSettings };
