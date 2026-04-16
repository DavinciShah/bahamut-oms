'use strict';

const express     = require('express');
const router      = express.Router();
const userCtrl    = require('../controllers/userController');
const { authenticateJWT, adminOnly } = require('../middleware/auth');
const rateLimit   = require('../middleware/rateLimitMiddleware');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

router.use(authenticateJWT);
router.use(limiter);

router.get('/',       adminOnly, userCtrl.getAll);
// Users may view their own profile; admins may view any profile.
router.get('/:id', (req, res, next) => {
  if (req.user.role !== 'admin' && String(req.user.id) !== String(req.params.id)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
}, userCtrl.getById);
router.put('/:id',    adminOnly, userCtrl.update);
router.delete('/:id', adminOnly, userCtrl.remove);

module.exports = router;