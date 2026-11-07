import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbStore } from '../services/mockDatabase';
import {
  GraduationCap,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldAlert,
  Building2,
  UserCheck,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface StudentLoginViewProps {
  onOpenRegister: () => void;
}

export const StudentLoginView: React.FC<StudentLoginViewProps> = ({ onOpenRegister }) => {
  const { login } = useAuth();
  const [activePortal, setActivePortal] = useState<'student' | 'faculty'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter student and staff profiles for quick demo chips
  const studentProfiles = dbStore.profiles.filter((p) => p.role === 'student');
  const staffProfiles = dbStore.profiles.filter((p) => p.role !== 'student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your Student Roll ID or institutional email.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await login(identifier.trim(), password);
      if (res.error) {
        setErrorMsg(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (idOrEmail: string) => {
    setIdentifier(idOrEmail);
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await login(idOrEmail);
      if (res.error) {
        setErrorMsg(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-[#e1e1f1] relative selection:bg-[#8B5CF6]/30 selection:text-[#acedff] flex flex-col justify-between overflow-x-hidden">
      {/* Background Lumina glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[15%] left-[10%] w-[550px] h-[550px] rounded-full bg-[#8B5CF6]/15 blur-[130px]" />
        <div className="absolute top-[35%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#06B6D4]/12 blur-[140px]" />
        <div className="absolute -bottom-[10%] left-[25%] w-[650px] h-[650px] rounded-full bg-[#6366F1]/12 blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top University Brand Bar */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 glass-panel border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B5CF6] via-[#6366F1] to-[#06B6D4] shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            <Sparkles className="w-5 h-5 text-white" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#06B6D4] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                SmartClassroom <span className="text-[#06B6D4] text-xs px-1.5 py-0.5 rounded-md bg-[#06B6D4]/10 border border-[#06B6D4]/20 font-mono">2.0</span>
              </h1>
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-[#06B6D4] border border-[#06B6D4]/30">
                1CSE22
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Sapthagiri NPS University &bull; Dept. of CSE &bull; Class Advisor: <strong className="text-slate-300">Mr. Prathap M S</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRegister}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold btn-spatial-secondary border border-[#06B6D4]/40 text-[#06B6D4] hover:bg-[#06B6D4]/10 transition-all cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Student Register</span>
        </button>
      </header>

      {/* Central Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg rounded-3xl glass-modal p-6 sm:p-8 border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95">
          {/* Portal Switcher Tabs */}
          <div className="flex rounded-2xl bg-black/40 p-1 border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setActivePortal('student');
                setErrorMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all ${
                activePortal === 'student'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePortal('faculty');
                setErrorMsg(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all ${
                activePortal === 'faculty'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Faculty & Admin</span>
            </button>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#06B6D4]/20 border border-white/15 mb-3 text-[#acedff]">
              {activePortal === 'student' ? (
                <GraduationCap className="w-7 h-7 text-[#06B6D4]" />
              ) : (
                <Building2 className="w-7 h-7 text-[#8B5CF6]" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {activePortal === 'student' ? 'Student Account Login' : 'Faculty & Staff Sign In'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {activePortal === 'student'
                ? 'Enter your institutional Student Roll ID to access your individual timetable, attendance, quizzes & notes.'
                : 'Sign in with your Faculty/Staff ID or university email credentials.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                {activePortal === 'student' ? 'Student Roll ID or Email' : 'Faculty ID or Email'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={
                    activePortal === 'student'
                      ? 'e.g. 26CS1042 or 26CS1055'
                      : 'e.g. FAC-PSC-01 or EMP-ADM-01'
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-white text-sm placeholder:text-slate-500 font-mono tracking-wide uppercase"
                />
                <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-mono">
                  {activePortal === 'student' ? 'ROLL NO' : 'ID'}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Optional for demo access</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your password (e.g. Password123!)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-white text-sm placeholder:text-slate-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl btn-spatial-primary text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.5)] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Log In to {activePortal === 'student' ? 'Student Portal' : 'Faculty Deck'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Select for Fast Testing */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">
              {activePortal === 'student'
                ? 'Quick Select Student Profile (Instant Login):'
                : 'Quick Select Staff Profile (Instant Login):'}
            </p>

            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {(activePortal === 'student' ? studentProfiles : staffProfiles).map((prof) => (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => handleQuickLogin(prof.student_id || prof.email)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#06B6D4]/50 hover:bg-[#06B6D4]/10 transition-all text-left group"
                >
                  <UserAvatar name={prof.full_name} role={prof.role} size="sm" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white group-hover:text-[#acedff] truncate">
                      {prof.full_name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {prof.student_id}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Registration Footer */}
          {activePortal === 'student' && (
            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400">
                New student without an account?{' '}
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="text-[#06B6D4] hover:underline font-semibold"
                >
                  Register Your Student Roll ID
                </button>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="relative z-10 py-4 px-4 text-center text-xs text-slate-500 border-t border-white/[0.05]">
        Sapthagiri NPS University &bull; School of Computer Science & Engineering &bull; SmartClassroom 2.0 Academic Portal
      </footer>
    </div>
  );
};
