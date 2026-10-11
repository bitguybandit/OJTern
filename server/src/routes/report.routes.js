const express = require('express');
const router = express.Router();
const reportingController = require('../modules/reporting/reporting.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.use(requireAuth);
router.use(requireRole('OJTCoordinator', 'SchoolAdministrator'));

router.get('/placements', reportingController.getPlacementReport);
router.get('/history', reportingController.getReportHistory);

module.exports = router;
