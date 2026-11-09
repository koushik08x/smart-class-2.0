import React, { useEffect, useState } from 'react';
import { TimetableSlot } from '../types';
import { timetableService } from '../services/timetableService';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  MapPin,
  User,
  Sparkles,
  Calendar,
  Layers,
  Coffee,
  Utensils,
  Info,
  BookOpen,
  Users,
  GraduationCap,
} from 'lucide-react';
import {
  COLLEGE_INFO,
  TIMETABLE_DAYS,
  SUBJECTS_CONFIG,
} from '../data/academicData';

export const TodayTimetableSection: React.FC = () => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<string>('Day 1');
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, TimetableSlot[]>>({});
  const [viewMode, setViewMode] = useState<'day' | 'weekly' | 'directory'>('day');
  const [loading, setLoading] = useState(true);

  // Next / Current class telemetry
  const [scheduleSummary, setScheduleSummary] = useState<{
    currentDay: string;
    liveSlot?: TimetableSlot;
    nextSlot?: TimetableSlot;
    todaySlots: TimetableSlot[];
  } | null>(null);

  useEffect(() => {
    const resolved = timetableService.resolveDay();
    setSelectedDay(resolved);
  }, []);

  const loadData = () => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      timetableService.getTimetableByDay(selectedDay, user?.section, 1),
      timetableService.getDashboardScheduleSummary(user?.section),
      timetableService.getWeeklySchedule(user?.section),
    ]).then(([daySlots, summary, weekly]) => {
      if (isMounted) {
        setSlots(daySlots);
        setScheduleSummary(summary);
        setWeeklySchedule(weekly);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    loadData();
  }, [selectedDay, user?.section]);

  const activeFocusClass = scheduleSummary?.liveSlot || scheduleSummary?.nextSlot || slots[0];

  return (
    <div className="space-y-6">
      {/* 60% Cream Institutional Summary Card */}
      <div className="p-5 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#C65D32] flex items-center justify-center text-[#F5F0E6] shrink-0 shadow-[0_4px_14px_rgba(198,93,50,0.3)]">
            <Calendar className="w-5 h-5 text-[#F5F0E6]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-[#171717] text-sm">{COLLEGE_INFO.university}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#171717] text-[#F5F0E6] font-semibold">
                {COLLEGE_INFO.department}
              </span>
            </div>
            <p className="text-[#5C554B] mt-0.5">
              Academic Year {COLLEGE_INFO.academicYear} &bull; Semester {COLLEGE_INFO.semester} ({COLLEGE_INFO.section}) &bull; Class Advisor: <strong className="text-[#171717]">{COLLEGE_INFO.classAdvisor}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[#5C554B] shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E5DCCB] font-semibold text-[#171717]">
            Term: {COLLEGE_INFO.commencementDateDisplay} – {COLLEGE_INFO.endDateDisplay}
          </span>
        </div>
      </div>

      {/* 30% INK-BLACK LARGE FEATURE PANEL: Live Lecture Telemetry */}
      {activeFocusClass && (
        <div className="relative p-6 sm:p-8 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-[#F5F0E6] shadow-2xl overflow-hidden">
          {/* Subtle Burnt Orange glow accent */}
          <div className="absolute -top-16 -right-16 w-52 h-52 bg-[#C65D32]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase font-black tracking-wider ${
                    scheduleSummary?.liveSlot
                      ? 'bg-[#C65D32] text-[#F5F0E6] shadow-[0_2px_12px_rgba(198,93,50,0.5)]'
                      : 'bg-[#292929] text-[#EDE5D8] border border-[#3E3E3E]'
                  }`}
                >
                  {scheduleSummary?.liveSlot ? '• LIVE IN SESSION' : 'NEXT UPCOMING PERIOD'}
                </span>
                <span className="text-xs font-mono text-[#B3ADA3]">
                  {selectedDay} &bull; {activeFocusClass.period_label || 'Period'}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="text-2xl sm:text-3xl font-black text-[#F5F0E6] tracking-tight">
                  {activeFocusClass.subject_abbr} – {activeFocusClass.subject_name}
                </h3>
                <span className="font-mono text-xs text-[#C65D32] bg-[#C65D32]/15 px-2.5 py-0.5 rounded-md border border-[#C65D32]/30 font-bold">
                  {activeFocusClass.subject_code}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-5 text-xs text-[#D6CFC4] pt-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C65D32]" />
                  <span>Faculty: <strong className="text-[#F5F0E6]">{activeFocusClass.faculty_name}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C65D32]" />
                  <span className="font-mono">{activeFocusClass.start_time} – {activeFocusClass.end_time}</span>
                </div>
                {activeFocusClass.classroom ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C65D32]" />
                    <span>Room: <strong className="text-[#F5F0E6] font-mono">{activeFocusClass.classroom}</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[#777777] italic">
                    <MapPin className="w-4 h-4 text-[#555555]" />
                    <span>Room: Not Specified</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto shrink-0">
              <span className="text-xs font-mono font-semibold text-[#D6CFC4] px-4 py-2 rounded-2xl bg-[#242424] border border-[#333333]">
                P1–P7 Standard Flow
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Control Navigation: Day Selector & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DCCB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#C65D32] uppercase font-bold">SCHEDULE PROTOCOL</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C65D32]" />
            <span className="text-xs text-[#5C554B]">Section {COLLEGE_INFO.section}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight mt-0.5">
            Academic Timetable & Lecture Streams
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Day 1 - Day 5 Tabs (Ink Black bar with Burnt Orange active states) */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#171717] border border-[#2B2B2B] overflow-x-auto shadow-sm">
            {TIMETABLE_DAYS.map((day) => (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  setViewMode('day');
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'day' && selectedDay === day
                    ? 'bg-[#C65D32] text-[#F5F0E6] shadow-[0_2px_10px_rgba(198,93,50,0.5)]'
                    : 'text-[#B3ADA3] hover:text-[#F5F0E6] hover:bg-white/5'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Matrix view toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'weekly' ? 'day' : 'weekly')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-[#171717] text-[#F5F0E6] border-[#171717]'
                : 'bg-white border-[#E5DCCB] text-[#171717] hover:border-[#C65D32]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{viewMode === 'weekly' ? 'Close 5-Day Matrix' : 'Full 5-Day Matrix'}</span>
          </button>

          {/* Faculty & Subject Directory toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'directory' ? 'day' : 'directory')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              viewMode === 'directory'
                ? 'bg-[#171717] text-[#F5F0E6] border-[#171717]'
                : 'bg-white border-[#E5DCCB] text-[#171717] hover:border-[#C65D32]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{viewMode === 'directory' ? 'Back to Timetable' : 'Faculty & Courses'}</span>
          </button>
        </div>
      </div>

      {/* Lectures Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white border border-[#E5DCCB]" />
          ))}
        </div>
      ) : viewMode === 'weekly' ? (
        /* Full 5-Day Matrix View on Cream Workspace */
        <div className="space-y-6">
          {TIMETABLE_DAYS.map((day) => {
            const dayEntries = weeklySchedule[day] || [];
            return (
              <div key={day} className="p-6 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DCCB]">
                  <h3 className="text-base font-black text-[#171717] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C65D32]" />
                    {day} Schedule
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#5C554B]">{dayEntries.length} Periods</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {dayEntries.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB] hover:border-[#C65D32] transition-all space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-[#171717] text-[#F5F0E6] text-[11px]">
                          {slot.period_label || 'Period'}
                        </span>
                        <span className="font-mono text-[#5C554B] text-[11px] font-semibold">{slot.start_time} – {slot.end_time}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#171717] text-sm">{slot.subject_abbr}</span>
                          <span className="text-[#5C554B] truncate font-medium">{slot.subject_name}</span>
                        </div>
                        <p className="text-[11px] text-[#7A7265] mt-0.5 truncate">{slot.faculty_name}</p>
                      </div>

                      <div className="pt-2 border-t border-[#E5DCCB] flex items-center justify-between text-[11px]">
                        {slot.classroom ? (
                          <span className="font-mono text-[#C65D32] font-bold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#C65D32]" /> Room {slot.classroom}
                          </span>
                        ) : (
                          <span className="text-[#999999] italic">No room assigned</span>
                        )}
                        <span className="font-mono text-[#7A7265] text-[10px] font-semibold">{slot.subject_code}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'directory' ? (
        /* Complete Faculty & Course Directory View */
        <div className="space-y-6 animate-in fade-in">
          {/* Institutional Class Advisor 30% Ink-Black Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-[#F5F0E6] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#C65D32] flex items-center justify-center text-[#F5F0E6] font-mono font-black text-xl shadow-[0_4px_16px_rgba(198,93,50,0.4)]">
                CAM
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C65D32] font-bold px-2.5 py-0.5 rounded-full bg-[#C65D32]/20 border border-[#C65D32]/40">
                  CLASS ADVISOR
                </span>
                <h3 className="text-xl font-black text-[#F5F0E6] mt-1">{COLLEGE_INFO.classAdvisor}</h3>
                <p className="text-xs text-[#B3ADA3] mt-0.5">
                  Class Advisor Meeting (CAM) &bull; Section {COLLEGE_INFO.section} &bull; {COLLEGE_INFO.department}
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-[#B3ADA3] space-y-1 sm:text-right">
              <p className="text-[#C65D32] font-bold">{COLLEGE_INFO.university}</p>
              <p>Academic Term: {COLLEGE_INFO.academicYear} (Semester {COLLEGE_INFO.semester})</p>
            </div>
          </div>

          {/* Theory Subjects Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#E5DCCB]">
              <h3 className="text-base font-black text-[#171717] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#C65D32]" />
                Theory Courses (8 Modules)
              </h3>
              <span className="text-xs font-mono font-bold text-[#5C554B]">Course Codes: 25BEPHY101 – 25BEPHY108</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SUBJECTS_CONFIG.filter((s) => !s.isLab && !['sub-cam', 'sub-lib', 'sub-sports'].includes(s.id)).map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm hover:border-[#C65D32] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md font-mono text-xs font-black bg-[#171717] text-[#F5F0E6]">
                        {sub.abbr}
                      </span>
                      <span className="font-mono text-[10px] text-[#C65D32] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DCCB] font-bold">
                        {sub.code}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#171717] leading-snug mb-2">{sub.name}</h4>
                  </div>

                  <div className="pt-3 border-t border-[#E5DCCB] flex items-center justify-between text-xs text-[#5C554B]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#C65D32]" />
                      <span className="truncate max-w-[140px] font-medium">{sub.faculty}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#7A7265] font-semibold">{sub.credits} Credits</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Laboratory Modules Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#E5DCCB]">
              <h3 className="text-base font-black text-[#171717] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C65D32]" />
                Laboratory Practical Modules (4 Labs with Batch Allocation)
              </h3>
              <span className="text-xs font-mono font-bold text-[#5C554B]">Batches B1 & B2</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SUBJECTS_CONFIG.filter((s) => s.isLab).map((lab) => (
                <div key={lab.id} className="p-6 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-xl font-mono text-xs font-black bg-[#171717] text-[#F5F0E6]">
                        {lab.abbr}
                      </span>
                      <h4 className="text-base font-bold text-[#171717]">{lab.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#5C554B]">{lab.credits} Credits</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB] space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#C65D32] font-black">BATCH 1 (B1)</span>
                      <p className="text-[#171717] font-semibold">{lab.labBatches?.b1}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB] space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#171717] font-black">BATCH 2 (B2)</span>
                      <p className="text-[#171717] font-semibold">{lab.labBatches?.b2}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : slots.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#E5DCCB]">
          <Calendar className="w-10 h-10 text-[#7A7265] mx-auto mb-3" />
          <p className="text-[#171717] font-bold">No scheduled lectures for {selectedDay}.</p>
          <p className="text-xs text-[#7A7265] mt-1">Study sandboxes and library remain open.</p>
        </div>
      ) : (
        /* Single Day View (Periods Flow on Cream Workspace) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slots.map((slot, index) => {
              const isLive = slot.is_live;

              return (
                <div
                  key={slot.id}
                  className={`p-6 rounded-3xl transition-all duration-200 relative ${
                    isLive
                      ? 'bg-white border-2 border-[#C65D32] shadow-lg ring-4 ring-[#C65D32]/10'
                      : 'bg-white border border-[#E5DCCB] shadow-sm hover:border-[#C65D32]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-[#171717] text-[#F5F0E6]">
                        {slot.period_label || `P${index + 1}`}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FAF7F2] text-[#C65D32] border border-[#E5DCCB]">
                        {slot.subject_abbr || slot.subject_code}
                      </span>
                      <span className="text-[11px] font-mono text-[#7A7265]">{slot.subject_code}</span>
                    </div>

                    {isLive ? (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#C65D32] text-[#F5F0E6] shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                          LIVE NOW
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-[#5C554B] font-mono font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#7A7265]" />
                        <span>{slot.start_time} – {slot.end_time}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#171717] leading-snug">
                    {slot.subject_name}
                  </h3>

                  {slot.batch_info && (
                    <div className="mt-2.5 p-2 rounded-xl bg-[#FAF7F2] border border-[#E5DCCB] text-[11px] text-[#C65D32] font-mono font-semibold">
                      &bull; Batches: {slot.batch_info}
                    </div>
                  )}

                  <div className="mt-4 pt-3.5 border-t border-[#E5DCCB] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C554B]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#C65D32]" />
                      <span className="font-medium">{slot.faculty_name}</span>
                    </div>

                    {slot.classroom ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#171717] text-[#F5F0E6] font-mono text-xs font-bold">
                        <MapPin className="w-3.5 h-3.5 text-[#C65D32]" />
                        <span>Room {slot.classroom}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[#999999] italic text-[11px]">
                        <MapPin className="w-3 h-3 text-[#999999]" />
                        <span>Room: Not Specified</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Institutional Breaks Reference Bar */}
          <div className="p-4 rounded-2xl bg-[#171717] text-[#F5F0E6] border border-[#2E2E2E] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-[#C65D32]" />
              <span>Tea Break: <strong className="text-[#F5F0E6]">10:30 AM – 10:45 AM</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#C65D32]" />
              <span>Lunch Break: <strong className="text-[#F5F0E6]">12:45 PM – 1:45 PM</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[#9E978C] text-[11px]">
              <Info className="w-3.5 h-3.5 text-[#C65D32]" />
              <span>Class timings synchronized with Sapthagiri NPS University bells</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
