const express = require('express');
const router = express.Router();
const applicationController = require('../modules/application/application.controller');
const coordinatorController = require('../modules/coordinator/coordinator.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// All coordinator routes require authentication + OJTCoordinator role
router.use(requireAuth);
router.use(requireRole('OJTCoordinator'));

// Applications queue & review
router.get('/applications', applicationController.getCoordinatorQueue);
router.get('/applications/:id', applicationController.getCoordinatorDetail);
router.patch('/applications/:id', applicationController.reviewApplication);

// Company verification
router.get('/companies', coordinatorController.getCompanies);
router.patch('/companies/:id', coordinatorController.verifyCompany);

// Dashboard KPIs
router.get('/stats', coordinatorController.getDashboardKPIs);

module.exports = router;
