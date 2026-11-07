import React, { useEffect, useState } from 'react';
import { Announcement, AnnouncementPriority } from '../types';
import { announcementService } from '../services/announcementService';
import { useAuth } from '../context/AuthContext';
import { Pin, AlertCircle, Megaphone, Plus, Clock, ShieldCheck, X } from 'lucide-react';

export const AnnouncementsSection: React.FC = () => {
  const { user, isAdmin, isFaculty } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    setLoading(true);
    announcementService.getAnnouncements(user?.section).then((data) => {
      setAnnouncements(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [user?.section]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !user) return;

    setSubmitting(true);
    try {
      await announcementService.createAnnouncement({
        title,
        description,
        authorId: user.id,
        authorName: user.full_name,
        authorRole: user.role,
        priority,
        isPinned,
        targetSection: user.section,
      });
      setTitle('');
      setDescription('');
      setPriority('normal');
      setIsPinned(false);
      setShowCreateModal(false);
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityStyle = (p: AnnouncementPriority) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'low':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'normal':
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#8B5CF6] uppercase">DISPATCH WIRE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
            <span className="text-xs text-slate-400">Official Notices</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            Department Broadcasts & Notices
          </h2>
        </div>

        {(isAdmin || isFaculty) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl glass-card bg-white/[0.02]" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card">
          <Megaphone className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No announcements published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-6 rounded-3xl glass-card transition-all relative overflow-hidden ${
                ann.is_pinned
                  ? 'border-t-[#8B5CF6]/70 shadow-[0_0_30px_rgba(139,92,246,0.15)] bg-white/[0.04]'
                  : 'hover:border-white/20'
              }`}
            >
              {ann.is_pinned && (
                <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-2xl bg-gradient-to-l from-[#8B5CF6]/40 to-transparent flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#d0bcff]">
                  <Pin className="w-3 h-3 text-[#d0bcff]" />
                  <span>PINNED NOTICE</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${getPriorityStyle(ann.priority)}`}>
                  {ann.priority} PRIORITY
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(ann.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 leading-tight">{ann.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{ann.description}</p>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>Issued by <strong className="text-slate-200">{ann.author_name}</strong> ({ann.author_role?.replace('_', ' ')})</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">Ref: #{ann.id.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-modal p-6 border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-5 h-5 text-[#8B5CF6]" />
              <h3 className="text-lg font-bold text-white">Create Department Announcement</h3>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Lab Exam Schedules"
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                    className="w-full px-3 py-2.5 rounded-2xl glass-input bg-[#0B0F1F] text-white text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="pinNotice"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-[#8B5CF6] accent-[#8B5CF6]"
                  />
                  <label htmlFor="pinNotice" className="text-xs text-slate-300 cursor-pointer flex items-center gap-1">
                    <Pin className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    Pin to Top
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Description / Content</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete details, instructions, syllabus pointers or room allocations..."
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full btn-spatial-secondary text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg"
                >
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
