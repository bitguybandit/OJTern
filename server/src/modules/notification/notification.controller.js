const notificationService = require('./notification.service');
const { success, error } = require('../../utils/response');

const getMyNotifications = async (req, res, next) => {
  try {
    const list = await notificationService.getUserNotifications(req.user.UserID);
    return success(res, list);
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const updated = await notificationService.markNotificationRead(notificationId, req.user.UserID);
    if (!updated) {
      return error(res, {
        code: 'NOT_FOUND',
        message: 'Notification not found or access denied.'
      }, 404);
    }
    return success(res, updated);
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.UserID);
    return success(res, { unreadCount: count });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  getUnreadCount
};
