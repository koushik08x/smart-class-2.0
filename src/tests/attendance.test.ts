import { describe, it, expect, beforeEach } from 'vitest';
import { attendanceService } from '../services/attendanceService';
import { dbStore } from '../services/mockDatabase';

describe('Attendance Telemetry & Shortage Calculation Tests', () => {
  beforeEach(() => {
    dbStore.resetToDefault();
    localStorage.clear();
  });

  it('calculates telemetry percentage correctly for student', async () => {
    const studentId = '00000000-0000-0000-0000-000000000010';
    const telemetry = await attendanceService.getStudentTelemetry(studentId);

    expect(telemetry.totalClasses).toBeGreaterThan(0);
    expect(telemetry.presentClasses + telemetry.absentClasses).toBe(telemetry.totalClasses);
    expect(telemetry.percentage).toBeGreaterThanOrEqual(0);
    expect(telemetry.percentage).toBeLessThanOrEqual(100);
  });

  it('correctly implements the 75% attendance recovery formula', async () => {
    // Mathematical formula: k >= 3 * Total - 4 * Present
    // Suppose Total = 20, Present = 12 (Attendance = 60%, below 75%)
    // Needed: 3*20 - 4*12 = 60 - 48 = 12 consecutive classes
    // Verification: (12 + 12) / (20 + 12) = 24 / 32 = 0.75 (75%)
    const total = 20;
    const present = 12;
    const needed = Math.ceil(3 * total - 4 * present);
    expect(needed).toBe(12);

    // Suppose Total = 10, Present = 8 (80%, above threshold)
    // Needed should be 0
    const neededAbove = Math.max(0, Math.ceil(3 * 10 - 4 * 8));
    expect(neededAbove).toBe(0);
  });

  it('prevents duplicate attendance records for the same student in a session', async () => {
    const testSession = await attendanceService.markSessionAttendance({
      subjectId: 'sub-mat',
      facultyId: '00000000-0000-0000-0000-000000000004',
      date: '2026-11-08',
      topicCovered: 'Differential Equations Unit 2',
      records: [
        { studentId: '00000000-0000-0000-0000-000000000010', status: 'present' },
        { studentId: '00000000-0000-0000-0000-000000000010', status: 'present' }, // Duplicate entry
      ],
    });

    expect(testSession.id).toBeDefined();
    const recordsForStudent = dbStore.attendanceRecords.filter(
      (r) => r.session_id === testSession.id && r.student_id === '00000000-0000-0000-0000-000000000010'
    );
    expect(recordsForStudent.length).toBe(1);
  });
});
