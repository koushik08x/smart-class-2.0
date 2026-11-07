import { realtimeBus } from '../lib/supabase';
import { dbStore } from './mockDatabase';
import { NotificationItem } from '../types';

export const notificationService = {
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    return dbStore.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async markAsRead(notificationId: string): Promise<void> {
    const item = dbStore.notifications.find((n) => n.id === notificationId);
    if (item) {
      item.is_read = true;
      dbStore.persist();
      realtimeBus.emit('notification_read', notificationId);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    dbStore.notifications.forEach((n) => {
      if (n.user_id === userId) n.is_read = true;
    });
    dbStore.persist();
    realtimeBus.emit('all_notifications_read', userId);
  }
};
