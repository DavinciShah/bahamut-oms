const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN, BCRYPT_SALT_ROUNDS } = require('../config/auth');
const { createError } = require('../utils/errorHandler');

const generateTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

const register = async (name, email, password) => {
  const existing = await User.findByEmail(email);
  if (existing) throw createError('Email already in use', 409);

  const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const user = await User.create({ name, email, password: hashed });
  const { password: _, refresh_token: __, ...safeUser } = user;
  return safeUser;
};

const login = async (email, password) => {
  const user = await User.findByEmail(email);
  if (!user) throw createError('Invalid email or password', 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createError('Invalid email or password', 401);

  const { accessToken, refreshToken } = generateTokens(user);
  await User.updateRefreshToken(user.id, refreshToken);

  const { password: _, refresh_token: __, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
};

const logout = async (userId) => {
  await User.updateRefreshToken(userId, null);
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw createError('User not found', 404);
  const { password: _, refresh_token: __, ...safeUser } = user;
  return safeUser;
};

const refreshToken = async (token) => {
  if (!token) throw createError('Refresh token required', 401);

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (err) {
    throw createError('Invalid or expired refresh token', 401);
  }

  const user = await User.findByRefreshToken(token);
  if (!user) throw createError('Invalid refresh token', 401);

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { accessToken };
};

module.exports = { register, login, logout, getProfile, refreshToken };
