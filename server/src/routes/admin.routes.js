const express = require('express');
const router = express.Router();
const adminController = require('../modules/admin/admin.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.use(requireAuth);
router.use(requireRole('SchoolAdministrator'));

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id', adminController.updateUser);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
