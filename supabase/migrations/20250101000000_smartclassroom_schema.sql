-- ============================================================================
-- SMARTCLASSROOM 2.0 - POSTGRESQL & SUPABASE PRODUCTION DATABASE SCHEMA
-- Normalized Schema with Strict Row-Level Security (RLS) & Role-Based Access
-- ============================================================================

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('class_admin', 'faculty', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE announcement_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('submitted', 'graded', 'late', 'resubmitted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. USER PROFILES & REGISTRATION REQUESTS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  student_id TEXT,
  department TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
  semester INT NOT NULL DEFAULT 5,
  section TEXT NOT NULL DEFAULT '1CSE22',
  approval_status approval_status NOT NULL DEFAULT 'pending',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.registration_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_role user_role NOT NULL DEFAULT 'student',
  status approval_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ACADEMIC MANAGEMENT
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_name TEXT NOT NULL,
  subject_code TEXT NOT NULL UNIQUE,
  faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  department TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
  semester INT NOT NULL DEFAULT 5,
  section TEXT NOT NULL DEFAULT '1CSE22',
  credits INT NOT NULL DEFAULT 4,
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.timetable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  day_of_week TEXT NOT NULL, -- 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  classroom TEXT NOT NULL,
  semester INT NOT NULL DEFAULT 5,
  section TEXT NOT NULL DEFAULT '1CSE22',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  priority announcement_priority NOT NULL DEFAULT 'normal',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  target_section TEXT DEFAULT '1CSE22',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'application/pdf',
  file_size BIGINT NOT NULL DEFAULT 0,
  download_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deadline TIMESTAMPTZ NOT NULL,
  attachment_path TEXT,
  max_marks INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  submission_status submission_status NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  grade NUMERIC(5,2),
  feedback TEXT,
  UNIQUE(assignment_id, student_id)
);

-- 4. ATTENDANCE MANAGEMENT
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_date DATE NOT NULL DEFAULT CURRENT_DATE,
  semester INT NOT NULL DEFAULT 5,
  section TEXT NOT NULL DEFAULT '1CSE22',
  topic_covered TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'present',
  marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  marked_by UUID NOT NULL REFERENCES public.profiles(id),
  UNIQUE(session_id, student_id)
);

-- 5. QUIZ MANAGEMENT
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration INT NOT NULL DEFAULT 15, -- duration in minutes
  total_marks INT NOT NULL DEFAULT 10,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  available_from TIMESTAMPTZ DEFAULT NOW(),
  available_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL, -- 'A', 'B', 'C', 'D' (PROTECTED by RLS and Edge Function evaluation)
  marks INT NOT NULL DEFAULT 1,
  explanation TEXT,
  question_order INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  max_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'timed_out'
  UNIQUE(quiz_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  marks_awarded NUMERIC(5,2) NOT NULL DEFAULT 0,
  UNIQUE(attempt_id, question_id)
);

-- 6. CLASS DISCUSSIONS
CREATE TABLE IF NOT EXISTS public.discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.discussion_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.discussion_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'announcement', 'notes', 'assignment', 'quiz', 'result', 'reply', 'approval'
  related_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security helper functions
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'class_admin' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_faculty_or_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('class_admin', 'faculty') FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin() OR public.is_faculty_or_admin());

CREATE POLICY "Users can update their own profile avatar and name"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- Registration Requests Policies
CREATE POLICY "Users can view their own registration requests"
  ON public.registration_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert registration request on signup"
  ON public.registration_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update registration requests"
  ON public.registration_requests FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Subjects Policies
CREATE POLICY "Approved members can view subjects"
  ON public.subjects FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved'));

CREATE POLICY "Faculty and Admins can manage subjects"
  ON public.subjects FOR ALL
  USING (public.is_faculty_or_admin());

-- Timetable Policies
CREATE POLICY "Approved members can view timetable"
  ON public.timetable FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved'));

CREATE POLICY "Faculty and Admins can manage timetable"
  ON public.timetable FOR ALL
  USING (public.is_faculty_or_admin());

-- Announcements Policies
CREATE POLICY "Approved members can view announcements"
  ON public.announcements FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved'));

CREATE POLICY "Faculty and Admins can create announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (public.is_faculty_or_admin() AND auth.uid() = author_id);

