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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type DashboardTab =
  | 'timetable'
  | 'announcements'
  | 'notes'
  | 'assignments'
  | 'attendance'
  | 'quizzes'
  | 'discussions'
  | 'admin';

interface FloatingHUDProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export const FloatingHUD: React.FC<FloatingHUDProps> = ({ activeTab, onTabChange }) => {
  const { isAdmin, isFaculty } = useAuth();

  const navItems: { id: DashboardTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'announcements', label: 'Notices', icon: Megaphone },
    { id: 'notes', label: 'Materials', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileCheck2 },
    { id: 'attendance', label: 'Attendance', icon: Activity },
    { id: 'quizzes', label: 'Quizzes', icon: Award },
    { id: 'discussions', label: 'Discussions', icon: MessagesSquare },
  ];

  if (isAdmin || isFaculty) {
    navItems.push({ id: 'admin', label: isAdmin ? 'Admin' : 'Faculty', icon: ShieldCheck });
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] px-2 py-1.5 rounded-full glass-dock border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(139,92,246,0.25)] flex items-center gap-1 sm:gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`relative flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-full text-xs font-medium transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span className={`${isActive ? 'inline' : 'hidden md:inline'}`}>{item.label}</span>
            {isActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#06B6D4] shadow-[0_0_6px_#06b6d4]" />
            )}
          </button>
        );
      })}
    </div>
  );
};
