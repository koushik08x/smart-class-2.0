import { supabase, isSupabaseConfigured, realtimeBus } from '../lib/supabase';
import { dbStore } from './mockDatabase';
import { NotificationItem, NotificationType } from '../types';

export interface AcademicNotificationEvent {
  title: string;
  message: string;
  notificationType: NotificationType;
  relatedId?: string;
  targetSection?: string;
  targetStudentId?: string;
}

export const notificationService = {
  // Fetch permanent notifications for a student
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (data && !error) {
          // Sync any missing remote notifications into dbStore for offline caching
          for (const item of data) {
            const exists = dbStore.notifications.some((n) => n.id === item.id);
            if (!exists) {
              dbStore.notifications.push(item as NotificationItem);
            }
          }
          dbStore.persist();
          return data as NotificationItem[];
        }
      } catch (err) {
        console.warn('Supabase notifications fetch error, using local store:', err);
      }
    }

    return dbStore.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Central Academic Notification Engine:
  // Dispatches targeted alerts to relevant students based on class and section, with deduplication
  async dispatchAcademicNotification(event: AcademicNotificationEvent): Promise<NotificationItem[]> {
    const targetSection = event.targetSection || '1CSE22';

    // Identify target student recipients
    let recipients: string[] = [];
    if (event.targetStudentId) {
      recipients = [event.targetStudentId];
    } else {
      recipients = dbStore.profiles
        .filter((p) => p.role === 'student' && p.section === targetSection && p.approval_status === 'approved')
        .map((p) => p.id);
    }

    if (recipients.length === 0) {
      return [];
    }

    const createdNotifications: NotificationItem[] = [];
    const nowIso = new Date().toISOString();

    for (const studentId of recipients) {
      // Deduplication check: Prevent duplicate notifications for the same event & target
      const isDuplicate = dbStore.notifications.some((existing) => {
        if (existing.user_id !== studentId) return false;
        if (event.relatedId && existing.related_id === event.relatedId && existing.notification_type === event.notificationType) {
          return true;
        }
        // If no relatedId, check title within last 30 minutes
        if (!event.relatedId && existing.title === event.title) {
          const ageMinutes = (Date.now() - new Date(existing.created_at).getTime()) / (1000 * 60);
          return ageMinutes < 30;
        }
        return false;
      });

      if (isDuplicate) {
        continue;
      }

      const notifItem: NotificationItem = {
        id: `notif-${Date.now()}-${studentId.substring(0, 5)}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: studentId,
        title: event.title,
        message: event.message,
        notification_type: event.notificationType,
        related_id: event.relatedId,
        is_read: false,
        created_at: nowIso,
      };

      createdNotifications.push(notifItem);
      dbStore.notifications.unshift(notifItem);
    }

    dbStore.persist();

    // Persist permanently in Supabase if configured
    if (isSupabaseConfigured && createdNotifications.length > 0) {
      try {
        const payload = createdNotifications.map((n) => ({
          user_id: n.user_id,
          title: n.title,
          message: n.message,
          notification_type: n.notification_type,
          related_id: n.related_id,
          is_read: false,
        }));
        await supabase.from('notifications').insert(payload);
      } catch (err) {
        console.warn('Supabase notifications insert error:', err);
      }
    }

    // Broadcast realtime event
    realtimeBus.emit('notification_dispatched', {
      event,
      count: createdNotifications.length,
      recipients,
    });

    return createdNotifications;
  },

  // Mark single notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const item = dbStore.notifications.find((n) => n.id === notificationId);
    if (item) {
      item.is_read = true;
      dbStore.persist();
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
      } catch (err) {
        console.warn('Supabase mark notification read error:', err);
      }
    }

    realtimeBus.emit('notification_read', notificationId);
  },

  // Mark all notifications for user as read
  async markAllAsRead(userId: string): Promise<void> {
    dbStore.notifications.forEach((n) => {
      if (n.user_id === userId) n.is_read = true;
    });
    dbStore.persist();

    if (isSupabaseConfigured) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase mark all notifications read error:', err);
      }
    }

    realtimeBus.emit('all_notifications_read', userId);
  },

  // Realtime subscription helper
  subscribeToLiveNotifications(userId: string, onUpdate: () => void): () => void {
    const unsubLocal = realtimeBus.subscribe('notification_dispatched', (payload: any) => {
      if (payload?.recipients && payload.recipients.includes(userId)) {
        onUpdate();
      }
    });

    let supabaseChannel: any = null;
    if (isSupabaseConfigured) {
      try {
        supabaseChannel = supabase
          .channel(`user-notifications-${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`,
            },
            () => {
              onUpdate();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Supabase realtime channel subscription failed:', err);
      }
    }

    return () => {
      unsubLocal();
      if (supabaseChannel) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  },
};
