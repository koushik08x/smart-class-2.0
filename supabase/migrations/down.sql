-- ============================================================================
-- SMARTCLASSROOM 2.0 - DATABASE MIGRATION ROLLBACK SCRIPT (down.sql)
-- Drops all tables, views, enums, and functions in reverse dependency order
-- ============================================================================

-- 1. Drop Views
DROP VIEW IF EXISTS public.student_quiz_questions CASCADE;

-- 2. Drop Tables
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.discussion_reports CASCADE;
DROP TABLE IF EXISTS public.discussion_likes CASCADE;
DROP TABLE IF EXISTS public.discussion_replies CASCADE;
DROP TABLE IF EXISTS public.discussions CASCADE;
DROP TABLE IF EXISTS public.quiz_answers CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.quiz_questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.attendance_sessions CASCADE;
DROP TABLE IF EXISTS public.assignment_submissions CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.timetable CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.registration_requests CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. Drop Security Functions
DROP FUNCTION IF EXISTS public.is_student() CASCADE;
DROP FUNCTION IF EXISTS public.is_faculty() CASCADE;
DROP FUNCTION IF EXISTS public.is_faculty_or_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_role() CASCADE;

-- 4. Drop Custom Enum Types
DROP TYPE IF EXISTS public.submission_status CASCADE;
DROP TYPE IF EXISTS public.announcement_priority CASCADE;
DROP TYPE IF EXISTS public.attendance_status CASCADE;
DROP TYPE IF EXISTS public.approval_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
