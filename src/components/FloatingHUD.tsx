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

import { DashboardTab } from '../types';
export type { DashboardTab };

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

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: ShieldCheck });
  } else if (isFaculty) {
    navItems.push({ id: 'faculty', label: 'Faculty Desk', icon: ShieldCheck });
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] px-2.5 py-1.5 rounded-full bg-[#171717]/95 backdrop-blur-md border border-[#2E2E2E] shadow-[0_15px_35px_rgba(23,23,23,0.35)] flex items-center gap-1 sm:gap-1.5 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-[#C65D32] text-[#F5F0E6] shadow-[0_2px_10px_rgba(198,93,50,0.5)] scale-105'
                : 'text-[#B3ADA3] hover:text-[#F5F0E6] hover:bg-white/5'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F5F0E6]' : 'text-[#B3ADA3]'}`} />
            <span className={`${isActive ? 'inline' : 'hidden md:inline'}`}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
