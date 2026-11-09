import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FloatingHUD, DashboardTab } from './components/FloatingHUD';
import { TodayTimetableSection } from './components/TodayTimetableSection';
import { AnnouncementsSection } from './components/AnnouncementsSection';
import { StudyMaterialsSection } from './components/StudyMaterialsSection';
import { AssignmentsSection } from './components/AssignmentsSection';
import { AttendanceSection } from './components/AttendanceSection';
import { DailyQuizzesSection } from './components/DailyQuizzesSection';
import { ClassDiscussionsSection } from './components/ClassDiscussionsSection';
import { AdminDashboardSection } from './components/AdminDashboardSection';
import { FacultyDashboardSection } from './components/FacultyDashboardSection';
import { PendingApprovalView } from './components/PendingApprovalView';
import { SupabaseInfoModal } from './components/SupabaseInfoModal';
import { RegistrationModal } from './components/RegistrationModal';
import { StudentLoginView } from './components/StudentLoginView';
import { notificationService } from './services/notificationService';
import { NotificationItem } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';

function DashboardContent() {
  const { user, isApproved, isAdmin, isFaculty, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('timetable');
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadNotifications = () => {
    if (user) {
      notificationService.getNotifications(user.id).then(setNotifications);
    }
  };

  useEffect(() => {
    loadNotifications();
    if (user?.id) {
      const unsubscribe = notificationService.subscribeToLiveNotifications(user.id, () => {
        loadNotifications();
      });
      return () => unsubscribe();
    }
  }, [user?.id]);

  // Strict role guards: unauthorized tab access immediately redirects to timetable
  useEffect(() => {
    if (activeTab === 'admin' && user?.role !== 'class_admin') {
      setActiveTab('timetable');
    }
    if (activeTab === 'faculty' && user?.role !== 'faculty') {
      setActiveTab('timetable');
    }
  }, [user?.role, activeTab]);

  const getTabTitle = (tab: DashboardTab): string => {
    switch (tab) {
      case 'timetable':
        return 'Academic Timetable & Lecture Streams';
      case 'announcements':
        return 'Class Announcements & Broadcasts';
      case 'notes':
        return 'Study Materials & Course Repository';
      case 'assignments':
        return 'Assignments & Project Trackers';
      case 'attendance':
        return 'Biometric Attendance & Telemetry';
      case 'quizzes':
        return 'Daily Quizzes & Leaderboard';
      case 'discussions':
        return 'Class Discussions & Forum';
      case 'admin':
        return 'Class Administration Master Deck';
      case 'faculty':
        return 'Faculty Course Management Desk';
      default:
        return 'Academic Hub';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white border border-[#E5DCCB] shadow-md">
          <div className="w-10 h-10 border-3 border-[#C65D32] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono font-bold text-[#171717] tracking-wider uppercase">Loading SmartClassroom 2.0...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, show the redesigned Student Login Portal
  if (!user) {
    return (
      <>
        <StudentLoginView onOpenRegister={() => setShowRegisterModal(true)} />
        {showRegisterModal && (
          <RegistrationModal onClose={() => setShowRegisterModal(false)} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E6] text-[#171717] flex">
      {/* 30% INK-BLACK FULL-HEIGHT FIXED SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenRegisterModal={() => setShowRegisterModal(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 60% CREAM MAIN WORKSPACE */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen w-full transition-all duration-300">
        {/* Top Header Bar */}
        <Header
          currentTabName={getTabTitle(activeTab)}
          onOpenRegisterModal={() => setShowRegisterModal(true)}
          onSelectTab={setActiveTab}
          notifications={notifications}
          onRefreshNotifications={loadNotifications}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Main Content Viewport on Warm Cream Foundation */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex-1 pb-28 lg:pb-12">
          {!isApproved ? (
            /* Protected Route Enforcing Approval Workflow */
            <PendingApprovalView onGoToAdmin={() => setActiveTab('admin')} />
          ) : (
            /* Approved Classroom Workspace */
            <div className="animate-in fade-in duration-300">
              {activeTab === 'timetable' && <TodayTimetableSection />}
              {activeTab === 'announcements' && <AnnouncementsSection />}
              {activeTab === 'notes' && <StudyMaterialsSection />}
              {activeTab === 'assignments' && <AssignmentsSection />}
              {activeTab === 'attendance' && <AttendanceSection />}
              {activeTab === 'quizzes' && <DailyQuizzesSection />}
              {activeTab === 'discussions' && <ClassDiscussionsSection />}
              {activeTab === 'admin' && isAdmin && (
                <AdminDashboardSection onOpenBackendConsole={() => setShowSupabaseModal(true)} />
              )}
              {activeTab === 'faculty' && isFaculty && (
                <FacultyDashboardSection />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Floating HUD */}
      {isApproved && (
        <FloatingHUD activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {/* Backend Console Modal */}
      {showSupabaseModal && (
        <SupabaseInfoModal onClose={() => setShowSupabaseModal(false)} />
      )}

      {/* Registration Modal */}
      {showRegisterModal && (
        <RegistrationModal onClose={() => setShowRegisterModal(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
