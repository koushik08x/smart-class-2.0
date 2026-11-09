import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbStore } from '../services/mockDatabase';
import { attendanceService } from '../services/attendanceService';
import { assignmentService } from '../services/assignmentService';
import { notesService } from '../services/notesService';
import { announcementService } from '../services/announcementService';
import { AttendanceStatus, Assignment, StudyNote } from '../types';
import {
  Activity,
  FileCheck2,
  BookOpen,
  Megaphone,
  CheckCircle,
  Clock,
  Plus,
  Send,
  Upload,
  ShieldCheck,
  ShieldAlert,
  Edit3,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export const FacultyDashboardSection: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'attendance' | 'assignments' | 'notes' | 'announcements'>('attendance');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Strict role gatekeeper
  if (user?.role !== 'faculty') {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-rose-200 text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-[#171717]">403 - Forbidden: Faculty Desk Only</h3>
        <p className="text-xs text-[#5C554B] max-w-md mx-auto">
          Your current account role (<span className="text-[#C65D32] font-mono font-bold">{user?.role}</span>) cannot access the Faculty Desk.
        </p>
      </div>
    );
  }

  // 1. Attendance state
  const students = dbStore.profiles.filter((p) => p.role === 'student' && p.section === '1CSE22');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(dbStore.subjects[0]?.id || '');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [topicCovered, setTopicCovered] = useState<string>('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      initial[s.id] = 'present';
    });
    return initial;
  });
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  // 2. Assignment creation state
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgSubjectId, setAsgSubjectId] = useState(dbStore.subjects[0]?.id || '');
  const [asgDeadline, setAsgDeadline] = useState('');
  const [asgMaxMarks, setAsgMaxMarks] = useState(25);
  const [asgFile, setAsgFile] = useState<File | null>(null);
  const [isSubmittingAsg, setIsSubmittingAsg] = useState(false);

  // Assignment deadline update state
  const [editingAsgId, setEditingAsgId] = useState<string | null>(null);
  const [newDeadlineVal, setNewDeadlineVal] = useState<string>('');

  // 3. Notes upload state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDesc, setNoteDesc] = useState('');
  const [noteSubjectId, setNoteSubjectId] = useState(dbStore.subjects[0]?.id || '');
  const [noteFile, setNoteFile] = useState<File | null>(null);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // 4. Faculty announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annDesc, setAnnDesc] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [isSubmittingAnn, setIsSubmittingAnn] = useState(false);

  const showFeedback = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // Submit attendance session
  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !topicCovered.trim()) return;
    setIsSubmittingAttendance(true);
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        status: attendanceMap[s.id] || 'present',
      }));

      await attendanceService.markSessionAttendance({
        subjectId: selectedSubjectId,
        facultyId: user.id,
        date: sessionDate,
        topicCovered: topicCovered.trim(),
        records,
      });

      setTopicCovered('');
      showFeedback('Attendance session recorded! Automated notifications dispatched to all students in section 1CSE22.');
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  // Submit assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim() || !asgDeadline || !asgSubjectId) return;
    setIsSubmittingAsg(true);
    try {
      await assignmentService.createAssignment({
        title: asgTitle.trim(),
        description: asgDesc.trim(),
        subjectId: asgSubjectId,
        facultyId: user.id,
        facultyName: user.full_name,
        deadline: new Date(asgDeadline).toISOString(),
        maxMarks: asgMaxMarks,
        attachmentFile: asgFile || undefined,
      });

      setAsgTitle('');
      setAsgDesc('');
      setAsgDeadline('');
      setAsgFile(null);
      showFeedback('Assignment published! All students in section 1CSE22 have been automatically notified.');
    } finally {
      setIsSubmittingAsg(false);
    }
  };

  // Update assignment deadline
  const handleUpdateDeadline = async (asgId: string) => {
    if (!newDeadlineVal) return;
    await assignmentService.updateAssignmentDeadline(asgId, new Date(newDeadlineVal).toISOString());
    setEditingAsgId(null);
    setNewDeadlineVal('');
    showFeedback('Assignment deadline updated! Students have been alerted to the extension.');
  };

  // Upload study material
  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteSubjectId || !noteFile) return;
    setIsSubmittingNote(true);
    try {
      await notesService.uploadNote({
        title: noteTitle.trim(),
        description: noteDesc.trim(),
        subjectId: noteSubjectId,
        uploadedBy: user.id,
        authorName: user.full_name,
        file: noteFile,
      });

      setNoteTitle('');
      setNoteDesc('');
      setNoteFile(null);
      showFeedback('Study material uploaded! All students in section 1CSE22 have been alerted.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Publish faculty announcement
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annDesc.trim()) return;
    setIsSubmittingAnn(true);
    try {
      await announcementService.createAnnouncement({
        title: annTitle.trim(),
        description: annDesc.trim(),
        authorId: user.id,
        authorName: user.full_name,
        authorRole: 'faculty',
        priority: annPriority,
        isPinned: false,
        targetSection: '1CSE22',
      });

      setAnnTitle('');
      setAnnDesc('');
      showFeedback('Faculty notice broadcasted! Real-time alerts delivered to student inboxes.');
    } finally {
      setIsSubmittingAnn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DCCB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#C65D32] uppercase font-bold">FACULTY DESK</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C65D32] animate-pulse" />
            <span className="text-xs text-[#5C554B]">Course Administration & Academic Delivery &bull; Section 1CSE22</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight mt-0.5">
            Faculty Teaching Deck
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171717] text-[#F5F0E6] text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4 text-[#C65D32]" />
            <span>ROLE: FACULTY ({user.full_name})</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 30% INK-BLACK LARGE FEATURE PANEL: Faculty Command Spotlight */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-[#F5F0E6] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C65D32]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#C65D32]/20 text-[#C65D32] border border-[#C65D32]/40 font-bold">
                INSTRUCTOR COMMAND CENTER
              </span>
              <span className="text-xs font-mono text-[#B3ADA3]">Section 1CSE22</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#F5F0E6] tracking-tight">
              Course Delivery & Student Evaluation
            </h3>
            <p className="text-xs text-[#B3ADA3] max-w-xl leading-relaxed">
              Record biometric class attendance, upload lecture materials, author course assignments with grading rubrics, and dispatch priority student notices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E] text-center min-w-[120px]">
              <span className="text-2xl sm:text-3xl font-black text-[#C65D32] tabular-nums">{students.length}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E978C] mt-0.5">Enrolled Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs (Ink Black dock with Burnt Orange active states) */}
      <div className="flex items-center gap-2 overflow-x-auto p-1.5 rounded-2xl bg-[#171717] border border-[#2E2E2E]">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-[#C65D32] text-[#F5F0E6] shadow-sm'
              : 'text-[#B3ADA3] hover:text-[#F5F0E6] hover:bg-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Mark Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'assignments'
              ? 'bg-[#C65D32] text-[#F5F0E6] shadow-sm'
              : 'text-[#B3ADA3] hover:text-[#F5F0E6] hover:bg-white/5'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Assignments & Deadlines</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'notes'
              ? 'bg-[#C65D32] text-[#F5F0E6] shadow-sm'
              : 'text-[#B3ADA3] hover:text-[#F5F0E6] hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Upload Study Materials</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'bg-[#C65D32] text-[#F5F0E6] shadow-sm'
              : 'text-[#B3ADA3] hover:text-[#F5F0E6] hover:bg-white/5'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Publish Faculty Notice</span>
        </button>
      </div>

      {/* 60% CREAM WORKSPACE: Tab Content */}
      {/* 1. ATTENDANCE MANAGEMENT */}
      {activeTab === 'attendance' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5DCCB]">
            <div>
              <h3 className="text-base font-black text-[#171717] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#C65D32]" />
                <span>Mark Attendance Session &bull; Section 1CSE22</span>
              </h3>
              <p className="text-xs text-[#5C554B] mt-0.5">
                Submitting updates student records and automatically broadcasts attendance alerts to student inboxes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated: Record<string, AttendanceStatus> = {};
                students.forEach((s) => {
                  updated[s.id] = 'present';
                });
                setAttendanceMap(updated);
              }}
              className="px-3.5 py-1.5 rounded-xl btn-cream-outline text-xs font-bold self-start sm:self-auto cursor-pointer"
            >
              Mark All Present
            </button>
          </div>

          <form onSubmit={handleSubmitAttendance} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-cream text-xs font-mono"
                >
                  {dbStore.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subject_code} - {sub.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Session Date</label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-cream text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Topic Covered</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 2: Stack & Queue Implementations"
                  value={topicCovered}
                  onChange={(e) => setTopicCovered(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-cream text-xs"
                />
              </div>
            </div>

            {/* Student Roll Call Grid */}
            <div className="pt-2">
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-2">
                Class Roll Call ({students.length} Students)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {students.map((st) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={st.full_name} role="student" size="sm" />
                      <div className="truncate">
                        <p className="font-bold text-[#171717] truncate">{st.full_name}</p>
                        <p className="text-[10px] font-mono text-[#5C554B]">{st.student_id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {(['present', 'absent', 'excused'] as AttendanceStatus[]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: status })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase transition-all cursor-pointer font-bold ${
                            attendanceMap[st.id] === status
                              ? status === 'present'
                                ? 'bg-emerald-600 text-white'
                                : status === 'absent'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-500 text-black'
                              : 'bg-white border border-[#E5DCCB] text-[#5C554B] hover:text-[#171717]'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5DCCB]">
              <button
                type="submit"
                disabled={isSubmittingAttendance}
                className="px-6 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold shadow-md cursor-pointer"
              >
                {isSubmittingAttendance ? 'Saving Attendance...' : 'Commit & Notify Students'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. ASSIGNMENT MANAGEMENT */}
      {activeTab === 'assignments' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm space-y-5">
          <div className="pb-3 border-b border-[#E5DCCB]">
            <h3 className="text-base font-black text-[#171717] flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#C65D32]" />
              <span>Create New Assignment Deliverable</span>
            </h3>
            <p className="text-xs text-[#5C554B] mt-0.5">
              Publish course lab assignments, set deadlines, and configure max marks for section 1CSE22.
            </p>
          </div>

          <form onSubmit={handleCreateAssignment} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Subject</label>
                <select
                  value={asgSubjectId}
                  onChange={(e) => setAsgSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-cream text-xs font-mono"
                >
                  {dbStore.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subject_code} - {sub.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Deadline Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={asgDeadline}
                  onChange={(e) => setAsgDeadline(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-cream text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Max Marks</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="100"
                  value={asgMaxMarks}
                  onChange={(e) => setAsgMaxMarks(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl input-cream text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Assignment Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Lab Deliverable 03: AVL Trees & Binary Search Algorithms"
                value={asgTitle}
                onChange={(e) => setAsgTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-cream text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Instructions & Problem Statement</label>
              <textarea
                required
                rows={3}
                placeholder="Detail requirements, submission guidelines, test cases, and constraints..."
                value={asgDesc}
                onChange={(e) => setAsgDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-cream text-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmittingAsg}
                className="px-6 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold shadow-md cursor-pointer"
              >
                {isSubmittingAsg ? 'Publishing...' : 'Publish Assignment to Section'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. NOTES UPLOAD */}
      {activeTab === 'notes' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm space-y-5">
          <div className="pb-3 border-b border-[#E5DCCB]">
            <h3 className="text-base font-black text-[#171717] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C65D32]" />
              <span>Upload Lecture Slides & Course Materials</span>
            </h3>
            <p className="text-xs text-[#5C554B] mt-0.5">
              Upload officially verified syllabus PDFs, question banks, and reference sheets.
            </p>
          </div>

          <form onSubmit={handleUploadNote} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Subject</label>
              <select
                value={noteSubjectId}
                onChange={(e) => setNoteSubjectId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl input-cream text-xs font-mono"
              >
                {dbStore.subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.subject_code} - {sub.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Document Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Chapter 4: Processes & CPU Scheduling Algorithms"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-cream text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Overview / Description</label>
              <textarea
                rows={3}
                placeholder="Outline slide contents, textbook chapter references..."
                value={noteDesc}
                onChange={(e) => setNoteDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-cream text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Select File (PDF)</label>
              <input
                type="file"
                required
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#E5DCCB] text-xs text-[#171717] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#171717] file:text-[#F5F0E6] cursor-pointer"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmittingNote}
                className="px-6 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold shadow-md cursor-pointer"
              >
                {isSubmittingNote ? 'Uploading Document...' : 'Publish Courseware'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. FACULTY NOTICES */}
      {activeTab === 'announcements' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm space-y-5">
          <div className="pb-3 border-b border-[#E5DCCB]">
            <h3 className="text-base font-black text-[#171717] flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#C65D32]" />
              <span>Broadcast Faculty Notice to Students</span>
            </h3>
            <p className="text-xs text-[#5C554B] mt-0.5">
              Send immediate lecture alerts, syllabus changes, or laboratory instructions to all 1CSE22 student dashboards.
            </p>
          </div>

          <form onSubmit={handlePublishAnnouncement} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Notice Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Laboratory Preparation: Bring Completed Flowcharts"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-cream text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Priority Level</label>
              <select
                value={annPriority}
                onChange={(e) => setAnnPriority(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl input-cream text-xs font-mono"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#5C554B] font-bold mb-1">Notice Message</label>
              <textarea
                required
                rows={4}
                placeholder="Provide notice details and instructions..."
                value={annDesc}
                onChange={(e) => setAnnDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl input-cream text-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmittingAnn}
                className="px-6 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingAnn ? 'Broadcasting...' : 'Broadcast Faculty Notice'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
