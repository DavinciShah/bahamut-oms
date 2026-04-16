'use strict';

const express    = require('express');
const router     = express.Router();
const authCtrl   = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

router.post('/register', authCtrl.register);
router.post('/login',    authCtrl.login);
router.post('/logout',   authenticateJWT, authCtrl.logout);
router.get( '/profile',  authenticateJWT, authCtrl.profile);
router.post('/refresh',  authenticateJWT, authCtrl.refresh);

module.exports = router;