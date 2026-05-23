'use strict';

const { Router } = require('express');
const router = Router();
const tenantController = require('../controllers/tenantController');
const { authenticate } = require('../middleware/authMiddleware');
const rateLimit = require('../middleware/rateLimitMiddleware');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

router.use(authenticate);
router.use(limiter);

router.get('/current',                      tenantController.getCurrent);
router.put('/current',                      tenantController.updateCurrent);
router.get('/team',                         tenantController.getTeam);
router.post('/team/invite',                 tenantController.inviteTeamMember);
router.put('/team/:memberId',               tenantController.updateTeamMember);
router.delete('/team/:memberId',            tenantController.removeTeamMember);
router.get('/settings',                     tenantController.getSettings);
router.put('/settings',                     tenantController.updateSettings);
router.get('/domains',                      tenantController.getDomains);
router.post('/domains',                     tenantController.addDomain);
router.get('/',                            tenantController.getAll);
router.post('/',                           tenantController.create);
router.get('/:id',                         tenantController.getById);
router.put('/:id',                         tenantController.update);
router.delete('/:id',                      tenantController.delete);
router.get('/:id/users',                   tenantController.getUsers);
router.post('/:id/users',                  tenantController.addUser);
router.delete('/:id/users/:userId',        tenantController.removeUser);

module.exports = router;
