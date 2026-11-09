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
  Award,
  X,
  Plus,
  Calendar,
  AlertCircle,
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

  const totalCount = assignments.length;
  const gradedCount = assignments.filter((a) => a.user_submission?.submission_status === 'graded').length;
  const submittedCount = assignments.filter((a) => a.user_submission?.submission_status === 'submitted').length;
  const pendingCount = totalCount - (gradedCount + submittedCount);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DCCB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#C65D32] uppercase font-bold">LABORATORY DELIVERABLES</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C65D32]" />
            <span className="text-xs text-[#5C554B]">Assessments & Deadlines</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight mt-0.5">
            Course Assignments & Lab Submissions
          </h2>
        </div>

        {(isFaculty || isAdmin) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl btn-burnt-orange text-xs font-bold shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* 30% INK-BLACK LARGE FEATURE PANEL: Assignment Telemetry Radar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-[#F5F0E6] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C65D32]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#C65D32]/20 text-[#C65D32] border border-[#C65D32]/40 font-bold">
              SUBMISSION TELEMETRY
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#F5F0E6] tracking-tight">
              Academic Assessment Tracker
            </h3>
            <p className="text-xs text-[#B3ADA3] max-w-xl leading-relaxed">
              Track course problem sets, laboratory code repositories, and term paper deadlines. Late submissions require prior departmental permission.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#222222] border border-[#2E2E2E] text-center">
              <span className="text-2xl sm:text-3xl font-black text-[#F5F0E6] tabular-nums">{totalCount}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E978C] mt-0.5">Total Tasks</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#222222] border border-[#2E2E2E] text-center">
              <span className="text-2xl sm:text-3xl font-black text-[#C65D32] tabular-nums">{pendingCount}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E978C] mt-0.5">Pending</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#222222] border border-[#2E2E2E] text-center">
              <span className="text-2xl sm:text-3xl font-black text-[#EDE5D8] tabular-nums">{submittedCount}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E978C] mt-0.5">Submitted</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#222222] border border-[#2E2E2E] text-center">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">{gradedCount}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E978C] mt-0.5">Graded</p>
            </div>
          </div>
        </div>
      </div>

      {/* 60% CREAM WORKSPACE: Assignments List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-white border border-[#E5DCCB]" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#E5DCCB]">
          <FileCheck2 className="w-10 h-10 text-[#7A7265] mx-auto mb-3" />
          <p className="text-[#171717] font-bold">No course assignments currently published.</p>
          <p className="text-xs text-[#7A7265] mt-1">Check back once lecture modules complete.</p>
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
                className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm hover:border-[#C65D32] transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#171717] text-[#F5F0E6]">
                        {asg.subject_code}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#5C554B]">Max Marks: {asg.max_marks}</span>
                    </div>
                    <h3 className="text-lg font-black text-[#171717] leading-snug">{asg.title}</h3>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isGraded ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>GRADED ({submission?.grade} / {asg.max_marks})</span>
                      </div>
                    ) : isSubmitted ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171717] text-[#F5F0E6] text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>SUBMITTED FOR REVIEW</span>
                      </div>
                    ) : isOverdue ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>OVERDUE DEADLINE</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C65D32]/15 text-[#C65D32] border border-[#C65D32]/30 text-xs font-bold">
                        <Clock className="w-4 h-4" />
                        <span>PENDING SUBMISSION</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#5C554B] leading-relaxed">{asg.description}</p>

                {/* Feedback Box if Graded */}
                {isGraded && submission?.feedback && (
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DCCB] text-xs">
                    <span className="text-[10px] font-mono uppercase text-[#C65D32] font-black block mb-0.5">Faculty Feedback:</span>
                    <p className="text-[#171717] font-medium">{submission.feedback}</p>
                  </div>
                )}

                {/* Footer details & Action Buttons */}
                <div className="pt-3 border-t border-[#E5DCCB] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-[#5C554B]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#C65D32]" />
                      <span className="font-mono">
                        Deadline: <strong className="text-[#171717]">{new Date(asg.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                      </span>
                    </div>
                    <span>Faculty: <strong className="text-[#171717]">{asg.faculty_name}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Faculty Grade Action */}
                    {(isFaculty || isAdmin) && isSubmitted && !isGraded && (
                      <button
                        onClick={() => {
                          setGradingAssignment(asg);
                          setGradeInput(asg.max_marks * 0.9);
                        }}
                        className="px-3.5 py-1.5 rounded-xl btn-ink text-xs font-bold"
                      >
                        Grade Submission
                      </button>
                    )}

                    {/* Student Submit / Re-submit Action */}
                    {!isGraded && (
                      <button
                        onClick={() => {
                          setSubmittingAssignment(asg);
                          setSubmissionError(null);
                        }}
                        className="px-4 py-2 rounded-xl btn-burnt-orange text-xs font-bold"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isSubmitted ? 'Resubmit Deliverable' : 'Upload Submission'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Upload Submission Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#171717] text-[#F5F0E6] p-6 sm:p-8 border border-[#2E2E2E] shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSubmittingAssignment(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-[#9E978C] hover:text-[#F5F0E6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-[#C65D32]/20 text-[#C65D32]">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F5F0E6]">Upload Assignment File</h3>
                <p className="text-xs text-[#9E978C] truncate max-w-sm">{submittingAssignment.title}</p>
              </div>
            </div>

            {submissionError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submissionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1.5">
                  Select Deliverable (PDF, ZIP, C/CPP source)
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 rounded-xl bg-[#242424] border border-[#333333] text-xs text-[#F5F0E6] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#C65D32] file:text-[#F5F0E6] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2B2B]">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 rounded-xl btn-ink text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold"
                >
                  {isUploading ? 'Uploading Deliverable...' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Grading Modal */}
      {gradingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#171717] text-[#F5F0E6] p-6 sm:p-8 border border-[#2E2E2E] shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setGradingAssignment(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-[#9E978C] hover:text-[#F5F0E6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-[#C65D32]/20 text-[#C65D32]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F5F0E6]">Grade Submission</h3>
                <p className="text-xs text-[#9E978C] truncate max-w-sm">{gradingAssignment.title}</p>
              </div>
            </div>

            <form onSubmit={handleGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1.5">
                  Awarded Marks (Out of {gradingAssignment.max_marks})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={gradingAssignment.max_marks}
                  value={gradeInput}
                  onChange={(e) => setGradeInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1.5">
                  Evaluation Feedback & Comments
                </label>
                <textarea
                  required
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2B2B]">
                <button
                  type="button"
                  onClick={() => setGradingAssignment(null)}
                  className="px-4 py-2 rounded-xl btn-ink text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold"
                >
                  Save Marks & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#171717] text-[#F5F0E6] p-6 sm:p-8 border border-[#2E2E2E] shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-[#9E978C] hover:text-[#F5F0E6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-[#C65D32]/20 text-[#C65D32]">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#F5F0E6]">Create New Assignment</h3>
                <p className="text-xs text-[#9E978C]">Section 1CSE22 Coursework</p>
              </div>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Subject</label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs"
                >
                  {dbStore.subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Assignment 04: Pointers & Linked Structures"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide instructions, rubric guidelines, and required format..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl input-ink text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Max Marks</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="100"
                    value={newMarks}
                    onChange={(e) => setNewMarks(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl input-ink text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2B2B2B]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl btn-ink text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl btn-burnt-orange text-xs font-bold"
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
