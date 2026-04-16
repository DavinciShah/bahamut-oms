'use strict';

const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { jwtSecret, jwtExpiration, bcryptSaltRounds } = require('../config/auth');
const { validateEmail, validatePassword } = require('../utils/validators');

/**
 * Hash a plain-text password.
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  return bcrypt.hash(password, bcryptSaltRounds);
}

/**
 * Compare a plain-text password against a hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a JWT for the given user.
 * @param {{ id: number, email: string, role: string }} user
 * @returns {string}
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: jwtExpiration }
  );
}

/**
 * Register a new user.
 * @param {{ email: string, username: string, password: string, role?: string }} data
 * @returns {Promise<{ user: Object, token: string }>}
 */
async function registerUser({ email, username, password, role }) {
  if (!email || !username || !password) {
    const err = new Error('Email, username and password are required');
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
  const user   = await User.create({ email, username, password: hashed, role });
  const token  = signToken(user);

  return { user, token };
}

/**
 * Authenticate an existing user.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ user: Object, token: string }>}
 */
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

  const match = await comparePasswords(password, user.password);
  if (!match) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const { password: _pw, ...safeUser } = user;
  const token = signToken(safeUser);

  return { user: safeUser, token };
}

module.exports = {
  registerUser,
  loginUser,
  hashPassword,
  comparePasswords,
};
