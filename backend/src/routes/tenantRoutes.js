'use strict';

const { Router } = require('express');
const router = Router();
const tenantController = require('../controllers/tenantController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/',                            tenantController.getAll);
router.post('/',                           tenantController.create);
router.get('/:id',                         tenantController.getById);
router.put('/:id',                         tenantController.update);
router.delete('/:id',                      tenantController.delete);
router.get('/:id/users',                   tenantController.getUsers);
router.post('/:id/users',                  tenantController.addUser);
router.delete('/:id/users/:userId',        tenantController.removeUser);

module.exports = router;
