import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldAlert, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';

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
      <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-white border border-[#E5DCCB] shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95">
        <div className="relative w-20 h-20 mx-auto rounded-3xl flex items-center justify-center bg-[#FAF7F2] border border-[#E5DCCB] shadow-sm">
          {isRejected ? (
            <ShieldAlert className="w-10 h-10 text-rose-600" />
          ) : (
            <Clock className="w-10 h-10 text-[#C65D32] animate-pulse" />
          )}
        </div>

        <div>
          <span
            className={`text-[10px] font-mono uppercase tracking-widest font-black px-3 py-1 rounded-full ${
              isRejected
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : 'bg-[#C65D32]/15 text-[#C65D32] border border-[#C65D32]/30'
            }`}
          >
            {isRejected ? 'REGISTRATION REJECTED' : 'ACCOUNT APPROVAL PENDING'}
          </span>
          <h2 className="text-2xl font-black text-[#171717] mt-3 tracking-tight">
            {isRejected ? 'Application Not Approved' : 'Under Institutional Review'}
          </h2>
          <p className="text-xs text-[#5C554B] leading-relaxed mt-2">
            {isRejected
              ? 'Your registration request was declined by the class administrator. Please reach out to the department office to verify your credentials.'
              : `Welcome, ${user?.full_name}. Your registration for section ${user?.section || '1CSE22'} has been submitted and is currently queued for review by the Class Administrator.`}
          </p>
        </div>

        {/* 30% Ink Black Security Protocol Card */}
        <div className="p-5 rounded-2xl bg-[#171717] border border-[#2B2B2B] text-left space-y-2 font-mono text-xs text-[#B3ADA3]">
          <p className="text-[#C65D32] font-black flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Institutional Security Protocol Active:</span>
          </p>
          <p className="text-[#D6CFC4]">
            &bull; User ID: <code className="text-[#F5F0E6] font-bold">{user?.student_id || user?.id.slice(0, 8)}</code>
          </p>
          <p className="text-[#D6CFC4]">
            &bull; Requested Role: <code className="text-[#F5F0E6] capitalize font-bold">{user?.role}</code>
          </p>
          <p className="text-[#D6CFC4]">
            &bull; RLS Rule: <code className="text-[#C65D32] font-bold">approval_status = 'approved'</code> required to unlock lecture streams, notes, quizzes & forums.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="pt-3 border-t border-[#E5DCCB] flex flex-col gap-2.5">
          <button
            onClick={handleSwitchToAdmin}
            className="w-full py-3 px-4 rounded-xl btn-burnt-orange text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Simulate Admin Review (Demo Sandbox)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-xl btn-ink text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Current Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
