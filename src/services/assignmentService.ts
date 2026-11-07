import { supabase, isSupabaseConfigured, realtimeBus } from '../lib/supabase';
import { dbStore } from './mockDatabase';
import { Assignment, AssignmentSubmission } from '../types';
import { storageService } from './storageService';

export const assignmentService = {
  // Fetch assignments with student submission status attached
  async getAssignments(studentId?: string): Promise<Assignment[]> {
    const targetStudentId = studentId || localStorage.getItem('sc2_active_user_id') || '00000000-0000-0000-0000-000000000010';

    return dbStore.assignments.map((asg) => {
      // Find submission in assignment_submissions or on assignment object
      const sub = asg.user_submission?.student_id === targetStudentId ? asg.user_submission : undefined;
      return {
        ...asg,
        user_submission: sub,
      };
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  },

  // Student submit assignment
  async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    studentName: string;
    file: File;
  }): Promise<{ submission: AssignmentSubmission; error?: string }> {
    const uploadRes = await storageService.uploadFile({
      bucket: 'assignment-submissions',
      file: data.file,
      allowedTypes: ['.zip', '.tar.gz', '.c', '.cpp', '.py', '.pdf', '.sql'],
      maxSizeMB: 30,
    });

    if (uploadRes.error) {
      return { submission: {} as any, error: uploadRes.error };
    }

    const assignment = dbStore.assignments.find((a) => a.id === data.assignmentId);
    if (!assignment) {
      return { submission: {} as any, error: 'Assignment not found' };
    }

    const isLate = new Date() > new Date(assignment.deadline);

    const newSubmission: AssignmentSubmission = {
      id: `subm-${Date.now()}`,
      assignment_id: data.assignmentId,
      student_id: data.studentId,
      student_name: data.studentName,
      file_path: uploadRes.path,
      file_name: data.file.name,
      submission_status: isLate ? 'late' : 'submitted',
      submitted_at: new Date().toISOString(),
    };

    assignment.user_submission = newSubmission;
    dbStore.persist();

    realtimeBus.emit('assignment_submitted', { assignmentId: data.assignmentId, submission: newSubmission });

    // Notify faculty
    dbStore.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: assignment.faculty_id,
      title: 'New Assignment Submission',
      message: `${data.studentName} submitted "${assignment.title}".`,
      notification_type: 'assignment',
      related_id: assignment.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    dbStore.persist();

    return { submission: newSubmission };
  },

  // Faculty create assignment
  async createAssignment(data: {
    title: string;
    description: string;
    subjectId: string;
    facultyId: string;
    facultyName: string;
    deadline: string;
    maxMarks: number;
    attachmentFile?: File;
  }): Promise<Assignment> {
    let attachmentPath: string | undefined;

    if (data.attachmentFile) {
      const uploadRes = await storageService.uploadFile({
        bucket: 'assignment-files',
        file: data.attachmentFile,
        maxSizeMB: 25,
      });
      if (uploadRes.path) attachmentPath = uploadRes.path;
    }

    const subject = dbStore.subjects.find((s) => s.id === data.subjectId);
    const newAssignment: Assignment = {
      id: `asg-${Date.now()}`,
      title: data.title,
      description: data.description,
      subject_id: data.subjectId,
      subject_name: subject?.subject_name,
      subject_code: subject?.subject_code,
      faculty_id: data.facultyId,
      faculty_name: data.facultyName,
      deadline: data.deadline,
      attachment_path: attachmentPath,
      max_marks: data.maxMarks,
      created_at: new Date().toISOString(),
    };

    dbStore.assignments.unshift(newAssignment);
    dbStore.persist();

    realtimeBus.emit('assignment_created', newAssignment);

    // Notify all students
    for (const student of dbStore.profiles.filter((p) => p.role === 'student')) {
      dbStore.notifications.push({
        id: `notif-${Date.now()}-${student.id.substring(0, 4)}`,
        user_id: student.id,
        title: `New Assignment: ${data.title}`,
        message: `Due on ${new Date(data.deadline).toLocaleDateString()}. Max Marks: ${data.maxMarks}`,
        notification_type: 'assignment',
        related_id: newAssignment.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }
    dbStore.persist();

    return newAssignment;
  },

  // Faculty grade submission
  async gradeSubmission(
    assignmentId: string,
    grade: number,
    feedback: string
  ): Promise<void> {
    const assignment = dbStore.assignments.find((a) => a.id === assignmentId);
    if (assignment && assignment.user_submission) {
      assignment.user_submission.grade = grade;
      assignment.user_submission.feedback = feedback;
      assignment.user_submission.submission_status = 'graded';
      dbStore.persist();

      // Notify student
      dbStore.notifications.push({
        id: `notif-${Date.now()}`,
        user_id: assignment.user_submission.student_id,
        title: 'Assignment Graded',
        message: `Your submission for "${assignment.title}" received ${grade}/${assignment.max_marks} marks.`,
        notification_type: 'assignment',
        related_id: assignment.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
      dbStore.persist();
      realtimeBus.emit('assignment_graded', assignment);
    }
  }
};
