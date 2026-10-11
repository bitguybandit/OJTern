const { Notification, User } = require('../../models');
const { sendNotificationEmail } = require('../../utils/mailer');

/**
 * Creates an in-app notification and dispatches an email notification.
 * Guaranteed: in-app notification is created first, email failure does not throw.
 */
const notifyUser = async ({ userId, message, type = 'info', relatedApplicationId = null, emailSubject = null }) => {
  try {
    // 1. Create in-app notification record
    const notification = await Notification.create({
      UserID: userId,
      Message: message,
      Type: type,
      DateSent: new Date(),
      IsRead: false,
      RelatedApplicationID: relatedApplicationId
    });

    // 2. Dispatch email (async, non-blocking failure)
    try {
      const user = await User.findByPk(userId);
      if (user && user.Email) {
        const subject = emailSubject || `OJTerm Notification: ${type.toUpperCase()}`;
        await sendNotificationEmail({
          to: user.Email,
          subject,
          text: message,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
            <h2 style="color: #4f46e5;">OJTerm Platform Notification</h2>
            <p style="font-size: 16px;">${message}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">This is an automated notification from the OJTerm OJT Matching System.</p>
          </div>`
        });
      }
    } catch (emailErr) {
      console.warn('Email dispatch failed, but notification created in DB:', emailErr.message);
    }

    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    throw err;
  }
};

const getUserNotifications = async (userId) => {
  return await Notification.findAll({
    where: { UserID: userId },
    order: [['DateSent', 'DESC']],
    limit: 50
  });
};

const markNotificationRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    where: {
      NotificationID: notificationId,
      UserID: userId
    }
  });

  if (!notification) {
    return null;
  }

  notification.IsRead = true;
  await notification.save();
  return notification;
};

const getUnreadCount = async (userId) => {
  return await Notification.count({
    where: {
      UserID: userId,
      IsRead: false
    }
  });
};

module.exports = {
  notifyUser,
  getUserNotifications,
  markNotificationRead,
  getUnreadCount
};
