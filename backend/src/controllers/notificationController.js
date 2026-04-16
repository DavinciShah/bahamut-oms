'use strict';

const notificationService = require('../services/notificationService');

const notificationController = {
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
      const offset = parseInt(req.query.offset || '0', 10);
      const unreadOnly = req.query.unreadOnly === 'true';

      const result = await notificationService.getNotifications(userId, {
        limit,
        offset,
        unreadOnly,
      });

      res.json({
        success: true,
        data: result.notifications,
        total: result.total,
        unreadCount: result.unreadCount,
        limit,
        offset,
      });
    } catch (err) {
      console.error('[notificationController.getNotifications]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async markRead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const notification = await notificationService.markRead(id, userId);
      res.json({ success: true, data: notification });
    } catch (err) {
      console.error('[notificationController.markRead]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async markAllRead(req, res) {
    try {
      const userId = req.user.id;
      const count = await notificationService.markAllRead(userId);
      res.json({ success: true, updated: count });
    } catch (err) {
      console.error('[notificationController.markAllRead]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await notificationService.deleteNotification(id, userId);
      res.json({ success: true, message: 'Notification deleted' });
    } catch (err) {
      console.error('[notificationController.deleteNotification]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },

  async deleteAll(req, res) {
    try {
      const userId = req.user.id;
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString:
          process.env.DATABASE_URL ||
          `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`,
      });
      const Notification = require('../models/Notification');
      const count = await Notification.deleteAll(userId);
      res.json({ success: true, deleted: count });
    } catch (err) {
      console.error('[notificationController.deleteAll]', err);
      res.status(err.status || 500).json({ success: false, error: err.message });
    }
  },
};

module.exports = notificationController;
