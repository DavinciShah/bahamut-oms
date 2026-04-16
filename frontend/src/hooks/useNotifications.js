import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import socketService from '../services/socketService';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      const data = res.data || [];
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
      socketService.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }
    return () => {
      socketService.off('notification');
    };
  }, [fetchNotifications]);

  const markRead = useCallback(async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      await notificationService.delete(id);
      const notif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notif && !notif.read) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [notifications]);

  return { notifications, unreadCount, loading, markRead, markAllRead, deleteNotification, refresh: fetchNotifications };
}
