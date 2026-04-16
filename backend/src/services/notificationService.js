'use strict';

const Notification = require('../models/Notification');
const emailService = require('./emailService');

let _io = null;

const notificationService = {
  setIO(io) {
    _io = io;
  },

  async createNotification(userId, type, title, message, data = null) {
    const notification = await Notification.create({ userId, type, title, message, data });

    if (_io) {
      _io.to(`user:${userId}`).emit('notification', notification);
    }

    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString:
          process.env.DATABASE_URL ||
          `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
      });
      const { rows } = await pool.query(
        'SELECT email FROM users WHERE id = $1',
        [userId]
      );
      if (rows[0] && rows[0].email && process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true') {
        await emailService.sendNotification(rows[0].email, notification);
      }
    } catch (err) {
      console.error('[notificationService] Failed to send email notification:', err.message);
    }

    return notification;
  },

  async getNotifications(userId, options = {}) {
    const { limit = 50, offset = 0, unreadOnly = false } = options;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.findAll(userId, { limit, offset, unreadOnly }),
      Notification.countAll(userId),
      Notification.countUnread(userId),
    ]);
    return { notifications, total, unreadCount };
  },

  async markRead(notificationId, userId) {
    const notification = await Notification.markRead(notificationId, userId);
    if (!notification) {
      throw Object.assign(new Error('Notification not found'), { status: 404 });
    }
    if (_io) {
      _io.to(`user:${userId}`).emit('notification-read', { id: notificationId });
    }
    return notification;
  },

  async markAllRead(userId) {
    const count = await Notification.markAllRead(userId);
    if (_io) {
      _io.to(`user:${userId}`).emit('notifications-all-read');
    }
    return count;
  },

  async deleteNotification(notificationId, userId) {
    const deleted = await Notification.deleteById(notificationId, userId);
    if (!deleted) {
      throw Object.assign(new Error('Notification not found'), { status: 404 });
    }
    return deleted;
  },

  async getUnreadCount(userId) {
    return Notification.countUnread(userId);
  },
};

module.exports = notificationService;
