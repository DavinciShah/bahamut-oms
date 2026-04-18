'use strict';

const express    = require('express');
const router     = express.Router();
const authCtrl   = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');
const rateLimit  = require('express-rate-limit');

// Strict rate limit for auth endpoints (20 requests per 15 min per IP)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.use(authLimiter);

router.post('/register', authCtrl.register);
router.post('/login',    authCtrl.login);
router.post('/logout',   authenticateJWT, authCtrl.logout);
router.get( '/profile',  authenticateJWT, authCtrl.profile);
router.post('/refresh',  authenticateJWT, authCtrl.refresh);

module.exports = router;
