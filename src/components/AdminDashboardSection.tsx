import React, { useEffect, useState } from 'react';
import { RegistrationRequest, TimetableSlot } from '../types';
import { profileService } from '../services/profileService';
import { timetableService } from '../services/timetableService';
import { announcementService } from '../services/announcementService';
import { useAuth } from '../context/AuthContext';
import { dbStore } from '../services/mockDatabase';
import { TIMETABLE_DAYS } from '../data/academicData';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  Megaphone,
  BookOpen,
  MapPin,
  Send,
  Building,
  Sparkles,
  ShieldAlert,
  Server,
  Terminal,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export const AdminDashboardSection: React.FC<{ onOpenBackendConsole?: () => void }> = ({
  onOpenBackendConsole,
}) => {
  const { user, isAdmin } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'timetable' | 'directory' | 'announcements' | 'academic'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Timetable & Classroom management state
  const [selectedDay, setSelectedDay] = useState<string>('Day 1');
  const [daySlots, setDaySlots] = useState<TimetableSlot[]>([]);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [newClassroom, setNewClassroom] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Exam announcement state
  const [examTitle, setExamTitle] = useState('');
  const [examMessage, setExamMessage] = useState('');
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);

  // Official announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annDesc, setAnnDesc] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'high' | 'urgent'>('high');
  const [annPinned, setAnnPinned] = useState(true);
  const [isSubmittingAnn, setIsSubmittingAnn] = useState(false);

  // Strict role defense
  if (user?.role !== 'class_admin') {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-rose-200 text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-[#171717]">403 - Forbidden: Class Admin Access Only</h3>
        <p className="text-xs text-[#5C554B] max-w-md mx-auto">
          Your current account role (<span className="text-[#C65D32] font-mono font-bold">{user?.role}</span>) is not authorized to access the Class Admin Portal.
        </p>
      </div>
    );
  }

  const loadData = () => {
    setLoading(true);
    Promise.all([
      profileService.getAdminStats(),
      profileService.getRegistrationRequests(),
    ]).then(([s, reqs]) => {
      setStats(s);
      setRequests(reqs);
      setLoading(false);
    });
  };

  const loadDaySlots = () => {
    timetableService.getTimetableByDay(selectedDay, '1CSE22', 1).then(setDaySlots);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadDaySlots();
  }, [selectedDay]);

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    if (!user) return;
    setActionInProgress(requestId);
    await profileService.reviewRegistration(requestId, action, user.id);
    setActionInProgress(null);
    loadData();
  };

  const handleUpdateClassroom = async (slotId: string) => {
    if (!newClassroom.trim()) return;
    setStatusMessage('Updating classroom allocation & notifying students...');
    await timetableService.updateClassroom(slotId, newClassroom, '1CSE22');
    setEditingSlotId(null);
    setNewClassroom('');
    loadDaySlots();
    setStatusMessage('Classroom updated successfully. All students in section 1CSE22 were notified!');
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const handlePublishExamAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examMessage.trim()) return;
    setIsSubmittingExam(true);
    try {
      await timetableService.publishExamScheduleChange({
        title: examTitle.trim(),
        message: examMessage.trim(),
        section: '1CSE22',
      });
      setExamTitle('');
      setExamMessage('');
      setStatusMessage('Examination schedule alert broadcasted to all section 1CSE22 students!');
      setTimeout(() => setStatusMessage(null), 4500);
    } finally {
      setIsSubmittingExam(false);
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annDesc.trim() || !user) return;
    setIsSubmittingAnn(true);
    try {
      await announcementService.createAnnouncement({
        title: annTitle.trim(),
        description: annDesc.trim(),
        authorId: user.id,
        authorName: user.full_name,
        authorRole: user.role,
        priority: annPriority,
        isPinned: annPinned,
        targetSection: '1CSE22',
      });
      setAnnTitle('');
      setAnnDesc('');
      setStatusMessage('Official announcement published! Automated alerts dispatched to all students.');
      setTimeout(() => setStatusMessage(null), 4500);
    } finally {
      setIsSubmittingAnn(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const studentsList = dbStore.profiles.filter((p) => p.role === 'student' && p.section === '1CSE22');
  const facultyList = dbStore.profiles.filter((p) => p.role === 'faculty');

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DCCB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#C65D32] uppercase font-bold">ADMIN PORTAL</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C65D32]" />
            <span className="text-xs text-[#5C554B]">Class Administrator Master Deck &bull; Section 1CSE22</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight mt-0.5">
            Academic Governance & Class Management
          </h2>
        </div>

        {onOpenBackendConsole && (
          <button
            onClick={onOpenBackendConsole}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl btn-ink text-xs font-bold shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Server className="w-4 h-4 text-[#C65D32]" />
            <span>Database & RLS Console</span>
          </button>
        )}
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 30% INK-BLACK MASTER STATS PANEL */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-[#F5F0E6] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C65D32]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#C65D32]/20 text-[#C65D32] border border-[#C65D32]/40 font-bold">
                SYSTEM HEALTH & ENROLLMENT METRICS
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#F5F0E6] tracking-tight mt-1.5">
                Section 1CSE22 Operational Center
              </h3>
            </div>
            <span className="text-xs font-mono text-[#D6CFC4] bg-[#242424] px-3 py-1.5 rounded-xl border border-[#333333] self-start lg:self-auto">
              Dept. of Computer Science & Engineering
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono uppercase text-[#9E978C]">Students</span>
                <GraduationCap className="w-4 h-4 text-[#C65D32]" />
              </div>
              <span className="text-3xl font-black text-[#F5F0E6] tabular-nums">{studentsList.length}</span>
              <p className="text-[10px] text-[#7A7265] mt-1 font-mono">Enrolled in 1CSE22</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono uppercase text-[#9E978C]">Pending</span>
                <Clock className="w-4 h-4 text-[#C65D32]" />
              </div>
              <span className="text-3xl font-black text-[#C65D32] tabular-nums">{pendingRequests.length}</span>
              <p className="text-[10px] text-[#7A7265] mt-1 font-mono">Approval queue</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono uppercase text-[#9E978C]">Faculty</span>
                <Users className="w-4 h-4 text-[#C65D32]" />
              </div>
              <span className="text-3xl font-black text-[#EDE5D8] tabular-nums">{facultyList.length}</span>
              <p className="text-[10px] text-[#7A7265] mt-1 font-mono">Instructors & TAs</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono uppercase text-[#9E978C]">Modules</span>
                <BookOpen className="w-4 h-4 text-[#C65D32]" />
              </div>
              <span className="text-3xl font-black text-[#EDE5D8] tabular-nums">{dbStore.subjects.length}</span>
              <p className="text-[10px] text-[#7A7265] mt-1 font-mono">Active courses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-[#171717] border border-[#2E2E2E]">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'overview'
              ? 'bg-[#C65D32] text-[#F5F0E6] shadow-sm'
              : 'text-[#B3ADA3] hover:text-[#F5F0E6] hover:bg-white/5'
          }`}
        >
          Registration Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('timetable')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'timetable'
              ? 'bg-[#C65D32] text-[#F5F0E6] shadow-sm'
              : 'text-[#B3ADA3] hover:text-[#F5F0E6] hover:bg-white/5'
          }`}
        >
          Timetable & Room Routing
        </button>
        <button
          onClick={() => setActiveAdminTab('announcements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'announcements'
              ? 'bg-[#C65D32] text-[#F5F0E6] shadow-sm'
              : 'text-[#B3ADA3] hover:text-[#F5F0E6] hover:bg-white/5'
          }`}
        >
          Broadcast Composer
        </button>
        <button
          onClick={() => setActiveAdminTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'directory'
              ? 'bg-[#C65D32] text-[#F5F0E6] shadow-sm'
              : 'text-[#B3ADA3] hover:text-[#F5F0E6] hover:bg-white/5'
          }`}
        >
          Section Roster ({studentsList.length})
        </button>
      </div>

      {/* 60% CREAM WORKSPACE: Tab Content */}
      {activeAdminTab === 'overview' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DCCB]">
            <div>
              <h3 className="text-base font-black text-[#171717]">Pending Student Registration Approvals</h3>
              <p className="text-xs text-[#5C554B]">Review new student requests before unlocking section 1CSE22 workspace.</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#C65D32] bg-[#FAF7F2] px-3 py-1 rounded-xl border border-[#E5DCCB]">
              {pendingRequests.length} Pending
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB]" />
              ))}
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB]">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-[#171717] font-bold text-sm">All registration requests processed!</p>
              <p className="text-xs text-[#5C554B] mt-1">There are no pending student applications in the queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB] hover:border-[#C65D32] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#171717] text-sm">{req.profile?.full_name || 'New Applicant'}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171717] text-[#F5F0E6] font-bold">
                        {req.profile?.student_id || req.requested_role}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C554B]">
                      {req.profile?.email} &bull; Section: <strong className="text-[#171717]">{req.profile?.section || '1CSE22'}</strong> &bull; Semester {req.profile?.semester || 1}
                    </p>
                    <p className="text-[10px] text-[#7A7265] font-mono">
                      Requested: {new Date(req.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={actionInProgress === req.id}
                      onClick={() => handleReview(req.id, 'reject')}
                      className="px-4 py-2 rounded-xl btn-ink text-xs font-bold"
                    >
                      Reject
                    </button>
                    <button
                      disabled={actionInProgress === req.id}
                      onClick={() => handleReview(req.id, 'approve')}
                      className="px-5 py-2 rounded-xl btn-burnt-orange text-xs font-bold shadow-sm"
                    >
                      Approve & Enroll
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeAdminTab === 'timetable' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DCCB]">
            <div>
              <h3 className="text-base font-black text-[#171717]">Classroom Routing & Period Management</h3>
              <p className="text-xs text-[#5C554B]">Update room assignments in real-time. Changes immediately notify enrolled students.</p>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAF7F2] border border-[#E5DCCB]">
              {TIMETABLE_DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedDay === day
                      ? 'bg-[#171717] text-[#F5F0E6]'
                      : 'text-[#5C554B] hover:text-[#171717]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {daySlots.map((slot) => {
              const isEditing = editingSlotId === slot.id;

              return (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#171717] text-[#F5F0E6]">
                        {slot.period_label || 'Period'}
                      </span>
                      <span className="font-bold text-sm text-[#171717]">{slot.subject_abbr} – {slot.subject_name}</span>
                      <span className="text-[10px] font-mono text-[#5C554B]">({slot.subject_code})</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#5C554B]">
                      <span>Faculty: <strong className="text-[#171717]">{slot.faculty_name}</strong></span>
                      <span className="font-mono">{slot.start_time} – {slot.end_time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. 402 or LAB-A"
                          value={newClassroom}
                          onChange={(e) => setNewClassroom(e.target.value)}
                          className="px-3 py-1.5 rounded-xl input-cream text-xs font-mono w-28 uppercase"
                        />
                        <button
                          onClick={() => handleUpdateClassroom(slot.id)}
                          className="px-3 py-1.5 rounded-xl btn-burnt-orange text-xs font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingSlotId(null)}
                          className="px-3 py-1.5 rounded-xl btn-cream-outline text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-xl bg-white border border-[#E5DCCB] text-xs font-mono font-bold text-[#171717]">
                          Room: {slot.classroom || 'Unassigned'}
                        </span>
                        <button
                          onClick={() => {
                            setEditingSlotId(slot.id);
                            setNewClassroom(slot.classroom || '');
                          }}
                          className="px-3.5 py-1.5 rounded-xl btn-ink text-xs font-bold"
                        >
                          Assign Room
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeAdminTab === 'announcements' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm space-y-6">
          <div className="pb-3 border-b border-[#E5DCCB]">
            <h3 className="text-base font-black text-[#171717]">Broadcast Official Circular or Exam Alert</h3>
            <p className="text-xs text-[#5C554B]">Announcements sent here trigger instant push notifications to all 1CSE22 student profiles.</p>
          </div>

          <form onSubmit={handlePublishAnnouncement} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1.5">Announcement Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Schedule Revision for Internal Assessment 02"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-cream text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1.5">Priority Level</label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl input-cream text-xs font-mono"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="adminPin"
                  checked={annPinned}
                  onChange={(e) => setAnnPinned(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#C65D32]"
                />
                <label htmlFor="adminPin" className="text-xs text-[#171717] font-bold cursor-pointer">
                  Pin to Top of Student Dashboard
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1.5">Circular Description</label>
              <textarea
                required
                rows={4}
                placeholder="Enter detailed notice, instructions, and room venues..."
                value={annDesc}
                onChange={(e) => setAnnDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-cream text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingAnn}
              className="px-6 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingAnn ? 'Dispatching...' : 'Dispatch Circular'}</span>
            </button>
          </form>
        </div>
      )}

      {activeAdminTab === 'directory' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DCCB]">
            <div>
              <h3 className="text-base font-black text-[#171717]">Section 1CSE22 Enrolled Roster</h3>
              <p className="text-xs text-[#5C554B]">Verified student identities and account credentials.</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#171717]">{studentsList.length} Students</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentsList.map((st) => (
              <div key={st.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB] flex items-center gap-3">
                <UserAvatar name={st.full_name} role={st.role} size="md" />
                <div className="truncate">
                  <p className="font-bold text-xs text-[#171717] truncate">{st.full_name}</p>
                  <p className="text-[10px] font-mono text-[#5C554B]">{st.student_id}</p>
                  <p className="text-[10px] text-[#7A7265] truncate">{st.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
