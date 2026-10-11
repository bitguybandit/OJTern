const express = require('express');
const router = express.Router();
const notificationController = require('../modules/notification/notification.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.get('/unread-count', notificationController.getUnreadCount);

module.exports = router;
