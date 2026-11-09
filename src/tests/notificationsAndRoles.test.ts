import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore, DEFAULT_DEMO_PASSWORD } from '../services/mockDatabase';
import { notificationService } from '../services/notificationService';
import { timetableService } from '../services/timetableService';
import { attendanceService } from '../services/attendanceService';
import { assignmentService } from '../services/assignmentService';
import { notesService } from '../services/notesService';
import { announcementService } from '../services/announcementService';

describe('Automatic Realtime Notifications & Role Segregation Tests', () => {
  beforeEach(() => {
    dbStore.resetToDefault();
    localStorage.clear();
  });

  describe('Feature 2: Automated Academic Notifications', () => {
    it('automatically notifies all students in section 1CSE22 on classroom allocation changes', async () => {
      const studentProfiles = dbStore.profiles.filter(
        (p) => p.role === 'student' && p.section === '1CSE22' && p.approval_status === 'approved'
      );
      expect(studentProfiles.length).toBeGreaterThan(0);

      const targetSlot = dbStore.timetable[0];
      const updatedSlot = await timetableService.updateClassroom(targetSlot.id, 'Room 504 - Advanced Systems Lab', '1CSE22');
      expect(updatedSlot?.classroom).toBe('Room 504 - Advanced Systems Lab');

      // Verify that every student received the classroom change alert
      for (const student of studentProfiles) {
        const studentNotifs = await notificationService.getNotifications(student.id);
        const match = studentNotifs.find((n) => n.notification_type === 'classroom' && n.related_id === targetSlot.id);
        expect(match).toBeDefined();
        expect(match?.title).toContain('Classroom Change');
        expect(match?.message).toContain('Room 504 - Advanced Systems Lab');
      }
    });

    it('automatically notifies students on timetable timing modifications', async () => {
      const student = dbStore.profiles.find((p) => p.student_id === '26CS1042')!;
      const targetSlot = dbStore.timetable[1];

      await timetableService.updateTimetableSlot(targetSlot.id, {
        start_time: '09:45',
        end_time: '10:45',
      }, '1CSE22');

      const notifs = await notificationService.getNotifications(student.id);
      const match = notifs.find((n) => n.notification_type === 'timetable' && n.related_id === targetSlot.id);
      expect(match).toBeDefined();
      expect(match?.message).toContain('09:45-10:45');
    });

    it('broadcasts high-priority examination alerts to all section students', async () => {
      const student = dbStore.profiles.find((p) => p.student_id === '26CS1042')!;
      await timetableService.publishExamScheduleChange({
        title: 'Semester 1 IA-1 Physics Schedule',
        message: 'Exam begins at 10:00 AM on Monday in Block B.',
        section: '1CSE22',
      });

      const notifs = await notificationService.getNotifications(student.id);
      const examAlert = notifs.find((n) => n.notification_type === 'exam');
      expect(examAlert).toBeDefined();
      expect(examAlert?.title).toContain('Semester 1 IA-1');
    });

    it('dispatches general attendance update and targeted absent warning alerts', async () => {
      const presentStudent = dbStore.profiles.find((p) => p.student_id === '26CS1042')!;
      const absentStudent = dbStore.profiles.find((p) => p.student_id === '26CS1055')!;
      const faculty = dbStore.profiles.find((p) => p.role === 'faculty')!;

      await attendanceService.markSessionAttendance({
        subjectId: dbStore.subjects[0].id,
        facultyId: faculty.id,
        date: '2026-10-15',
        topicCovered: 'Unit 2: Pointer Arithmetic',
        records: [
          { studentId: presentStudent.id, status: 'present' },
          { studentId: absentStudent.id, status: 'absent' },
        ],
      });

      // Present student should get general attendance update
      const presentNotifs = await notificationService.getNotifications(presentStudent.id);
      expect(presentNotifs.some((n) => n.notification_type === 'attendance')).toBe(true);

      // Absent student should receive targeted absent warning
      const absentNotifs = await notificationService.getNotifications(absentStudent.id);
      const warningNotif = absentNotifs.find((n) => n.title.includes('Absent'));
      expect(warningNotif).toBeDefined();
      expect(warningNotif?.message).toContain('75%');
    });

    it('automatically notifies students when a new assignment is created', async () => {
      const student = dbStore.profiles.find((p) => p.student_id === '26CS1042')!;
      const faculty = dbStore.profiles.find((p) => p.role === 'faculty')!;

      const asg = await assignmentService.createAssignment({
        title: 'Operating Systems Semaphore Synchronization',
        description: 'Implement producer-consumer problem using semaphores.',
        subjectId: dbStore.subjects[0].id,
        facultyId: faculty.id,
        facultyName: faculty.full_name,
        deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
        maxMarks: 30,
      });

      const notifs = await notificationService.getNotifications(student.id);
      const asgNotif = notifs.find((n) => n.notification_type === 'assignment' && n.related_id === asg.id);
      expect(asgNotif).toBeDefined();
      expect(asgNotif?.title).toContain('Operating Systems Semaphore');
    });

    it('notifies students when assignment deadline is extended', async () => {
      const student = dbStore.profiles.find((p) => p.student_id === '26CS1042')!;
      const asg = dbStore.assignments[0];
      const newDeadline = new Date(Date.now() + 86400000 * 7).toISOString();

      await assignmentService.updateAssignmentDeadline(asg.id, newDeadline);

      const notifs = await notificationService.getNotifications(student.id);
      const deadlineNotif = notifs.find((n) => n.title.includes('Deadline Updated'));
      expect(deadlineNotif).toBeDefined();
    });

    it('prevents duplicate notifications for the same event and student', async () => {
      const student = dbStore.profiles.find((p) => p.student_id === '26CS1042')!;
      const eventPayload = {
        title: 'Duplicate Prevention Test Notice',
        message: 'This is a unique test alert.',
        notificationType: 'announcement' as const,
        relatedId: 'event-unique-999',
        targetSection: '1CSE22',
      };

      // Dispatch twice
      await notificationService.dispatchAcademicNotification(eventPayload);
      await notificationService.dispatchAcademicNotification(eventPayload);

      const notifs = await notificationService.getNotifications(student.id);
      const count = notifs.filter((n) => n.related_id === 'event-unique-999').length;
      expect(count).toBe(1);
    });

    it('marks single and all notifications as read', async () => {
      const student = dbStore.profiles.find((p) => p.student_id === '26CS1042')!;
      const notifs = await notificationService.getNotifications(student.id);
      expect(notifs.length).toBeGreaterThan(0);

      // Mark single as read
      await notificationService.markAsRead(notifs[0].id);
      let updated = await notificationService.getNotifications(student.id);
      expect(updated.find((n) => n.id === notifs[0].id)?.is_read).toBe(true);

      // Mark all as read
      await notificationService.markAllAsRead(student.id);
      updated = await notificationService.getNotifications(student.id);
      const unread = updated.filter((n) => !n.is_read);
      expect(unread.length).toBe(0);
    });
  });

  describe('Feature 1: Three-Role Architecture & Access Verification', () => {
    it('verifies that only 3 distinct roles exist in the system', () => {
      const allowedRoles = new Set(['class_admin', 'faculty', 'student']);
      for (const profile of dbStore.profiles) {
        expect(allowedRoles.has(profile.role)).toBe(true);
      }
    });

    it('verifies Class Admin has control over timetable modifications', async () => {
      const classAdmin = dbStore.profiles.find((p) => p.role === 'class_admin')!;
      expect(classAdmin.role).toBe('class_admin');

      const slot = dbStore.timetable[0];
      const res = await timetableService.updateClassroom(slot.id, 'Room 402 - Main Campus', '1CSE22');
      expect(res?.classroom).toBe('Room 402 - Main Campus');
    });

    it('verifies student cannot delete announcements', async () => {
      const student = dbStore.profiles.find((p) => p.role === 'student')!;
      const ann = dbStore.announcements[0];

      // Student attempt to delete
      const deleted = await announcementService.deleteAnnouncement(ann.id, student.id, student.role);
      expect(deleted).toBe(false);
      expect(dbStore.announcements.some((a) => a.id === ann.id)).toBe(true);
    });

    it('verifies class_admin can moderate announcements', async () => {
      const classAdmin = dbStore.profiles.find((p) => p.role === 'class_admin')!;
      const newAnn = await announcementService.createAnnouncement({
        title: 'Notice to be Deleted by Admin',
        description: 'Test body',
        authorId: 'some-other-id',
        authorName: 'Other',
        authorRole: 'faculty',
        priority: 'normal',
        isPinned: false,
        targetSection: '1CSE22',
      });

      const deleted = await announcementService.deleteAnnouncement(newAnn.id, classAdmin.id, classAdmin.role);
      expect(deleted).toBe(true);
      expect(dbStore.announcements.some((a) => a.id === newAnn.id)).toBe(false);
    });
  });
});
