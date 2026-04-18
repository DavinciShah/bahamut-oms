'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const authConfig = require('../config/auth');

const authService = {
  async getUserByEmail(email) {
    return User.findByEmail(email);
  },

  async getUserById(id) {
    return User.findById(id);
  },

  async hashPassword(plaintext) {
    return bcrypt.hash(plaintext, authConfig.BCRYPT_ROUNDS);
  },

  async comparePassword(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
  },

  generateToken(payload) {
    return jwt.sign(payload, authConfig.JWT_SECRET, { expiresIn: authConfig.JWT_EXPIRY });
  },

  generateRefreshToken(payload) {
    return jwt.sign(payload, authConfig.REFRESH_TOKEN_SECRET, { expiresIn: authConfig.REFRESH_TOKEN_EXPIRY });
  },

  verifyToken(token) {
    return jwt.verify(token, authConfig.JWT_SECRET);
  },

  verifyRefreshToken(token) {
    return jwt.verify(token, authConfig.REFRESH_TOKEN_SECRET);
  },

  generateSecureToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  },

  passwordResetExpiry() {
    return new Date(Date.now() + authConfig.passwordResetExpiry);
  },

  async registerUser({ email, username, name, password, role }) {
    const exists = await User.emailExists(email);
    if (exists) {
      const err = new Error('Email already in use');
      err.status = 409;
      throw err;
    }
    const hashed = await this.hashPassword(password);
    return User.create({ email, username, name, password: hashed, role });
  },

  async setup2FA(userId) {
    const otpService = require('./otpService');
    return otpService.generateTOTPSecret(userId);
  },

  async verify2FA(secret, token) {
    const otpService = require('./otpService');
    return otpService.verifyTOTP(secret, token);
  },

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
