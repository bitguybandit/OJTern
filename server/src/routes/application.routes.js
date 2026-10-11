const express = require('express');
const router = express.Router();
const applicationController = require('../modules/application/application.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { uploadEndorsement } = require('../middleware/upload');

// Student submits application with endorsement document
router.post(
  '/',
  requireAuth,
  requireRole('Student'),
  uploadEndorsement.single('document'),
  applicationController.submitApplication
);

// Student views own applications
router.get('/', requireAuth, requireRole('Student'), applicationController.getMyApplications);
router.get('/my', requireAuth, requireRole('Student'), applicationController.getMyApplications);

// Secure document viewing
router.get('/:id/document', requireAuth, applicationController.viewDocument);

module.exports = router;
