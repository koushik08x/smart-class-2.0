import React, { useEffect, useState } from 'react';
import { Assignment } from '../types';
import { assignmentService } from '../services/assignmentService';
import { useAuth } from '../context/AuthContext';
import { dbStore } from '../services/mockDatabase';
import {
  FileCheck2,
  Clock,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Award,
  X,
  Plus,
} from 'lucide-react';

export const AssignmentsSection: React.FC = () => {
  const { user, isFaculty, isAdmin } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Student submission modal
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Faculty grading modal
  const [gradingAssignment, setGradingAssignment] = useState<Assignment | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(90);
  const [feedbackInput, setFeedbackInput] = useState<string>('Well structured solution with robust error handling.');

  // Faculty create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(dbStore.subjects[0]?.id || '');
  const [newDeadline, setNewDeadline] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16));
  const [newMarks, setNewMarks] = useState(100);

  const loadData = () => {
    setLoading(true);
    assignmentService.getAssignments(user?.id).then((data) => {
      setAssignments(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !submissionFile || !user) return;

    setIsUploading(true);
    setSubmissionError(null);

    const res = await assignmentService.submitAssignment({
      assignmentId: submittingAssignment.id,
      studentId: user.id,
      studentName: user.full_name,
      file: submissionFile,
    });

    setIsUploading(false);
    if (res.error) {
      setSubmissionError(res.error);
    } else {
      setSubmittingAssignment(null);
      setSubmissionFile(null);
      loadData();
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingAssignment) return;

    await assignmentService.gradeSubmission(gradingAssignment.id, gradeInput, feedbackInput);
    setGradingAssignment(null);
    loadData();
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;

    await assignmentService.createAssignment({
      title: newTitle,
      description: newDesc,
      subjectId: newSubjectId,
      facultyId: user.id,
      facultyName: user.full_name,
      deadline: new Date(newDeadline).toISOString(),
      maxMarks: newMarks,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#8B5CF6] uppercase">LABORATORY DELIVERABLES</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
            <span className="text-xs text-slate-400">Assessments & Deadlines</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            Course Assignments & Lab Submissions
          </h2>
        </div>

        {(isFaculty || isAdmin) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl glass-card bg-white/[0.02]" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card">
          <FileCheck2 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No pending course assignments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((asg) => {
            const isOverdue = new Date() > new Date(asg.deadline);
            const submission = asg.user_submission;
            const isGraded = submission?.submission_status === 'graded';
            const isSubmitted = submission?.submission_status === 'submitted' || isGraded;

            return (
              <div
                key={asg.id}
                className={`p-6 rounded-3xl glass-card transition-all relative overflow-hidden ${
                  isGraded
                    ? 'border-t-emerald-500/50 bg-emerald-950/10'
                    : isSubmitted
                    ? 'border-t-[#06B6D4]/50'
                    : isOverdue
                    ? 'border-t-rose-500/50 bg-rose-950/10'
                    : 'hover:border-white/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#8B5CF6]/15 text-[#d0bcff] border border-[#8B5CF6]/30">
                        {asg.subject_code}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Max Marks: {asg.max_marks}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight">{asg.title}</h3>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isGraded ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                        <Award className="w-3.5 h-3.5" />
                        <span>Graded: {submission.grade}/{asg.max_marks}</span>
                      </div>
                    ) : isSubmitted ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Submitted</span>
                      </div>
                    ) : isOverdue ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Past Deadline</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Action Required</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">{asg.description}</p>

                {/* Graded Feedback Box */}
                {isGraded && submission.feedback && (
                  <div className="mb-4 p-3 rounded-2xl bg-black/40 border border-emerald-500/20 text-xs">
                    <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
                      Faculty Evaluation & Feedback
                    </p>
                    <p className="text-slate-300">{submission.feedback}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                    <span className="font-mono">
                      Due: {new Date(asg.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Faculty grading action */}
                    {(isFaculty || isAdmin) && submission && (
                      <button
                        onClick={() => {
                          setGradingAssignment(asg);
                          setGradeInput(submission.grade || 85);
                          setFeedbackInput(submission.feedback || '');
                        }}
                        className="px-3.5 py-1.5 rounded-full btn-spatial-secondary text-xs text-cyan-300 hover:text-white border border-cyan-500/30"
                      >
                        {isGraded ? 'Review Grade' : 'Grade Submission'}
                      </button>
                    )}

                    {/* Student upload submission */}
                    {!isGraded && (
                      <button
                        onClick={() => setSubmittingAssignment(asg)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white shadow-md transition-all ${
                          isSubmitted ? 'btn-spatial-secondary' : 'btn-spatial-primary'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isSubmitted ? 'Resubmit Solution' : 'Submit Solution'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Submission Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-modal p-6 border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSubmittingAssignment(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-[#8B5CF6]" />
              <div>
                <span className="text-[10px] font-mono uppercase text-[#06B6D4]">
                  {submittingAssignment.subject_code} &bull; SECURE LAB DROPBOX
                </span>
                <h3 className="text-lg font-bold text-white">{submittingAssignment.title}</h3>
              </div>
            </div>

            {submissionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                {submissionError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Upload Code Archive or Report (.zip, .c, .py, .pdf, max 30MB)
                </label>
                <div className="relative border-2 border-dashed border-white/15 hover:border-[#8B5CF6]/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-black/30">
                  <input
                    type="file"
                    required
                    accept=".zip,.tar.gz,.c,.cpp,.py,.pdf,.sql"
                    onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileCode className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-200 font-medium">
                    {submissionFile ? submissionFile.name : 'Click to select solution archive'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Auto-stamped with Student ID: {user?.student_id || '26CS101'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 space-y-1">
                <p>&bull; Target Supabase Bucket: <code className="text-white">assignment-submissions</code></p>
                <p>&bull; Enforces student ownership check <code className="text-cyan-300">auth.uid() = student_id</code></p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 rounded-full btn-spatial-secondary text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg"
                >
                  {isUploading ? 'Encrypting & Uploading...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Grading Modal */}
      {gradingAssignment && gradingAssignment.user_submission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-modal p-6 border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setGradingAssignment(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-[#06B6D4]" />
              <div>
                <span className="text-[10px] font-mono uppercase text-[#06B6D4]">
                  FACULTY ASSESSMENT DESK
                </span>
                <h3 className="text-lg font-bold text-white">Grade Student Submission</h3>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 mb-4 text-xs space-y-1">
              <p className="text-slate-300">Student: <strong>{gradingAssignment.user_submission.student_name}</strong></p>
              <p className="text-slate-400 font-mono">File: {gradingAssignment.user_submission.file_name}</p>
            </div>

            <form onSubmit={handleGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                  Marks Awarded (out of {gradingAssignment.max_marks})
                </label>
                <input
                  type="number"
                  min={0}
                  max={gradingAssignment.max_marks}
                  required
                  value={gradeInput}
                  onChange={(e) => setGradeInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Feedback & Comments</label>
                <textarea
                  rows={3}
                  required
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl glass-input text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingAssignment(null)}
                  className="px-4 py-2 rounded-full btn-spatial-secondary text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg"
                >
                  Save & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl glass-modal p-6 border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <FileCheck2 className="w-5 h-5 text-[#8B5CF6]" />
              <h3 className="text-lg font-bold text-white">Create New Course Assignment</h3>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Lab 2: Matrix Operations & Dynamic Memory in C"
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Subject</label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl glass-input bg-[#0B0F1F] text-white text-xs"
                  >
                    {dbStore.subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={newMarks}
                    onChange={(e) => setNewMarks(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl glass-input text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Submission Deadline</label>
                <input
                  type="datetime-local"
                  required
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl glass-input text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Specification & Guidelines</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detail instructions, test cases, and delivery expectations..."
                  className="w-full px-4 py-2 rounded-2xl glass-input text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-full btn-spatial-secondary text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
