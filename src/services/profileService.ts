import { realtimeBus } from '../lib/supabase';
import { dbStore } from './mockDatabase';
import { UserProfile, RegistrationRequest, ApprovalStatus } from '../types';

export const profileService = {
  // Get all registration requests with attached profile info
  async getRegistrationRequests(): Promise<RegistrationRequest[]> {
    return dbStore.registrationRequests.map((req) => {
      const profile = dbStore.profiles.find((p) => p.id === req.user_id);
      return {
        ...req,
        profile,
      };
    });
  },

  // Admin approves or rejects a registration request
  async reviewRegistration(
    requestId: string,
    action: 'approve' | 'reject',
    reviewerId: string,
    notes?: string
  ): Promise<boolean> {
    const request = dbStore.registrationRequests.find((r) => r.id === requestId);
    if (!request) return false;

    const newStatus: ApprovalStatus = action === 'approve' ? 'approved' : 'rejected';
    request.status = newStatus;
    request.reviewed_by = reviewerId;
    request.reviewed_at = new Date().toISOString();
    if (notes) request.notes = notes;

    const userProfile = dbStore.profiles.find((p) => p.id === request.user_id);
    if (userProfile) {
      userProfile.approval_status = newStatus;
      userProfile.updated_at = new Date().toISOString();
    }

    dbStore.persist();

    // Send notification to user
    if (userProfile) {
      dbStore.notifications.push({
        id: `notif-${Date.now()}`,
        user_id: userProfile.id,
        title: action === 'approve' ? 'Account Approved!' : 'Registration Update',
        message:
          action === 'approve'
            ? 'Your SmartClassroom 2.0 registration has been approved. You now have full access to class modules.'
            : 'Your registration request could not be approved at this time. Please contact administration.',
        notification_type: 'approval',
        is_read: false,
        created_at: new Date().toISOString(),
      });
      dbStore.persist();
    }

    realtimeBus.emit('registration_reviewed', { requestId, status: newStatus });
    return true;
  },

  // Update profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const profile = dbStore.profiles.find((p) => p.id === userId);
    if (!profile) return null;

    // Security check: cannot elevate own role via updateProfile!
    if (updates.role && updates.role !== profile.role) {
      delete updates.role;
    }

    Object.assign(profile, updates, { updated_at: new Date().toISOString() });
    dbStore.persist();
    realtimeBus.emit('profile_updated', profile);
    return profile;
  },

  // Admin summary metrics
  async getAdminStats() {
    const totalStudents = dbStore.profiles.filter((p) => p.role === 'student' && p.approval_status === 'approved').length;
    const totalFaculty = dbStore.profiles.filter((p) => p.role === 'faculty').length;
    const pendingRegistrations = dbStore.registrationRequests.filter((r) => r.status === 'pending').length;
    const totalAnnouncements = dbStore.announcements.length;
    const totalNotes = dbStore.notes.length;
    const totalAssignments = dbStore.assignments.length;
    const totalAttendanceSessions = dbStore.attendanceSessions.length;
    const totalQuizAttempts = dbStore.quizAttempts.length;

    // Calculate class average attendance
    const totalCounted = dbStore.attendanceRecords.filter((r) => r.status === 'present' || r.status === 'absent').length;
    const totalPresent = dbStore.attendanceRecords.filter((r) => r.status === 'present').length;
    const avgAttendance = totalCounted > 0 ? Number(((totalPresent / totalCounted) * 100).toFixed(1)) : 85.0;

    return {
      totalStudents,
      totalFaculty,
      pendingRegistrations,
      totalAnnouncements,
      totalNotes,
      totalAssignments,
      totalAttendanceSessions,
      totalQuizAttempts,
      avgAttendance,
    };
  }
};
