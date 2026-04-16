'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const authConfig = require('../config/auth');

const authService = {
  /**
   * Generate a signed access token for a user.
   */
  generateToken(payload) {
    return jwt.sign(payload, authConfig.jwtSecret, {
      expiresIn: authConfig.jwtExpiresIn,
    });
  },

  /**
   * Generate a signed refresh token.
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, authConfig.refreshTokenSecret, {
      expiresIn: authConfig.refreshTokenExpiresIn,
    });
  },

  /**
   * Verify an access token; throws on failure.
   */
  verifyToken(token) {
    return jwt.verify(token, authConfig.jwtSecret);
  },

  /**
   * Verify a refresh token; throws on failure.
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, authConfig.refreshTokenSecret);
  },

  /**
   * Hash a plaintext password with bcrypt.
   */
  async hashPassword(plaintext) {
    return bcrypt.hash(plaintext, authConfig.bcryptRounds);
  },

  /**
   * Compare a plaintext password against a stored hash.
   */
  async comparePassword(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
  },

  /**
   * Generate a cryptographically random token for password reset / email verification.
   */
  generateSecureToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  },

  /**
   * Return the expiry timestamp for a password reset token.
   */
  passwordResetExpiry() {
    return new Date(Date.now() + authConfig.passwordResetExpiry);
  },

  /**
   * Stub: Setup TOTP 2FA for a user.
   * Real integration is in otpService.js.
   */
  async setup2FA(userId) {
    const otpService = require('./otpService');
    return otpService.generateTOTPSecret(userId);
  },

  /**
   * Stub: Verify a TOTP code.
   */
  async verify2FA(secret, token) {
    const otpService = require('./otpService');
    return otpService.verifyTOTP(secret, token);
  },

  /**
   * Stub: Send a password reset email.
   * Actual email delivery is handled by emailService.js.
   */
  async sendPasswordResetEmail(user, resetToken) {
    const emailService = require('./emailService');
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    return emailService.sendEmail({
      to: user.email,
      subject: 'Reset your password',
      text: `Click the link to reset your password: ${resetUrl}`,
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. The link expires in 1 hour.</p>`,
    });
  },
};

module.exports = authService;
