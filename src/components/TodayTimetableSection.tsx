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
  ChevronRight,
  Info,
  BookOpen,
  Users,
  GraduationCap,
} from 'lucide-react';
import {
  COLLEGE_INFO,
  TIMETABLE_DAYS,
  TIME_SLOTS,
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
    // Automatically select today's Day 1-Day 5
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
      {/* Institutional Banner: College & Advisor Info */}
      <div className="p-4 rounded-3xl glass-card flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/30 to-[#06B6D4]/30 flex items-center justify-center border border-white/10 shrink-0">
            <Calendar className="w-5 h-5 text-[#acedff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{COLLEGE_INFO.university}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-[#06B6D4] border border-[#06B6D4]/30">
                {COLLEGE_INFO.department}
              </span>
            </div>
            <p className="text-slate-400 mt-0.5">
              Academic Year {COLLEGE_INFO.academicYear} &bull; Semester {COLLEGE_INFO.semester} ({COLLEGE_INFO.section}) &bull; Class Advisor: <strong className="text-white">{COLLEGE_INFO.classAdvisor}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 shrink-0">
          <span className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/5">
            Term: {COLLEGE_INFO.commencementDateDisplay} – {COLLEGE_INFO.endDateDisplay}
          </span>
        </div>
      </div>

      {/* Live / Next Class Telemetry Card (Dashboard Integration Requirement #1) */}
      {activeFocusClass && (
        <div className="relative p-6 rounded-3xl glass-card border border-white/15 bg-gradient-to-r from-white/[0.04] via-[#8B5CF6]/[0.08] to-[#06B6D4]/[0.05] overflow-hidden shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider ${
                  scheduleSummary?.liveSlot
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_#10b981]'
                    : 'bg-[#8B5CF6]/20 text-[#d0bcff] border border-[#8B5CF6]/40'
                }`}>
                  {scheduleSummary?.liveSlot ? '• LIVE IN SESSION' : 'NEXT UPCOMING PERIOD'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedDay} &bull; {activeFocusClass.period_label || 'Period'}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-2.5">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {activeFocusClass.subject_abbr} – {activeFocusClass.subject_name}
                </h3>
                <span className="font-mono text-xs text-[#06B6D4] bg-cyan-950/60 px-2 py-0.5 rounded border border-[#06B6D4]/30">
                  {activeFocusClass.subject_code}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Faculty: <strong>{activeFocusClass.faculty_name}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#06B6D4]" />
                  <span className="font-mono">{activeFocusClass.start_time} – {activeFocusClass.end_time}</span>
                </div>
                {activeFocusClass.classroom ? (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#EC4899]" />
                    <span>Room: <strong className="text-white font-mono">{activeFocusClass.classroom}</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400 italic">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>Room: Not Specified</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-2xl bg-black/50 border border-white/10">
                P1–P7 Standard Flow
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Section Header with Day Selector & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#06B6D4] uppercase">SCHEDULE PROTOCOL</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
            <span className="text-xs text-slate-400">Section {COLLEGE_INFO.section}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            Academic Timetable & Lecture Streams
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Day 1 - Day 5 Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-full glass-panel border border-white/10 overflow-x-auto">
            {TIMETABLE_DAYS.map((day) => (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  setViewMode('day');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  viewMode === 'day' && selectedDay === day
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Matrix view toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'weekly' ? 'day' : 'weekly')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              viewMode === 'weekly'
                ? 'bg-[#06B6D4] text-black font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'btn-spatial-secondary text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{viewMode === 'weekly' ? 'Close 5-Day Matrix' : 'Full 5-Day Matrix'}</span>
          </button>

          {/* Faculty & Subject Directory toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'directory' ? 'day' : 'directory')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              viewMode === 'directory'
                ? 'bg-[#8B5CF6] text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.5)]'
                : 'btn-spatial-secondary text-slate-300 hover:text-white'
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
            <div key={i} className="h-40 rounded-3xl glass-card bg-white/[0.02]" />
          ))}
        </div>
      ) : viewMode === 'weekly' ? (
        /* Full 5-Day Matrix View */
        <div className="space-y-6">
          {TIMETABLE_DAYS.map((day) => {
            const dayEntries = weeklySchedule[day] || [];
            return (
              <div key={day} className="p-5 rounded-3xl glass-card space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
                    {day} Schedule
                  </h3>
                  <span className="text-xs font-mono text-slate-400">{dayEntries.length} Periods</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dayEntries.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-[#8B5CF6]/20 text-[#d0bcff]">
                          {slot.period_label || 'Period'}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">{slot.start_time} – {slot.end_time}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{slot.subject_abbr}</span>
                          <span className="text-slate-400 truncate">{slot.subject_name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{slot.faculty_name}</p>
                      </div>

                      <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                        {slot.classroom ? (
                          <span className="font-mono text-cyan-300 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#EC4899]" /> Room {slot.classroom}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No room assigned</span>
                        )}
                        <span className="font-mono text-slate-500 text-[10px]">{slot.subject_code}</span>
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
          {/* Institutional Class Advisor Card */}
          <div className="p-6 rounded-3xl glass-card border border-white/15 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-mono font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                CAM
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                  CLASS ADVISOR
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{COLLEGE_INFO.classAdvisor}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Class Advisor Meeting (CAM) &bull; Section {COLLEGE_INFO.section} &bull; {COLLEGE_INFO.department}
                </p>
              </div>
            </div>
            <div className="text-xs font-mono text-slate-400 space-y-1 sm:text-right">
              <p className="text-cyan-300 font-bold">{COLLEGE_INFO.university}</p>
              <p>Academic Term: {COLLEGE_INFO.academicYear} (Semester {COLLEGE_INFO.semester})</p>
            </div>
          </div>

          {/* Theory Subjects Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#8B5CF6]" />
                Theory Courses (8 Modules)
              </h3>
              <span className="text-xs font-mono text-slate-400">Course Codes: 25BEPHY101 – 25BEPHY108</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {SUBJECTS_CONFIG.filter((s) => !s.isLab && !['sub-cam', 'sub-lib', 'sub-sports'].includes(s.id)).map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-3xl glass-card hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-[#8B5CF6]/20 text-[#d0bcff]">
                        {sub.abbr}
                      </span>
                      <span className="font-mono text-[10px] text-[#06B6D4] px-1.5 py-0.5 rounded bg-cyan-950/70 border border-[#06B6D4]/30">
                        {sub.code}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-tight mb-2">{sub.name}</h4>
                  </div>

                  <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#06B6D4]" />
                      <span className="truncate max-w-[150px]">{sub.faculty}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{sub.credits} Credits</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Laboratory Modules Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#06B6D4]" />
                Laboratory Practical Modules (4 Labs with Batch Allocation)
              </h3>
              <span className="text-xs font-mono text-slate-400">Batches B1 & B2</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SUBJECTS_CONFIG.filter((s) => s.isLab).map((lab) => (
                <div key={lab.id} className="p-5 rounded-3xl glass-card space-y-3 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl font-mono text-xs font-bold bg-cyan-500/20 text-[#acedff]">
                        {lab.abbr}
                      </span>
                      <h4 className="text-base font-bold text-white">{lab.name}</h4>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{lab.credits} Credits</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">BATCH 1 (B1)</span>
                      <p className="text-white font-medium">{lab.labBatches?.b1}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-[#06B6D4] font-bold">BATCH 2 (B2)</span>
                      <p className="text-white font-medium">{lab.labBatches?.b2}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Co-Curricular & Advisory */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Co-Curricular & Institutional Periods
              </h3>
              <span className="text-xs font-mono text-slate-400">Section 1CSE22 Engagements</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-3xl glass-card space-y-1 text-xs">
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-500/20 text-rose-300">CAM</span>
                <p className="font-bold text-white text-sm">Class Advisor Meeting</p>
                <p className="text-slate-400">Class Advisor: Mr. Prathap M S</p>
              </div>
              <div className="p-4 rounded-3xl glass-card space-y-1 text-xs">
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-500/20 text-slate-300">LIB</span>
                <p className="font-bold text-white text-sm">Library & Self-Study</p>
                <p className="text-slate-400">Resource Sandbox & Reference Desk</p>
              </div>
              <div className="p-4 rounded-3xl glass-card space-y-1 text-xs">
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-500/20 text-amber-300">SPORTS</span>
                <p className="font-bold text-white text-sm">Physical Education & Sports</p>
                <p className="text-slate-400">Campus Sports Ground & Fitness Arena</p>
              </div>
            </div>
          </div>
        </div>
      ) : slots.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card">
          <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No scheduled lectures for {selectedDay}.</p>
          <p className="text-xs text-slate-500 mt-1">Study sandboxes and library remain open.</p>
        </div>
      ) : (
        /* Single Day View (Periods Flow) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slots.map((slot, index) => {
              const isLive = slot.is_live;

              return (
                <div
                  key={slot.id}
                  className={`relative p-5 rounded-3xl glass-card transition-all duration-300 group overflow-hidden ${
                    isLive
                      ? 'border-t-[#06B6D4] ring-1 ring-[#06B6D4]/40 shadow-[0_0_35px_rgba(6,182,212,0.2)]'
                      : 'hover:border-white/20'
                  }`}
                >
                  {/* Chromatic ambient glow */}
                  <div
                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-all group-hover:opacity-40"
                    style={{ backgroundColor: slot.color || '#8B5CF6' }}
                  />

                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-[#8B5CF6]/20 text-[#acedff] border border-[#8B5CF6]/40">
                        {slot.period_label || `P${index + 1}`}
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold"
                        style={{
                          backgroundColor: `${slot.color || '#8B5CF6'}25`,
                          color: slot.color || '#8B5CF6',
                          border: `1px solid ${slot.color || '#8B5CF6'}40`,
                        }}
                      >
                        {slot.subject_abbr || slot.subject_code}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{slot.subject_code}</span>
                    </div>

                    {isLive ? (
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                        <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-ping" />
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#acedff] font-semibold">
                          LIVE NOW
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.start_time} – {slot.end_time}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#acedff] transition-colors leading-snug">
                    {slot.subject_name}
                  </h3>

                  {slot.batch_info && (
                    <div className="mt-2 p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-cyan-300 font-mono">
                      &bull; Batches: {slot.batch_info}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#06B6D4]" />
                      <span>{slot.faculty_name}</span>
                    </div>

                    {slot.classroom ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black/50 border border-white/10 font-mono text-xs text-[#acedff]">
                        <MapPin className="w-3.5 h-3.5 text-[#EC4899]" />
                        <span>Room {slot.classroom}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400 italic text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>Room: Not Specified</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Institutional Breaks Reference Bar */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Tea Break: <strong>10:30 AM – 10:45 AM</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-cyan-400" />
              <span>Lunch Break: <strong>12:45 PM – 1:45 PM</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Info className="w-3.5 h-3.5 text-purple-400" />
              <span>Class timings synchronized with Sapthagiri NPS University bells</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
