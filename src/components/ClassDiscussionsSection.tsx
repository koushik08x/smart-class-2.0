import React, { useEffect, useState } from 'react';
import { Discussion, DiscussionReply } from '../types';
import { discussionService } from '../services/discussionService';
import { useAuth } from '../context/AuthContext';
import { dbStore } from '../services/mockDatabase';
import {
  MessagesSquare,
  Heart,
  MessageCircle,
  Plus,
  Send,
  Flag,
  Pin,
  Clock,
  Sparkles,
  X,
  ShieldCheck,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export const ClassDiscussionsSection: React.FC = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [activeDiscussion, setActiveDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [loading, setLoading] = useState(true);

  // Compose Reply state
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // New Post Modal
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubjectId, setNewSubjectId] = useState<string>('');

  // Report Modal
  const [reportingDiscussionId, setReportingDiscussionId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Inappropriate language or academic misconduct');

  const loadDiscussions = () => {
    setLoading(true);
    discussionService.getDiscussions(user?.id, sortBy).then((data) => {
      setDiscussions(data);
      setLoading(false);
      if (activeDiscussion) {
        const found = data.find((d) => d.id === activeDiscussion.id);
        if (found) setActiveDiscussion(found);
      }
    });
  };

  useEffect(() => {
    loadDiscussions();
  }, [sortBy, user?.id]);

  const handleOpenDiscussion = (d: Discussion) => {
    setActiveDiscussion(d);
    discussionService.getReplies(d.id).then(setReplies);
  };

  const handleToggleLike = async (e: React.MouseEvent, discussionId: string) => {
    e.stopPropagation();
    if (!user) return;
    await discussionService.toggleLike(discussionId, user.id);
    loadDiscussions();
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user || !activeDiscussion) return;

    setIsSendingReply(true);
    await discussionService.postReply({
      discussionId: activeDiscussion.id,
      authorId: user.id,
      authorName: user.full_name,
      authorRole: user.role,
      authorAvatar: user.avatar_url,
      content: replyText,
    });

    setReplyText('');
    setIsSendingReply(false);
    discussionService.getReplies(activeDiscussion.id).then(setReplies);
    loadDiscussions();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !user) return;

    await discussionService.createDiscussion({
      authorId: user.id,
      authorName: user.full_name,
      authorRole: user.role,
      authorAvatar: user.avatar_url,
      subjectId: newSubjectId || undefined,
      title: newTitle,
      content: newContent,
    });

    setShowNewPostModal(false);
    setNewTitle('');
    setNewContent('');
    loadDiscussions();
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingDiscussionId || !user) return;

    await discussionService.reportDiscussion(reportingDiscussionId, user.id, reportReason);
    setReportingDiscussionId(null);
    alert('Report submitted to Class Administration for compliance review.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DCCB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#C65D32] uppercase font-bold">SYNAPSE NETWORK</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C65D32]" />
            <span className="text-xs text-[#5C554B]">Section 1CSE22 Forum</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight mt-0.5">
            Academic Discourse & Peer Q&A
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Control */}
          <div className="flex items-center p-1 rounded-full bg-[#171717] border border-[#2B2B2B] text-xs">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                sortBy === 'latest' ? 'bg-[#C65D32] text-[#F5F0E6] shadow-sm' : 'text-[#B3ADA3] hover:text-[#F5F0E6]'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                sortBy === 'popular' ? 'bg-[#C65D32] text-[#F5F0E6] shadow-sm' : 'text-[#B3ADA3] hover:text-[#F5F0E6]'
              }`}
            >
              Popular
            </button>
          </div>

          <button
            onClick={() => setShowNewPostModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl btn-burnt-orange text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Thread</span>
          </button>
        </div>
      </div>

      {/* 30% INK-BLACK LARGE FEATURE PANEL: Community Spotlight & Forum Rules */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-[#F5F0E6] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C65D32]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#C65D32]/20 text-[#C65D32] border border-[#C65D32]/40 font-bold">
                COLLABORATIVE DIALOGUE
              </span>
              <span className="text-xs font-mono text-[#B3ADA3]">Section 1CSE22</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#F5F0E6] tracking-tight">
              Classroom Forum & Code Discussions
            </h3>
            <p className="text-xs text-[#B3ADA3] max-w-xl leading-relaxed">
              Post questions on assignments, clarify lab algorithms, and review exam concepts with peers and faculty advisors. Keep all discussions compliant with institutional academic integrity policies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E] text-center min-w-[120px]">
              <span className="text-2xl sm:text-3xl font-black text-[#C65D32] tabular-nums">{discussions.length}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E978C] mt-0.5">Active Threads</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 60% Cream Discussions List + Thread Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Threads Feed */}
        <div className={`${activeDiscussion ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-3xl bg-white border border-[#E5DCCB]" />
              ))}
            </div>
          ) : discussions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#E5DCCB]">
              <MessagesSquare className="w-10 h-10 text-[#7A7265] mx-auto mb-3" />
              <p className="text-[#171717] font-bold">No discussion threads started yet.</p>
              <p className="text-xs text-[#7A7265] mt-1">Start the first academic conversation!</p>
            </div>
          ) : (
            discussions.map((d) => {
              const isSelected = activeDiscussion?.id === d.id;

              return (
                <div
                  key={d.id}
                  onClick={() => handleOpenDiscussion(d)}
                  className={`p-6 rounded-3xl bg-white border transition-all cursor-pointer relative overflow-hidden space-y-3 ${
                    isSelected
                      ? 'border-2 border-[#C65D32] shadow-md ring-2 ring-[#C65D32]/10'
                      : 'border-[#E5DCCB] shadow-sm hover:border-[#C65D32]'
                  }`}
                >
                  {d.is_pinned && (
                    <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-[#171717] text-[#F5F0E6] text-[9px] font-mono font-bold flex items-center gap-1">
                      <Pin className="w-3 h-3 text-[#C65D32]" />
                      <span>PINNED</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={d.author_name} role={d.author_role} size="sm" />
                      <div>
                        <span className="text-xs font-bold text-[#171717]">{d.author_name}</span>
                        <span className="text-[10px] font-mono text-[#7A7265] ml-1.5 capitalize font-semibold">
                          ({d.author_role.replace('_', ' ')})
                        </span>
                      </div>
                    </div>

                    {d.subject_name && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#C65D32] border border-[#E5DCCB] font-bold">
                        {d.subject_name.slice(0, 18)}...
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-[#171717] leading-snug">{d.title}</h3>
                  <p className="text-xs text-[#5C554B] line-clamp-2 leading-relaxed">{d.content}</p>

                  <div className="pt-3 border-t border-[#E5DCCB] flex items-center justify-between text-xs text-[#5C554B]">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => handleToggleLike(e, d.id)}
                        className={`flex items-center gap-1.5 font-mono text-xs font-bold transition-colors ${
                          d.has_liked ? 'text-[#C65D32]' : 'text-[#7A7265] hover:text-[#C65D32]'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${d.has_liked ? 'fill-current' : ''}`} />
                        <span>{d.likes_count}</span>
                      </button>

                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#7A7265]">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{d.replies_count} replies</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-[#7A7265]">
                      {new Date(d.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Active Thread & Reply Stream */}
        {activeDiscussion && (
          <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-white border border-[#E5DCCB] shadow-lg space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DCCB]">
              <div className="flex items-center gap-2.5">
                <UserAvatar name={activeDiscussion.author_name} role={activeDiscussion.author_role} size="sm" />
                <div>
                  <h4 className="text-sm font-black text-[#171717]">{activeDiscussion.author_name}</h4>
                  <p className="text-[10px] text-[#7A7265] font-mono capitalize">
                    {activeDiscussion.author_role.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReportingDiscussionId(activeDiscussion.id)}
                  className="p-1.5 rounded-xl hover:bg-[#FAF7F2] text-[#7A7265] hover:text-[#C65D32]"
                  title="Report discussion"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveDiscussion(null)}
                  className="p-1.5 rounded-xl hover:bg-[#FAF7F2] text-[#7A7265] hover:text-[#171717]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-[#171717] leading-snug">{activeDiscussion.title}</h3>
              <p className="text-xs text-[#5C554B] leading-relaxed whitespace-pre-line">{activeDiscussion.content}</p>
            </div>

            {/* Replies Stream */}
            <div className="pt-4 border-t border-[#E5DCCB] space-y-3">
              <h5 className="text-xs font-mono uppercase text-[#7A7265] font-bold">
                Discussion Stream ({replies.length} Responses)
              </h5>

              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                {replies.length === 0 ? (
                  <p className="text-xs text-[#7A7265] py-4 text-center">No replies yet. Be the first to comment!</p>
                ) : (
                  replies.map((rep) => (
                    <div key={rep.id} className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserAvatar name={rep.author_name} role={rep.author_role} size="xs" />
                          <span className="font-bold text-[#171717]">{rep.author_name}</span>
                          <span className="text-[10px] text-[#7A7265] font-mono capitalize">
                            ({rep.author_role.replace('_', ' ')})
                          </span>
                        </div>
                        <span className="text-[10px] text-[#7A7265] font-mono">
                          {new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-[#5C554B] leading-relaxed pl-6">{rep.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reply Composer */}
            <form onSubmit={handleSendReply} className="pt-3 border-t border-[#E5DCCB] flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="Type your response to this thread..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl input-cream text-xs placeholder:text-stone-400"
              />
              <button
                type="submit"
                disabled={isSendingReply}
                className="px-4 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#171717] text-[#F5F0E6] p-6 sm:p-8 border border-[#2E2E2E] shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowNewPostModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-[#9E978C] hover:text-[#F5F0E6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-[#C65D32]/20 text-[#C65D32]">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F5F0E6]">Start Discussion Thread</h3>
                <p className="text-xs text-[#9E978C]">Section 1CSE22 Peer Forum</p>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Subject (Optional)</label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs font-mono"
                >
                  <option value="">General Academic Discourse</option>
                  {dbStore.subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Thread Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clarification on Laboratory Linked List Pointers"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Discussion Details & Context</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Elaborate on the question, error snippet, or concept..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2B2B]">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 rounded-xl btn-ink text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold"
                >
                  Post Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingDiscussionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#171717] text-[#F5F0E6] p-6 border border-[#2E2E2E] shadow-2xl relative animate-in fade-in zoom-in-95">
            <h3 className="text-base font-black text-[#F5F0E6] mb-3">Report Thread to Class Admin</h3>
            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-ink text-xs"
                >
                  <option value="Inappropriate language or academic misconduct">Inappropriate language</option>
                  <option value="Plagiarism or answer sharing">Plagiarism or test answer sharing</option>
                  <option value="Spam or off-topic advertising">Spam or off-topic</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#2B2B2B]">
                <button
                  type="button"
                  onClick={() => setReportingDiscussionId(null)}
                  className="px-3.5 py-2 rounded-xl btn-ink text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl btn-burnt-orange text-xs font-bold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
