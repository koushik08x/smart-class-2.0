import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldAlert, LogOut, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

interface PendingApprovalViewProps {
  onGoToAdmin?: () => void;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({ onGoToAdmin }) => {
  const { user, switchUser, logout } = useAuth();
  const isRejected = user?.approval_status === 'rejected';

  const handleSwitchToAdmin = async () => {
    await switchUser('00000000-0000-0000-0000-000000000001');
    if (onGoToAdmin) {
      onGoToAdmin();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-8 rounded-3xl glass-modal border border-white/20 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95">
        <div className="relative w-20 h-20 mx-auto rounded-3xl flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.3)]">
          {isRejected ? (
            <ShieldAlert className="w-10 h-10 text-rose-400" />
          ) : (
            <Clock className="w-10 h-10 text-amber-400 animate-pulse" />
          )}
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
            {isRejected ? 'REGISTRATION REJECTED' : 'ACCOUNT APPROVAL PENDING'}
          </span>
          <h2 className="text-2xl font-bold text-white mt-3 tracking-tight">
            {isRejected ? 'Application Not Approved' : 'Under Institutional Review'}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mt-2">
            {isRejected
              ? 'Your registration request was declined by the class administrator. Please reach out to the department office to verify your credentials.'
              : `Welcome, ${user?.full_name}. Your registration for section ${user?.section || '1CSE22'} has been submitted and is currently queued for review by the Class Administrator.`}
          </p>
        </div>

        {/* Security details card */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-left space-y-2 font-mono text-xs text-slate-400">
          <p className="text-[#06B6D4] font-bold">&bull; Security Protocol Active:</p>
          <p className="text-slate-300">
            &bull; User ID: <code className="text-white">{user?.student_id || user?.id.slice(0, 8)}</code>
          </p>
          <p className="text-slate-300">
            &bull; Requested Role: <code className="text-white capitalize">{user?.role}</code>
          </p>
          <p className="text-slate-300">
            &bull; RLS Rule: <code className="text-amber-300">approval_status = &apos;approved&apos;</code> required to unlock lecture streams, notes, quizzes & forums.
          </p>
        </div>

        {/* Quick actions to test approval flow */}
        <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
          <p className="text-[11px] text-slate-400">
            To test approving this account, switch to <strong>Super Admin</strong> or <strong>Class Admin</strong>:
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleSwitchToAdmin}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Switch to Admin & Review</span>
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-full btn-spatial-secondary text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Log Out to Login Screen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
