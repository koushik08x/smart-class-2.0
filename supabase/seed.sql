-- ============================================================================
-- SMARTCLASSROOM 2.0 - SAPTHAGIRI NPS UNIVERSITY PRODUCTION SEED DATA
-- Department of Computer Science and Engineering
-- Semester 1 | Section: 1CSE22 | Academic Year: 2026–2027
-- Class Advisor: Mr. Prathap M S
-- ============================================================================

-- 1. PROFILES
INSERT INTO public.profiles (id, full_name, email, role, student_id, department, semester, section, approval_status, avatar_url)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dr. Katherine Vance', 'admin@snpsu.edu.in', 'super_admin', 'EMP-ADM-01', 'Computer Science and Engineering', 1, '1CSE22', 'approved', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
  ('00000000-0000-0000-0000-000000000002', 'Alex Mercer', 'alex.mercer@snpsu.edu.in', 'class_admin', '26CS1002', 'Computer Science and Engineering', 1, '1CSE22', 'approved', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
  ('00000000-0000-0000-0000-000000000003', 'Mr. Prathap M S', 'prathap.ms@snpsu.edu.in', 'faculty', 'FAC-PSC-01', 'Computer Science and Engineering', 1, '1CSE22', 'approved', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
  ('00000000-0000-0000-0000-000000000004', 'Mrs. Prajwala Y M', 'prajwala.ym@snpsu.edu.in', 'faculty', 'FAC-MAT-02', 'Computer Science and Engineering', 1, '1CSE22', 'approved', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'),
  ('00000000-0000-0000-0000-000000000005', 'Mr. Umesh Anthakanavar', 'umesh.a@snpsu.edu.in', 'faculty', 'FAC-PHY-03', 'Computer Science and Engineering', 1, '1CSE22', 'approved', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
  ('00000000-0000-0000-0000-000000000006', 'Mrs. Priyadarshini H P', 'priyadarshini.hp@snpsu.edu.in', 'faculty', 'FAC-DTI-04', 'Computer Science and Engineering', 1, '1CSE22', 'approved', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
  ('00000000-0000-0000-0000-000000000007', 'Mrs. Sneha S', 'sneha.s@snpsu.edu.in', 'faculty', 'FAC-BEE-05', 'Computer Science and Engineering', 1, '1CSE22', 'approved', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
  ('00000000-0000-0000-0000-000000000008', 'Mr. Raghavendra N', 'raghavendra.n@snpsu.edu.in', 'faculty', 'FAC-CAEG-06', 'Computer Science and Engineering', 1, '1CSE22', 'approved', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
  ('00000000-0000-0000-0000-000000000009', 'HRD Trainer', 'hrd.english@snpsu.edu.in', 'faculty', 'FAC-ENG-07', 'Computer Science and Engineering', 1, '1CSE22', 'approved', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
  ('00000000-0000-0000-0000-000000000010', 'Aarav Sharma', 'aarav.sharma@snpsu.edu.in', 'student', '26CS1042', 'Computer Science and Engineering', 1, '1CSE22', 'approved', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
  ('00000000-0000-0000-0000-000000000011', 'Maya Patel', 'maya.patel@snpsu.edu.in', 'student', '26CS1055', 'Computer Science and Engineering', 1, '1CSE22', 'approved', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
  ('00000000-0000-0000-0000-000000000012', 'Rohan Gupta', 'rohan.gupta@snpsu.edu.in', 'student', '26CS1068', 'Computer Science and Engineering', 1, '1CSE22', 'approved', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
  ('00000000-0000-0000-0000-000000000099', 'Priya Verma', 'priya.verma@snpsu.edu.in', 'student', '26CS1089', 'Computer Science and Engineering', 1, '1CSE22', 'pending', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  department = EXCLUDED.department,
  semester = EXCLUDED.semester;

-- 2. REGISTRATION REQUESTS
INSERT INTO public.registration_requests (id, user_id, requested_role, status, notes)
VALUES
  ('a1b2c3d4-0001-0000-0000-000000000001', '00000000-0000-0000-0000-000000000099', 'student', 'pending', 'Sapthagiri NPS University Admission Verified. Enrolled in 1CSE22, Semester 1.')
ON CONFLICT (id) DO NOTHING;

-- 3. ACADEMIC SUBJECTS (MAT, PHY, DTI, PSC, BEE, CAEG, ENG, IPR)
INSERT INTO public.subjects (id, subject_name, subject_code, faculty_id, department, semester, section, credits, color)
VALUES
  ('sub-mat', 'Mathematics I', '25BEPHY101', '00000000-0000-0000-0000-000000000004', 'Computer Science and Engineering', 1, '1CSE22', 4, '#8B5CF6'),
  ('sub-phy', 'Engineering Physics', '25BEPHY102', '00000000-0000-0000-0000-000000000005', 'Computer Science and Engineering', 1, '1CSE22', 4, '#06B6D4'),
  ('sub-dti', 'Design Thinking and Innovation', '25BEPHY103', '00000000-0000-0000-0000-000000000006', 'Computer Science and Engineering', 1, '1CSE22', 3, '#EC4899'),
  ('sub-psc', 'Problem Solving Using C', '25BEPHY104', '00000000-0000-0000-0000-000000000003', 'Computer Science and Engineering', 1, '1CSE22', 4, '#3B82F6'),
  ('sub-bee', 'Basics of Electrical Engineering', '25BEPHY105', '00000000-0000-0000-0000-000000000007', 'Computer Science and Engineering', 1, '1CSE22', 3, '#F59E0B'),
  ('sub-caeg', 'Computer Aided Engineering Graphics', '25BEPHY106', '00000000-0000-0000-0000-000000000008', 'Computer Science and Engineering', 1, '1CSE22', 3, '#10B981'),
  ('sub-eng', 'Communicative English', '25BEPHY107', '00000000-0000-0000-0000-000000000009', 'Computer Science and Engineering', 1, '1CSE22', 2, '#6366F1'),
  ('sub-ipr', 'Intellectual Property Rights', '25BEPHY108', '00000000-0000-0000-0000-000000000003', 'Computer Science and Engineering', 1, '1CSE22', 2, '#84CC16')
ON CONFLICT (id) DO UPDATE SET
  subject_name = EXCLUDED.subject_name,
  subject_code = EXCLUDED.subject_code,
  semester = EXCLUDED.semester;

-- 4. TIMETABLE (EXACT 5-DAY MATRIX: Day 1 to Day 5)
INSERT INTO public.timetable (id, subject_id, faculty_id, day_of_week, start_time, end_time, classroom, semester, section)
VALUES
  -- DAY 1
  ('tt-d1-p1', 'sub-bee', '00000000-0000-0000-0000-000000000007', 'Day 1', '08:30', '09:30', 'A1018', 1, '1CSE22'),
  ('tt-d1-p2', 'sub-psc', '00000000-0000-0000-0000-000000000003', 'Day 1', '09:30', '10:30', 'A1018', 1, '1CSE22'),
  ('tt-d1-p3p4', 'sub-eng', '00000000-0000-0000-0000-000000000009', 'Day 1', '10:45', '12:45', 'A1018', 1, '1CSE22'),

  -- DAY 2
  ('tt-d2-p1', 'sub-mat', '00000000-0000-0000-0000-000000000004', 'Day 2', '08:30', '09:30', 'A1018', 1, '1CSE22'),
  ('tt-d2-p2', 'sub-dti', '00000000-0000-0000-0000-000000000006', 'Day 2', '09:30', '10:30', 'A1018', 1, '1CSE22'),
  ('tt-d2-p3p4', 'sub-caeg', '00000000-0000-0000-0000-000000000008', 'Day 2', '10:45', '12:45', 'A1221', 1, '1CSE22'),
  ('tt-d2-p5', 'sub-psc', '00000000-0000-0000-0000-000000000003', 'Day 2', '13:45', '14:40', 'A1018', 1, '1CSE22'),
  ('tt-d2-p6', 'sub-bee', '00000000-0000-0000-0000-000000000007', 'Day 2', '14:40', '15:35', NULL, 1, '1CSE22'),

  -- DAY 3
  ('tt-d3-p1p2', 'sub-psc', '00000000-0000-0000-0000-000000000003', 'Day 3', '08:30', '10:30', 'A1121', 1, '1CSE22'),
  ('tt-d3-p3', 'sub-phy', '00000000-0000-0000-0000-000000000005', 'Day 3', '10:45', '11:45', 'A1018', 1, '1CSE22'),
  ('tt-d3-p4', 'sub-dti', '00000000-0000-0000-0000-000000000006', 'Day 3', '11:45', '12:45', 'A1018', 1, '1CSE22'),
  ('tt-d3-p5', 'sub-mat', '00000000-0000-0000-0000-000000000004', 'Day 3', '13:45', '14:40', 'A1018', 1, '1CSE22'),
  ('tt-d3-p6', 'sub-eng', '00000000-0000-0000-0000-000000000009', 'Day 3', '14:40', '15:35', NULL, 1, '1CSE22'),
  ('tt-d3-p7', 'sub-mat', '00000000-0000-0000-0000-000000000004', 'Day 3', '15:35', '16:30', NULL, 1, '1CSE22'),

  -- DAY 4
  ('tt-d4-p1', 'sub-dti', '00000000-0000-0000-0000-000000000006', 'Day 4', '08:30', '09:30', 'A1018', 1, '1CSE22'),
  ('tt-d4-p2', 'sub-psc', '00000000-0000-0000-0000-000000000003', 'Day 4', '09:30', '10:30', 'A1018', 1, '1CSE22'),
  ('tt-d4-p3p4', 'sub-phy', '00000000-0000-0000-0000-000000000005', 'Day 4', '10:45', '12:45', NULL, 1, '1CSE22'),
  ('tt-d4-p5', 'sub-ipr', '00000000-0000-0000-0000-000000000003', 'Day 4', '13:45', '14:40', 'A1018', 1, '1CSE22'),
  ('tt-d4-p6', 'sub-caeg', '00000000-0000-0000-0000-000000000008', 'Day 4', '14:40', '15:35', NULL, 1, '1CSE22'),
  ('tt-d4-p7', 'sub-psc', '00000000-0000-0000-0000-000000000003', 'Day 4', '15:35', '16:30', NULL, 1, '1CSE22'),

  -- DAY 5
  ('tt-d5-p1p2', 'sub-caeg', '00000000-0000-0000-0000-000000000008', 'Day 5', '08:30', '10:30', 'A1018', 1, '1CSE22'),
  ('tt-d5-p3', 'sub-phy', '00000000-0000-0000-0000-000000000005', 'Day 5', '10:45', '11:45', NULL, 1, '1CSE22'),
  ('tt-d5-p4', 'sub-mat', '00000000-0000-0000-0000-000000000004', 'Day 5', '11:45', '12:45', NULL, 1, '1CSE22'),
  ('tt-d5-p5', 'sub-bee', '00000000-0000-0000-0000-000000000007', 'Day 5', '13:45', '14:40', NULL, 1, '1CSE22'),
  ('tt-d5-p6p7', 'sub-mat', '00000000-0000-0000-0000-000000000004', 'Day 5', '14:40', '16:30', NULL, 1, '1CSE22')
ON CONFLICT (id) DO NOTHING;

-- 5. ANNOUNCEMENTS
INSERT INTO public.announcements (id, title, description, author_id, priority, is_pinned, target_section, created_at)
VALUES
  ('ann-0001', 'Class Advisor Orientation & Semester 1 Schedule', 'Welcome to Sapthagiri NPS University! Section 1CSE22 classes have commenced. Class Advisor Meetings (CAM) will be conducted by Mr. Prathap M S on Day 4 Period 7.', '00000000-0000-0000-0000-000000000003', 'urgent', TRUE, '1CSE22', NOW() - INTERVAL '2 hours'),
  ('ann-0002', 'Lab Batches Allocation: PSCL (A1121) & CAEGL (A1221)', 'Practical lab batches have been partitioned into Batch B1 and Batch B2. Please check your lab slots.', '00000000-0000-0000-0000-000000000008', 'high', TRUE, '1CSE22', NOW() - INTERVAL '1 day'),
  ('ann-0003', 'First Internal Assessment (IA-1) Notification', 'First Internal Assessment covers Portions up to Unit 2 across all 8 theory subjects.', '00000000-0000-0000-0000-000000000001', 'normal', FALSE, '1CSE22', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
