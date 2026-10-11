const express = require('express');
const router = express.Router();
const profileController = require('../modules/profile/profile.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/profile', requireAuth, requireRole('IndustryPartner'), profileController.getCompanyProfile);
router.post('/profile', requireAuth, requireRole('IndustryPartner'), profileController.saveCompanyProfile);
router.put('/profile', requireAuth, requireRole('IndustryPartner'), profileController.saveCompanyProfile);

module.exports = router;
