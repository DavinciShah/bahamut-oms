'use strict';

const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const User = require('../models/User');
const authService = require('./authService');
const googleOAuthConfigService = require('./googleOAuthConfigService');
const { jwtSecret, jwtExpiration } = require('../config/auth');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client();

async function verifyGoogleToken(token) {
  const audiences = await googleOAuthConfigService.getGoogleAudiences();
  if (audiences.length === 0) {
    const err = new Error('Google SSO is not configured on the server');
    err.status = 503;
    throw err;
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: audiences,
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (err) {
    const authErr = new Error(`Invalid Google token: ${err.message}`);
    authErr.status = 401;
    throw authErr;
  }
}

async function loginOrRegisterWithGoogle(token) {
  const payload = await verifyGoogleToken(token);

  const { email, name } = payload;

  if (!email) {
    const err = new Error('Google account does not have an email');
    err.status = 400;
    throw err;
  }

  let user = await User.findByEmail(email);

  if (!user) {
    // Auto-register with a random secret so DB non-null password constraint is satisfied.
    const displayName = name || email.split('@')[0];
    const randomPassword = crypto.randomUUID();
    const hashedPassword = await authService.hashPassword(randomPassword);
    user = await User.create({
      email,
      name: displayName,
      password: hashedPassword,
      role: 'user',
    });
  }

  // Create JWT token for OMS
  const safeUser = authService.sanitizeUser(user);
  const omsToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: jwtExpiration }
  );

  return { user: safeUser, token: omsToken };
}

module.exports = {
  verifyGoogleToken,
  loginOrRegisterWithGoogle,
};
