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
  UserPlus,
  ShieldCheck,
  CheckCircle2,
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
    const demoPass = 'Password123!';
    setIdentifier(idOrEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await login(idOrEmail, demoPass);
      if (res.error) {
        setErrorMsg(res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#171717] flex flex-col justify-between selection:bg-[#C65D32]/20 selection:text-[#C65D32]">
      {/* Top University Brand Bar */}
      <header className="w-full px-6 sm:px-12 py-4 bg-[#FAF7F2] border-b border-[#E5DCCB] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#C65D32] shadow-[0_4px_16px_rgba(198,93,50,0.35)]">
            <Sparkles className="w-6 h-6 text-[#F5F0E6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-[#171717]">
                SmartClassroom <span className="text-[11px] font-mono font-bold bg-[#C65D32] text-[#F5F0E6] px-1.5 py-0.5 rounded">2.0</span>
              </h1>
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#171717] text-[#F5F0E6] font-semibold">
                1CSE22
              </span>
            </div>
            <p className="text-xs text-[#5C554B] hidden sm:block">
              Sapthagiri NPS University &bull; Dept. of CSE &bull; Class Advisor: <strong className="text-[#171717]">Mr. Prathap M S</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRegister}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold btn-burnt-orange cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Student Register</span>
        </button>
      </header>

      {/* Main Container: 30% Ink-Black Hero Panel + 60% Cream Form Card */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10 sm:py-16 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: 30% INK-BLACK FEATURE PANEL */}
          <div className="lg:col-span-5 bg-[#171717] text-[#F5F0E6] p-8 sm:p-10 rounded-3xl border border-[#2B2B2B] shadow-2xl flex flex-col justify-between relative overflow-hidden">
            {/* Background accent glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C65D32]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C65D32]/20 border border-[#C65D32]/40 text-[#C65D32] text-xs font-mono font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>INSTITUTIONAL PORTAL</span>
              </div>

              <div>
                <h2 className="text-3xl font-black text-[#F5F0E6] tracking-tight leading-tight">
                  Academic Portal & Lecture Operations
                </h2>
                <p className="text-sm text-[#B3ADA3] mt-3 leading-relaxed">
                  Welcome to Section 1CSE22’s centralized educational hub. Access live lecture streams, verifiable attendance telemetry, academic notes repository, and daily timed evaluations.
                </p>
              </div>

              {/* Key Features List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1E1E1E] border border-[#2B2B2B]">
                  <div className="p-2 rounded-xl bg-[#C65D32]/20 text-[#C65D32]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#F5F0E6]">Real-time Timetable Protocol</p>
                    <p className="text-[11px] text-[#9E978C]">Dynamic classroom routing & lecture tracking</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1E1E1E] border border-[#2B2B2B]">
                  <div className="p-2 rounded-xl bg-[#C65D32]/20 text-[#C65D32]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#F5F0E6]">Biometric Attendance Telemetry</p>
                    <p className="text-[11px] text-[#9E978C]">85% threshold alerts & subject breakdowns</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1E1E1E] border border-[#2B2B2B]">
                  <div className="p-2 rounded-xl bg-[#C65D32]/20 text-[#C65D32]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#F5F0E6]">Three-Tier Role Security</p>
                    <p className="text-[11px] text-[#9E978C]">Enforced RLS for Student, Faculty & Class Admin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="relative z-10 pt-6 mt-6 border-t border-[#2B2B2B] text-xs text-[#888888] font-mono flex items-center justify-between">
              <span>Term: Sem 1 (2026–2027)</span>
              <span className="text-[#C65D32] font-bold">1CSE22 CSE</span>
            </div>
          </div>

          {/* RIGHT: 60% CREAM INTERACTIVE LOGIN CARD */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-[#E5DCCB] shadow-xl flex flex-col justify-between">
            <div>
              {/* Portal Switcher Tabs */}
              <div className="flex rounded-2xl bg-[#F5F0E6] p-1.5 border border-[#E5DCCB] mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setActivePortal('student');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activePortal === 'student'
                      ? 'bg-[#171717] text-[#F5F0E6] shadow-md'
                      : 'text-[#5C554B] hover:text-[#171717]'
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
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activePortal === 'faculty'
                      ? 'bg-[#171717] text-[#F5F0E6] shadow-md'
                      : 'text-[#5C554B] hover:text-[#171717]'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Faculty & Admin</span>
                </button>
              </div>

              {/* Heading */}
              <div className="mb-6">
                <h3 className="text-2xl font-black text-[#171717] tracking-tight">
                  {activePortal === 'student' ? 'Student Account Sign In' : 'Faculty & Staff Sign In'}
                </h3>
                <p className="text-xs text-[#5C554B] mt-1.5">
                  {activePortal === 'student'
                    ? 'Enter your institutional Student Roll ID to access your timetable, attendance telemetry, quizzes & notes.'
                    : 'Sign in with your verified Faculty/Staff ID or university credentials.'}
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{errorMsg}</div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#5C554B] font-bold mb-1.5">
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
                      className="w-full px-4 py-3.5 rounded-xl input-cream text-[#171717] text-sm font-mono tracking-wide uppercase placeholder:text-stone-400 placeholder:normal-case"
                    />
                    <span className="absolute right-3.5 top-3.5 text-xs text-[#7A7265] font-mono font-bold">
                      {activePortal === 'student' ? 'ROLL NO' : 'ID'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#5C554B] font-bold">
                      Password
                    </label>
                    <span className="text-[10px] text-[#C65D32] font-mono font-bold">Default: Password123!</span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Enter your account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl input-cream text-[#171717] text-sm placeholder:text-stone-400"
                    />
                    <Lock className="w-4 h-4 text-[#7A7265] absolute right-3.5 top-4" />
                  </div>
                </div>

                {/* 10% Burnt Orange Primary Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl btn-burnt-orange text-sm font-bold shadow-lg cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter {activePortal === 'student' ? 'Student Hub' : 'Faculty Deck'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Select for Instant Demo Testing */}
            <div className="mt-8 pt-6 border-t border-[#E5DCCB]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#7A7265] font-bold">
                  {activePortal === 'student'
                    ? 'Demo Sandbox: Instant Student Sign In'
                    : 'Demo Sandbox: Instant Staff Sign In'}
                </p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF7F2] text-[#C65D32] border border-[#E5DCCB] font-semibold">
                  Click to log in
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {(activePortal === 'student' ? studentProfiles : staffProfiles).map((prof) => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => handleQuickLogin(prof.student_id || prof.email)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF7F2] border border-[#E5DCCB] hover:border-[#C65D32] hover:bg-white transition-all text-left group cursor-pointer"
                  >
                    <UserAvatar name={prof.full_name} role={prof.role} size="sm" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-[#171717] group-hover:text-[#C65D32] truncate">
                        {prof.full_name}
                      </p>
                      <p className="text-[10px] text-[#7A7265] font-mono">
                        {prof.student_id}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Registration Prompt */}
              {activePortal === 'student' && (
                <div className="mt-4 pt-3 text-center border-t border-[#E5DCCB]/60">
                  <p className="text-xs text-[#5C554B]">
                    New student without an enrolled account?{' '}
                    <button
                      type="button"
                      onClick={onOpenRegister}
                      className="text-[#C65D32] hover:underline font-bold"
                    >
                      Register Your Student Roll ID
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="py-4 px-6 text-center text-xs text-[#7A7265] border-t border-[#E5DCCB] bg-[#FAF7F2]">
        Sapthagiri NPS University &bull; School of Computer Science & Engineering &bull; SmartClassroom 2.0 Academic Portal
      </footer>
    </div>
  );
};
