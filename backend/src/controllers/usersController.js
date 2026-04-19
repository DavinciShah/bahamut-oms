const usersService = require('../services/usersService');

const getUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await usersService.getAllUsers(page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(parseInt(req.params.id));
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await usersService.updateUser(parseInt(req.params.id), req.body);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await usersService.deleteUser(parseInt(req.params.id));
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const users = await usersService.searchUsers(req.query.q || '');
    res.status(200).json({ success: true, data: { users } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUserById, updateUser, deleteUser, searchUsers };
