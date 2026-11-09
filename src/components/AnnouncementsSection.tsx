import React, { useEffect, useState } from 'react';
import { Announcement, AnnouncementPriority } from '../types';
import { announcementService } from '../services/announcementService';
import { useAuth } from '../context/AuthContext';
import { Pin, Megaphone, Plus, Clock, ShieldCheck, X, AlertTriangle } from 'lucide-react';

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
        return 'bg-rose-100 text-rose-800 border-rose-300 font-black';
      case 'high':
        return 'bg-[#C65D32]/15 text-[#C65D32] border-[#C65D32]/30 font-bold';
      case 'low':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'normal':
      default:
        return 'bg-[#EDE5D8] text-[#171717] border-[#D5C8B2] font-semibold';
    }
  };

  const pinnedAnnouncements = announcements.filter((a) => a.is_pinned);

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DCCB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#C65D32] uppercase font-bold">DISPATCH WIRE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C65D32]" />
            <span className="text-xs text-[#5C554B]">Official Department Bulletins</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight mt-0.5">
            Department Broadcasts & Circulars
          </h2>
        </div>

        {(isAdmin || isFaculty) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl btn-burnt-orange text-xs font-bold shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Announcement</span>
          </button>
        )}
      </div>

      {/* 30% INK-BLACK LARGE FEATURE PANEL: Broadcast Hub Spotlight */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-[#F5F0E6] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C65D32]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#C65D32]/20 text-[#C65D32] border border-[#C65D32]/40 font-bold">
                ACADEMIC CIRCULAR HUB
              </span>
              <span className="text-xs font-mono text-[#B3ADA3]">Section 1CSE22</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#F5F0E6] tracking-tight">
              Class Announcements & Alerts
            </h3>
            <p className="text-xs text-[#B3ADA3] max-w-xl leading-relaxed">
              Official circulars from Class Advisor Mr. Prathap M S, Department of Computer Science & Engineering, and university administrative offices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E] text-center min-w-[120px]">
              <span className="text-2xl sm:text-3xl font-black text-[#C65D32] tabular-nums">{announcements.length}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E978C] mt-0.5">Total Notices</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E] text-center min-w-[120px]">
              <span className="text-2xl sm:text-3xl font-black text-[#EDE5D8] tabular-nums">{pinnedAnnouncements.length}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E978C] mt-0.5">Pinned Circulars</p>
            </div>
          </div>
        </div>
      </div>

      {/* 60% CREAM WORKSPACE: Announcements Feed */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-white border border-[#E5DCCB]" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#E5DCCB]">
          <Megaphone className="w-10 h-10 text-[#7A7265] mx-auto mb-3" />
          <p className="text-[#171717] font-bold">No announcements published yet.</p>
          <p className="text-xs text-[#7A7265] mt-1">Official circulars will appear here as released.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`p-6 sm:p-7 rounded-3xl bg-white border transition-all relative overflow-hidden space-y-3 ${
                ann.is_pinned
                  ? 'border-2 border-[#C65D32] shadow-md ring-2 ring-[#C65D32]/10'
                  : 'border-[#E5DCCB] shadow-sm hover:border-[#C65D32]'
              }`}
            >
              {ann.is_pinned && (
                <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-[#C65D32] text-[#F5F0E6] flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold shadow-sm">
                  <Pin className="w-3 h-3" />
                  <span>PINNED NOTICE</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase border ${getPriorityStyle(ann.priority)}`}>
                  {ann.priority} PRIORITY
                </span>
                <span className="text-xs text-[#5C554B] font-mono font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#7A7265]" />
                  {new Date(ann.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <h3 className="text-lg font-black text-[#171717] leading-snug">{ann.title}</h3>
              <p className="text-xs text-[#5C554B] leading-relaxed whitespace-pre-line">{ann.description}</p>

              <div className="mt-4 pt-3.5 border-t border-[#E5DCCB] flex items-center justify-between text-xs text-[#5C554B]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#C65D32]" />
                  <span>Issued by <strong className="text-[#171717]">{ann.author_name}</strong> ({ann.author_role?.replace('_', ' ')})</span>
                </div>
                <span className="font-mono text-[10px] text-[#7A7265] font-semibold">Ref: #{ann.id.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal in 30% Ink Black */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#171717] text-[#F5F0E6] p-6 sm:p-8 border border-[#2E2E2E] shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-[#9E978C] hover:text-[#F5F0E6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-[#C65D32]/20 text-[#C65D32]">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F5F0E6]">Dispatch Announcement</h3>
                <p className="text-xs text-[#9E978C]">Broadcast to Section 1CSE22</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for Mid-Term Laboratory Assessment"
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                    className="w-full px-3 py-2.5 rounded-xl input-ink text-xs font-mono"
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
                    className="w-4 h-4 rounded text-[#C65D32] accent-[#C65D32]"
                  />
                  <label htmlFor="pinNotice" className="text-xs text-[#D6CFC4] cursor-pointer flex items-center gap-1 font-semibold">
                    <Pin className="w-3.5 h-3.5 text-[#C65D32]" />
                    Pin to Top
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Notice Description / Content</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter the full text of the circular, guidelines, and deadlines..."
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2B2B]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl btn-ink text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold"
                >
                  {submitting ? 'Broadcasting...' : 'Broadcast Circular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
