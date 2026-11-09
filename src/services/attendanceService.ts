import { supabase, isSupabaseConfigured, realtimeBus } from '../lib/supabase';
import { dbStore } from './mockDatabase';
import { AttendanceTelemetry, AttendanceRecord, AttendanceSession, AttendanceStatus } from '../types';
import { notificationService } from './notificationService';

export const attendanceService = {
  // Calculate attendance telemetry for a student
  async getStudentTelemetry(studentId: string): Promise<AttendanceTelemetry> {
    let records: AttendanceRecord[] = [];
    let sessions: AttendanceSession[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data: recData } = await supabase
          .from('attendance_records')
          .select('*, attendance_sessions(*)')
          .eq('student_id', studentId);

        const { data: sesData } = await supabase
          .from('attendance_sessions')
          .select('*');

        if (recData && sesData) {
          records = recData as any;
          sessions = sesData as any;
        }
      } catch (err) {
        console.warn('Supabase attendance query fallback to local:', err);
      }
    }

    if (records.length === 0) {
      records = dbStore.attendanceRecords.filter((r) => r.student_id === studentId);
      if (records.length === 0 && dbStore.attendanceSessions.length > 0) {
        const charCode = studentId.charCodeAt(studentId.length - 1) || 5;
        records = dbStore.attendanceSessions.map((ses, idx) => {
          const isAbsent = (idx + charCode) % 6 === 0;
          return {
            id: `rec-${studentId.slice(0, 8)}-${idx}`,
            session_id: ses.id,
            student_id: studentId,
            status: isAbsent ? 'absent' : 'present',
            marked_at: ses.created_at,
            marked_by: ses.faculty_id,
          };
        });
        dbStore.attendanceRecords.push(...records);
        dbStore.persist();
      }
      sessions = dbStore.attendanceSessions;
    }

    const totalCounted = records.filter((r) => r.status === 'present' || r.status === 'absent').length;
    const presentClasses = records.filter((r) => r.status === 'present').length;
    const absentClasses = records.filter((r) => r.status === 'absent').length;
    const excusedClasses = records.filter((r) => r.status === 'excused').length;

    const percentage = totalCounted > 0 ? Number(((presentClasses / totalCounted) * 100).toFixed(1)) : 100;
    const isBelowThreshold = percentage < 75.0;

    // Mathematical formula for consecutive classes needed to hit 75%:
    // (Present + k) / (Total + k) >= 0.75  =>  0.25k >= 0.75 * Total - Present  =>  k >= 3 * Total - 4 * Present
    let consecutiveClassesNeeded = 0;
    if (isBelowThreshold && totalCounted > 0) {
      const needed = Math.ceil(3 * totalCounted - 4 * presentClasses);
      consecutiveClassesNeeded = Math.max(0, needed);
    }

    // Subject-wise attendance calculation
    const subjectMap = new Map<string, { id: string; name: string; code: string; total: number; present: number; absent: number }>();
    for (const sub of dbStore.subjects) {
      subjectMap.set(sub.id, {
        id: sub.id,
        name: sub.subject_name,
        code: sub.subject_code,
        total: 0,
        present: 0,
        absent: 0,
      });
    }

    for (const rec of records) {
      const session = sessions.find((s) => s.id === rec.session_id);
      if (session && subjectMap.has(session.subject_id)) {
        const item = subjectMap.get(session.subject_id)!;
        if (rec.status === 'present' || rec.status === 'absent') {
          item.total += 1;
          if (rec.status === 'present') item.present += 1;
          if (rec.status === 'absent') item.absent += 1;
        }
      }
    }

    const subjectWise = Array.from(subjectMap.values()).map((sub) => {
      const pct = sub.total > 0 ? Number(((sub.present / sub.total) * 100).toFixed(1)) : 100;
      return {
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        total: sub.total,
        present: sub.present,
        absent: sub.absent,
        percentage: pct,
      };
    });

    return {
      totalClasses: totalCounted,
      presentClasses,
      absentClasses,
      excusedClasses,
      percentage,
      isBelowThreshold,
      consecutiveClassesNeeded,
      subjectWise,
    };
  },

  // Get full attendance history with session details
  async getStudentHistory(studentId: string): Promise<(AttendanceRecord & { session: AttendanceSession })[]> {
    let records = dbStore.attendanceRecords.filter((r) => r.student_id === studentId);
    if (records.length === 0 && dbStore.attendanceSessions.length > 0) {
      const charCode = studentId.charCodeAt(studentId.length - 1) || 5;
      records = dbStore.attendanceSessions.map((ses, idx) => {
        const isAbsent = (idx + charCode) % 6 === 0;
        return {
          id: `rec-${studentId.slice(0, 8)}-${idx}`,
          session_id: ses.id,
          student_id: studentId,
          status: isAbsent ? 'absent' : 'present',
          marked_at: ses.created_at,
          marked_by: ses.faculty_id,
        };
      });
      dbStore.attendanceRecords.push(...records);
      dbStore.persist();
    }
    return records.map((rec) => {
      const session = dbStore.attendanceSessions.find((s) => s.id === rec.session_id) || {
        id: rec.session_id,
        subject_id: 'sub-001',
        subject_name: 'Operating Systems',
        subject_code: 'CSE-301',
        faculty_id: rec.marked_by,
        class_date: new Date().toISOString().split('T')[0],
        semester: 5,
        section: '1CSE22',
        created_at: rec.marked_at,
      };
      return {
        ...rec,
        session,
      };
    }).sort((a, b) => new Date(b.session.class_date).getTime() - new Date(a.session.class_date).getTime());
  },

  // Faculty: create new attendance session and bulk mark students
  async markSessionAttendance(data: {
    subjectId: string;
    facultyId: string;
    date: string;
    topicCovered: string;
    records: { studentId: string; status: AttendanceStatus }[];
  }): Promise<AttendanceSession> {
    const subject = dbStore.subjects.find((s) => s.id === data.subjectId);
    const newSession: AttendanceSession = {
      id: `ses-${Date.now()}`,
      subject_id: data.subjectId,
      subject_name: subject?.subject_name,
      subject_code: subject?.subject_code,
      faculty_id: data.facultyId,
      class_date: data.date,
      semester: 5,
      section: '1CSE22',
      topic_covered: data.topicCovered,
      created_at: new Date().toISOString(),
    };

    dbStore.attendanceSessions.unshift(newSession);

    for (const r of data.records) {
      // Prevent duplicate attendance records for the same student and session
      const existingIdx = dbStore.attendanceRecords.findIndex(
        (rec) => rec.session_id === newSession.id && rec.student_id === r.studentId
      );

      const recordObj: AttendanceRecord = {
        id: `rec-${Date.now()}-${r.studentId}`,
        session_id: newSession.id,
        student_id: r.studentId,
        status: r.status,
        marked_at: new Date().toISOString(),
        marked_by: data.facultyId,
      };

      if (existingIdx >= 0) {
        dbStore.attendanceRecords[existingIdx] = recordObj;
      } else {
        dbStore.attendanceRecords.push(recordObj);
      }
    }

    dbStore.persist();
    realtimeBus.emit('attendance_updated', newSession);

    // Automatically notify relevant students using central academic notification engine
    await notificationService.dispatchAcademicNotification({
      title: `Attendance Updated: ${newSession.subject_code || newSession.subject_name}`,
      message: `Attendance marked for session on ${newSession.class_date}. Check your telemetry.`,
      notificationType: 'attendance',
      relatedId: newSession.id,
      targetSection: '1CSE22',
    });

    // Notify absent students individually
    for (const r of data.records) {
      if (r.status === 'absent') {
        await notificationService.dispatchAcademicNotification({
          title: `Attendance Alert: Absent in ${newSession.subject_code || newSession.subject_name}`,
          message: `You were marked absent on ${newSession.class_date}. Ensure attendance remains >= 75%.`,
          notificationType: 'attendance',
          relatedId: `${newSession.id}-absent-${r.studentId}`,
          targetStudentId: r.studentId,
        });
      }
    }

    return newSession;
  }
};
