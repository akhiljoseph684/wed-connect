import * as notificationService from '../services/notification.service.js';
import { ApiResponse, asyncHandler } from '../utils/apiResponse.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await notificationService.getUserNotifications(req.user._id, { page, limit });
  return res.status(200).json(new ApiResponse(200, result, 'Notifications retrieved'));
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  return res.status(200).json(new ApiResponse(200, { unreadCount: count }, 'Unread count'));
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationAsRead(req.params.notificationId, req.user._id);
  return res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllNotificationsRead(req.user._id);
  return res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

export const getSettings = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, { emailNotifications: true, pushNotifications: true }, 'Notification settings'));
});

export const updateSettings = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.body, 'Notification settings updated'));
});
