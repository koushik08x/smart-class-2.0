/**
 * CENTRALIZED ACADEMIC DATA SOURCE
 * University: Sapthagiri NPS University
 * Department: Computer Science and Engineering
 * Academic Year: 2026–2027
 * Semester: 1 | Section: 1CSE22
 * Class Advisor: Mr. Prathap M S
 * Semester Period: 07 September 2026 – 05 January 2027
 */

export interface PeriodSlotDef {
  period: string; // 'P1', 'P2', 'Tea Break', 'P3', 'P4', 'Lunch', 'P5', 'P6', 'P7'
  name: string;
  startTime: string;
  endTime: string;
  isBreak?: boolean;
}

export const COLLEGE_INFO = {
  university: 'Sapthagiri NPS University',
  department: 'Computer Science and Engineering',
  academicYear: '2026–2027',
  semester: 1,
  section: '1CSE22',
  classAdvisor: 'Mr. Prathap M S',
  commencementDate: '2026-09-07',
  endDate: '2027-01-05',
  commencementDateDisplay: '07 September 2026',
  endDateDisplay: '05 January 2027',
};

// Official Time Slots
export const TIME_SLOTS: PeriodSlotDef[] = [
  { period: 'P1', name: 'Period 1', startTime: '08:30', endTime: '09:30' },
  { period: 'P2', name: 'Period 2', startTime: '09:30', endTime: '10:30' },
  { period: 'Tea Break', name: 'Tea Break', startTime: '10:30', endTime: '10:45', isBreak: true },
  { period: 'P3', name: 'Period 3', startTime: '10:45', endTime: '11:45' },
  { period: 'P4', name: 'Period 4', startTime: '11:45', endTime: '12:45' },
  { period: 'Lunch', name: 'Lunch Break', startTime: '12:45', endTime: '13:45', isBreak: true },
  { period: 'P5', name: 'Period 5', startTime: '13:45', endTime: '14:40' },
  { period: 'P6', name: 'Period 6', startTime: '14:40', endTime: '15:35' },
  { period: 'P7', name: 'Period 7', startTime: '15:35', endTime: '16:30' },
];

export interface SubjectDef {
  id: string;
  code: string;       // e.g. '25BEPHY101'
  abbr: string;       // e.g. 'MAT'
  name: string;       // e.g. 'Mathematics I'
  faculty: string;    // e.g. 'Mrs. Prajwala Y M'
  color: string;
  credits: number;
  isLab?: boolean;
  labBatches?: { b1: string; b2: string };
}

