'use strict';

const User = require('../models/User');

async function getAllUsers() {
  return User.findAll();
}

async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
}

async function updateUser(id, data) {
  const user = await User.update(id, data);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
}

async function deleteUser(id) {
  const deleted = await User.delete(id);
  if (!deleted) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
