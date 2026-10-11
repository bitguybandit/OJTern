const express = require('express');
const router = express.Router();
const matchingController = require('../modules/matching/matching.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/:profileId', requireAuth, requireRole('Student'), matchingController.getRecommendations);

module.exports = router;