// 8 Theory Subjects + Labs + Special Activities
export const SUBJECTS_CONFIG: SubjectDef[] = [
  {
    id: 'sub-mat',
    code: '25BEPHY101',
    abbr: 'MAT',
    name: 'Mathematics I',
    faculty: 'Mrs. Prajwala Y M',
    color: '#8B5CF6', // Electric Violet
    credits: 4,
  },
  {
    id: 'sub-phy',
    code: '25BEPHY102',
    abbr: 'PHY',
    name: 'Engineering Physics',
    faculty: 'Mr. Umesh Anthakanavar',
    color: '#06B6D4', // Cyber Cyan
    credits: 4,
  },
  {
    id: 'sub-dti',
    code: '25BEPHY103',
    abbr: 'DTI',
    name: 'Design Thinking and Innovation',
    faculty: 'Mrs. Priyadarshini H P',
    color: '#EC4899', // Pink / Magenta
    credits: 3,
  },
  {
    id: 'sub-psc',
    code: '25BEPHY104',
    abbr: 'PSC',
    name: 'Problem Solving Using C',
    faculty: 'Mr. Prathap M S',
    color: '#3B82F6', // Blue
    credits: 4,
  },
  {
    id: 'sub-bee',
    code: '25BEPHY105',
    abbr: 'BEE',
    name: 'Basics of Electrical Engineering',
    faculty: 'Mrs. Sneha S',
    color: '#F59E0B', // Amber
    credits: 3,
  },
  {
    id: 'sub-caeg',
    code: '25BEPHY106',
    abbr: 'CAEG',
    name: 'Computer Aided Engineering Graphics',
    faculty: 'Mr. Raghavendra N',
    color: '#10B981', // Emerald
    credits: 3,
  },
  {
    id: 'sub-eng',
    code: '25BEPHY107',
    abbr: 'ENG',
    name: 'Communicative English',
    faculty: 'HRD Trainer',
    color: '#6366F1', // Indigo
    credits: 2,
  },
  {
    id: 'sub-ipr',
    code: '25BEPHY108',
    abbr: 'IPR',
    name: 'Intellectual Property Rights',
    faculty: 'Mr. Ravikanth',
    color: '#84CC16', // Lime
    credits: 2,
  },
  // Labs
  {
    id: 'sub-matl',
    code: '25BEPHYL101',
    abbr: 'MATL',
    name: 'Mathematics Lab',
    faculty: 'B1: Mrs. Prajwala Y M / B2: Dr. Saravanan V',
    color: '#A855F7',
    credits: 1.5,
    isLab: true,
    labBatches: {
      b1: 'Mrs. Prajwala Y M',
      b2: 'Dr. Saravanan V',
    },
  },
  {
    id: 'sub-phyl',
    code: '25BEPHYL102',
    abbr: 'PHYL',
    name: 'Engineering Physics Lab',
    faculty: 'B1: Dr. Umashankar Raja R / B2: Dr. Bhavana H V',
    color: '#0EA5E9',
    credits: 1.5,
    isLab: true,
    labBatches: {
      b1: 'Dr. Umashankar Raja R',
      b2: 'Dr. Bhavana H V',
    },
  },
  {
    id: 'sub-pscl',
    code: '25BEPHYL104',
    abbr: 'PSCL',
    name: 'Problem Solving Using C Lab',
    faculty: 'B1: Vyshnavi M / B2: Hemalatha K',
    color: '#2563EB',
    credits: 1.5,
    isLab: true,
    labBatches: {
      b1: 'Vyshnavi M',
      b2: 'Hemalatha K',
    },
  },
  {
    id: 'sub-caegl',
    code: '25BEPHYL106',
    abbr: 'CAEGL',
    name: 'Computer Aided Engineering Graphics Lab',
    faculty: 'B1: Mr. Raghavendra N / B2: Mr. Ramesh N G',
    color: '#059669',
    credits: 1.5,
    isLab: true,
    labBatches: {
      b1: 'Mr. Raghavendra N',
      b2: 'Mr. Ramesh N G',
    },
  },
  // Co-curricular / Advisory
  {
    id: 'sub-cam',
    code: 'CAM-101',
    abbr: 'CAM',
    name: 'Class Advisor Meeting',
    faculty: 'Mr. Prathap M S',
    color: '#E11D48',
    credits: 0,
  },
  {
    id: 'sub-lib',
    code: 'LIB-101',
    abbr: 'LIB',
    name: 'Library & Research Session',
    faculty: 'Library Staff',
    color: '#64748B',
    credits: 0,
  },
  {
    id: 'sub-sports',
    code: 'SPT-101',
    abbr: 'SPORTS',
    name: 'Physical Education & Sports',
    faculty: 'Sports Director',
    color: '#D97706',
    credits: 0,
  },
];

export interface TimetableEntryDef {
  id: string;
  day: 'Day 1' | 'Day 2' | 'Day 3' | 'Day 4' | 'Day 5';
  period: string; // 'P1', 'P2', 'P3–P4', 'P5', 'P6', 'P7', etc.
  startTime: string;
  endTime: string;
  subjectAbbr: string;
  classroom?: string; // EXACT: Never invent missing room numbers!
  batchInfo?: string;
}

