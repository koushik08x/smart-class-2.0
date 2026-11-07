# SmartClassroom 2.0 — Vision Lumina

A next-generation institutional academic hub built with **React**, **Tailwind CSS**, and **Supabase Backend as a Service**. Engineered with a spatial glassmorphism interface, liquid glow effects, real-time timetable telemetry, regulatory attendance monitoring, verified courseware vault, laboratory assignment dropboxes, and daily competitive syllabus quizzes.

---

## 🏛️ Institutional Profile

- **University:** Sapthagiri NPS University
- **Department:** Department of Computer Science and Engineering
- **Academic Year:** 2026–2027
- **Semester & Section:** Semester 1 • Section 1CSE22
- **Class Advisor:** Mr. Prathap M S
- **Semester Term:** 07 September 2026 – 05 January 2027

---

## 📚 Curriculum & Faculty Directory

| Course Code | Abbr | Subject Name | Faculty In-Charge | Credits |
| :--- | :--- | :--- | :--- | :--- |
| **25BEPHY101** | MAT | Mathematics I | Mrs. Prajwala Y M | 4 |
| **25BEPHY102** | PHY | Engineering Physics | Mr. Umesh Anthakanavar | 4 |
| **25BEPHY103** | DTI | Design Thinking and Innovation | Mrs. Priyadarshini H P | 3 |
| **25BEPHY104** | PSC | Problem Solving Using C | Mr. Prathap M S | 4 |
| **25BEPHY105** | BEE | Basics of Electrical Engineering | Mrs. Sneha S | 3 |
| **25BEPHY106** | CAEG | Computer Aided Engineering Graphics | Mr. Raghavendra N | 3 |
| **25BEPHY107** | ENG | Communicative English | HRD Trainer | 2 |
| **25BEPHY108** | IPR | Intellectual Property Rights | Mr. Ravikanth | 2 |

### Laboratory Practical Modules (Batch Allocations)

- **MATL (Mathematics Lab):** Batch 1 (B1): Mrs. Prajwala Y M | Batch 2 (B2): Dr. Saravanan V
- **PHYL (Engineering Physics Lab):** Batch 1 (B1): Dr. Umashankar Raja R | Batch 2 (B2): Dr. Bhavana H V
- **PSCL (Problem Solving Using C Lab):** Batch 1 (B1): Vyshnavi M | Batch 2 (B2): Hemalatha K
- **CAEGL (Computer Aided Engineering Graphics Lab):** Batch 1 (B1): Mr. Raghavendra N | Batch 2 (B2): Mr. Ramesh N G

### Institutional & Advisory Engagements

- **CAM (Class Advisor Meeting):** Mr. Prathap M S
- **LIB:** Library & Research Session
- **SPORTS:** Physical Education & Athletics

---

## ⏰ Official Timetable & Period Schedule

### Standard Time Slots
- **P1:** 8:30 AM – 9:30 AM
- **P2:** 9:30 AM – 10:30 AM
- **Tea Break:** 10:30 AM – 10:45 AM
- **P3:** 10:45 AM – 11:45 AM
- **P4:** 11:45 AM – 12:45 PM
- **Lunch Break:** 12:45 PM – 1:45 PM
- **P5:** 1:45 PM – 2:40 PM
- **P6:** 2:40 PM – 3:35 PM
- **P7:** 3:35 PM – 4:30 PM

### 5-Day Lecture Flow
- **Day 1:** P1 BEE (A1018), P2 PSC (A1018), P3–P4 ENG (A1018)
- **Day 2:** P1 MAT (A1018), P2 DTI (A1018), P3–P4 CAEGL (A1221), P5 PSC (A1018), P6 BEE
- **Day 3:** P1–P2 PSCL (A1121), P3 PHY (A1018), P4 DTI (A1018), P5 MAT (A1018), P6 LIB, P7 SPORTS
- **Day 4:** P1 DTI (A1018), P2 PSC (A1018), P3–P4 PHYL, P5 IPR (A1018), P6 CAEG, P7 CAM
- **Day 5:** P1–P2 CAEG (A1018), P3 PHY, P4 MAT, P5 BEE, P6–P7 MATL

*(Classrooms specified strictly where assigned; unassigned rooms remain clean without fabrication).*

---

## ⚡ Architecture & Features

1. **Role-Based Access Control (RBAC):**
   - 4 Institutional Roles: `super_admin`, `class_admin`, `faculty`, `student`.
   - Admin account approval workflow with pending quarantine views.

2. **Supabase PostgreSQL & Security (RLS):**
   - Full migration schema located in `supabase/migrations/20250101000000_smartclassroom_schema.sql`.
   - Comprehensive Row-Level Security policies for profiles, timetable, notes, attendance, assignments, and quizzes.
   - Anti-leakage quiz protection (correct answers hidden from students prior to submission).

3. **Attendance Telemetry Matrix:**
   - Real-time SVG circular gauge calculating percentage with 75.0% statutory threshold validation.
   - Mathematical recovery calculator showing consecutive classes needed to clear exam eligibility.

4. **Academic Courseware Vault & Assignments:**
   - Study materials organization by course code with download telemetry.
   - Assignment dropboxes with deadline timers, file format enforcement, and faculty grading desks.

5. **Competitive Daily Quizzes & Leaderboard:**
   - Timed quizzes with real-time class rank calculations for Section 1CSE22.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📦 Project Structure

```
smart-class-/
├── src/
│   ├── components/         # Spatial liquid glass UI components
│   │   ├── AdminDashboardSection.tsx
│   │   ├── AnnouncementsSection.tsx
│   │   ├── AssignmentsSection.tsx
│   │   ├── AttendanceSection.tsx
│   │   ├── ClassDiscussionsSection.tsx
│   │   ├── DailyQuizzesSection.tsx
│   │   ├── FloatingHUD.tsx
│   │   ├── Header.tsx
│   │   ├── PendingApprovalView.tsx
│   │   ├── QuizRunnerModal.tsx
│   │   ├── RegistrationModal.tsx
│   │   ├── StudyMaterialsSection.tsx
│   │   ├── SupabaseInfoModal.tsx
│   │   └── TodayTimetableSection.tsx
│   ├── context/            # AuthContext & role switching
│   ├── data/               # Centralized academic single source of truth
│   ├── lib/                # Supabase client setup
│   ├── services/           # Academic services & fallback mock database
│   ├── types/              # TypeScript contracts
│   ├── App.tsx             # Root spatial viewport
│   └── main.tsx            # App entry point
├── supabase/
│   ├── functions/          # Deno Edge Function for quiz grading
│   ├── migrations/         # Full PostgreSQL schema with RLS
│   └── seed.sql            # Master seed data for Sapthagiri NPS University
├── package.json
├── tsconfig.json
└── vite.config.ts
```