const express = require('express');
const router = express.Router();
const applicationController = require('../modules/application/application.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/postings/:id/applicants', requireAuth, requireRole('IndustryPartner'), applicationController.getPartnerApplicants);
router.patch('/applications/:id', requireAuth, requireRole('IndustryPartner'), applicationController.decidePartnerApplication);

module.exports = router;
