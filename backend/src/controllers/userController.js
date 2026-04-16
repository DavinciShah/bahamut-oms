const bcrypt = require('bcrypt');
const User = require('../models/User');
const { bcryptRounds } = require('../config/auth');
const { validateEmail } = require('../utils/validators');

const getAll = async (req, res, next) => {
  try {
    const users = await User.findAll(req.app.locals.db);
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.app.locals.db, req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const pool = req.app.locals.db;
    const existing = await User.findByEmail(pool, email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, bcryptRounds);
    const user = await User.create(pool, { name, email, password: hashedPassword, role });
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await User.update(req.app.locals.db, req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const deleted = await User.delete(req.app.locals.db, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, delete: deleteUser };
