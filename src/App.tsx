import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { FloatingHUD, DashboardTab } from './components/FloatingHUD';
import { TodayTimetableSection } from './components/TodayTimetableSection';
import { AnnouncementsSection } from './components/AnnouncementsSection';
import { StudyMaterialsSection } from './components/StudyMaterialsSection';
import { AssignmentsSection } from './components/AssignmentsSection';
import { AttendanceSection } from './components/AttendanceSection';
import { DailyQuizzesSection } from './components/DailyQuizzesSection';
import { ClassDiscussionsSection } from './components/ClassDiscussionsSection';
import { AdminDashboardSection } from './components/AdminDashboardSection';
import { PendingApprovalView } from './components/PendingApprovalView';
import { SupabaseInfoModal } from './components/SupabaseInfoModal';
import { RegistrationModal } from './components/RegistrationModal';
import { StudentLoginView } from './components/StudentLoginView';
import { notificationService } from './services/notificationService';
import { NotificationItem } from './types';

function DashboardContent() {
  const { user, isApproved, isAdmin, isFaculty, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('timetable');
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = () => {
    if (user) {
      notificationService.getNotifications(user.id).then(setNotifications);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  // If user switches away from admin tab when not authorized, reset to timetable
  useEffect(() => {
    if (activeTab === 'admin' && !isAdmin && !isFaculty) {
      setActiveTab('timetable');
    }
  }, [isAdmin, isFaculty, activeTab]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading SmartClassroom 2.0...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, show the Student Login Portal
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
    <div className="min-h-screen bg-[#070913] text-[#e1e1f1] relative selection:bg-[#8B5CF6]/30 selection:text-[#acedff] flex flex-col justify-between">
      {/* Vision Lumina Multi-Point Cosmic Glow Backdrops */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/12 blur-[120px]" />
        <div className="absolute top-[35%] -right-[10%] w-[550px] h-[550px] rounded-full bg-[#06B6D4]/10 blur-[130px]" />
        <div className="absolute -bottom-[10%] left-[25%] w-[600px] h-[600px] rounded-full bg-[#6366F1]/10 blur-[140px]" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Spatial Top Header - backend console hidden from main header */}
        <Header
          onOpenRegisterModal={() => setShowRegisterModal(true)}
          notifications={notifications}
          onRefreshNotifications={loadNotifications}
        />

        {/* Main Content Viewport */}
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6 pb-28 flex-1">
          {!isApproved ? (
            /* Protected Route Enforcing Approval Workflow */
            <PendingApprovalView />
          ) : (
            /* Approved Classroom Hub */
            <div className="animate-in fade-in duration-300">
              {activeTab === 'timetable' && <TodayTimetableSection />}
              {activeTab === 'announcements' && <AnnouncementsSection />}
              {activeTab === 'notes' && <StudyMaterialsSection />}
              {activeTab === 'assignments' && <AssignmentsSection />}
              {activeTab === 'attendance' && <AttendanceSection />}
              {activeTab === 'quizzes' && <DailyQuizzesSection />}
              {activeTab === 'discussions' && <ClassDiscussionsSection />}
              {activeTab === 'admin' && (isAdmin || isFaculty) && (
                <AdminDashboardSection onOpenBackendConsole={() => setShowSupabaseModal(true)} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Floating Spatial HUD Navigation Bar */}
      {isApproved && (
        <FloatingHUD activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {/* Backend Console Modal - only opened by authorized admin from Admin Deck */}
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
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
