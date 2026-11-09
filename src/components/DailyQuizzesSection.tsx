import React, { useEffect, useState } from 'react';
import { Quiz } from '../types';
import { quizService } from '../services/quizService';
import { useAuth } from '../context/AuthContext';
import { dbStore } from '../services/mockDatabase';
import { Award, Clock, Play, Trophy, Plus, CheckCircle, Flame, X, Sparkles } from 'lucide-react';
import { QuizRunnerModal } from './QuizRunnerModal';

export const DailyQuizzesSection: React.FC = () => {
  const { user, isFaculty, isAdmin } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuizToRun, setActiveQuizToRun] = useState<Quiz | null>(null);

  // Faculty Create Quiz Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizSubjectId, setQuizSubjectId] = useState(dbStore.subjects[0]?.id || '');
  const [quizDuration, setQuizDuration] = useState(10);
  const [questionsForm, setQuestionsForm] = useState<any[]>([
    {
      question: 'What is the output of sizeof(char) according to ANSI C standards?',
      option_a: '1 byte',
      option_b: '2 bytes',
      option_c: '4 bytes',
      option_d: 'Architecture dependent',
      correct_answer: 'A',
      marks: 1,
      explanation: 'By standard C specification, sizeof(char) is unconditionally guaranteed to be 1 byte.',
    },
  ]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      quizService.getQuizzes(user?.id),
      quizService.getLeaderboard(),
    ]).then(([quizList, lb]) => {
      setQuizzes(quizList);
      setLeaderboard(lb);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || !user) return;

    await quizService.createQuiz({
      title: quizTitle,
      description: quizDesc,
      subjectId: quizSubjectId,
      createdBy: user.id,
      authorName: user.full_name,
      duration: quizDuration,
      questions: questionsForm,
    });

    setShowCreateModal(false);
    setQuizTitle('');
    setQuizDesc('');
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DCCB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#C65D32] uppercase font-bold">KNOWLEDGE CHALLENGE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C65D32]" />
            <span className="text-xs text-[#5C554B]">Timed Concept Evaluations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight mt-0.5">
            Daily Quizzes & Subject Arenas
          </h2>
        </div>

        {(isFaculty || isAdmin) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl btn-burnt-orange text-xs font-bold shadow-md self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Quiz</span>
          </button>
        )}
      </div>

      {/* 30% INK-BLACK LARGE FEATURE PANEL: Quiz Arena Spotlight & Daily Sprint */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-[#F5F0E6] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C65D32]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#C65D32]/20 text-[#C65D32] border border-[#C65D32]/40 font-bold">
                DAILY KNOWLEDGE SPRINT
              </span>
              <span className="text-xs font-mono text-[#B3ADA3]">Section 1CSE22</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#F5F0E6] tracking-tight">
              Rapid Assessment & Concept Testing
            </h3>
            <p className="text-xs text-[#B3ADA3] max-w-xl leading-relaxed">
              Test your grasp of lecture concepts in 5 to 10 minute timed sprints. Scores instantly sync with your institutional profile and the section rankings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E] text-center min-w-[110px]">
              <span className="text-2xl sm:text-3xl font-black text-[#C65D32] tabular-nums">{quizzes.length}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E978C] mt-0.5">Active Quizzes</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#222222] border border-[#2E2E2E] text-center min-w-[110px]">
              <span className="text-2xl sm:text-3xl font-black text-[#EDE5D8] tabular-nums">{leaderboard.length}</span>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#9E978C] mt-0.5">Top Scorers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 60% Cream Quizzes Feed + Ink-Black Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Quizzes Feed on Cream Workspace */}
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 rounded-3xl bg-white border border-[#E5DCCB]" />
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#E5DCCB]">
              <Award className="w-10 h-10 text-[#7A7265] mx-auto mb-3" />
              <p className="text-[#171717] font-bold">No active quizzes published today.</p>
              <p className="text-xs text-[#7A7265] mt-1">New topic assessments appear following lectures.</p>
            </div>
          ) : (
            quizzes.map((quiz) => {
              const attempt = quiz.user_attempt;
              const isCompleted = attempt?.status === 'completed';

              return (
                <div
                  key={quiz.id}
                  className="p-6 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm hover:border-[#C65D32] transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#171717] text-[#F5F0E6]">
                          {quiz.subject_code}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#5C554B]">
                          <Clock className="w-3.5 h-3.5 text-[#C65D32]" />
                          <span>{quiz.duration} mins</span>
                        </div>
                      </div>

                      {isCompleted ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Score: {attempt.score} / {quiz.total_marks}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C65D32]/10 text-[#C65D32] border border-[#C65D32]/25 text-xs font-bold">
                          <Flame className="w-3.5 h-3.5 text-[#C65D32]" />
                          <span>Available Now</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-[#171717] leading-snug">{quiz.title}</h3>
                    <p className="text-xs text-[#5C554B] leading-relaxed mt-1">
                      {quiz.description || 'Verified course quiz module testing foundational concepts.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E5DCCB] flex items-center justify-between text-xs text-[#5C554B]">
                    <div>
                      <span>Faculty: <strong className="text-[#171717]">{quiz.author_name}</strong></span>
                      <p className="text-[10px] text-[#7A7265] font-mono">Max Marks: {quiz.total_marks}</p>
                    </div>

                    <button
                      onClick={() => setActiveQuizToRun(quiz)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCompleted
                          ? 'btn-ink'
                          : 'btn-burnt-orange shadow-md'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCompleted ? 'Review Answers' : 'Start Assessment'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 5 Cols: 30% Ink-Black Leaderboard Panel */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-[#F5F0E6] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2C]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#C65D32]/20 text-[#C65D32]">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-[#F5F0E6]">Class Leaderboard</h3>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C65D32] font-bold">
              1CSE22 RANKINGS
            </span>
          </div>

          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <p className="text-xs text-[#9E978C] text-center py-6">No leaderboard entries yet.</p>
            ) : (
              leaderboard.map((row, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition-colors ${
                    row.rank === 1
                      ? 'bg-[#C65D32]/20 border-[#C65D32]/40 text-[#F5F0E6]'
                      : row.rank === 2
                      ? 'bg-[#242424] border-[#383838] text-[#F5F0E6]'
                      : row.rank === 3
                      ? 'bg-[#202020] border-[#303030] text-[#D6CFC4]'
                      : 'bg-[#1C1C1C] border-[#282828] text-[#B3ADA3]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-black text-xs ${
                        row.rank === 1
                          ? 'bg-[#C65D32] text-[#F5F0E6]'
                          : row.rank === 2
                          ? 'bg-white/20 text-[#F5F0E6]'
                          : row.rank === 3
                          ? 'bg-amber-900/40 text-amber-300'
                          : 'bg-[#2E2E2E] text-[#888888]'
                      }`}
                    >
                      {row.rank}
                    </span>
                    <div>
                      <p className="font-bold text-[#F5F0E6] truncate max-w-[140px]">{row.full_name}</p>
                      <p className="text-[10px] font-mono text-[#9E978C]">{row.student_id}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-[#C65D32] text-sm">{row.total_points ?? row.points ?? 0}</span>
                    <span className="text-[10px] font-mono text-[#888888] ml-1">pts</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Quiz Runner Modal */}
      {activeQuizToRun && (
        <QuizRunnerModal
          quiz={activeQuizToRun}
          onClose={() => setActiveQuizToRun(null)}
          onCompleted={() => {
            setActiveQuizToRun(null);
            loadData();
          }}
        />
      )}

      {/* Faculty Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-[#171717] text-[#F5F0E6] p-6 sm:p-8 border border-[#2E2E2E] shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
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
                <h3 className="text-lg font-black text-[#F5F0E6]">Author New Daily Quiz</h3>
                <p className="text-xs text-[#9E978C]">Faculty Assessment Console</p>
              </div>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Subject</label>
                  <select
                    value={quizSubjectId}
                    onChange={(e) => setQuizSubjectId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl input-ink text-xs font-mono"
                  >
                    {dbStore.subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    required
                    value={quizDuration}
                    onChange={(e) => setQuizDuration(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl input-ink text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Sprint 06: Logic Gates & Karnaugh Maps"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B3ADA3] font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short syllabus coverage note..."
                  value={quizDesc}
                  onChange={(e) => setQuizDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl input-ink text-xs"
                />
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
                  Publish Daily Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
