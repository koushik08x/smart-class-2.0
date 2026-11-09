-- ============================================================================
-- SMARTCLASSROOM 2.0 - STRICT 3-ROLE ENFORCEMENT & REALTIME NOTIFICATIONS
-- 1. CLASS ADMIN ('class_admin')
-- 2. FACULTY ('faculty')
-- 3. STUDENT ('student')
-- Elimination of super_admin across all schema domains, RLS policies, and triggers
-- ============================================================================

-- 1. MIGRATE EXISTING PROFILES FROM SUPER_ADMIN TO CLASS_ADMIN
UPDATE public.profiles
SET role = 'class_admin'
WHERE role::text = 'super_admin';

UPDATE public.registration_requests
SET requested_role = 'class_admin'
WHERE requested_role::text = 'super_admin';

-- 2. UPDATE ENUM TYPE user_role (PostgreSQL Safe Transition)
DO $$
BEGIN
  -- Alter columns using the enum to text temporarily
  ALTER TABLE public.profiles ALTER COLUMN role TYPE text;
  ALTER TABLE public.registration_requests ALTER COLUMN requested_role TYPE text;

  -- Drop existing enum type
  DROP TYPE IF EXISTS public.user_role CASCADE;

  -- Recreate enum with strictly 3 roles
  CREATE TYPE public.user_role AS ENUM ('class_admin', 'faculty', 'student');

  -- Cast columns back to new user_role enum
  ALTER TABLE public.profiles ALTER COLUMN role TYPE public.user_role USING role::public.user_role;
  ALTER TABLE public.registration_requests ALTER COLUMN requested_role TYPE public.user_role USING requested_role::public.user_role;
END $$;

-- 3. HARDEN ROLE VERIFICATION SECURITY DEFINER FUNCTIONS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Only true Class Admin accounts return true
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'class_admin' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Faculty role verification
CREATE OR REPLACE FUNCTION public.is_faculty()
RETURNS BOOLEAN AS $$
  SELECT role = 'faculty' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Student role verification
CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN AS $$
  SELECT role = 'student' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Faculty or Class Admin combined verification
CREATE OR REPLACE FUNCTION public.is_faculty_or_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('class_admin', 'faculty') FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. HARDEN TIMETABLE & CLASSROOM RLS (FEATURE 1)
-- Only Class Admin can modify timetable slots and allocate classrooms
DROP POLICY IF EXISTS "Faculty and admins can manage timetable" ON public.timetable;
DROP POLICY IF EXISTS "Class Admin can manage timetable" ON public.timetable;
DROP POLICY IF EXISTS "Approved students and staff can view timetable" ON public.timetable;

CREATE POLICY "Approved students and staff can view timetable"
  ON public.timetable FOR SELECT
  USING (public.is_approved());

CREATE POLICY "Only Class Admin can manage timetable and classroom allocations"
  ON public.timetable FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. HARDEN NOTIFICATIONS RLS & DEDUPLICATION (FEATURE 2)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view and update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Students can only view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Students can mark their own notifications as read" ON public.notifications;
DROP POLICY IF EXISTS "Staff and Admin can dispatch notifications" ON public.notifications;

-- Students can ONLY view notifications delivered to their specific user_id
CREATE POLICY "Students can only view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Students can ONLY update (mark as read) their own notifications
CREATE POLICY "Students can mark their own notifications as read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only Class Admin or Faculty can dispatch new notifications to students
CREATE POLICY "Staff and Admin can dispatch notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_faculty_or_admin());

-- Deduplication index preventing duplicate notifications for the same academic event
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedup 
  ON public.notifications (user_id, notification_type, related_id) 
  WHERE related_id IS NOT NULL;

-- 6. HARDEN PROFILES ROLE ESCALATION PREVENTION
-- Prevent students or faculty from escalating their role
DROP POLICY IF EXISTS "Users can update their own profile avatar and name" ON public.profiles;

CREATE POLICY "Users can update their own profile avatar and name"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Class Admin accounts must never be created via public registration
DROP POLICY IF EXISTS "Users can create their own registration request" ON public.registration_requests;

CREATE POLICY "Users can create their own registration request"
  ON public.registration_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND requested_role IN ('student', 'faculty')
  );

-- 7. ENABLE SUPABASE REALTIME REPLICATION FOR NOTIFICATIONS
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
