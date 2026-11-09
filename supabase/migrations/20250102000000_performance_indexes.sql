-- ============================================================================
-- SMARTCLASSROOM 2.0 - PRODUCTION DATABASE PERFORMANCE INDEXES & SECURITY VIEWS
-- Migration: 20250102000000_performance_indexes.sql
-- ============================================================================

-- 1. ATTENDANCE QUERY OPTIMIZATION INDEXES
CREATE INDEX IF NOT EXISTS idx_attendance_records_student 
  ON public.attendance_records(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_session 
  ON public.attendance_records(session_id);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_subject_date 
  ON public.attendance_sessions(subject_id, class_date DESC);

-- 2. QUIZ PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz 
  ON public.quiz_questions(quiz_id, question_order ASC);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student 
  ON public.quiz_attempts(student_id, quiz_id);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt 
  ON public.quiz_answers(attempt_id);

-- 3. DISCUSSION & COMMUNITY INDEXES
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion 
  ON public.discussion_replies(discussion_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_discussions_author 
  ON public.discussions(author_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_discussions_pinned 
  ON public.discussions(is_pinned, created_at DESC);

-- 4. ACADEMIC & NOTIFICATION QUERY INDEXES
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON public.notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_target_created 
  ON public.announcements(target_section, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notes_subject 
  ON public.notes(subject_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_timetable_day_time 
  ON public.timetable(day_of_week, start_time ASC);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student 
  ON public.assignment_submissions(student_id);

CREATE INDEX IF NOT EXISTS idx_registration_requests_status 
  ON public.registration_requests(status, created_at DESC);

-- 5. COLUMN-LEVEL SECURITY VIEW FOR STUDENT QUIZZES
-- Explicitly omits 'correct_answer' to prevent network inspection before submission
CREATE OR REPLACE VIEW public.student_quiz_questions AS
  SELECT 
    id, 
    quiz_id, 
    question, 
    option_a, 
    option_b, 
    option_c, 
    option_d, 
    marks, 
    question_order
  FROM public.quiz_questions;

GRANT SELECT ON public.student_quiz_questions TO authenticated, anon;
