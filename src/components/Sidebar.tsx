import React from 'react';
import {
  Calendar,
  Megaphone,
  BookOpen,
  FileCheck2,
  Activity,
  Award,
  MessagesSquare,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  LogOut,
  UserPlus,
  ChevronRight,
  X,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
import { DashboardTab } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onOpenRegisterModal: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenRegisterModal,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, isAdmin, isFaculty, logout } = useAuth();

  const navItems: { id: DashboardTab; label: string; icon: React.FC<{ className?: string }>; description: string }[] = [
    { id: 'timetable', label: 'Timetable', icon: Calendar, description: 'Daily periods & room stream' },
    { id: 'announcements', label: 'Notices & Circulars', icon: Megaphone, description: 'Official broadcasts' },
    { id: 'notes', label: 'Study Materials', icon: BookOpen, description: 'Syllabus notes & slides' },
    { id: 'assignments', label: 'Assignments', icon: FileCheck2, description: 'Submissions & deadlines' },
    { id: 'attendance', label: 'Attendance', icon: Activity, description: 'Biometric telemetry & stats' },
    { id: 'quizzes', label: 'Daily Quizzes', icon: Award, description: 'Knowledge checks & ranks' },
    { id: 'discussions', label: 'Class Discussions', icon: MessagesSquare, description: 'Peer forums & Q&A' },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Admin Portal',
      icon: ShieldCheck,
      description: 'System master console',
    });
  } else if (isFaculty) {
    navItems.push({
      id: 'faculty',
      label: 'Faculty Desk',
      icon: ShieldCheck,
      description: 'Course & grading command',
    });
  }

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'class_admin':
        return { label: 'CLASS ADMIN', style: 'bg-[#C65D32]/20 text-[#C65D32] border-[#C65D32]/40' };
      case 'faculty':
        return { label: 'FACULTY', style: 'bg-white/10 text-[#F5F0E6] border-white/20' };
      case 'student':
      default:
        return { label: 'STUDENT', style: 'bg-[#EDE5D8]/20 text-[#EDE5D8] border-[#EDE5D8]/30' };
    }
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Ink-Black Fixed Sidebar (30% visual weight anchor) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#171717] border-r border-[#262626] text-[#F5F0E6] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Header */}
        <div className="p-5 border-b border-[#262626]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C65D32] flex items-center justify-center text-[#F5F0E6] shadow-[0_4px_16px_rgba(198,93,50,0.4)]">
                <Sparkles className="w-5 h-5 text-[#F5F0E6]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black tracking-tight text-[#F5F0E6]">
                    SmartClassroom
                  </h1>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C65D32] text-[#F5F0E6]">
                    2.0
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C65D32] font-semibold">
                    Section {user?.section || '1CSE22'}
                  </span>
                  <span className="text-[#555555]">&bull;</span>
                  <span className="text-[10px] font-mono text-[#9E978C]">
                    Sem 1 (2026–27)
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-xl hover:bg-white/10 text-[#9E978C] hover:text-[#F5F0E6] lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[11px] text-[#9E978C] mt-3 font-sans leading-tight">
            Sapthagiri NPS University &bull; Dept. of CSE
          </p>
        </div>

        {/* User Identity Panel */}
        <div className="px-4 py-3 border-b border-[#262626] bg-[#1C1C1C]">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-[#242424] border border-[#2F2F2F]">
            <UserAvatar name={user?.full_name} role={user?.role} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#F5F0E6] truncate">
                {user?.full_name || 'Classroom User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-semibold ${roleBadge.style}`}
                >
                  {user?.student_id || roleBadge.label}
                </span>
                {user?.approval_status === 'pending' && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    PENDING
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-[#7A7265] font-bold">
            Academic Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#C65D32] text-[#F5F0E6] shadow-[0_4px_18px_rgba(198,93,50,0.35)] font-semibold'
                    : 'text-[#D6CFC4] hover:bg-[#222222] hover:text-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 text-left">
                  <div
                    className={`p-1.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-black/20 text-[#F5F0E6]'
                        : 'bg-[#222222] text-[#B3ADA3] group-hover:text-[#C65D32] group-hover:bg-[#2A2A2A]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="truncate font-semibold">{item.label}</p>
                    <p
                      className={`text-[10px] truncate ${
                        isActive ? 'text-[#F5F0E6]/80' : 'text-[#7A7265]'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>

                {isActive ? (
                  <span className="w-2 h-2 rounded-full bg-[#F5F0E6] shadow-sm shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#555555] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Institutional Info & Actions */}
        <div className="p-4 border-t border-[#262626] bg-[#161616] space-y-3">
          {/* Institutional Advisor Note */}
          <div className="p-3 rounded-2xl bg-[#1E1E1E] border border-[#2B2B2B] text-[11px] space-y-1">
            <div className="flex items-center justify-between text-[#9E978C] font-mono text-[10px]">
              <span>ADVISOR</span>
              <span
                className={`px-1.5 py-0.2 rounded ${
                  isSupabaseConfigured
                    ? 'bg-emerald-500/20 text-emerald-400 font-mono'
                    : 'bg-[#C65D32]/20 text-[#C65D32] font-mono'
                }`}
              >
                {isSupabaseConfigured ? 'LIVE DB' : 'SANDBOX'}
              </span>
            </div>
            <p className="font-semibold text-[#F5F0E6]">Mr. Prathap M S</p>
            <p className="text-[#7A7265] text-[10px]">Class Advisor, Dept. of CSE</p>
          </div>

          {/* Quick Registration & Logout Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRegisterModal}
              className="flex-1 py-2 px-3 rounded-xl bg-[#242424] hover:bg-[#2E2E2E] border border-[#333333] text-[#F5F0E6] hover:text-[#C65D32] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              title="Register new student"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
            <button
              onClick={logout}
              className="py-2 px-3 rounded-xl bg-[#242424] hover:bg-rose-950/40 border border-[#333333] hover:border-rose-900/50 text-[#9E978C] hover:text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
