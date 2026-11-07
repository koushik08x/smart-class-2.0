import React, { useEffect, useState } from 'react';
import { RegistrationRequest } from '../types';
import { profileService } from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { dbStore } from '../services/mockDatabase';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Megaphone,
  BookOpen,
  Award,
  Activity,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export const AdminDashboardSection: React.FC<{ onOpenBackendConsole?: () => void }> = ({
  onOpenBackendConsole,
}) => {
  const { user, isAdmin, isFaculty } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

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

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    if (!user) return;
    setActionInProgress(requestId);
    await profileService.reviewRegistration(requestId, action, user.id);
    setActionInProgress(null);
    loadData();
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const pastRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#EC4899] uppercase">CONTROL DECK</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
            <span className="text-xs text-slate-400">Administrative Governance & Security</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            System Administration & Resource Management
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenBackendConsole && isAdmin && (
            <button
              onClick={onOpenBackendConsole}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full btn-spatial-secondary border border-[#06B6D4]/30 text-[#acedff] text-xs font-mono hover:bg-[#06B6D4]/10 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
              <span>Backend Console</span>
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#d0bcff] text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
            <span>Role: {user?.role.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Students', val: stats?.totalStudents ?? 0, icon: GraduationCap, color: '#10B981' },
          { label: 'Academic Faculty', val: stats?.totalFaculty ?? 0, icon: Users, color: '#06B6D4' },
          { label: 'Pending Approvals', val: stats?.pendingRegistrations ?? 0, icon: Clock, color: '#F59E0B' },
          { label: 'Avg Attendance', val: `${stats?.avgAttendance ?? 0}%`, icon: Activity, color: '#8B5CF6' },
          { label: 'Announcements', val: stats?.totalAnnouncements ?? 0, icon: Megaphone, color: '#EC4899' },
          { label: 'Uploaded Notes', val: stats?.totalNotes ?? 0, icon: BookOpen, color: '#38BDF8' },
          { label: 'Lab Assignments', val: stats?.totalAssignments ?? 0, icon: FileText, color: '#A78BFA' },
          { label: 'Quiz Submissions', val: stats?.totalQuizAttempts ?? 0, icon: Award, color: '#F43F5E' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;

          return (
            <div
              key={idx}
              className="p-4 rounded-3xl glass-card flex items-center gap-3.5 hover:border-white/20 transition-all"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${kpi.color}20`, border: `1px solid ${kpi.color}40` }}
              >
                <Icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-slate-400">{kpi.label}</p>
                <p className="text-lg font-bold text-white tabular-nums tracking-tight">{kpi.val}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Account Approvals Card */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Pending Registration Review Queue</h3>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {pendingRequests.length} PENDING
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p>All student and faculty registrations have been processed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar name={req.profile?.full_name} role={req.requested_role} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{req.profile?.full_name}</p>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {req.requested_role}
                      </span>
                    </div>
                    <p className="text-slate-400 font-mono text-[11px] mt-0.5">
                      {req.profile?.email} &bull; ID: {req.profile?.student_id} &bull; Section {req.profile?.section}
                    </p>
                    {req.notes && (
                      <p className="text-[11px] text-slate-300 italic mt-1">&quot;{req.notes}&quot;</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    disabled={actionInProgress === req.id}
                    onClick={() => handleReview(req.id, 'reject')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold transition-all disabled:opacity-40"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    disabled={actionInProgress === req.id}
                    onClick={() => handleReview(req.id, 'approve')}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-bold transition-all shadow-[0_0_15px_#10b981] disabled:opacity-40"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve Access</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Constraints Info Box */}
      <div className="p-6 rounded-3xl glass-card space-y-3 font-mono text-xs text-slate-300">
        <h4 className="font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
          PostgreSQL Row-Level Security Enforcements Active
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <p className="text-[#06B6D4] font-semibold">&bull; Registration Gatekeeper Policy</p>
            <p className="text-slate-400">Only verified users with approval_status = &apos;approved&apos; can query timetable, study materials and quizzes.</p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <p className="text-[#8B5CF6] font-semibold">&bull; Quiz Anti-Leakage Policy</p>
            <p className="text-slate-400">Correct answers are evaluated server-side and hidden from frontend inspection prior to submission.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