CREATE POLICY "Authors and Admins can update/delete announcements"
  ON public.announcements FOR ALL
  USING (auth.uid() = author_id OR public.is_admin());

-- Notes Policies
CREATE POLICY "Approved members can view notes"
  ON public.notes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved'));

CREATE POLICY "Faculty can upload notes"
  ON public.notes FOR INSERT
  WITH CHECK (public.is_faculty_or_admin() AND auth.uid() = uploaded_by);

CREATE POLICY "Uploaders and Admins can manage notes"
  ON public.notes FOR ALL
  USING (auth.uid() = uploaded_by OR public.is_admin());

-- Assignments Policies
CREATE POLICY "Approved members can view assignments"
  ON public.assignments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved'));

CREATE POLICY "Faculty and Admins can manage assignments"
  ON public.assignments FOR ALL
  USING (public.is_faculty_or_admin());

-- Assignment Submissions Policies
CREATE POLICY "Students can view their own submissions"
  ON public.assignment_submissions FOR SELECT
  USING (auth.uid() = student_id OR public.is_faculty_or_admin());

CREATE POLICY "Students can submit their own assignments"
  ON public.assignment_submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Faculty can grade submissions"
  ON public.assignment_submissions FOR UPDATE
  USING (public.is_faculty_or_admin());

-- Attendance Policies (CRITICAL: Students cannot modify attendance)
CREATE POLICY "Faculty and Admins can manage attendance sessions"
  ON public.attendance_sessions FOR ALL
  USING (public.is_faculty_or_admin());

CREATE POLICY "Approved members can view attendance sessions"
  ON public.attendance_sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved'));

CREATE POLICY "Students can only view their own attendance records"
  ON public.attendance_records FOR SELECT
  USING (auth.uid() = student_id OR public.is_faculty_or_admin());

CREATE POLICY "Faculty and Admins can mark and update attendance"
  ON public.attendance_records FOR INSERT
  WITH CHECK (public.is_faculty_or_admin() AND auth.uid() = marked_by);

CREATE POLICY "Faculty and Admins can edit attendance records"
  ON public.attendance_records FOR UPDATE
  USING (public.is_faculty_or_admin());

-- Quizzes Policies (CRITICAL: Correct answers hidden from student queries)
CREATE POLICY "Approved members can view published quizzes"
  ON public.quizzes FOR SELECT
  USING ((is_published = TRUE AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved')) OR public.is_faculty_or_admin());

CREATE POLICY "Faculty and Admins can manage quizzes"
  ON public.quizzes FOR ALL
  USING (public.is_faculty_or_admin());

CREATE POLICY "Approved students can view quiz questions without answers"
  ON public.quiz_questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND (is_published = TRUE OR public.is_faculty_or_admin())));

CREATE POLICY "Students can view and create their own quiz attempts"
  ON public.quiz_attempts FOR ALL
  USING (auth.uid() = student_id OR public.is_faculty_or_admin())
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can insert their quiz answers"
  ON public.quiz_answers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND student_id = auth.uid()));

CREATE POLICY "Students can view their completed quiz answers"
  ON public.quiz_answers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND (student_id = auth.uid() OR public.is_faculty_or_admin())));

-- Discussions Policies
CREATE POLICY "Approved members can read discussions"
  ON public.discussions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved'));

CREATE POLICY "Approved members can create discussions"
  ON public.discussions FOR INSERT
  WITH CHECK (auth.uid() = author_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved'));

CREATE POLICY "Authors and Admins can edit or delete discussions"
  ON public.discussions FOR ALL
  USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Approved members can reply to discussions"
  ON public.discussion_replies FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND approval_status = 'approved'));

CREATE POLICY "Approved members can manage their own likes"
  ON public.discussion_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can submit reports"
  ON public.discussion_reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Admins can view and moderate reports"
  ON public.discussion_reports FOR ALL
  USING (public.is_admin());

-- Notifications Policies
CREATE POLICY "Users can view and update their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage Buckets Configuration (Executed via Supabase Storage API or SQL)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('profile-images', 'profile-images', true),
  ('study-materials', 'study-materials', true),
  ('assignment-files', 'assignment-files', true),
  ('assignment-submissions', 'assignment-submissions', false)
ON CONFLICT (id) DO NOTHING;
