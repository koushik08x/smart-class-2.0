import { supabase, isSupabaseConfigured, realtimeBus } from '../lib/supabase';
import { dbStore } from './mockDatabase';
import { TimetableSlot } from '../types';
import { TIMETABLE_DAYS, RAW_TIMETABLE_ENTRIES, TIME_SLOTS } from '../data/academicData';
import { notificationService } from './notificationService';

export const timetableService = {
  // Map standard weekday names or day numbers to 'Day 1' - 'Day 5'
  resolveDay(dayInput?: string): string {
    if (!dayInput) {
      const dayNum = new Date().getDay(); // 0 is Sun, 1 is Mon, 5 is Fri
      switch (dayNum) {
        case 1: return 'Day 1';
        case 2: return 'Day 2';
        case 3: return 'Day 3';
        case 4: return 'Day 4';
        case 5: return 'Day 5';
        default: return 'Day 1';
      }
    }

    const lower = dayInput.toLowerCase().trim();
    if (lower.includes('1') || lower.includes('mon')) return 'Day 1';
    if (lower.includes('2') || lower.includes('tue')) return 'Day 2';
    if (lower.includes('3') || lower.includes('wed')) return 'Day 3';
    if (lower.includes('4') || lower.includes('thu')) return 'Day 4';
    if (lower.includes('5') || lower.includes('fri')) return 'Day 5';

    return dayInput;
  },

  // Get timetable for a given day or today
  async getTimetableByDay(
    dayName?: string,
    section: string = '1CSE22',
    semester: number = 1
  ): Promise<TimetableSlot[]> {
    const targetDay = this.resolveDay(dayName);

    let slots: TimetableSlot[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('timetable')
          .select('*, subjects(subject_name, subject_code, color), profiles!faculty_id(full_name)')
          .eq('day_of_week', targetDay)
          .eq('section', section)
          .eq('semester', semester);

        if (data && !error && data.length > 0) {
          slots = data.map((item: any) => ({
            id: item.id,
            subject_id: item.subject_id,
            subject_name: item.subjects?.subject_name,
            subject_code: item.subjects?.subject_code,
            subject_abbr: item.subject_abbr,
            color: item.subjects?.color,
            faculty_id: item.faculty_id,
            faculty_name: item.profiles?.full_name,
            day_of_week: item.day_of_week,
            period_label: item.period_label,
            start_time: item.start_time,
            end_time: item.end_time,
            classroom: item.classroom,
            batch_info: item.batch_info,
            semester: item.semester,
            section: item.section,
          }));
        }
      } catch (err) {
        console.warn('Supabase timetable query fallback to local:', err);
      }
    }

    if (slots.length === 0) {
      slots = dbStore.timetable.filter(
        (t) => t.day_of_week.toLowerCase() === targetDay.toLowerCase() && t.section === section
      );
    }

    // Determine which slot is actively LIVE based on current system time
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return slots
      .map((slot) => {
        const [startH, startM] = slot.start_time.split(':').map(Number);
        const [endH, endM] = slot.end_time.split(':').map(Number);
        const slotStart = startH * 60 + startM;
        const slotEnd = endH * 60 + endM;

        const isLive = currentMinutes >= slotStart && currentMinutes <= slotEnd;
        return {
          ...slot,
          is_live: isLive,
        };
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  },

  // Calculate upcoming period and next class for Dashboard
  async getDashboardScheduleSummary(section: string = '1CSE22'): Promise<{
    currentDay: string;
    liveSlot?: TimetableSlot;
    nextSlot?: TimetableSlot;
    todaySlots: TimetableSlot[];
  }> {
    const currentDay = this.resolveDay();
    const todaySlots = await this.getTimetableByDay(currentDay, section, 1);

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let liveSlot: TimetableSlot | undefined = undefined;
    let nextSlot: TimetableSlot | undefined = undefined;

    for (const slot of todaySlots) {
      const [startH, startM] = slot.start_time.split(':').map(Number);
      const [endH, endM] = slot.end_time.split(':').map(Number);
      const slotStart = startH * 60 + startM;
      const slotEnd = endH * 60 + endM;

      if (currentMinutes >= slotStart && currentMinutes <= slotEnd) {
        liveSlot = slot;
      } else if (currentMinutes < slotStart && !nextSlot) {
        nextSlot = slot;
      }
    }

    // Fallback if after hours: nextSlot is first period of the day
    if (!liveSlot && !nextSlot && todaySlots.length > 0) {
      nextSlot = todaySlots[0];
    }

    return {
      currentDay,
      liveSlot,
      nextSlot,
      todaySlots,
    };
  },

  // Get full weekly 5-day schedule grouped by Day 1 - Day 5
  async getWeeklySchedule(section: string = '1CSE22'): Promise<Record<string, TimetableSlot[]>> {
    const result: Record<string, TimetableSlot[]> = {};

    for (const d of TIMETABLE_DAYS) {
      result[d] = dbStore.timetable
        .filter((t) => t.day_of_week === d && t.section === section)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    }

    return result;
  },

  // Class Admin: Update classroom allocation for a slot and notify students
  async updateClassroom(slotId: string, newClassroom: string, section: string = '1CSE22'): Promise<TimetableSlot | null> {
    const slot = dbStore.timetable.find((t) => t.id === slotId);
    if (!slot) return null;

    const oldRoom = slot.classroom || 'Unassigned';
    slot.classroom = newClassroom.trim();
    dbStore.persist();

    if (isSupabaseConfigured) {
      try {
        await supabase.from('timetable').update({ classroom: slot.classroom }).eq('id', slotId);
      } catch (err) {
        console.warn('Supabase classroom update error:', err);
      }
    }

    realtimeBus.emit('timetable_updated', slot);

    // Automatically notify all students in the section
    await notificationService.dispatchAcademicNotification({
      title: `Classroom Change: ${slot.subject_abbr || slot.subject_name}`,
      message: `${slot.day_of_week} (${slot.start_time}-${slot.end_time}) relocated from ${oldRoom} to ${newClassroom}.`,
      notificationType: 'classroom',
      relatedId: slot.id,
      targetSection: section,
    });

    return slot;
  },

  // Class Admin: Update slot schedule/timing and notify students
  async updateTimetableSlot(
    slotId: string,
    updates: Partial<TimetableSlot>,
    section: string = '1CSE22'
  ): Promise<TimetableSlot | null> {
    const slot = dbStore.timetable.find((t) => t.id === slotId);
    if (!slot) return null;

    Object.assign(slot, updates);
    dbStore.persist();

    if (isSupabaseConfigured) {
      try {
        await supabase.from('timetable').update(updates).eq('id', slotId);
      } catch (err) {
        console.warn('Supabase timetable update error:', err);
      }
    }

    realtimeBus.emit('timetable_updated', slot);

    // Automatically notify all students in the section
    await notificationService.dispatchAcademicNotification({
      title: `Timetable Updated: ${slot.subject_abbr || slot.subject_name}`,
      message: `Schedule adjustment on ${slot.day_of_week} for ${slot.subject_name || slot.subject_abbr}. New hours: ${slot.start_time}-${slot.end_time}.`,
      notificationType: 'timetable',
      relatedId: slot.id,
      targetSection: section,
    });

    return slot;
  },

  // Class Admin / Academic notice: Publish examination schedule update
  async publishExamScheduleChange(data: {
    title: string;
    message: string;
    section?: string;
  }): Promise<void> {
    const targetSection = data.section || '1CSE22';

    await notificationService.dispatchAcademicNotification({
      title: `Exam Schedule Alert: ${data.title}`,
      message: data.message,
      notificationType: 'exam',
      targetSection,
    });
  },
};
