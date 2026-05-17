'use strict';

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const User   = require('../models/User');
const { jwtSecret, jwtExpiration, bcryptSaltRounds } = require('../config/auth');
const { validateEmail, validatePassword } = require('../utils/validators');

async function hashPassword(password) {
  return bcrypt.hash(password, bcryptSaltRounds);
}

async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}

// Legacy alias used by older code
const comparePassword = comparePasswords;

function sanitizeUser(user) {
  if (!user) {
    return user;
  }

  const { password: _pw, password_hash: _ph, ...safeUser } = user;
  return safeUser;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: jwtExpiration }
  );
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

// Legacy aliases
const generateToken = signToken;

async function getUserByEmail(email) {
  return User.findByEmail(email);
}

async function getUserById(id) {
  return User.findById(id);
}

async function registerUser({ email, username, name, password, role }) {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }

  const displayName = (name || username || '').trim();
  if (!displayName) {
    const err = new Error('Name is required');
    err.status = 400;
    throw err;
  }

  if (!validateEmail(email)) {
    const err = new Error('Invalid email format');
    err.status = 400;
    throw err;
  }

  if (!validatePassword(password)) {
    const err = new Error(
      'Password must be at least 8 characters and contain at least one letter and one digit'
    );
    err.status = 400;
    throw err;
  }

  const existing = await User.findByEmail(email);
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }

  const hashed = await hashPassword(password);
  const user   = await User.create({ email, name: displayName, password: hashed, role });
  const safeUser = sanitizeUser(user);
  const token  = signToken(safeUser);

  return { user: safeUser, token };
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }

  const user = await User.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const pwField = user.password || user.password_hash;
  const match = await comparePasswords(password, pwField);
  if (!match) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const safeUser = sanitizeUser(user);
  const token = signToken(safeUser);

  return { user: safeUser, token };
}

module.exports = {
  registerUser,
  loginUser,
  getUserByEmail,
  getUserById,
  hashPassword,
  comparePasswords,
  comparePassword,
  signToken,
  generateToken,
  verifyToken,
  generateSecureToken,
  sanitizeUser,
};
