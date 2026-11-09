import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { realtimeBus } from '../lib/supabase';
import { dbStore } from '../services/mockDatabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  unreadCount: number;
  availableUsers: UserProfile[];
  isAdmin: boolean;
  isFaculty: boolean;
  isStudent: boolean;
  isApproved: boolean;
  login: (identifier: string, password?: string) => Promise<{ user?: UserProfile; error?: string }>;
  switchUser: (userId: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    role: UserRole;
    studentId?: string;
    department: string;
    semester: number;
    section: string;
    password?: string;
  }) => Promise<{ user: UserProfile; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);

  const loadActiveUser = async () => {
    setIsLoading(true);
    try {
      const active = await authService.getCurrentProfile();
      setUser(active);
      setAvailableUsers([...dbStore.profiles]);
      if (active) {
        const notifs = await notificationService.getNotifications(active.id);
        setUnreadCount(notifs.filter((n) => !n.is_read).length);
      } else {
        setUnreadCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActiveUser();

    const unsubAuth = realtimeBus.subscribe('auth_state_change', (profile: UserProfile | null) => {
      setUser(profile);
      setAvailableUsers([...dbStore.profiles]);
      if (profile) {
        notificationService.getNotifications(profile.id).then((notifs) => {
          setUnreadCount(notifs.filter((n) => !n.is_read).length);
        });
      } else {
        setUnreadCount(0);
      }
    });

    const unsubProfile = realtimeBus.subscribe('profile_updated', () => {
      loadActiveUser();
    });

    const unsubReview = realtimeBus.subscribe('registration_reviewed', () => {
      loadActiveUser();
    });

    const refreshNotifications = (userId?: string) => {
      const targetId = userId || localStorage.getItem('sc2_active_user_id');
      if (targetId) {
        notificationService.getNotifications(targetId).then((notifs) => {
          setUnreadCount(notifs.filter((n) => !n.is_read).length);
        });
      }
    };

    const unsubNotif = realtimeBus.subscribe('notification_read', () => {
      refreshNotifications();
    });

    const unsubAllRead = realtimeBus.subscribe('all_notifications_read', () => {
      refreshNotifications();
    });

    const unsubDispatched = realtimeBus.subscribe('notification_dispatched', () => {
      refreshNotifications();
    });

    return () => {
      unsubAuth();
      unsubProfile();
      unsubReview();
      unsubNotif();
      unsubAllRead();
      unsubDispatched();
    };
  }, []);

  const handleLogin = async (identifier: string, password?: string) => {
    const res = await authService.login(identifier, password);
    if (res.user) {
      setUser(res.user);
      setAvailableUsers([...dbStore.profiles]);
      const notifs = await notificationService.getNotifications(res.user.id);
      setUnreadCount(notifs.filter((n) => !n.is_read).length);
    }
    return res;
  };

  const handleSwitchUser = async (userId: string) => {
    const switched = await authService.switchUser(userId);
    setUser(switched);
    const notifs = await notificationService.getNotifications(switched.id);
    setUnreadCount(notifs.filter((n) => !n.is_read).length);
  };

  const handleRegister = async (data: any) => {
    const res = await authService.register(data);
    if (!res.error) {
      setUser(res.user);
      setAvailableUsers([...dbStore.profiles]);
    }
    return res;
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setUnreadCount(0);
  };

  const refreshProfile = async () => {
    await loadActiveUser();
  };

  const isAdmin = user?.role === 'class_admin';
  const isFaculty = user?.role === 'faculty';
  const isStudent = user?.role === 'student';
  const isApproved = user?.approval_status === 'approved';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        unreadCount,
        availableUsers,
        isAdmin,
        isFaculty,
        isStudent,
        isApproved,
        login: handleLogin,
        switchUser: handleSwitchUser,
        register: handleRegister,
        logout: handleLogout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
