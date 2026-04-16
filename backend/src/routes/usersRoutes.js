'use strict';

const express     = require('express');
const router      = express.Router();
const userCtrl    = require('../controllers/userController');
const { authenticateJWT, adminOnly } = require('../middleware/auth');

router.use(authenticateJWT);

router.get('/',     adminOnly, userCtrl.getAll);
router.get('/:id',             userCtrl.getById);
router.put('/:id',  adminOnly, userCtrl.update);
router.delete('/:id', adminOnly, userCtrl.remove);

module.exports = router;