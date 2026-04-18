'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authConfig = require('../config/auth');

const authService = {
  async getUserByEmail(email) {
    return User.findByEmail(email);
  },

  async getUserById(id) {
    return User.findById(id);
  },

  async hashPassword(password) {
    return bcrypt.hash(password, authConfig.BCRYPT_ROUNDS);
  },

  async comparePassword(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
  },

  generateToken(payload) {
    return jwt.sign(payload, authConfig.JWT_SECRET, { expiresIn: authConfig.JWT_EXPIRY });
  },

  verifyToken(token) {
    return jwt.verify(token, authConfig.JWT_SECRET);
  },

  async registerUser({ email, username, password, role }) {
    const exists = await User.emailExists(email);
    if (exists) {
      const err = new Error('Email already in use');
      err.status = 409;
      throw err;
    }
    const hashed = await this.hashPassword(password);
    return User.create({ email, username, password: hashed, role });
  },
};

module.exports = authService;
