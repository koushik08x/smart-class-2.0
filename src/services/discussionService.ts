import { realtimeBus } from '../lib/supabase';
import { dbStore } from './mockDatabase';
import { Discussion, DiscussionReply, UserRole } from '../types';

export const discussionService = {
  // Fetch discussions with like status and sorting
  async getDiscussions(userId?: string, sortBy: 'latest' | 'popular' = 'latest'): Promise<Discussion[]> {
    const activeUserId = userId || localStorage.getItem('sc2_active_user_id') || '00000000-0000-0000-0000-000000000010';

    const list = dbStore.discussions.map((d) => {
      const likes = dbStore.discussionLikes.filter((l) => l.discussion_id === d.id);
      const replies = dbStore.discussionReplies.filter((r) => r.discussion_id === d.id);
      const hasLiked = dbStore.discussionLikes.some((l) => l.discussion_id === d.id && l.user_id === activeUserId);

      return {
        ...d,
        likes_count: likes.length,
        replies_count: replies.length,
        has_liked: hasLiked,
      };
    });

    return list.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      if (sortBy === 'popular') {
        return b.likes_count - a.likes_count;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  },

  // Get replies for a discussion
  async getReplies(discussionId: string): Promise<DiscussionReply[]> {
    return dbStore.discussionReplies
      .filter((r) => r.discussion_id === discussionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  // Create post
  async createDiscussion(data: {
    authorId: string;
    authorName: string;
    authorRole: UserRole;
    authorAvatar?: string;
    subjectId?: string;
    title: string;
    content: string;
    isPinned?: boolean;
  }): Promise<Discussion> {
    const subject = data.subjectId ? dbStore.subjects.find((s) => s.id === data.subjectId) : undefined;
    const newPost: Discussion = {
      id: `disc-${Date.now()}`,
      author_id: data.authorId,
      author_name: data.authorName,
      author_role: data.authorRole,
      author_avatar: data.authorAvatar,
      subject_id: data.subjectId,
      subject_name: subject?.subject_name,
      title: data.title,
      content: data.content,
      is_pinned: Boolean(data.isPinned),
      likes_count: 0,
      replies_count: 0,
      has_liked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.discussions.unshift(newPost);
    dbStore.persist();

    realtimeBus.emit('discussion_created', newPost);
    return newPost;
  },

  // Post reply
  async postReply(data: {
    discussionId: string;
    authorId: string;
    authorName: string;
    authorRole: UserRole;
    authorAvatar?: string;
    content: string;
  }): Promise<DiscussionReply> {
    const newReply: DiscussionReply = {
      id: `rep-${Date.now()}`,
      discussion_id: data.discussionId,
      author_id: data.authorId,
      author_name: data.authorName,
      author_role: data.authorRole,
      author_avatar: data.authorAvatar,
      content: data.content,
      created_at: new Date().toISOString(),
    };

    dbStore.discussionReplies.push(newReply);
    dbStore.persist();

    const parentDiscussion = dbStore.discussions.find((d) => d.id === data.discussionId);
    if (parentDiscussion && parentDiscussion.author_id !== data.authorId) {
      dbStore.notifications.push({
        id: `notif-${Date.now()}`,
        user_id: parentDiscussion.author_id,
        title: 'New Discussion Reply',
        message: `${data.authorName} commented on your thread "${parentDiscussion.title}".`,
        notification_type: 'reply',
        related_id: parentDiscussion.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
      dbStore.persist();
    }

    realtimeBus.emit('reply_posted', { discussionId: data.discussionId, reply: newReply });
    return newReply;
  },

  // Toggle like with duplicate prevention
  async toggleLike(discussionId: string, userId: string): Promise<{ liked: boolean; newCount: number }> {
    const existingIndex = dbStore.discussionLikes.findIndex(
      (l) => l.discussion_id === discussionId && l.user_id === userId
    );

    let liked = false;
    if (existingIndex >= 0) {
      dbStore.discussionLikes.splice(existingIndex, 1);
      liked = false;
    } else {
      dbStore.discussionLikes.push({ discussion_id: discussionId, user_id: userId });
      liked = true;
    }

    dbStore.persist();
    const count = dbStore.discussionLikes.filter((l) => l.discussion_id === discussionId).length;
    realtimeBus.emit('like_toggled', { discussionId, count });
    return { liked, newCount: count };
  },

  // Report discussion
  async reportDiscussion(discussionId: string, reportedBy: string, reason: string): Promise<boolean> {
    // Add notification to admin
    dbStore.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: '00000000-0000-0000-0000-000000000001', // Admin
      title: 'Flagged Content Report',
      message: `Thread reported for reason: "${reason}". Review in Moderation.`,
      notification_type: 'announcement',
      related_id: discussionId,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    dbStore.persist();
    return true;
  }
};
