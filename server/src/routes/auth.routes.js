const express = require('express');
const router = express.Router();
const authController = require('../modules/auth/auth.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
