const express = require('express');
const router = express.Router();
const profileController = require('../modules/profile/profile.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/profile', requireAuth, requireRole('Student'), profileController.getStudentProfile);
router.post('/profile', requireAuth, requireRole('Student'), profileController.saveStudentProfile);
router.put('/profile', requireAuth, requireRole('Student'), profileController.saveStudentProfile);
router.get('/skills', requireAuth, profileController.getSkillsList);

module.exports = router;
