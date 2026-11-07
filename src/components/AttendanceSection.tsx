import React, { useEffect, useState } from 'react';
import { AttendanceTelemetry, AttendanceRecord, AttendanceSession, AttendanceStatus } from '../types';
import { attendanceService } from '../services/attendanceService';
import { useAuth } from '../context/AuthContext';
import { dbStore } from '../services/mockDatabase';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  UserCheck,
  ShieldAlert,
  Plus,
  History,
  X,
  Sparkles,
} from 'lucide-react';

export const AttendanceSection: React.FC = () => {
  const { user, isFaculty, isAdmin } = useAuth();
  const [telemetry, setTelemetry] = useState<AttendanceTelemetry | null>(null);
  const [history, setHistory] = useState<(AttendanceRecord & { session: AttendanceSession })[]>([]);
  const [loading, setLoading] = useState(true);

  // Faculty Mark Attendance Drawer Modal
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markSubjectId, setMarkSubjectId] = useState(dbStore.subjects[0]?.id || '');
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markTopic, setMarkTopic] = useState('');
  const [studentStatuses, setStudentStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [markingSaving, setMarkingSaving] = useState(false);

  const studentsList = dbStore.profiles.filter((p) => p.role === 'student' && p.approval_status === 'approved');

  const loadData = () => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      attendanceService.getStudentTelemetry(user.id),
      attendanceService.getStudentHistory(user.id),
    ]).then(([telem, hist]) => {
      setTelemetry(telem);
      setHistory(hist);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    // Initialize student statuses for faculty marking modal
    const initialMap: Record<string, AttendanceStatus> = {};
    studentsList.forEach((s) => {
      initialMap[s.id] = 'present';
    });
    setStudentStatuses(initialMap);
  }, [user?.id]);

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !markSubjectId) return;

    setMarkingSaving(true);
    const records = Object.entries(studentStatuses).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    await attendanceService.markSessionAttendance({
      subjectId: markSubjectId,
      facultyId: user.id,
      date: markDate,
      topicCovered: markTopic || 'Course Lecture & Practical Analysis',
      records,
    });

    setMarkingSaving(false);
    setShowMarkModal(false);
    setMarkTopic('');
    loadData();
  };

  const percentage = telemetry?.percentage ?? 0;
  const isBelow = telemetry?.isBelowThreshold ?? false;
  const needed = telemetry?.consecutiveClassesNeeded ?? 0;

  // SVG Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#06B6D4] uppercase">TELEMETRY MATRIX</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
            <span className="text-xs text-slate-400">Institutional Threshold: 75.0%</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            Biometric & Academic Attendance Telemetry
          </h2>
        </div>

        {(isFaculty || isAdmin) && (
          <button
            onClick={() => setShowMarkModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg self-start sm:self-auto"
          >
            <UserCheck className="w-4 h-4" />
            <span>Mark Lecture Attendance</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl glass-card animate-pulse bg-white/[0.02]" />
      ) : (
        <>
          {/* Top Telemetry Row: Circular Gauge & Threshold Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Circular Gauge Card */}
            <div className="p-6 rounded-3xl glass-card flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Glowing Progress Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="url(#luminaGrad)"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="luminaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="50%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white tabular-nums tracking-tighter">
                    {percentage}%
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    AGGREGATE
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Present: {telemetry?.presentClasses}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Absent: {telemetry?.absentClasses}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Total: {telemetry?.totalClasses}</span>
                </div>
              </div>
            </div>

            {/* 75% Regulatory Status Card */}
            <div
              className={`lg:col-span-2 p-6 rounded-3xl glass-card flex flex-col justify-between transition-all ${
                isBelow
                  ? 'border-t-rose-500/80 bg-rose-950/15 shadow-[0_0_35px_rgba(244,63,94,0.2)]'
                  : 'border-t-emerald-500/80 bg-emerald-950/15 shadow-[0_0_35px_rgba(16,185,129,0.15)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isBelow ? (
                      <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isBelow ? 'text-rose-300' : 'text-emerald-300'}`}>
                      {isBelow ? 'CRITICAL ATTENDANCE DEFICIT WARNING' : 'EXAMINATION CLEARANCE GRANTED'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Formula: (P / T) &times; 100</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {isBelow
                    ? `Warning: Your attendance is below the mandatory 75% threshold (${percentage}%).`
                    : `In Good Standing: You have attended ${percentage}% of total semester classes.`}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {isBelow ? (
                    <>
                      Under university examination statutes, students with attendance below 75% are ineligible for semester end theory and practical examinations without formal condonation.
                    </>
                  ) : (
                    <>
                      You are comfortably above the minimum 75% threshold. Maintain your consistency across all core subjects to preserve lab access and test eligibility.
                    </>
                  )}
                </p>
              </div>

              {/* Mathematical Consecutive Attendance Recovery Engine */}
              <div className="mt-5 p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono uppercase text-[#06B6D4] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Recovery Calculator Engine
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {isBelow
                      ? `You must attend ${needed} additional consecutive classes without missing any to reach 75.0%.`
                      : `You can miss up to ${Math.max(0, Math.floor((telemetry?.presentClasses || 0) / 0.75 - (telemetry?.totalClasses || 0)))} upcoming classes and still remain at or above 75%.`}
                  </p>
                </div>

                {isBelow && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold whitespace-nowrap self-start sm:self-auto">
                    <span>+{needed} Consecutive Required</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subject-Wise Attendance Breakdown */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#8B5CF6]" />
                Subject-Wise Attendance Breakdown
              </h3>
              <span className="text-xs text-slate-400 font-mono">{telemetry?.subjectWise.length || 0} Enrolled Modules</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {telemetry?.subjectWise.map((sub) => {
                const subIsBelow = sub.percentage < 75.0;

                return (
                  <div
                    key={sub.subjectId}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-semibold text-[#acedff]">{sub.subjectCode}</span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          subIsBelow ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {sub.percentage}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium truncate mb-2.5">{sub.subjectName}</p>

                    {/* Miniature Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          subIsBelow ? 'bg-rose-500' : 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]'
                        }`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Attended: {sub.present}/{sub.total}</span>
                      <span>Missed: {sub.absent}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attendance History Feed */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#06B6D4]" />
                Verified Attendance Session History
              </h3>
              <span className="text-xs text-slate-400 font-mono">Last {history.length} Lectures</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.status === 'present'
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : item.status === 'absent'
                          ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
                          : 'bg-amber-400'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {item.session.subject_name} ({item.session.subject_code})
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Topic: {item.session.topic_covered || 'Standard lecture coverage'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                        item.status === 'present'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {item.status}
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.session.class_date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Faculty Mark Attendance Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl glass-modal p-6 border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowMarkModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-5 h-5 text-[#06B6D4]" />
              <h3 className="text-lg font-bold text-white">Mark Class Attendance (Faculty)</h3>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Subject</label>
                  <select
                    value={markSubjectId}
                    onChange={(e) => setMarkSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl glass-input bg-[#0B0F1F] text-white text-xs"
                  >
                    {dbStore.subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={markDate}
                    onChange={(e) => setMarkDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl glass-input text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Topic Covered</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arrays, Strings & Modular Functions in C"
                  value={markTopic}
                  onChange={(e) => setMarkTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl glass-input text-white text-xs"
                />
              </div>

              {/* Student Roll Call List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
                <label className="block text-xs font-mono uppercase text-slate-400">Class Roll Call ({studentsList.length} Students)</label>
                {studentsList.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{st.full_name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{st.student_id}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {(['present', 'absent', 'excused'] as AttendanceStatus[]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setStudentStatuses({ ...studentStatuses, [st.id]: status })}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-mono uppercase transition-all ${
                            studentStatuses[st.id] === status
                              ? status === 'present'
                                ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_#10b981]'
                                : status === 'absent'
                                ? 'bg-rose-500 text-white font-bold shadow-[0_0_10px_#f43f5e]'
                                : 'bg-amber-500 text-black font-bold'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="px-4 py-2 rounded-full btn-spatial-secondary text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={markingSaving}
                  className="px-5 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg"
                >
                  {markingSaving ? 'Saving Records...' : 'Commit Attendance Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
