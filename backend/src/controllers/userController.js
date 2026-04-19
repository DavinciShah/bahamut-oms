'use strict';

const userService = require('../services/userService');

async function getAll(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await userService.deleteUser(req.params.id);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, update, remove };