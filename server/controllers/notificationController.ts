import { Response } from 'express';
import { NotificationModel } from '../models/Notification.ts';
import { AuthRequest } from '../middleware/authMiddleware.ts';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user!._id;
    const notifications = await NotificationModel.find({ recipient: currentUserId });
    const unreadCount = await NotificationModel.countDocuments({ recipient: currentUserId, read: false });

    return res.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching notifications' });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await NotificationModel.findByIdAndUpdate(id, { read: true });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Error marking notification read' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user!._id;
    await NotificationModel.updateMany({ recipient: currentUserId, read: false }, { read: true });
    return res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Error marking all notifications read' });
  }
};
