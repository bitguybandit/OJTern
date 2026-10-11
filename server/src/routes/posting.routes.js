const express = require('express');
const router = express.Router();
const postingController = require('../modules/posting/posting.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/', requireAuth, postingController.getPostings);
router.post('/', requireAuth, requireRole('IndustryPartner'), postingController.createPosting);
router.get('/:id', requireAuth, postingController.getPostingDetail);
router.patch('/:id', requireAuth, requireRole('IndustryPartner'), postingController.updatePosting);

module.exports = router;
