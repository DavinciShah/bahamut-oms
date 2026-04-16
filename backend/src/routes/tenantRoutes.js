'use strict';

const { Router } = require('express');
const router = Router();
const tenantController = require('../controllers/tenantController');
const { authenticate } = require('../middleware/authMiddleware');
const rateLimit = require('../middleware/rateLimitMiddleware');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

router.use(authenticate);
router.use(limiter);

router.get('/',                            tenantController.getAll);
router.post('/',                           tenantController.create);
router.get('/:id',                         tenantController.getById);
router.put('/:id',                         tenantController.update);
router.delete('/:id',                      tenantController.delete);
router.get('/:id/users',                   tenantController.getUsers);
router.post('/:id/users',                  tenantController.addUser);
router.delete('/:id/users/:userId',        tenantController.removeUser);

module.exports = router;
