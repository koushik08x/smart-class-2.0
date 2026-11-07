import React, { useEffect, useState } from 'react';
import { StudyNote, Subject } from '../types';
import { notesService } from '../services/notesService';
import { dbStore } from '../services/mockDatabase';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Download, FileText, Upload, Plus, Eye, X, CheckCircle, HardDrive } from 'lucide-react';

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
    // Open preview or download simulation
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
      uploadedBy: user.id,
      authorName: user.full_name,
      file: selectedFile,
    });

    setUploading(false);

    if (res.error) {
      setUploadError(res.error);
    } else {
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setShowUploadModal(false);
      loadData();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#06B6D4] uppercase">ACADEMIC VAULT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
            <span className="text-xs text-slate-400">Validated Courseware</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            Study Materials & Lecture Repositories
          </h2>
        </div>

        {(isFaculty || isAdmin) && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Courseware (PDF)</span>
          </button>
        )}
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedSubject('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            selectedSubject === 'all'
              ? 'bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
              : 'glass-panel text-slate-400 hover:text-white'
          }`}
        >
          All Subjects ({dbStore.notes.length})
        </button>
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubject(sub.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedSubject === sub.id
                ? 'bg-[#06B6D4] text-black font-semibold shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            {sub.subject_code}
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-3xl glass-card bg-white/[0.02]" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No study materials in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-3xl glass-card hover:border-[#06B6D4]/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#06B6D4]/15 text-[#38BDF8] border border-[#06B6D4]/30">
                    {note.subject_code || 'CSE'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                    <HardDrive className="w-3 h-3 text-slate-500" />
                    <span>{formatFileSize(note.file_size)}</span>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-white group-hover:text-[#acedff] transition-colors mb-1.5 line-clamp-1">
                  {note.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                  {note.description || 'Verified course slide deck and architectural lecture notes.'}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div>
                  <span className="text-[11px] text-slate-300">{note.author_name}</span>
                  <p className="text-[10px] text-slate-500 font-mono">{note.download_count} accesses</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewNote(note)}
                    className="p-2 rounded-xl btn-spatial-secondary text-slate-300 hover:text-white"
                    title="View Document Summary"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(note)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-md"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl glass-modal p-6 border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setPreviewNote(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/30 to-[#06B6D4]/30 border border-white/15">
                <FileText className="w-6 h-6 text-[#acedff]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#06B6D4]">
                  {previewNote.subject_code} &bull; PDF DOCUMENT
                </span>
                <h3 className="text-lg font-bold text-white">{previewNote.title}</h3>
              </div>
            </div>

            {/* Document Projection Viewport */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono text-xs text-slate-300 max-h-72 overflow-y-auto">
              <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-white/5">
                <span>FILE_HASH: SHA256-verified</span>
                <span>SIZE: {formatFileSize(previewNote.file_size)}</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-sm">
                {previewNote.description}
              </p>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-cyan-300">
                &bull; Storage Path: <span className="text-white">{previewNote.file_path}</span><br />
                &bull; Security Tier: Authorized Institutional Academic Bucket<br />
                &bull; Authenticated Uploader: {previewNote.author_name}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Verified for Semester {user?.semester || 1} syllabus
              </span>
              <button
                onClick={() => {
                  alert(`Downloading "${previewNote.title}" to device.`);
                  setPreviewNote(null);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span>Save to Local Drive</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Upload Drawer Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-modal p-6 border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-[#06B6D4]" />
              <h3 className="text-lg font-bold text-white">Upload Lecture Courseware</h3>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Problem Solving with C - Modular Functions & Arrays"
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl glass-input bg-[#0B0F1F] text-white text-xs"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subject_code} - {sub.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of topics covered, references and exercises..."
                  className="w-full px-4 py-2 rounded-2xl glass-input text-white text-xs"
                />
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Select File (PDF, DOCX, PPTX max 50MB)</label>
                <div className="relative border-2 border-dashed border-white/15 hover:border-[#06B6D4]/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-black/20">
                  <input
                    type="file"
                    required
                    accept=".pdf,.docx,.pptx,.zip"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-200 font-medium">
                    {selectedFile ? selectedFile.name : 'Click or drag courseware file here'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {selectedFile ? formatFileSize(selectedFile.size) : 'Enforced storage policy validation'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-full btn-spatial-secondary text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg"
                >
                  {uploading ? 'Uploading to Bucket...' : 'Upload Study Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
