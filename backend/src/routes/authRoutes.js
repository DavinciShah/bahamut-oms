'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));

module.exports = router;