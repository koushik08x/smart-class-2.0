/**
 * SmartClassroom 2.0 - Core TypeScript Definitions
 * Aligned with PostgreSQL Database Schema & Supabase Data Model
 */

export type UserRole = 'super_admin' | 'class_admin' | 'faculty' | 'student';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type AttendanceStatus = 'present' | 'absent' | 'excused';
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';
export type SubmissionStatus = 'submitted' | 'graded' | 'late' | 'resubmitted';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  student_id?: string;
  department: string;
  semester: number;
  section: string;
  approval_status: ApprovalStatus;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationRequest {
  id: string;
  user_id: string;
  requested_role: UserRole;
  status: ApprovalStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
  profile?: UserProfile;
}

export interface Subject {
  id: string;
  subject_name: string;
  subject_code: string;
  faculty_id?: string;
  faculty_name?: string;
  department: string;
  semester: number;
  section: string;
  credits: number;
  color: string;
  created_at: string;
}

export interface TimetableSlot {
  id: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  subject_abbr?: string;
  color?: string;
  faculty_id?: string;
  faculty_name?: string;
  day_of_week: string; // 'Day 1' | 'Day 2' | 'Day 3' | 'Day 4' | 'Day 5' | 'Monday' ...
  period_label?: string; // 'P1', 'P2', 'P3–P4', etc.
  start_time: string; // e.g. "08:30"
  end_time: string;   // e.g. "09:30"
  classroom?: string; // EXACT: Never invent missing room numbers
  batch_info?: string; // e.g. 'B1: Mrs. Prajwala Y M | B2: Dr. Saravanan V'
  is_break?: boolean;
  semester: number;
  section: string;
  is_live?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  author_id: string;
  author_name?: string;
  author_role?: UserRole;
  priority: AnnouncementPriority;
  is_pinned: boolean;
  target_section?: string;
  created_at: string;
  updated_at: string;
}

export interface StudyNote {
  id: string;
  title: string;
  description?: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  uploaded_by: string;
  author_name?: string;
  file_path: string;
  file_type: string;
  file_size: number;
  download_count: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  faculty_id: string;
  faculty_name?: string;
  deadline: string;
  attachment_path?: string;
  max_marks: number;
  created_at: string;
  user_submission?: AssignmentSubmission;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name?: string;
  file_path: string;
  file_name: string;
  submission_status: SubmissionStatus;
  submitted_at: string;
  grade?: number;
  feedback?: string;
}

export interface AttendanceSession {
  id: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  faculty_id: string;
  faculty_name?: string;
  class_date: string;
  semester: number;
  section: string;
  topic_covered?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  student_name?: string;
  status: AttendanceStatus;
  marked_at: string;
  marked_by: string;
  session?: AttendanceSession;
}

export interface AttendanceTelemetry {
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  excusedClasses: number;
  percentage: number;
  isBelowThreshold: boolean; // < 75%
  consecutiveClassesNeeded: number; // calculated mathematically
  subjectWise: {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    total: number;
    present: number;
    absent: number;
    percentage: number;
  }[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  created_by: string;
  author_name?: string;
  duration: number; // in minutes
  total_marks: number;
  is_published: boolean;
  available_from?: string;
  available_until?: string;
  created_at: string;
  user_attempt?: QuizAttempt;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer?: string; // Hidden on client for students
  marks: number;
  explanation?: string;
  question_order: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  student_name?: string;
  score: number;
  max_score: number;
  started_at: string;
  submitted_at?: string;
  status: 'in_progress' | 'completed' | 'timed_out';
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  marks_awarded: number;
}

export interface Discussion {
  id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  author_avatar?: string;
  subject_id?: string;
  subject_name?: string;
  title: string;
  content: string;
  is_pinned: boolean;
  likes_count: number;
  replies_count: number;
  has_liked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'announcement' | 'notes' | 'assignment' | 'quiz' | 'result' | 'reply' | 'approval';
  related_id?: string;
  is_read: boolean;
  created_at: string;
}