/**
 * EXACT 5-DAY TIMETABLE AS SPECIFIED:
 * 
 * DAY 1:
 * P1 BEE – A1018
 * P2 PSC – A1018
 * P3–P4 ENG – A1018
 * 
 * DAY 2:
 * P1 MAT – A1018
 * P2 DTI – A1018
 * P3–P4 CAEGL – A1221
 * P5 PSC – A1018
 * P6 BEE (no room specified)
 * 
 * DAY 3:
 * P1–P2 PSCL – A1121
 * P3 PHY – A1018
 * P4 DTI – A1018
 * P5 MAT – A1018
 * P6 LIB (no room specified)
 * P7 SPORTS (no room specified)
 * 
 * DAY 4:
 * P1 DTI – A1018
 * P2 PSC – A1018
 * P3–P4 PHYL (no room specified)
 * P5 IPR – A1018
 * P6 CAEG (no room specified)
 * P7 CAM (no room specified)
 * 
 * DAY 5:
 * P1–P2 CAEG – A1018
 * P3 PHY (no room specified)
 * P4 MAT (no room specified)
 * P5 BEE (no room specified)
 * P6–P7 MATL (no room specified)
 */
export const RAW_TIMETABLE_ENTRIES: TimetableEntryDef[] = [
  // DAY 1
  {
    id: 'tt-d1-p1',
    day: 'Day 1',
    period: 'P1',
    startTime: '08:30',
    endTime: '09:30',
    subjectAbbr: 'BEE',
    classroom: 'A1018',
  },
  {
    id: 'tt-d1-p2',
    day: 'Day 1',
    period: 'P2',
    startTime: '09:30',
    endTime: '10:30',
    subjectAbbr: 'PSC',
    classroom: 'A1018',
  },
  {
    id: 'tt-d1-p3p4',
    day: 'Day 1',
    period: 'P3–P4',
    startTime: '10:45',
    endTime: '12:45',
    subjectAbbr: 'ENG',
    classroom: 'A1018',
  },

  // DAY 2
  {
    id: 'tt-d2-p1',
    day: 'Day 2',
    period: 'P1',
    startTime: '08:30',
    endTime: '09:30',
    subjectAbbr: 'MAT',
    classroom: 'A1018',
  },
  {
    id: 'tt-d2-p2',
    day: 'Day 2',
    period: 'P2',
    startTime: '09:30',
    endTime: '10:30',
    subjectAbbr: 'DTI',
    classroom: 'A1018',
  },
  {
    id: 'tt-d2-p3p4',
    day: 'Day 2',
    period: 'P3–P4',
    startTime: '10:45',
    endTime: '12:45',
    subjectAbbr: 'CAEGL',
    classroom: 'A1221',
    batchInfo: 'B1: Mr. Raghavendra N | B2: Mr. Ramesh N G',
  },
  {
    id: 'tt-d2-p5',
    day: 'Day 2',
    period: 'P5',
    startTime: '13:45',
    endTime: '14:40',
    subjectAbbr: 'PSC',
    classroom: 'A1018',
  },
  {
    id: 'tt-d2-p6',
    day: 'Day 2',
    period: 'P6',
    startTime: '14:40',
    endTime: '15:35',
    subjectAbbr: 'BEE',
    // No classroom mentioned: Never invent missing room numbers
  },

  // DAY 3
  {
    id: 'tt-d3-p1p2',
    day: 'Day 3',
    period: 'P1–P2',
    startTime: '08:30',
    endTime: '10:30',
    subjectAbbr: 'PSCL',
    classroom: 'A1121',
    batchInfo: 'B1: Vyshnavi M | B2: Hemalatha K',
  },
  {
    id: 'tt-d3-p3',
    day: 'Day 3',
    period: 'P3',
    startTime: '10:45',
    endTime: '11:45',
    subjectAbbr: 'PHY',
    classroom: 'A1018',
  },
  {
    id: 'tt-d3-p4',
    day: 'Day 3',
    period: 'P4',
    startTime: '11:45',
    endTime: '12:45',
    subjectAbbr: 'DTI',
    classroom: 'A1018',
  },
  {
    id: 'tt-d3-p5',
    day: 'Day 3',
    period: 'P5',
    startTime: '13:45',
    endTime: '14:40',
    subjectAbbr: 'MAT',
    classroom: 'A1018',
  },
  {
    id: 'tt-d3-p6',
    day: 'Day 3',
    period: 'P6',
    startTime: '14:40',
    endTime: '15:35',
    subjectAbbr: 'LIB',
  },
  {
    id: 'tt-d3-p7',
    day: 'Day 3',
    period: 'P7',
    startTime: '15:35',
    endTime: '16:30',
    subjectAbbr: 'SPORTS',
  },

  // DAY 4
  {
    id: 'tt-d4-p1',
    day: 'Day 4',
    period: 'P1',
    startTime: '08:30',
    endTime: '09:30',
    subjectAbbr: 'DTI',
    classroom: 'A1018',
  },
  {
    id: 'tt-d4-p2',
    day: 'Day 4',
    period: 'P2',
    startTime: '09:30',
    endTime: '10:30',
    subjectAbbr: 'PSC',
    classroom: 'A1018',
  },
  {
    id: 'tt-d4-p3p4',
    day: 'Day 4',
    period: 'P3–P4',
    startTime: '10:45',
    endTime: '12:45',
    subjectAbbr: 'PHYL',
    batchInfo: 'B1: Dr. Umashankar Raja R | B2: Dr. Bhavana H V',
  },
  {
    id: 'tt-d4-p5',
    day: 'Day 4',
    period: 'P5',
    startTime: '13:45',
    endTime: '14:40',
    subjectAbbr: 'IPR',
    classroom: 'A1018',
  },
  {
    id: 'tt-d4-p6',
    day: 'Day 4',
    period: 'P6',
    startTime: '14:40',
    endTime: '15:35',
    subjectAbbr: 'CAEG',
  },
  {
    id: 'tt-d4-p7',
    day: 'Day 4',
    period: 'P7',
    startTime: '15:35',
    endTime: '16:30',
    subjectAbbr: 'CAM',
    batchInfo: 'Class Advisor: Mr. Prathap M S',
  },

  // DAY 5
  {
    id: 'tt-d5-p1p2',
    day: 'Day 5',
    period: 'P1–P2',
    startTime: '08:30',
    endTime: '10:30',
    subjectAbbr: 'CAEG',
    classroom: 'A1018',
  },
  {
    id: 'tt-d5-p3',
    day: 'Day 5',
    period: 'P3',
    startTime: '10:45',
    endTime: '11:45',
    subjectAbbr: 'PHY',
  },
  {
    id: 'tt-d5-p4',
    day: 'Day 5',
    period: 'P4',
    startTime: '11:45',
    endTime: '12:45',
    subjectAbbr: 'MAT',
  },
  {
    id: 'tt-d5-p5',
    day: 'Day 5',
    period: 'P5',
    startTime: '13:45',
    endTime: '14:40',
    subjectAbbr: 'BEE',
  },
  {
    id: 'tt-d5-p6p7',
    day: 'Day 5',
    period: 'P6–P7',
    startTime: '14:40',
    endTime: '16:30',
    subjectAbbr: 'MATL',
    batchInfo: 'B1: Mrs. Prajwala Y M | B2: Dr. Saravanan V',
  },
];

export const TIMETABLE_DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'] as const;

// Helper to find subject definition by abbreviation or code
export function getSubjectByAbbr(abbr: string): SubjectDef | undefined {
  return SUBJECTS_CONFIG.find((s) => s.abbr.toUpperCase() === abbr.toUpperCase());
}

export function getSubjectByCode(code: string): SubjectDef | undefined {
  return SUBJECTS_CONFIG.find((s) => s.code.toUpperCase() === code.toUpperCase());
}
