import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  UserPlus,
  Calendar,
  BookOpen,
  FileCheck2,
  Activity,
  Award,
  MessagesSquare,
  AlertCircle,
  MapPin,
  Megaphone,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { NotificationItem, DashboardTab } from '../types';
import { notificationService } from '../services/notificationService';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  onOpenSupabaseModal?: () => void;
  onOpenRegisterModal: () => void;
  onSelectTab?: (tab: DashboardTab) => void;
  notifications: NotificationItem[];
  onRefreshNotifications: () => void;
  onToggleMobileMenu?: () => void;
  currentTabName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegisterModal,
  onSelectTab,
  notifications,
  onRefreshNotifications,
  onToggleMobileMenu,
  currentTabName = 'Academic Hub',
}) => {
  const { user, switchUser, availableUsers, logout, unreadCount } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'class_admin':
        return { label: 'CLASS ADMIN', bg: 'bg-[#C65D32]/15 text-[#C65D32] border-[#C65D32]/30' };
      case 'faculty':
        return { label: 'FACULTY', bg: 'bg-[#171717]/10 text-[#171717] border-[#171717]/20' };
      case 'student':
      default:
        return { label: 'STUDENT', bg: 'bg-[#EDE5D8] text-[#171717] border-[#D5C8B2]' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  const getTabForNotification = (type: string): DashboardTab => {
    switch (type) {
      case 'timetable':
      case 'classroom':
        return 'timetable';
      case 'announcement':
      case 'exam':
        return 'announcements';
      case 'notes':
        return 'notes';
      case 'assignment':
        return 'assignments';
      case 'attendance':
        return 'attendance';
      case 'quiz':
      case 'result':
        return 'quizzes';
      case 'reply':
        return 'discussions';
      case 'approval':
        return user?.role === 'class_admin' ? 'admin' : 'timetable';
      default:
        return 'announcements';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'timetable':
        return <Calendar className="w-3.5 h-3.5 text-[#C65D32]" />;
      case 'classroom':
        return <MapPin className="w-3.5 h-3.5 text-[#C65D32]" />;
      case 'announcement':
      case 'exam':
        return <Megaphone className="w-3.5 h-3.5 text-[#C65D32]" />;
      case 'notes':
        return <BookOpen className="w-3.5 h-3.5 text-[#F5F0E6]" />;
      case 'assignment':
        return <FileCheck2 className="w-3.5 h-3.5 text-[#C65D32]" />;
      case 'attendance':
        return <Activity className="w-3.5 h-3.5 text-[#10B981]" />;
      case 'quiz':
      case 'result':
        return <Award className="w-3.5 h-3.5 text-[#C65D32]" />;
      case 'reply':
        return <MessagesSquare className="w-3.5 h-3.5 text-[#F5F0E6]" />;
      case 'approval':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-8 py-3.5 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E5DCCB] flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Page Context */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl bg-white border border-[#E5DCCB] text-[#171717] hover:bg-[#F5F0E6] lg:hidden"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-[#171717] tracking-tight">
              {currentTabName}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#171717] text-[#F5F0E6] font-semibold hidden sm:inline-block">
              {user?.section || '1CSE22'}
            </span>
          </div>
          <p className="text-[11px] text-[#5C554B] hidden md:block">
            Sapthagiri NPS University &bull; Dept. of CSE &bull; Class Advisor: <strong className="text-[#171717]">Mr. Prathap M S</strong>
          </p>
        </div>
      </div>

      {/* Right Controls: Notifications & User Profile Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-2xl bg-white border border-[#E5DCCB] text-[#171717] hover:border-[#C65D32] hover:text-[#C65D32] transition-colors shadow-sm"
            title="Live Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C65D32] px-1 text-[10px] font-black text-[#F5F0E6] shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout (Ink Black 30% panel with Burnt Orange highlights) */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-[#171717] border border-[#2E2E2E] p-4 text-[#F5F0E6] z-50 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2C]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#C65D32]/20 text-[#C65D32]">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#F5F0E6]">Live Notifications</span>
                </div>
                {unreadCount > 0 && user && (
                  <button
                    onClick={async () => {
                      await notificationService.markAllAsRead(user.id);
                      onRefreshNotifications();
                    }}
                    className="text-[11px] text-[#C65D32] hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto mt-2 space-y-2 pr-0.5">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs text-[#9E978C]">No notifications yet.</p>
                    <p className="text-[10px] text-[#666666] mt-0.5">You're completely up to date.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={async () => {
                        await notificationService.markAsRead(n.id);
                        onRefreshNotifications();
                        if (onSelectTab) {
                          onSelectTab(getTabForNotification(n.notification_type));
                        }
                        setShowNotifications(false);
                      }}
                      className={`p-2.5 rounded-2xl cursor-pointer text-xs transition-colors border flex items-start gap-2.5 ${
                        n.is_read
                          ? 'bg-[#1F1F1F] border-[#292929] text-[#9E978C] hover:bg-[#262626]'
                          : 'bg-[#262626] border-[#C65D32]/40 text-[#F5F0E6] hover:border-[#C65D32]'
                      }`}
                    >
                      <div className="p-1.5 rounded-xl bg-[#171717] border border-[#333333] shrink-0 mt-0.5">
                        {getNotificationIcon(n.notification_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1 mb-1">
                          <span className="text-[11px] font-bold text-[#F5F0E6] truncate">{n.title}</span>
                          <span className="text-[10px] text-[#9E978C] shrink-0 font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-[#C4BCB0] text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu / Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white border border-[#E5DCCB] hover:border-[#C65D32] transition-all shadow-sm"
          >
            <UserAvatar name={user?.full_name} role={user?.role} size="sm" />
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-[#171717] truncate max-w-[130px]">{user?.full_name}</div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold border ${roleInfo.bg}`}>
                  {user?.student_id || roleInfo.label}
                </span>
                {user?.approval_status === 'pending' && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 border border-amber-500/30 font-bold">
                    PENDING
                  </span>
                )}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#5C554B]" />
          </button>

          {/* User Switcher Dropdown (Ink Black container) */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-[#171717] border border-[#2E2E2E] p-3 text-[#F5F0E6] z-50 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="px-2 py-2 border-b border-[#2C2C2C] mb-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#9E978C] font-bold">Account Switcher</p>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-[#C65D32]/20 text-[#C65D32] border border-[#C65D32]/40'}`}>
                    {isSupabaseConfigured ? 'SECURE AUTH' : 'DEMO SANDBOX'}
                  </span>
                </div>
                <p className="text-xs text-[#C4BCB0] mt-1">
                  {isSupabaseConfigured
                    ? 'Session is bound to Supabase Auth.'
                    : 'Switch persona in local demo sandbox:'}
                </p>
              </div>

              {!isSupabaseConfigured && (
                <div className="space-y-1 max-h-60 overflow-y-auto pr-0.5">
                  {availableUsers.map((u) => {
                    const isCurrent = u.id === user?.id;
                    const isPending = u.approval_status === 'pending';
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-2xl text-xs transition-colors ${
                          isCurrent
                            ? 'bg-[#C65D32] text-[#F5F0E6] font-semibold'
                            : 'hover:bg-[#242424] text-[#C4BCB0]'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-left truncate">
                          <UserAvatar name={u.full_name} role={u.role} size="xs" />
                          <div className="truncate">
                            <p className="truncate text-xs font-bold text-[#F5F0E6]">{u.full_name}</p>
                            <p className="text-[10px] text-[#9E978C] font-mono capitalize">
                              {u.role.replace('_', ' ')} &bull; {u.student_id}
                            </p>
                          </div>
                        </div>
                        {isPending && (
                          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            PENDING
                          </span>
                        )}
                        {isCurrent && <Check className="w-3.5 h-3.5 text-[#F5F0E6]" />}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 mt-2 border-t border-[#2C2C2C] flex flex-col gap-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenRegisterModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-[#C65D32] hover:bg-[#C65D32]/10 transition-colors font-semibold"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register New Student ID</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out ({user?.student_id || 'Account'})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
