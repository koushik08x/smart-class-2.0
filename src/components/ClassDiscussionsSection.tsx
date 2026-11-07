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
      // Update active discussion if open
      if (activeDiscussion) {
        const found = data.find((d) => d.id === activeDiscussion.id);
        if (found) setActiveDiscussion(found);
      }
    });
  };

  useEffect(() => {
    loadDiscussions();
  }, [user?.id, sortBy]);

  const handleOpenDiscussion = (d: Discussion) => {
    setActiveDiscussion(d);
    discussionService.getReplies(d.id).then(setReplies);
  };

  const handleToggleLike = async (e: React.MouseEvent, d: Discussion) => {
    e.stopPropagation();
    if (!user) return;
    await discussionService.toggleLike(d.id, user.id);
    loadDiscussions();
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeDiscussion || !user) return;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#8B5CF6] uppercase">SYNAPSE NETWORK</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
            <span className="text-xs text-slate-400">Class 1CSE22 Forum</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            Academic Discourse & Laboratory Discussions
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Control */}
          <div className="flex items-center p-1 rounded-full glass-panel border border-white/10 text-xs">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1 rounded-full transition-all ${
                sortBy === 'latest' ? 'bg-[#8B5CF6] text-white font-medium shadow-md' : 'text-slate-400'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1 rounded-full transition-all ${
                sortBy === 'popular' ? 'bg-[#06B6D4] text-black font-semibold shadow-md' : 'text-slate-400'
              }`}
            >
              Popular
            </button>
          </div>

          <button
            onClick={() => setShowNewPostModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Thread</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Discussion List Column */}
        <div className={`${activeDiscussion ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-3xl glass-card bg-white/[0.02]" />
              ))}
            </div>
          ) : discussions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-card">
              <MessagesSquare className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">No discussion threads started yet.</p>
            </div>
          ) : (
            discussions.map((d) => {
              const isSelected = activeDiscussion?.id === d.id;

              return (
                <div
                  key={d.id}
                  onClick={() => handleOpenDiscussion(d)}
                  className={`p-5 rounded-3xl glass-card cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    isSelected
                      ? 'border-t-[#06B6D4] ring-1 ring-[#06B6D4]/50 shadow-[0_0_30px_rgba(6,182,212,0.15)] bg-white/[0.05]'
                      : 'hover:border-white/20'
                  }`}
                >
                  {d.is_pinned && (
                    <div className="absolute top-0 right-0 px-3 py-0.5 rounded-bl-xl bg-[#8B5CF6]/30 text-[9px] font-mono text-[#d0bcff] flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5" />
                      <span>PINNED</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={d.author_name} role={d.author_role} size="sm" />
                      <div>
                        <span className="text-xs font-semibold text-white">{d.author_name}</span>
                        <span className="text-[10px] font-mono text-slate-400 ml-1.5 capitalize">
                          ({d.author_role.replace('_', ' ')})
                        </span>
                      </div>
                    </div>

                    {d.subject_name && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-[#38BDF8] border border-[#06B6D4]/30">
                        {d.subject_name.slice(0, 16)}...
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5 leading-snug">{d.title}</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">{d.content}</p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      {/* Like button */}
                      <button
                        onClick={(e) => handleToggleLike(e, d)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                          d.has_liked
                            ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                            : 'hover:text-rose-400 hover:bg-white/5'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${d.has_liked ? 'fill-current' : ''}`} />
                        <span className="font-mono text-xs tabular-nums">{d.likes_count}</span>
                      </button>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="font-mono">{d.replies_count} replies</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportingDiscussionId(d.id);
                        }}
                        className="p-1 hover:text-rose-400 text-slate-500 transition-colors"
                        title="Report Thread"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Thread & Replies Column */}
        {activeDiscussion && (
          <div className="lg:col-span-6 p-6 rounded-3xl glass-card space-y-4 flex flex-col justify-between max-h-[700px] animate-in fade-in">
            <div className="overflow-y-auto pr-1 space-y-4 flex-1">
              <div className="flex items-start justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <UserAvatar name={activeDiscussion.author_name} role={activeDiscussion.author_role} size="md" />
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{activeDiscussion.author_name}</h4>
                    <span className="text-[10px] font-mono text-[#06B6D4] capitalize">
                      {activeDiscussion.author_role.replace('_', ' ')} &bull; Section {user?.section}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDiscussion(null)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-2">{activeDiscussion.title}</h3>
                <p className="text-xs text-slate-200 leading-relaxed bg-black/30 p-4 rounded-2xl border border-white/5 whitespace-pre-line">
                  {activeDiscussion.content}
                </p>
              </div>

              {/* Replies Feed */}
              <div className="space-y-3 pt-2">
                <h5 className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Thread Responses ({replies.length})
                </h5>

                {replies.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No replies yet. Be the first to chime in.</p>
                ) : (
                  replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#acedff]">{rep.author_name}</span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {new Date(rep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{rep.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Compose Reply Form */}
            <form onSubmit={handleSendReply} className="pt-3 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a technical response or observation..."
                className="flex-1 px-4 py-2.5 rounded-2xl glass-input text-white text-xs"
              />
              <button
                type="submit"
                disabled={isSendingReply}
                className="p-2.5 rounded-2xl btn-spatial-primary text-white shadow-md disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-modal p-6 border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowNewPostModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <MessagesSquare className="w-5 h-5 text-[#8B5CF6]" />
              <h3 className="text-lg font-bold text-white">Start New Class Discussion</h3>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Thread Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Profiling Cache Miss Rates in Matrix Multiplication"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Subject Association</label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl glass-input bg-[#0B0F1F] text-white text-xs"
                >
                  <option value="">General Engineering Discussion</option>
                  {dbStore.subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Content / Question</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Elaborate your inquiry, hypothesis, code findings or architectural question..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl glass-input text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 rounded-full btn-spatial-secondary text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg"
                >
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingDiscussionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl glass-modal p-6 border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setReportingDiscussionId(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Flag className="w-5 h-5 text-rose-400" />
              <h3 className="text-lg font-bold text-white">Report Content to Admin</h3>
            </div>

            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Reason for Flagging</label>
                <textarea
                  rows={3}
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl glass-input text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingDiscussionId(null)}
                  className="px-4 py-2 rounded-full btn-spatial-secondary text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white shadow-lg"
                >
                  Submit Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
