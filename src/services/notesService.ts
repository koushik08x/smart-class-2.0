import { supabase, isSupabaseConfigured, realtimeBus } from '../lib/supabase';
import { dbStore } from './mockDatabase';
import { StudyNote } from '../types';
import { storageService } from './storageService';

export const notesService = {
  // Fetch notes with optional subject filter
  async getNotes(subjectId?: string): Promise<StudyNote[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('notes')
          .select('*, subjects(subject_name, subject_code), profiles!uploaded_by(full_name)')
          .order('created_at', { ascending: false });

        if (subjectId && subjectId !== 'all') {
          query = query.eq('subject_id', subjectId);
        }

        const { data, error } = await query;
        if (data && !error) {
          return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            subject_id: item.subject_id,
            subject_name: item.subjects?.subject_name,
            subject_code: item.subjects?.subject_code,
            uploaded_by: item.uploaded_by,
            author_name: item.profiles?.full_name,
            file_path: item.file_path,
            file_type: item.file_type,
            file_size: item.file_size,
            download_count: item.download_count,
            created_at: item.created_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase notes query fallback to local:', err);
      }
    }

    if (subjectId && subjectId !== 'all') {
      return dbStore.notes.filter((n) => n.subject_id === subjectId);
    }
    return [...dbStore.notes];
  },

  // Faculty upload study material
  async uploadNote(data: {
    title: string;
    description: string;
    subjectId: string;
    uploadedBy: string;
    authorName: string;
    file: File;
  }): Promise<{ note: StudyNote; error?: string }> {
    const uploadRes = await storageService.uploadFile({
      bucket: 'study-materials',
      file: data.file,
      allowedTypes: ['application/pdf', '.pdf', '.docx', '.pptx', '.zip'],
      maxSizeMB: 50,
    });

    if (uploadRes.error) {
      return { note: {} as any, error: uploadRes.error };
    }

    const subject = dbStore.subjects.find((s) => s.id === data.subjectId);
    const newNote: StudyNote = {
      id: `not-${Date.now()}`,
      title: data.title,
      description: data.description,
      subject_id: data.subjectId,
      subject_name: subject?.subject_name,
      subject_code: subject?.subject_code,
      uploaded_by: data.uploadedBy,
      author_name: data.authorName,
      file_path: uploadRes.path,
      file_type: data.file.type || 'application/pdf',
      file_size: data.file.size,
      download_count: 0,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('notes').insert([
          {
            title: data.title,
            description: data.description,
            subject_id: data.subjectId,
            uploaded_by: data.uploadedBy,
            file_path: uploadRes.path,
            file_type: newNote.file_type,
            file_size: newNote.file_size,
          },
        ]);
      } catch (err) {
        console.warn('Supabase note insert error:', err);
      }
    }

    dbStore.notes.unshift(newNote);
    dbStore.persist();

    realtimeBus.emit('note_uploaded', newNote);

    // Notify students
    for (const student of dbStore.profiles.filter((p) => p.role === 'student')) {
      dbStore.notifications.push({
        id: `notif-${Date.now()}-${student.id.substring(0, 4)}`,
        user_id: student.id,
        title: `New Material: ${data.title}`,
        message: `${data.authorName} uploaded notes for ${subject?.subject_code || 'class'}.`,
        notification_type: 'notes',
        related_id: newNote.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }
    dbStore.persist();

    return { note: newNote };
  },

  // Increment download counter
  async recordDownload(noteId: string): Promise<void> {
    const note = dbStore.notes.find((n) => n.id === noteId);
    if (note) {
      note.download_count += 1;
      dbStore.persist();
    }
  }
};
