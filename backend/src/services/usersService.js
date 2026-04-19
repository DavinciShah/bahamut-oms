const User = require('../models/User');
const { createError } = require('../utils/errorHandler');

const getAllUsers = async (page = 1, limit = 10) => {
  return await User.findAll({ page: parseInt(page), limit: parseInt(limit) });
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw createError('User not found', 404);
  const { password: _, refresh_token: __, ...safeUser } = user;
  return safeUser;
};

const updateUser = async (id, data) => {
  const user = await User.findById(id);
  if (!user) throw createError('User not found', 404);

  if (data.email && data.email !== user.email) {
    const existing = await User.findByEmail(data.email);
    if (existing) throw createError('Email already in use', 409);
  }

  const updated = await User.update(id, { name: data.name, email: data.email });
  const { password: _, refresh_token: __, ...safeUser } = updated;
  return safeUser;
};

const deleteUser = async (id) => {
  const user = await User.delete(id);
  if (!user) throw createError('User not found', 404);
  return { message: 'User deleted successfully' };
};

const searchUsers = async (searchQuery) => {
  return await User.search(searchQuery);
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, searchUsers };
