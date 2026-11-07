import React, { useEffect, useState } from 'react';
import { Quiz } from '../types';
import { quizService } from '../services/quizService';
import { useAuth } from '../context/AuthContext';
import { dbStore } from '../services/mockDatabase';
import { Award, Clock, Play, Trophy, Plus, CheckCircle, Flame, X } from 'lucide-react';
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

  const addQuestionField = () => {
    setQuestionsForm([
      ...questionsForm,
      {
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        marks: 1,
        explanation: '',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#06B6D4] uppercase">COMPETITIVE MATRIX</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
            <span className="text-xs text-slate-400">Timed Syllabus Evaluations</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            Daily Quizzes & Live Class Leaderboard
          </h2>
        </div>

        {(isFaculty || isAdmin) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-lg self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Quiz</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quizzes Feed */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 rounded-3xl glass-card bg-white/[0.02]" />
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-card">
              <Award className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">No active quizzes published today.</p>
            </div>
          ) : (
            quizzes.map((quiz) => {
              const attempt = quiz.user_attempt;
              const isCompleted = attempt?.status === 'completed';

              return (
                <div
                  key={quiz.id}
                  className={`p-6 rounded-3xl glass-card transition-all flex flex-col justify-between ${
                    isCompleted
                      ? 'border-t-emerald-500/50 bg-emerald-950/10'
                      : 'border-t-[#8B5CF6]/50 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#8B5CF6]/20 text-[#d0bcff] border border-[#8B5CF6]/30">
                          {quiz.subject_code}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                          <span>{quiz.duration} mins</span>
                        </div>
                      </div>

                      {isCompleted ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Score: {attempt.score} / {quiz.total_marks}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                          <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                          <span>Available Now</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1.5 leading-snug">{quiz.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {quiz.description || 'Verified course quiz module testing foundational concepts.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <span>Author: <strong className="text-slate-200">{quiz.author_name}</strong></span>
                      <p className="text-[10px] text-slate-500 font-mono">Max Marks: {quiz.total_marks}</p>
                    </div>

                    <button
                      onClick={() => setActiveQuizToRun(quiz)}
                      className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white shadow-md transition-all ${
                        isCompleted ? 'btn-spatial-secondary' : 'btn-spatial-primary'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCompleted ? 'Review Assessment' : 'Start Quiz'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Live Class Leaderboard */}
        <div className="p-6 rounded-3xl glass-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Class Leaderboard</h3>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#06B6D4]">1CSE22 RANKINGS</span>
            </div>

            <div className="space-y-2">
              {leaderboard.map((row, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition-colors ${
                    row.rank === 1
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : row.rank === 2
                      ? 'bg-slate-300/10 border-slate-300/30'
                      : row.rank === 3
                      ? 'bg-amber-700/10 border-amber-700/30'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                        row.rank === 1
                          ? 'bg-amber-400 text-black shadow-[0_0_10px_#f59e0b]'
                          : row.rank === 2
                          ? 'bg-slate-300 text-black'
                          : row.rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {row.rank}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{row.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{row.submittedAt}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-[#acedff] text-sm tabular-nums">
                      {row.score}/{row.maxScore}
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono">MARKS</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400 flex items-center gap-1.5 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>Anti-leakage RLS protection enabled</span>
          </div>
        </div>
      </div>

      {/* Quiz Runner Modal */}
      {activeQuizToRun && (
        <QuizRunnerModal
          quiz={activeQuizToRun}
          onClose={() => setActiveQuizToRun(null)}
          onCompleted={() => loadData()}
        />
      )}

      {/* Faculty Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl glass-modal p-6 border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-[#8B5CF6]" />
              <h3 className="text-lg font-bold text-white">Create New Assessment Quiz</h3>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C Pointers, Strings & Modular Functions Mastery Quiz"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Subject</label>
                  <select
                    value={quizSubjectId}
                    onChange={(e) => setQuizSubjectId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl glass-input bg-[#0B0F1F] text-white text-xs"
                  >
                    {dbStore.subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.subject_code} - {s.subject_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={quizDuration}
                    onChange={(e) => setQuizDuration(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl glass-input text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Overview of syllabus focus..."
                  value={quizDesc}
                  onChange={(e) => setQuizDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-2xl glass-input text-white text-xs"
                />
              </div>

              {/* Questions Builder */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase text-[#06B6D4]">
                    Quiz Questions ({questionsForm.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addQuestionField}
                    className="text-xs text-[#8B5CF6] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {questionsForm.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
                    <p className="font-mono text-slate-300 font-semibold">Question #{idx + 1}</p>
                    <input
                      type="text"
                      required
                      placeholder="Enter question text..."
                      value={q.question}
                      onChange={(e) => {
                        const copy = [...questionsForm];
                        copy[idx].question = e.target.value;
                        setQuestionsForm(copy);
                      }}
                      className="w-full px-3 py-2 rounded-xl glass-input text-white text-xs"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {['a', 'b', 'c', 'd'].map((letter) => (
                        <input
                          key={letter}
                          type="text"
                          required
                          placeholder={`Option ${letter.toUpperCase()}`}
                          value={q[`option_${letter}`]}
                          onChange={(e) => {
                            const copy = [...questionsForm];
                            copy[idx][`option_${letter}`] = e.target.value;
                            setQuestionsForm(copy);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl glass-input text-white text-xs"
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">
                          Correct Answer (Protected on Server)
                        </label>
                        <select
                          value={q.correct_answer}
                          onChange={(e) => {
                            const copy = [...questionsForm];
                            copy[idx].correct_answer = e.target.value;
                            setQuestionsForm(copy);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl glass-input bg-[#0B0F1F] text-white text-xs"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-slate-400 mb-0.5">
                          Explanation (Shown after completion)
                        </label>
                        <input
                          type="text"
                          placeholder="Why this answer is right..."
                          value={q.explanation}
                          onChange={(e) => {
                            const copy = [...questionsForm];
                            copy[idx].explanation = e.target.value;
                            setQuestionsForm(copy);
                          }}
                          className="w-full px-3 py-1.5 rounded-xl glass-input text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
                  Publish Timed Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
