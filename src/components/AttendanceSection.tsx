import React, { useEffect, useState } from 'react';
import { AttendanceTelemetry, AttendanceRecord, AttendanceSession, AttendanceStatus } from '../types';
import { attendanceService } from '../services/attendanceService';
import { useAuth } from '../context/AuthContext';
import { dbStore } from '../services/mockDatabase';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  History,
  X,
  Sparkles,
  TrendingUp,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DCCB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#C65D32] uppercase font-bold">TELEMETRY MATRIX</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C65D32]" />
            <span className="text-xs text-[#5C554B]">Mandatory University Threshold: 75.0%</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight mt-0.5">
            Biometric & Academic Attendance Telemetry
          </h2>
        </div>

        {(isFaculty || isAdmin) && (
          <button
            onClick={() => setShowMarkModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl btn-burnt-orange text-xs font-bold shadow-md self-start sm:self-auto cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Mark Lecture Attendance</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-64 rounded-3xl bg-white border border-[#E5DCCB] animate-pulse" />
      ) : (
        <>
          {/* 30% INK-BLACK COCKPIT PANEL: Circular Gauge & Threshold Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Circular Gauge Card in Bold Ink Black */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-[#F5F0E6] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#C65D32]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="rgba(245, 240, 230, 0.1)"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Burnt Orange Progress Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#C65D32"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-black text-[#F5F0E6] tabular-nums tracking-tighter">
                    {percentage}%
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#B3ADA3] font-bold">
                    AGGREGATE
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-4 text-xs font-mono text-[#D6CFC4]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Present: {telemetry?.presentClasses}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>Absent: {telemetry?.absentClasses}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#888888]" />
                  <span>Total: {telemetry?.totalClasses}</span>
                </div>
              </div>
            </div>

            {/* 75% Regulatory Status & Recovery Card in Ink Black */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-[#F5F0E6] shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    {isBelow ? (
                      <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">
                        <AlertTriangle className="w-5 h-5 animate-bounce" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-xl bg-[#C65D32]/20 text-[#C65D32]">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    <span className={`text-xs font-mono font-black uppercase tracking-wider ${isBelow ? 'text-rose-400' : 'text-[#C65D32]'}`}>
                      {isBelow ? 'ATTENDANCE DEFICIT ALERT' : 'EXAMINATION CLEARANCE VERIFIED'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#888888]">Threshold: 75.0%</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-[#F5F0E6] mb-2 tracking-tight">
                  {isBelow
                    ? `Warning: Current attendance is below the mandatory 75% threshold (${percentage}%).`
                    : `In Good Academic Standing: Attended ${percentage}% of all semester course sessions.`}
                </h3>

                <p className="text-xs text-[#B3ADA3] leading-relaxed">
                  {isBelow ? (
                    <>
                      Under university academic regulations, students with attendance under 75% are ineligible for semester end theory and practical examinations without formal condonation.
                    </>
                  ) : (
                    <>
                      Your attendance comfortably satisfies the institutional examination eligibility requirements. Continue attending all sessions to retain your academic standing and internal assessment credits.
                    </>
                  )}
                </p>
              </div>

              {/* Mathematical Consecutive Attendance Recovery Engine */}
              <div className="mt-6 p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono uppercase text-[#C65D32] font-black flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Attendance Recovery Calculator
                  </div>
                  <p className="text-xs text-[#D6CFC4] mt-0.5">
                    {isBelow
                      ? `You must attend ${needed} additional consecutive classes without missing any to restore 75.0%.`
                      : `You can miss up to ${Math.max(0, Math.floor((telemetry?.presentClasses || 0) / 0.75 - (telemetry?.totalClasses || 0)))} upcoming lectures and remain in good standing.`}
                  </p>
                </div>

                {isBelow && (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-black whitespace-nowrap self-start sm:self-auto">
                    <span>+{needed} Consecutive Needed</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 60% Cream Workspace: Subject-Wise Attendance Breakdown */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DCCB]">
              <h3 className="text-base font-black text-[#171717] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#C65D32]" />
                Subject-Wise Attendance Breakdown
              </h3>
              <span className="text-xs text-[#5C554B] font-mono font-bold">{telemetry?.subjectWise.length || 0} Enrolled Courses</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {telemetry?.subjectWise.map((sub) => {
                const subIsBelow = sub.percentage < 75.0;

                return (
                  <div
                    key={sub.subjectId}
                    className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB] hover:border-[#C65D32] transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-[#171717] bg-white px-2 py-0.5 rounded border border-[#E5DCCB]">
                        {sub.subjectCode}
                      </span>
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                          subIsBelow ? 'bg-rose-100 text-rose-700' : 'bg-[#C65D32]/10 text-[#C65D32]'
                        }`}
                      >
                        {sub.percentage}%
                      </span>
                    </div>

                    <p className="text-xs text-[#171717] font-bold truncate">{sub.subjectName}</p>

                    {/* Progress Bar in Burnt Orange */}
                    <div className="w-full h-2 rounded-full bg-[#E5DCCB] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          subIsBelow ? 'bg-rose-500' : 'bg-[#C65D32]'
                        }`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] font-mono text-[#5C554B] pt-1">
                      <span>Attended: <strong className="text-[#171717]">{sub.present}</strong>/{sub.total}</span>
                      <span>Missed: <strong className={subIsBelow ? 'text-rose-600' : 'text-[#171717]'}>{sub.absent}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 60% Cream Workspace: Attendance History Feed */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DCCB]">
              <h3 className="text-base font-black text-[#171717] flex items-center gap-2">
                <History className="w-4 h-4 text-[#C65D32]" />
                Verified Attendance Session History
              </h3>
              <span className="text-xs text-[#5C554B] font-mono font-bold">Last {history.length} Lectures</span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB] hover:bg-white text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        item.status === 'present'
                          ? 'bg-emerald-500 shadow-sm'
                          : item.status === 'absent'
                          ? 'bg-rose-500 shadow-sm'
                          : 'bg-amber-500'
                      }`}
                    />
                    <div>
                      <p className="font-bold text-[#171717]">
                        {item.session.subject_name} ({item.session.subject_code})
                      </p>
                      <p className="text-[11px] text-[#5C554B]">
                        Topic: {item.session.topic_covered || 'Standard lecture coverage'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                        item.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                    <p className="text-[10px] text-[#7A7265] font-mono mt-0.5">{item.session.class_date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Faculty Mark Attendance Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-[#171717] text-[#F5F0E6] p-6 sm:p-8 border border-[#2E2E2E] shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowMarkModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-[#9E978C] hover:text-[#F5F0E6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 rounded-xl bg-[#C65D32]/20 text-[#C65D32]">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F5F0E6]">Mark Lecture Attendance</h3>
                <p className="text-xs text-[#9E978C]">Faculty Assessment Deck</p>
              </div>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Subject</label>
                  <select
                    value={markSubjectId}
                    onChange={(e) => setMarkSubjectId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl input-ink text-xs font-mono"
                  >
                    {dbStore.subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={markDate}
                    onChange={(e) => setMarkDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl input-ink text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Topic Covered</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arrays, Modular Structures & Algorithms"
                  value={markTopic}
                  onChange={(e) => setMarkTopic(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl input-ink text-xs"
                />
              </div>

              {/* Student Roll Call List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] bg-[#1E1E1E] p-3 rounded-2xl border border-[#2B2B2B]">
                <label className="block text-[11px] font-mono uppercase text-[#B3ADA3] font-bold mb-2">
                  Class Roll Call ({studentsList.length} Enrolled Students)
                </label>
                {studentsList.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#252525] border border-[#333333] text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#F5F0E6]">{st.full_name}</p>
                      <p className="text-[10px] font-mono text-[#9E978C]">{st.student_id}</p>
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
                                ? 'bg-emerald-500 text-black font-black'
                                : status === 'absent'
                                ? 'bg-rose-500 text-white font-black'
                                : 'bg-amber-500 text-black font-black'
                              : 'bg-white/5 text-[#9E978C] hover:text-[#F5F0E6]'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2B2B]">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="px-4 py-2 rounded-xl btn-ink text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={markingSaving}
                  className="px-5 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold"
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
