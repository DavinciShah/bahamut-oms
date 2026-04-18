'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const rateLimit = require('../middleware/rateLimitMiddleware');

// Stricter rate limit for auth endpoints (20 req per 15 min per IP)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/register', authLimiter, authController.register.bind(authController));
router.post('/login', authLimiter, authController.login.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/refresh', authLimiter, authController.refreshToken.bind(authController));

module.exports = router;