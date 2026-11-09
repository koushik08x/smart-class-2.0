import React, { useEffect, useState } from 'react';
import { StudyNote, Subject } from '../types';
import { notesService } from '../services/notesService';
import { dbStore } from '../services/mockDatabase';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Download, FileText, Upload, Plus, Eye, X, HardDrive, Sparkles } from 'lucide-react';

export const StudyMaterialsSection: React.FC = () => {
  const { user, isFaculty, isAdmin } = useAuth();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [previewNote, setPreviewNote] = useState<StudyNote | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(dbStore.subjects[0]?.id || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const subjects = dbStore.subjects;

  const loadData = () => {
    setLoading(true);
    notesService.getNotes(selectedSubject).then((data) => {
      setNotes(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [selectedSubject]);

  const handleDownload = async (note: StudyNote) => {
    await notesService.recordDownload(note.id);
    setPreviewNote(note);
    loadData();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedFile || !user) return;

    setUploading(true);
    setUploadError(null);

    const res = await notesService.uploadNote({
      title,
      description,
      subjectId,
      file: selectedFile,
      uploadedBy: user.id,
      authorName: user.full_name,
    });

    setUploading(false);
    if (res.error) {
      setUploadError(res.error);
    } else {
      setShowUploadModal(false);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      loadData();
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '2.4 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DCCB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#C65D32] uppercase font-bold">ACADEMIC VAULT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C65D32]" />
            <span className="text-xs text-[#5C554B]">Validated Courseware</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight mt-0.5">
            Study Materials & Lecture Repositories
          </h2>
        </div>

        {(isFaculty || isAdmin) && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl btn-burnt-orange text-xs font-bold shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Courseware (PDF)</span>
          </button>
        )}
      </div>

      {/* 30% INK-BLACK LARGE FEATURE PANEL: Courseware Vault Spotlight */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-[#F5F0E6] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C65D32]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#C65D32]/20 text-[#C65D32] border border-[#C65D32]/40 font-bold">
                DIGITAL REPOSITORY
              </span>
              <span className="text-xs font-mono text-[#B3ADA3]">Semester 1 (1CSE22)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#F5F0E6] tracking-tight">
              Syllabus Slides, Question Banks & Code Reference
            </h3>
            <p className="text-xs text-[#B3ADA3] max-w-xl leading-relaxed">
              Access officially vetted module presentations, tutorial sheets, and laboratory manual PDFs uploaded directly by your course instructors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E] text-center min-w-[110px]">
              <span className="text-2xl sm:text-3xl font-black text-[#C65D32] tabular-nums">{notes.length}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E978C] mt-0.5">Documents</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E] text-center min-w-[110px]">
              <span className="text-2xl sm:text-3xl font-black text-[#EDE5D8] tabular-nums">{subjects.length}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E978C] mt-0.5">Modules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Filter Pills (Ink Black dock with Burnt Orange active states) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 p-1.5 rounded-2xl bg-[#171717] border border-[#2E2E2E]">
        <button
          onClick={() => setSelectedSubject('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedSubject === 'all'
              ? 'bg-[#C65D32] text-[#F5F0E6] shadow-sm'
              : 'text-[#B3ADA3] hover:text-[#F5F0E6] hover:bg-white/5'
          }`}
        >
          All Subjects ({dbStore.notes.length})
        </button>
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubject(sub.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedSubject === sub.id
                ? 'bg-[#C65D32] text-[#F5F0E6] shadow-sm'
                : 'text-[#B3ADA3] hover:text-[#F5F0E6] hover:bg-white/5'
            }`}
          >
            {sub.subject_code}
          </button>
        ))}
      </div>

      {/* 60% CREAM WORKSPACE: Materials Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white border border-[#E5DCCB]" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#E5DCCB]">
          <BookOpen className="w-10 h-10 text-[#7A7265] mx-auto mb-3" />
          <p className="text-[#171717] font-bold">No study materials in this category yet.</p>
          <p className="text-xs text-[#7A7265] mt-1">Check another subject filter or wait for lecture notes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-6 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm hover:border-[#C65D32] transition-all flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#171717] text-[#F5F0E6]">
                    {note.subject_code || 'CSE'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5C554B] font-semibold">
                    <HardDrive className="w-3.5 h-3.5 text-[#7A7265]" />
                    <span>{formatFileSize(note.file_size)}</span>
                  </div>
                </div>

                <h3 className="text-base font-black text-[#171717] group-hover:text-[#C65D32] transition-colors mb-1.5 line-clamp-1">
                  {note.title}
                </h3>
                <p className="text-xs text-[#5C554B] leading-relaxed line-clamp-2">
                  {note.description || 'Verified course slide deck and architectural lecture notes.'}
                </p>
              </div>

              <div className="pt-3.5 border-t border-[#E5DCCB] flex items-center justify-between text-xs text-[#5C554B]">
                <div>
                  <span className="font-bold text-[#171717]">{note.author_name}</span>
                  <p className="text-[10px] text-[#7A7265] font-mono">{note.download_count} accesses</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewNote(note)}
                    className="p-2 rounded-xl btn-cream-outline text-[#171717]"
                    title="View Document Summary"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(note)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl btn-burnt-orange text-xs font-bold shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Reader / Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-[#171717] text-[#F5F0E6] p-6 sm:p-8 border border-[#2E2E2E] shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setPreviewNote(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-[#9E978C] hover:text-[#F5F0E6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="p-3 rounded-2xl bg-[#C65D32]/20 text-[#C65D32] border border-[#C65D32]/30">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C65D32] font-bold">
                  {previewNote.subject_code} &bull; PDF DOCUMENT
                </span>
                <h3 className="text-xl font-black text-[#F5F0E6]">{previewNote.title}</h3>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#202020] border border-[#2E2E2E] space-y-3 mb-6 text-xs">
              <div className="flex justify-between text-[#B3ADA3] font-mono">
                <span>Author: <strong className="text-[#F5F0E6]">{previewNote.author_name}</strong></span>
                <span>File Size: <strong className="text-[#F5F0E6]">{formatFileSize(previewNote.file_size)}</strong></span>
              </div>
              <p className="text-[#D6CFC4] leading-relaxed">
                {previewNote.description || 'Verified course slide deck and architectural lecture notes.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2B2B]">
              <button
                type="button"
                onClick={() => setPreviewNote(null)}
                className="px-4 py-2 rounded-xl btn-ink text-xs"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  notesService.recordDownload(previewNote.id);
                  loadData();
                  setPreviewNote(null);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Save to Local Drive</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Courseware Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#171717] text-[#F5F0E6] p-6 sm:p-8 border border-[#2E2E2E] shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-[#9E978C] hover:text-[#F5F0E6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-[#C65D32]/20 text-[#C65D32]">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F5F0E6]">Upload Lecture Notes</h3>
                <p className="text-xs text-[#9E978C]">Courseware Repository</p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Subject Module</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs font-mono"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Dynamic Memory Allocation & Structs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Description / Notes Outline</label>
                <textarea
                  rows={3}
                  placeholder="Summary of topics covered, readings, and slide sequence..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Select File (PDF)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 rounded-xl bg-[#242424] border border-[#333333] text-xs text-[#F5F0E6] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#C65D32] file:text-[#F5F0E6] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2B2B]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl btn-ink text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold"
                >
                  {uploading ? 'Uploading Courseware...' : 'Publish to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
