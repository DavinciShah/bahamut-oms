'use strict';

const express    = require('express');
const router     = express.Router();
const authCtrl   = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

// Rate limiting for this router is applied upstream in app.js (Redis-backed authLimiter).
// Do NOT add a local express-rate-limit here — it would use in-memory storage and break
// multi-instance deployments.

router.post('/register', authCtrl.register);
router.post('/login',    authCtrl.login);
router.post('/google',   authCtrl.googleLogin);
router.post('/logout',   authenticateJWT, authCtrl.logout);
router.get( '/profile',  authenticateJWT, authCtrl.profile);
router.post('/refresh',  authenticateJWT, authCtrl.refresh);

module.exports = router;

