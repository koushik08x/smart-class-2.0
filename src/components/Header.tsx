import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  ChevronDown,
  Sparkles,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { NotificationItem } from '../types';
import { notificationService } from '../services/notificationService';

interface HeaderProps {
  onOpenSupabaseModal?: () => void;
  onOpenRegisterModal: () => void;
  notifications: NotificationItem[];
  onRefreshNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegisterModal,
  notifications,
  onRefreshNotifications,
}) => {
  const { user, switchUser, availableUsers, logout, unreadCount } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'SUPER ADMIN', bg: 'bg-[#EC4899]/15 text-[#F472B6] border-[#EC4899]/30' };
      case 'class_admin':
        return { label: 'CLASS ADMIN', bg: 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30' };
      case 'faculty':
        return { label: 'FACULTY', bg: 'bg-[#06B6D4]/15 text-[#38BDF8] border-[#06B6D4]/30' };
      case 'student':
      default:
        return { label: 'STUDENT', bg: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 glass-panel border-b border-white/[0.08] flex items-center justify-between transition-all">
      {/* Brand & Section Indicator */}
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
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-[#06B6D4] border border-[#06B6D4]/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              {user?.section || '1CSE22'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 text-[#d0bcff] border border-purple-500/30 hidden sm:inline">
              Sem 1 (2026–2027)
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Sapthagiri NPS University &bull; Dept. of CSE &bull; Class Advisor: <strong className="text-slate-300">Mr. Prathap M S</strong>
          </p>
        </div>
      </div>

      {/* Control Nodes */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl btn-spatial-secondary text-slate-300 hover:text-white"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-lg animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-modal p-4 border border-white/15 z-50 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#8B5CF6]" />
                  <span className="text-sm font-semibold text-white">Live Notifications</span>
                </div>
                {unreadCount > 0 && user && (
                  <button
                    onClick={async () => {
                      await notificationService.markAllAsRead(user.id);
                      onRefreshNotifications();
                    }}
                    className="text-xs text-[#06B6D4] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={async () => {
                        await notificationService.markAsRead(n.id);
                        onRefreshNotifications();
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer text-xs transition-colors border ${
                        n.is_read
                          ? 'bg-white/[0.02] border-white/5 text-slate-400'
                          : 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-white font-medium'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[11px] font-semibold text-[#acedff]">{n.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
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
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl btn-spatial-secondary border border-white/10 hover:border-white/20 transition-all"
          >
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
              alt={user?.full_name || 'User'}
              className="w-7 h-7 rounded-xl object-cover ring-1 ring-white/20"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.full_name}</div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${roleInfo.bg} border`}>
                  {user?.student_id || roleInfo.label}
                </span>
                {user?.approval_status === 'pending' && (
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PENDING
                  </span>
                )}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Switcher Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-modal p-3 border border-white/15 z-50 shadow-2xl">
              <div className="px-2 py-2 border-b border-white/10 mb-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Account Switcher</p>
                <p className="text-xs text-slate-300 mt-0.5">Switch between student or faculty accounts:</p>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
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
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                        isCurrent
                          ? 'bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-white font-medium'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-left truncate">
                        <img src={u.avatar_url} className="w-6 h-6 rounded-lg object-cover" />
                        <div className="truncate">
                          <p className="truncate text-xs font-semibold text-white">{u.full_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono capitalize">
                            {u.role.replace('_', ' ')} &bull; {u.student_id}
                          </p>
                        </div>
                      </div>
                      {isPending && (
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          PENDING
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-2 border-t border-white/10 flex flex-col gap-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenRegisterModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-[#06B6D4] hover:bg-[#06B6D4]/10 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register New Student ID</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-medium"
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
