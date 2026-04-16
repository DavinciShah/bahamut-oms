'use strict';

const express    = require('express');
const router     = express.Router();
const authCtrl   = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');
const rateLimit  = require('../middleware/rateLimitMiddleware');

// Strict rate limit for auth endpoints (20 requests per 15 min per IP)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/register', authLimiter, authCtrl.register);
router.post('/login',    authLimiter, authCtrl.login);
router.post('/logout',   authLimiter, authenticateJWT, authCtrl.logout);
router.get( '/profile',  authLimiter, authenticateJWT, authCtrl.profile);
router.post('/refresh',  authLimiter, authenticateJWT, authCtrl.refresh);

module.exports = router;