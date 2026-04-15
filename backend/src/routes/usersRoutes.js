const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.get('/', authenticateToken, requireAdmin, usersController.getUsers);
router.get('/search', authenticateToken, requireAdmin, usersController.searchUsers);
router.get('/:id', authenticateToken, usersController.getUserById);
router.put('/:id', authenticateToken, usersController.updateUser);
router.delete('/:id', authenticateToken, requireAdmin, usersController.deleteUser);

module.exports = router;
