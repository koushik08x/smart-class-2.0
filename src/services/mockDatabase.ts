/**
 * SmartClassroom 2.0 - Centralized Relational Database Store
 * University: Sapthagiri NPS University
 * Department: Computer Science and Engineering
 * Semester: 1 | Section: 1CSE22
 * Class Advisor: Mr. Prathap M S
 */

import {
  UserProfile,
  RegistrationRequest,
  Subject,
  TimetableSlot,
  Announcement,
  StudyNote,
  Assignment,
  AttendanceSession,
  AttendanceRecord,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizAnswer,
  Discussion,
  DiscussionReply,
  NotificationItem,
} from '../types';
import {
  COLLEGE_INFO,
  SUBJECTS_CONFIG,
  RAW_TIMETABLE_ENTRIES,
  getSubjectByAbbr,
} from '../data/academicData';

// Profiles: Faculty, Administrators, and Students for Sapthagiri NPS University
export const INITIAL_PROFILES: UserProfile[] = [
  // Super Admin
  {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Dr. Katherine Vance',
    email: 'admin@snpsu.edu.in',
    role: 'super_admin',
    student_id: 'EMP-ADM-01',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'approved',
    created_at: new Date('2026-08-15').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Class Admin (Student Representative / Admin)
  {
    id: '00000000-0000-0000-0000-000000000002',
    full_name: 'Alex Mercer',
    email: 'alex.mercer@snpsu.edu.in',
    role: 'class_admin',
    student_id: '26CS1002',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'approved',
    created_at: new Date('2026-08-20').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Class Advisor & PSC Faculty: Mr. Prathap M S
  {
    id: '00000000-0000-0000-0000-000000000003',
    full_name: 'Mr. Prathap M S',
    email: 'prathap.ms@snpsu.edu.in',
    role: 'faculty',
    student_id: 'FAC-PSC-01',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'approved',
    created_at: new Date('2026-08-10').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Mathematics I Faculty: Mrs. Prajwala Y M
  {
    id: '00000000-0000-0000-0000-000000000004',
    full_name: 'Mrs. Prajwala Y M',
    email: 'prajwala.ym@snpsu.edu.in',
    role: 'faculty',
    student_id: 'FAC-MAT-02',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'approved',
    created_at: new Date('2026-08-10').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Engineering Physics Faculty: Mr. Umesh Anthakanavar
  {
    id: '00000000-0000-0000-0000-000000000005',
    full_name: 'Mr. Umesh Anthakanavar',
    email: 'umesh.a@snpsu.edu.in',
    role: 'faculty',
    student_id: 'FAC-PHY-03',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'approved',
    created_at: new Date('2026-08-10').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Design Thinking Faculty: Mrs. Priyadarshini H P
  {
    id: '00000000-0000-0000-0000-000000000006',
    full_name: 'Mrs. Priyadarshini H P',
    email: 'priyadarshini.hp@snpsu.edu.in',
    role: 'faculty',
    student_id: 'FAC-DTI-04',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'approved',
    created_at: new Date('2026-08-10').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Electrical Engineering Faculty: Mrs. Sneha S
  {
    id: '00000000-0000-0000-0000-000000000007',
    full_name: 'Mrs. Sneha S',
    email: 'sneha.s@snpsu.edu.in',
    role: 'faculty',
    student_id: 'FAC-BEE-05',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'approved',
    created_at: new Date('2026-08-10').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Computer Aided Engineering Graphics Faculty: Mr. Raghavendra N
  {
    id: '00000000-0000-0000-0000-000000000008',
    full_name: 'Mr. Raghavendra N',
    email: 'raghavendra.n@snpsu.edu.in',
    role: 'faculty',
    student_id: 'FAC-CAEG-06',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'approved',
    created_at: new Date('2026-08-10').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Communicative English Faculty: HRD Trainer
  {
    id: '00000000-0000-0000-0000-000000000009',
    full_name: 'HRD Trainer',
    email: 'hrd.english@snpsu.edu.in',
    role: 'faculty',
    student_id: 'FAC-ENG-07',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'approved',
    created_at: new Date('2026-08-10').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Primary Student: Aarav Sharma (Semester 1, 1CSE22)
  {
    id: '00000000-0000-0000-0000-000000000010',
    full_name: 'Aarav Sharma',
    email: 'aarav.sharma@snpsu.edu.in',
    role: 'student',
    student_id: '26CS1042',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'approved',
    created_at: new Date('2026-09-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Student 2: Maya Patel
  {
    id: '00000000-0000-0000-0000-000000000011',
    full_name: 'Maya Patel',
    email: 'maya.patel@snpsu.edu.in',
    role: 'student',
    student_id: '26CS1055',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'approved',
    created_at: new Date('2026-09-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Student 3: Rohan Gupta
  {
    id: '00000000-0000-0000-0000-000000000012',
    full_name: 'Rohan Gupta',
    email: 'rohan.gupta@snpsu.edu.in',
    role: 'student',
    student_id: '26CS1068',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'approved',
    created_at: new Date('2026-09-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Pending Student: Priya Verma (Awaiting Class Admin approval)
  {
    id: '00000000-0000-0000-0000-000000000099',
    full_name: 'Priya Verma',
    email: 'priya.verma@snpsu.edu.in',
    role: 'student',
    student_id: '26CS1089',
    department: 'Computer Science and Engineering',
    semester: 1,
    section: '1CSE22',
    approval_status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_REGISTRATION_REQUESTS: RegistrationRequest[] = [
  {
    id: 'req-001',
    user_id: '00000000-0000-0000-0000-000000000099',
    requested_role: 'student',
    status: 'pending',
    notes: 'Sapthagiri NPS University Admission Verified. Enrolled in 1CSE22, Semester 1.',
    created_at: new Date().toISOString(),
  },
];

// Subjects: Generated directly from centralized SUBJECTS_CONFIG
export const INITIAL_SUBJECTS: Subject[] = SUBJECTS_CONFIG.map((s) => ({
  id: s.id,
  subject_name: s.name,
  subject_code: s.code,
  faculty_id: '00000000-0000-0000-0000-000000000003',
  faculty_name: s.faculty,
  department: COLLEGE_INFO.department,
  semester: COLLEGE_INFO.semester,
  section: COLLEGE_INFO.section,
  credits: s.credits,
  color: s.color,
  created_at: new Date('2026-08-25').toISOString(),
}));

// Timetable: Generated directly from RAW_TIMETABLE_ENTRIES
export const INITIAL_TIMETABLE: TimetableSlot[] = RAW_TIMETABLE_ENTRIES.map((entry) => {
  const sub = getSubjectByAbbr(entry.subjectAbbr);
  return {
    id: entry.id,
    subject_id: sub ? sub.id : `sub-${entry.subjectAbbr.toLowerCase()}`,
    subject_name: sub ? sub.name : entry.subjectAbbr,
    subject_code: sub ? sub.code : entry.subjectAbbr,
    subject_abbr: entry.subjectAbbr,
    color: sub ? sub.color : '#8B5CF6',
    faculty_id: '00000000-0000-0000-0000-000000000003',
    faculty_name: entry.batchInfo || (sub ? sub.faculty : 'Faculty'),
    day_of_week: entry.day,
    period_label: entry.period,
    start_time: entry.startTime,
    end_time: entry.endTime,
    classroom: entry.classroom, // Never invent missing room numbers!
    batch_info: entry.batchInfo,
    semester: COLLEGE_INFO.semester,
    section: COLLEGE_INFO.section,
  };
});

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Class Advisor Orientation & Semester 1 Schedule',
    description: `Welcome to Sapthagiri NPS University, Department of Computer Science and Engineering! Classes for Semester 1 (Section 1CSE22) have commenced. Please review your Day 1–Day 5 timetable and note that Class Advisor Meetings (CAM) will be conducted by Mr. Prathap M S on Day 4 Period 7. Ensure minimum 75% attendance is maintained in all theory and practical courses.`,
    author_id: '00000000-0000-0000-0000-000000000003',
    author_name: 'Mr. Prathap M S',
    author_role: 'faculty',
    priority: 'urgent',
    is_pinned: true,
    target_section: '1CSE22',
    created_at: new Date('2026-09-07T08:00:00Z').toISOString(),
    updated_at: new Date('2026-09-07T08:00:00Z').toISOString(),
  },
  {
    id: 'ann-002',
    title: 'Lab Batches Allocation: PSCL (A1121) & CAEGL (A1221)',
    description: `Practical lab batches for Problem Solving Using C Lab (PSCL) and Computer Aided Engineering Graphics Lab (CAEGL) have been partitioned into Batch B1 and Batch B2. 
• PSCL: B1 guided by Vyshnavi M, B2 by Hemalatha K in Room A1121.
• CAEGL: B1 guided by Mr. Raghavendra N, B2 by Mr. Ramesh N G in Room A1221.
Please check your batch allocations before attending lab periods.`,
    author_id: '00000000-0000-0000-0000-000000000008',
    author_name: 'Mr. Raghavendra N',
    author_role: 'faculty',
    priority: 'high',
    is_pinned: true,
    target_section: '1CSE22',
    created_at: new Date('2026-09-08T09:30:00Z').toISOString(),
    updated_at: new Date('2026-09-08T09:30:00Z').toISOString(),
  },
  {
    id: 'ann-003',
    title: 'First Internal Assessment (IA-1) Notification',
    description: `First Internal Assessment for Semester 1 will cover portions completed up to Unit 2 across 25BEPHY101 (MAT), 25BEPHY102 (PHY), 25BEPHY103 (DTI), 25BEPHY104 (PSC), 25BEPHY105 (BEE), 25BEPHY106 (CAEG), 25BEPHY107 (ENG) and 25BEPHY108 (IPR). Review courseware in the study materials section.`,
    author_id: '00000000-0000-0000-0000-000000000001',
    author_name: 'Dr. Katherine Vance',
    author_role: 'super_admin',
    priority: 'normal',
    is_pinned: false,
    target_section: '1CSE22',
    created_at: new Date('2026-09-12T11:00:00Z').toISOString(),
    updated_at: new Date('2026-09-12T11:00:00Z').toISOString(),
  },
];

export const INITIAL_NOTES: StudyNote[] = [
  {
    id: 'not-001',
    title: 'Differential Calculus & Polar Curves Lecture Notes',
    description: 'Comprehensive notes covering angle between radius vector and tangent, derivative of arc length, and curvature in polar coordinates.',
    subject_id: 'sub-mat',
    subject_name: 'Mathematics I',
    subject_code: '25BEPHY101',
    uploaded_by: '00000000-0000-0000-0000-000000000004',
    author_name: 'Mrs. Prajwala Y M',
    file_path: 'study-materials/mat_calculus_polar_curves.pdf',
    file_type: 'application/pdf',
    file_size: 4215000,
    download_count: 58,
    created_at: new Date('2026-09-10T10:00:00Z').toISOString(),
  },
  {
    id: 'not-002',
    title: 'C Programming Primitives: Pointers, Loops & Arrays',
    description: 'Lecture slides and code walkthrough for control structures, function prototypes, pointers, and memory layout in C.',
    subject_id: 'sub-psc',
    subject_name: 'Problem Solving Using C',
    subject_code: '25BEPHY104',
    uploaded_by: '00000000-0000-0000-0000-000000000003',
    author_name: 'Mr. Prathap M S',
    file_path: 'study-materials/psc_c_primitives_pointers.pdf',
    file_type: 'application/pdf',
    file_size: 3850000,
    download_count: 72,
    created_at: new Date('2026-09-09T14:00:00Z').toISOString(),
  },
  {
    id: 'not-003',
    title: 'Quantum Mechanics & Laser Optical Physics',
    description: 'Wave-particle duality, de Broglie hypothesis, Heisenberg uncertainty principle, and semiconductor lasers overview.',
    subject_id: 'sub-phy',
    subject_name: 'Engineering Physics',
    subject_code: '25BEPHY102',
    uploaded_by: '00000000-0000-0000-0000-000000000005',
    author_name: 'Mr. Umesh Anthakanavar',
    file_path: 'study-materials/phy_quantum_lasers.pdf',
    file_type: 'application/pdf',
    file_size: 5120000,
    download_count: 45,
    created_at: new Date('2026-09-11T11:00:00Z').toISOString(),
  },
  {
    id: 'not-004',
    title: 'Design Thinking: Empathy Mapping & Problem Framing',
    description: 'Human-centered design stages, customer empathy interviews, divergent ideation, and rapid prototyping principles.',
    subject_id: 'sub-dti',
    subject_name: 'Design Thinking and Innovation',
    subject_code: '25BEPHY103',
    uploaded_by: '00000000-0000-0000-0000-000000000006',
    author_name: 'Mrs. Priyadarshini H P',
    file_path: 'study-materials/dti_empathy_prototyping.pdf',
    file_type: 'application/pdf',
    file_size: 6180000,
    download_count: 63,
    created_at: new Date('2026-09-12T15:00:00Z').toISOString(),
  },
  {
    id: 'not-005',
    title: 'Single-Phase AC Circuits & Magnetic Fields',
    description: 'RMS and average values, form factor, R-L-C series resonance, and magnetic circuit reluctance fundamentals.',
    subject_id: 'sub-bee',
    subject_name: 'Basics of Electrical Engineering',
    subject_code: '25BEPHY105',
    uploaded_by: '00000000-0000-0000-0000-000000000007',
    author_name: 'Mrs. Sneha S',
    file_path: 'study-materials/bee_ac_circuits.pdf',
    file_type: 'application/pdf',
    file_size: 4780000,
    download_count: 51,
    created_at: new Date('2026-09-13T12:00:00Z').toISOString(),
  },
  {
    id: 'not-006',
    title: 'Orthographic Projections & Principles of Isometric Views',
    description: 'First angle vs third angle projection, projections of points, straight lines, and plane surfaces with CAD standards.',
    subject_id: 'sub-caeg',
    subject_name: 'Computer Aided Engineering Graphics',
    subject_code: '25BEPHY106',
    uploaded_by: '00000000-0000-0000-0000-000000000008',
    author_name: 'Mr. Raghavendra N',
    file_path: 'study-materials/caeg_orthographic_projections.pdf',
    file_type: 'application/pdf',
    file_size: 7240000,
    download_count: 80,
    created_at: new Date('2026-09-14T09:00:00Z').toISOString(),
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-001',
    title: 'Lab Problem Set 1: C Algorithms & Dynamic Bitwise Operations',
    description: 'Implement modular C programs for matrix rotation, prime factor sieves, and bitwise endianness converters. Follow proper code indentation and compiler warnings flags (-Wall).',
    subject_id: 'sub-psc',
    subject_name: 'Problem Solving Using C',
    subject_code: '25BEPHY104',
    faculty_id: '00000000-0000-0000-0000-000000000003',
    faculty_name: 'Mr. Prathap M S',
    deadline: new Date(Date.now() + 4 * 86400000).toISOString(),
    attachment_path: 'assignment-files/psc_lab1_starter.zip',
    max_marks: 50,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'asg-002',
    title: 'Calculus Assignment 1: Radius of Curvature & Taylor Expansions',
    description: 'Derive pedal equations and evaluate radius of curvature for cycloids and astroids. Submit handwritten solutions as a single scanned PDF.',
    subject_id: 'sub-mat',
    subject_name: 'Mathematics I',
    subject_code: '25BEPHY101',
    faculty_id: '00000000-0000-0000-0000-000000000004',
    faculty_name: 'Mrs. Prajwala Y M',
    deadline: new Date(Date.now() + 6 * 86400000).toISOString(),
    attachment_path: 'assignment-files/mat_hw1_questions.pdf',
    max_marks: 25,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'asg-003',
    title: 'DTI Case Study: Campus Accessibility Empathy Map',
    description: 'Conduct user interviews with campus visitors and synthesize an empathy map and problem statement for institutional navigation.',
    subject_id: 'sub-dti',
    subject_name: 'Design Thinking and Innovation',
    subject_code: '25BEPHY103',
    faculty_id: '00000000-0000-0000-0000-000000000006',
    faculty_name: 'Mrs. Priyadarshini H P',
    deadline: new Date(Date.now() - 2 * 86400000).toISOString(),
    attachment_path: 'assignment-files/dti_case_template.pdf',
    max_marks: 30,
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    user_submission: {
      id: 'subm-001',
      assignment_id: 'asg-003',
      student_id: '00000000-0000-0000-0000-000000000010',
      student_name: 'Aarav Sharma',
      file_path: 'assignment-submissions/26cs1042_dti_casestudy.pdf',
      file_name: '26cs1042_dti_casestudy.pdf',
      submission_status: 'graded',
      submitted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      grade: 28,
      feedback: 'Excellent synthesis of user interviews and clear point-of-view problem statements.',
    },
  },
];

// Attendance Sessions for Semester 1 (1CSE22)
export const INITIAL_ATTENDANCE_SESSIONS: AttendanceSession[] = [
  { id: 'ses-01', subject_id: 'sub-psc', subject_name: 'Problem Solving Using C', subject_code: '25BEPHY104', faculty_id: '00000000-0000-0000-0000-000000000003', faculty_name: 'Mr. Prathap M S', class_date: '2026-09-08', semester: 1, section: '1CSE22', topic_covered: 'C Language Fundamentals & Data Types', created_at: new Date('2026-09-08').toISOString() },
  { id: 'ses-02', subject_id: 'sub-psc', subject_name: 'Problem Solving Using C', subject_code: '25BEPHY104', faculty_id: '00000000-0000-0000-0000-000000000003', faculty_name: 'Mr. Prathap M S', class_date: '2026-09-09', semester: 1, section: '1CSE22', topic_covered: 'Arithmetic & Logical Operators', created_at: new Date('2026-09-09').toISOString() },
  { id: 'ses-03', subject_id: 'sub-psc', subject_name: 'Problem Solving Using C', subject_code: '25BEPHY104', faculty_id: '00000000-0000-0000-0000-000000000003', faculty_name: 'Mr. Prathap M S', class_date: '2026-09-11', semester: 1, section: '1CSE22', topic_covered: 'Nested If-Else & Switch Statements', created_at: new Date('2026-09-11').toISOString() },
  { id: 'ses-04', subject_id: 'sub-psc', subject_name: 'Problem Solving Using C', subject_code: '25BEPHY104', faculty_id: '00000000-0000-0000-0000-000000000003', faculty_name: 'Mr. Prathap M S', class_date: '2026-09-14', semester: 1, section: '1CSE22', topic_covered: 'Looping Constructs: While & For', created_at: new Date('2026-09-14').toISOString() },
  { id: 'ses-05', subject_id: 'sub-mat', subject_name: 'Mathematics I', subject_code: '25BEPHY101', faculty_id: '00000000-0000-0000-0000-000000000004', faculty_name: 'Mrs. Prajwala Y M', class_date: '2026-09-08', semester: 1, section: '1CSE22', topic_covered: 'Polar Curves Introduction', created_at: new Date('2026-09-08').toISOString() },
  { id: 'ses-06', subject_id: 'sub-mat', subject_name: 'Mathematics I', subject_code: '25BEPHY101', faculty_id: '00000000-0000-0000-0000-000000000004', faculty_name: 'Mrs. Prajwala Y M', class_date: '2026-09-09', semester: 1, section: '1CSE22', topic_covered: 'Angle Between Radius Vector & Tangent', created_at: new Date('2026-09-09').toISOString() },
  { id: 'ses-07', subject_id: 'sub-mat', subject_name: 'Mathematics I', subject_code: '25BEPHY101', faculty_id: '00000000-0000-0000-0000-000000000004', faculty_name: 'Mrs. Prajwala Y M', class_date: '2026-09-11', semester: 1, section: '1CSE22', topic_covered: 'Pedal Equations of Polar Curves', created_at: new Date('2026-09-11').toISOString() },
  { id: 'ses-08', subject_id: 'sub-mat', subject_name: 'Mathematics I', subject_code: '25BEPHY101', faculty_id: '00000000-0000-0000-0000-000000000004', faculty_name: 'Mrs. Prajwala Y M', class_date: '2026-09-15', semester: 1, section: '1CSE22', topic_covered: 'Radius of Curvature in Cartesian Form', created_at: new Date('2026-09-15').toISOString() },
  { id: 'ses-09', subject_id: 'sub-phy', subject_name: 'Engineering Physics', subject_code: '25BEPHY102', faculty_id: '00000000-0000-0000-0000-000000000005', faculty_name: 'Mr. Umesh Anthakanavar', class_date: '2026-09-09', semester: 1, section: '1CSE22', topic_covered: 'Black Body Radiation & Planck Law', created_at: new Date('2026-09-09').toISOString() },
  { id: 'ses-10', subject_id: 'sub-phy', subject_name: 'Engineering Physics', subject_code: '25BEPHY102', faculty_id: '00000000-0000-0000-0000-000000000005', faculty_name: 'Mr. Umesh Anthakanavar', class_date: '2026-09-11', semester: 1, section: '1CSE22', topic_covered: 'Compton Effect & de Broglie Wavelength', created_at: new Date('2026-09-11').toISOString() },
  { id: 'ses-11', subject_id: 'sub-phy', subject_name: 'Engineering Physics', subject_code: '25BEPHY102', faculty_id: '00000000-0000-0000-0000-000000000005', faculty_name: 'Mr. Umesh Anthakanavar', class_date: '2026-09-15', semester: 1, section: '1CSE22', topic_covered: 'Heisenberg Uncertainty Principle', created_at: new Date('2026-09-15').toISOString() },
  { id: 'ses-12', subject_id: 'sub-dti', subject_name: 'Design Thinking and Innovation', subject_code: '25BEPHY103', faculty_id: '00000000-0000-0000-0000-000000000006', faculty_name: 'Mrs. Priyadarshini H P', class_date: '2026-09-08', semester: 1, section: '1CSE22', topic_covered: 'Empathize Phase: Stakeholder Persona', created_at: new Date('2026-09-08').toISOString() },
  { id: 'ses-13', subject_id: 'sub-dti', subject_name: 'Design Thinking and Innovation', subject_code: '25BEPHY103', faculty_id: '00000000-0000-0000-0000-000000000006', faculty_name: 'Mrs. Priyadarshini H P', class_date: '2026-09-10', semester: 1, section: '1CSE22', topic_covered: 'Point-of-View Statement Construction', created_at: new Date('2026-09-10').toISOString() },
  { id: 'ses-14', subject_id: 'sub-bee', subject_name: 'Basics of Electrical Engineering', subject_code: '25BEPHY105', faculty_id: '00000000-0000-0000-0000-000000000007', faculty_name: 'Mrs. Sneha S', class_date: '2026-09-07', semester: 1, section: '1CSE22', topic_covered: 'Ohm Law, KVL and KCL Analysis', created_at: new Date('2026-09-07').toISOString() },
  { id: 'ses-15', subject_id: 'sub-bee', subject_name: 'Basics of Electrical Engineering', subject_code: '25BEPHY105', faculty_id: '00000000-0000-0000-0000-000000000007', faculty_name: 'Mrs. Sneha S', class_date: '2026-09-14', semester: 1, section: '1CSE22', topic_covered: 'Single Phase AC Phasor Representation', created_at: new Date('2026-09-14').toISOString() },
  { id: 'ses-16', subject_id: 'sub-caeg', subject_name: 'Computer Aided Engineering Graphics', subject_code: '25BEPHY106', faculty_id: '00000000-0000-0000-0000-000000000008', faculty_name: 'Mr. Raghavendra N', class_date: '2026-09-10', semester: 1, section: '1CSE22', topic_covered: 'Projection of Points in 4 Quadrants', created_at: new Date('2026-09-10').toISOString() },
  { id: 'ses-17', subject_id: 'sub-caeg', subject_name: 'Computer Aided Engineering Graphics', subject_code: '25BEPHY106', faculty_id: '00000000-0000-0000-0000-000000000008', faculty_name: 'Mr. Raghavendra N', class_date: '2026-09-15', semester: 1, section: '1CSE22', topic_covered: 'Lines Inclined to Both Reference Planes', created_at: new Date('2026-09-15').toISOString() },
  { id: 'ses-18', subject_id: 'sub-eng', subject_name: 'Communicative English', subject_code: '25BEPHY107', faculty_id: '00000000-0000-0000-0000-000000000009', faculty_name: 'HRD Trainer', class_date: '2026-09-07', semester: 1, section: '1CSE22', topic_covered: 'Technical Vocabulary & Phonetic Transcription', created_at: new Date('2026-09-07').toISOString() },
];

// Attendance Records for Aarav (14 Present, 4 Absent = 77.8% - triggers healthy threshold with realistic formula verification)
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: 'rec-01', session_id: 'ses-01', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-08T09:35:00Z', marked_by: '00000000-0000-0000-0000-000000000003' },
  { id: 'rec-02', session_id: 'ses-02', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-09T09:35:00Z', marked_by: '00000000-0000-0000-0000-000000000003' },
  { id: 'rec-03', session_id: 'ses-03', student_id: '00000000-0000-0000-0000-000000000010', status: 'absent',  marked_at: '2026-09-11T09:35:00Z', marked_by: '00000000-0000-0000-0000-000000000003' },
  { id: 'rec-04', session_id: 'ses-04', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-14T09:35:00Z', marked_by: '00000000-0000-0000-0000-000000000003' },
  { id: 'rec-05', session_id: 'ses-05', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-08T10:35:00Z', marked_by: '00000000-0000-0000-0000-000000000004' },
  { id: 'rec-06', session_id: 'ses-06', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-09T10:35:00Z', marked_by: '00000000-0000-0000-0000-000000000004' },
  { id: 'rec-07', session_id: 'ses-07', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-11T10:35:00Z', marked_by: '00000000-0000-0000-0000-000000000004' },
  { id: 'rec-08', session_id: 'ses-08', student_id: '00000000-0000-0000-0000-000000000010', status: 'absent',  marked_at: '2026-09-15T10:35:00Z', marked_by: '00000000-0000-0000-0000-000000000004' },
  { id: 'rec-09', session_id: 'ses-09', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-09T11:50:00Z', marked_by: '00000000-0000-0000-0000-000000000005' },
  { id: 'rec-10', session_id: 'ses-10', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-11T11:50:00Z', marked_by: '00000000-0000-0000-0000-000000000005' },
  { id: 'rec-11', session_id: 'ses-11', student_id: '00000000-0000-0000-0000-000000000010', status: 'absent',  marked_at: '2026-09-15T11:50:00Z', marked_by: '00000000-0000-0000-0000-000000000005' },
  { id: 'rec-12', session_id: 'ses-12', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-08T13:50:00Z', marked_by: '00000000-0000-0000-0000-000000000006' },
  { id: 'rec-13', session_id: 'ses-13', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-10T13:50:00Z', marked_by: '00000000-0000-0000-0000-000000000006' },
  { id: 'rec-14', session_id: 'ses-14', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-07T08:35:00Z', marked_by: '00000000-0000-0000-0000-000000000007' },
  { id: 'rec-15', session_id: 'ses-15', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-14T13:50:00Z', marked_by: '00000000-0000-0000-0000-000000000007' },
  { id: 'rec-16', session_id: 'ses-16', student_id: '00000000-0000-0000-0000-000000000010', status: 'absent',  marked_at: '2026-09-10T14:45:00Z', marked_by: '00000000-0000-0000-0000-000000000008' },
  { id: 'rec-17', session_id: 'ses-17', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-15T14:45:00Z', marked_by: '00000000-0000-0000-0000-000000000008' },
  { id: 'rec-18', session_id: 'ses-18', student_id: '00000000-0000-0000-0000-000000000010', status: 'present', marked_at: '2026-09-07T10:50:00Z', marked_by: '00000000-0000-0000-0000-000000000009' },
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-001',
    title: 'Problem Solving Using C: Syntax, Pointers & Expressions',
    description: 'Unit 1 rapid evaluation on variables, data representations, operator precedence, and format specifiers.',
    subject_id: 'sub-psc',
    subject_name: 'Problem Solving Using C',
    subject_code: '25BEPHY104',
    created_by: '00000000-0000-0000-0000-000000000003',
    author_name: 'Mr. Prathap M S',
    duration: 10,
    total_marks: 5,
    is_published: true,
    created_at: new Date('2026-09-14T08:00:00Z').toISOString(),
  },
  {
    id: 'quiz-002',
    title: 'Basics of Electrical Engineering: Circuit Laws & AC Quantities',
    description: 'Kirchhoff Voltage/Current Laws, resistive network nodal analysis, and sinusoidal AC waveforms.',
    subject_id: 'sub-bee',
    subject_name: 'Basics of Electrical Engineering',
    subject_code: '25BEPHY105',
    created_by: '00000000-0000-0000-0000-000000000007',
    author_name: 'Mrs. Sneha S',
    duration: 15,
    total_marks: 5,
    is_published: true,
    created_at: new Date('2026-09-15T08:00:00Z').toISOString(),
  },
];

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-001',
    quiz_id: 'quiz-001',
    question: 'In C language, what is the size typically allocated for a standard double precision float according to IEEE-754?',
    option_a: '2 Bytes',
    option_b: '4 Bytes',
    option_c: '8 Bytes',
    option_d: '16 Bytes',
    correct_answer: 'C',
    marks: 1,
    explanation: 'A double in standard 64-bit C compilers conforms to 8 bytes (64 bits) IEEE-754 representation.',
    question_order: 1,
  },
  {
    id: 'q-002',
    quiz_id: 'quiz-001',
    question: 'Which of the following operators possesses the highest precedence in C expression evaluation?',
    option_a: 'Logical AND (&&)',
    option_b: 'Postfix increment / decrement (++)',
    option_c: 'Bitwise XOR (^)',
    option_d: 'Assignment operator (=)',
    correct_answer: 'B',
    marks: 1,
    explanation: 'Postfix increment/decrement operators and array subscripts take highest precedence level 1.',
    question_order: 2,
  },
  {
    id: 'q-003',
    quiz_id: 'quiz-001',
    question: 'What does the format specifier "%p" output in a printf statement?',
    option_a: 'A floating point percentage',
    option_b: 'The pointer address in implementation-defined hexadecimal format',
    option_c: 'A signed long integer',
    option_d: 'A character array string',
    correct_answer: 'B',
    marks: 1,
    explanation: '%p outputs the memory address of the pointer argument.',
    question_order: 3,
  },
  {
    id: 'q-004',
    quiz_id: 'quiz-001',
    question: 'What is the outcome of attempting to dereference a NULL pointer in C on modern OS environments?',
    option_a: 'Returns the integer 0 safely',
    option_b: 'Segmentation fault / memory access violation signal',
    option_c: 'Automatically allocates new heap space',
    option_d: 'Promotes variable to register storage',
    correct_answer: 'B',
    marks: 1,
    explanation: 'Dereferencing address 0 triggers a hardware MMU page fault resulting in SIGSEGV.',
    question_order: 4,
  },
  {
    id: 'q-005',
    quiz_id: 'quiz-001',
    question: 'Which header file must be included to utilize dynamic memory allocation primitives like malloc() and free()?',
    option_a: '<stdio.h>',
    option_b: '<stdlib.h>',
    option_c: '<string.h>',
    option_d: '<math.h>',
    correct_answer: 'B',
    marks: 1,
    explanation: '<stdlib.h> defines standard library dynamic memory allocation functions.',
    question_order: 5,
  },
];

export const INITIAL_DISCUSSIONS: Discussion[] = [
  {
    id: 'disc-001',
    author_id: '00000000-0000-0000-0000-000000000003',
    author_name: 'Mr. Prathap M S',
    author_role: 'faculty',
    subject_id: 'sub-psc',
    subject_name: 'Problem Solving Using C',
    title: 'PSC Lab 1: Common Mistakes in Pointer Dereferencing & Array Bounds',
    content: `Students of 1CSE22, during our first lab practical, several students encountered off-by-one errors when accessing array elements from 0 to N. Remember that for an array of size N, valid indices range from 0 to N-1. Please review buffer safety before Thursday's lab.`,
    is_pinned: true,
    likes_count: 12,
    replies_count: 2,
    has_liked: true,
    created_at: new Date('2026-09-12T16:00:00Z').toISOString(),
    updated_at: new Date('2026-09-12T16:00:00Z').toISOString(),
  },
  {
    id: 'disc-002',
    author_id: '00000000-0000-0000-0000-000000000008',
    author_name: 'Mr. Raghavendra N',
    author_role: 'faculty',
    subject_id: 'sub-caeg',
    subject_name: 'Computer Aided Engineering Graphics',
    title: 'CAEGL Software Setup: SolidWorks / CAD Workspace in Room A1221',
    content: `All workstations in Room A1221 have been imaged with standard ISO dimensioning templates. Ensure you save all part models in your respective USN folder on the central lab drive.`,
    is_pinned: false,
    likes_count: 7,
    replies_count: 1,
    has_liked: false,
    created_at: new Date('2026-09-13T10:00:00Z').toISOString(),
    updated_at: new Date('2026-09-13T10:00:00Z').toISOString(),
  },
];

export const INITIAL_DISCUSSION_REPLIES: DiscussionReply[] = [
  {
    id: 'rep-001',
    discussion_id: 'disc-001',
    author_id: '00000000-0000-0000-0000-000000000010',
    author_name: 'Aarav Sharma',
    author_role: 'student',
    content: 'Thank you Sir! Using sizeof(arr)/sizeof(arr[0]) helped us calculate array bounds dynamically without hardcoding magic numbers.',
    created_at: new Date('2026-09-12T17:30:00Z').toISOString(),
  },
  {
    id: 'rep-002',
    discussion_id: 'disc-001',
    author_id: '00000000-0000-0000-0000-000000000003',
    author_name: 'Mr. Prathap M S',
    author_role: 'faculty',
    content: 'Exactly Aarav, keep in mind this macro only works in the scope where the array is declared, not inside decay parameters.',
    created_at: new Date('2026-09-12T18:15:00Z').toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-001',
    user_id: '00000000-0000-0000-0000-000000000010',
    title: 'Class Advisor Orientation',
    message: 'Mr. Prathap M S scheduled the Class Advisor Meeting (CAM) on Day 4 Period 7.',
    notification_type: 'announcement',
    related_id: 'ann-001',
    is_read: false,
    created_at: new Date('2026-09-07T08:30:00Z').toISOString(),
  },
  {
    id: 'notif-002',
    user_id: '00000000-0000-0000-0000-000000000010',
    title: 'New Study Material Published',
    message: 'Mrs. Prajwala Y M uploaded "Differential Calculus & Polar Curves" for Mathematics I.',
    notification_type: 'notes',
    related_id: 'not-001',
    is_read: false,
    created_at: new Date('2026-09-10T10:15:00Z').toISOString(),
  },
  {
    id: 'notif-003',
    user_id: '00000000-0000-0000-0000-000000000010',
    title: 'C Programming Quiz Available',
    message: 'Unit 1 C Syntax & Pointers quiz is published by Mr. Prathap M S. 10 mins duration.',
    notification_type: 'quiz',
    related_id: 'quiz-001',
    is_read: true,
    created_at: new Date('2026-09-14T08:05:00Z').toISOString(),
  },
  {
    id: 'notif-004',
    user_id: '00000000-0000-0000-0000-000000000010',
    title: 'Discussion Reply Received',
    message: 'Mr. Prathap M S replied to your comment on pointer array bounds.',
    notification_type: 'reply',
    related_id: 'disc-001',
    is_read: true,
    created_at: new Date('2026-09-12T18:15:00Z').toISOString(),
  },
];

// SCHEMA VERSION: Bumped to snpsu_academic_v4_nofaces to clear legacy face photos and refresh client cache
const SCHEMA_VERSION = 'snpsu_academic_v4_nofaces';

function getOrInit<T>(key: string, initial: T): T {
  try {
    const version = localStorage.getItem('sc2_schema_version');
    if (version !== SCHEMA_VERSION) {
      localStorage.setItem('sc2_schema_version', SCHEMA_VERSION);
      saveStore(key, initial);
      return initial;
    }
    const raw = localStorage.getItem(`sc2_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('LocalStorage read error for key:', key);
  }
  return initial;
}

function saveStore<T>(key: string, value: T) {
  try {
    localStorage.setItem(`sc2_${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage save error for key:', key);
  }
}

// In-Memory Database Store singleton
class MockDatabaseStore {
  profiles = getOrInit<UserProfile[]>('profiles', INITIAL_PROFILES);
  registrationRequests = getOrInit<RegistrationRequest[]>('registration_requests', INITIAL_REGISTRATION_REQUESTS);
  subjects = getOrInit<Subject[]>('subjects', INITIAL_SUBJECTS);
  timetable = getOrInit<TimetableSlot[]>('timetable', INITIAL_TIMETABLE);
  announcements = getOrInit<Announcement[]>('announcements', INITIAL_ANNOUNCEMENTS);
  notes = getOrInit<StudyNote[]>('notes', INITIAL_NOTES);
  assignments = getOrInit<Assignment[]>('assignments', INITIAL_ASSIGNMENTS);
  attendanceSessions = getOrInit<AttendanceSession[]>('attendance_sessions', INITIAL_ATTENDANCE_SESSIONS);
  attendanceRecords = getOrInit<AttendanceRecord[]>('attendance_records', INITIAL_ATTENDANCE_RECORDS);
  quizzes = getOrInit<Quiz[]>('quizzes', INITIAL_QUIZZES);
  quizQuestions = getOrInit<QuizQuestion[]>('quiz_questions', INITIAL_QUIZ_QUESTIONS);
  quizAttempts = getOrInit<QuizAttempt[]>('quiz_attempts', []);
  quizAnswers = getOrInit<QuizAnswer[]>('quiz_answers', []);
  discussions = getOrInit<Discussion[]>('discussions', INITIAL_DISCUSSIONS);
  discussionReplies = getOrInit<DiscussionReply[]>('discussion_replies', INITIAL_DISCUSSION_REPLIES);
  discussionLikes = getOrInit<{ discussion_id: string; user_id: string }[]>('discussion_likes', [
    { discussion_id: 'disc-001', user_id: '00000000-0000-0000-0000-000000000010' }
  ]);
  notifications = getOrInit<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);

  persist() {
    saveStore('profiles', this.profiles);
    saveStore('registration_requests', this.registrationRequests);
    saveStore('subjects', this.subjects);
    saveStore('timetable', this.timetable);
    saveStore('announcements', this.announcements);
    saveStore('notes', this.notes);
    saveStore('assignments', this.assignments);
    saveStore('attendance_sessions', this.attendanceSessions);
    saveStore('attendance_records', this.attendanceRecords);
    saveStore('quizzes', this.quizzes);
    saveStore('quiz_questions', this.quizQuestions);
    saveStore('quiz_attempts', this.quizAttempts);
    saveStore('quiz_answers', this.quizAnswers);
    saveStore('discussions', this.discussions);
    saveStore('discussion_replies', this.discussionReplies);
    saveStore('discussion_likes', this.discussionLikes);
    saveStore('notifications', this.notifications);
  }

  resetToDefault() {
    this.profiles = [...INITIAL_PROFILES];
    this.registrationRequests = [...INITIAL_REGISTRATION_REQUESTS];
    this.subjects = [...INITIAL_SUBJECTS];
    this.timetable = [...INITIAL_TIMETABLE];
    this.announcements = [...INITIAL_ANNOUNCEMENTS];
    this.notes = [...INITIAL_NOTES];
    this.assignments = [...INITIAL_ASSIGNMENTS];
    this.attendanceSessions = [...INITIAL_ATTENDANCE_SESSIONS];
    this.attendanceRecords = [...INITIAL_ATTENDANCE_RECORDS];
    this.quizzes = [...INITIAL_QUIZZES];
    this.quizQuestions = [...INITIAL_QUIZ_QUESTIONS];
    this.quizAttempts = [];
    this.quizAnswers = [];
    this.discussions = [...INITIAL_DISCUSSIONS];
    this.discussionReplies = [...INITIAL_DISCUSSION_REPLIES];
    this.discussionLikes = [{ discussion_id: 'disc-001', user_id: '00000000-0000-0000-0000-000000000010' }];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.persist();
  }
}

export const dbStore = new MockDatabaseStore();
