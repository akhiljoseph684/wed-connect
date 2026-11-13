import { Notification } from '../models/index.js';

export const getUserNotifications = async (userId, { page = 1, limit = 30 }) => {
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipientId: userId })
      .populate('senderId', 'firstName lastName avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ recipientId: userId }),
    Notification.countDocuments({ recipientId: userId, isRead: false }),
  ]);

  return { notifications, total, unreadCount };
};

export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ recipientId: userId, isRead: false });
};

export const markNotificationAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, recipientId: userId },
    { isRead: true },
    { new: true }
  );
};

export const markAllNotificationsRead = async (userId) => {
  await Notification.updateMany({ recipientId: userId, isRead: false }, { isRead: true });
  return true;
};
