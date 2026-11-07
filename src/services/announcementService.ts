import { supabase, isSupabaseConfigured, realtimeBus } from '../lib/supabase';
import { dbStore } from './mockDatabase';
import { Announcement, AnnouncementPriority, UserRole } from '../types';

export const announcementService = {
  // Fetch announcements (pinned first, then date descending)
  async getAnnouncements(section: string = '1CSE22'): Promise<Announcement[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*, profiles!author_id(full_name, role)')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        if (data && !error) {
          return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            author_id: item.author_id,
            author_name: item.profiles?.full_name,
            author_role: item.profiles?.role,
            priority: item.priority,
            is_pinned: item.is_pinned,
            target_section: item.target_section,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase announcements query fallback to local:', err);
      }
    }

    return [...dbStore.announcements].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  },

  // Create new announcement
  async createAnnouncement(data: {
    title: string;
    description: string;
    authorId: string;
    authorName: string;
    authorRole: UserRole;
    priority: AnnouncementPriority;
    isPinned: boolean;
    targetSection?: string;
  }): Promise<Announcement> {
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: data.title,
      description: data.description,
      author_id: data.authorId,
      author_name: data.authorName,
      author_role: data.authorRole,
      priority: data.priority,
      is_pinned: data.isPinned,
      target_section: data.targetSection || '1CSE22',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('announcements').insert([
          {
            title: data.title,
            description: data.description,
            author_id: data.authorId,
            priority: data.priority,
            is_pinned: data.isPinned,
            target_section: data.targetSection || '1CSE22',
          },
        ]);
      } catch (err) {
        console.warn('Supabase announcement insert error:', err);
      }
    }

    dbStore.announcements.unshift(newAnnouncement);
    dbStore.persist();

    // Broadcast realtime event
    realtimeBus.emit('announcement_created', newAnnouncement);

    // Create notifications for all students
    for (const student of dbStore.profiles.filter((p) => p.role === 'student')) {
      dbStore.notifications.push({
        id: `notif-${Date.now()}-${student.id.substring(0, 5)}`,
        user_id: student.id,
        title: `Notice: ${data.title}`,
        message: data.description.substring(0, 100) + '...',
        notification_type: 'announcement',
        related_id: newAnnouncement.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }
    dbStore.persist();

    return newAnnouncement;
  },

  // Delete announcement
  async deleteAnnouncement(announcementId: string): Promise<boolean> {
    dbStore.announcements = dbStore.announcements.filter((a) => a.id !== announcementId);
    dbStore.persist();
    realtimeBus.emit('announcement_deleted', announcementId);
    return true;
  }
};
