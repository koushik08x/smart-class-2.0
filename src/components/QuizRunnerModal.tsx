import React, { useEffect, useState } from 'react';
import { Quiz, QuizQuestion } from '../types';
import { quizService } from '../services/quizService';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { Clock, CheckCircle, XCircle, AlertCircle, Award, ChevronRight, X } from 'lucide-react';

interface QuizRunnerModalProps {
  quiz: Quiz;
  onClose: () => void;
  onCompleted: () => void;
}

export const QuizRunnerModal: React.FC<QuizRunnerModalProps> = ({ quiz, onClose, onCompleted }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Omit<QuizQuestion, 'correct_answer'>[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    // 1. Initialize attempt session
    quizService.startAttempt(quiz.id, user.id, user.full_name).then((attempt) => {
      setAttemptId(attempt.id);
      // 2. Fetch questions with answer protection (correct answers stripped)
      quizService.getQuizQuestionsForStudent(quiz.id).then((qs) => {
        setQuestions(qs);
        setLoading(false);
      });
    });
  }, [quiz.id, user]);

  // Countdown Timer
  useEffect(() => {
    if (loading || result || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, result, isSubmitting]);

  const handleSubmitQuiz = async () => {
    if (isSubmitting || result) return;
    setIsSubmitting(true);

    const answersPayload = Object.entries(selectedAnswers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer,
    }));

    try {
      const evaluation = await quizService.submitAttempt(attemptId, answersPayload);
      setResult(evaluation);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe confetti fallback
      }
      onCompleted();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl glass-modal p-6 sm:p-8 border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#06B6D4]">
                TIMED ASSESSMENT PROTOCOL
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
              <span className="text-xs text-slate-400 font-mono">{quiz.subject_code}</span>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight mt-0.5">{quiz.title}</h3>
          </div>

          <div className="flex items-center gap-3">
            {!result && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-[#06B6D4]/40 text-[#acedff] font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-[#06B6D4] animate-spin" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-60 flex items-center justify-center text-slate-400 font-mono text-xs">
            Initializing server evaluation session...
          </div>
        ) : result ? (
          /* Quiz Results View */
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#06B6D4]/20 border border-white/15 text-center">
              <Award className="w-12 h-12 text-[#acedff] mx-auto mb-2" />
              <h4 className="text-2xl font-black text-white">Assessment Evaluated!</h4>
              <p className="text-sm text-slate-300 mt-1">
                Your score: <strong className="text-[#06B6D4] text-xl tabular-nums">{result.score}</strong> / {result.maxScore} marks
              </p>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                Stored in Supabase database &bull; Leaderboard updated
              </p>
            </div>

            {/* Answer Explanations Review */}
            <div className="space-y-3">
              <h5 className="text-xs font-mono uppercase text-slate-400">Detailed Answer Key & Explanations</h5>
              {result.results.map((res: any, idx: number) => (
                <div
                  key={res.questionId}
                  className={`p-4 rounded-2xl border text-xs ${
                    res.isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-white">Q{idx + 1}: Question Evaluation</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${res.isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {res.isCorrect ? '+1 Mark (Correct)' : '0 Marks (Incorrect)'}
                    </span>
                  </div>
                  <p className="text-slate-300 mb-2">
                    Your Choice: <strong className="font-mono text-white">[{res.selectedAnswer || 'None'}]</strong> &bull; Correct Answer: <strong className="font-mono text-emerald-400">[{res.correctAnswer}]</strong>
                  </p>
                  {res.explanation && (
                    <p className="text-[11px] text-slate-400 border-t border-white/5 pt-1.5 italic">
                      &bull; Explanation: {res.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-xl"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Question Taking View */
          currentQ && (
            <div className="space-y-6">
              {/* Question Pagination Pills */}
              <div className="flex items-center gap-1.5 pb-2 overflow-x-auto">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id];
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-8 h-8 rounded-xl font-mono text-xs font-semibold transition-all flex items-center justify-center ${
                        isCurrent
                          ? 'bg-[#06B6D4] text-black shadow-[0_0_12px_#06b6d4]'
                          : isAnswered
                          ? 'bg-[#8B5CF6]/30 text-[#d0bcff] border border-[#8B5CF6]/50'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Question Body */}
              <div className="p-5 rounded-3xl glass-card">
                <div className="flex justify-between text-xs text-slate-400 font-mono mb-2">
                  <span>Question {currentIdx + 1} of {questions.length}</span>
                  <span>1 Mark</span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQ.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {[
                  { key: 'A', text: currentQ.option_a },
                  { key: 'B', text: currentQ.option_b },
                  { key: 'C', text: currentQ.option_c },
                  { key: 'D', text: currentQ.option_d },
                ].map((opt) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.key;

                  return (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQ.id]: opt.key })}
                      className={`w-full flex items-center gap-3.5 p-4 rounded-2xl text-left text-sm transition-all border ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#8B5CF6]/30 to-[#06B6D4]/30 border-[#06B6D4] text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] text-slate-300'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold ${
                          isSelected ? 'bg-[#06B6D4] text-black shadow-md' : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1 text-xs sm:text-sm font-medium">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation & Submit Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  className="px-4 py-2 rounded-full btn-spatial-secondary text-xs text-slate-300 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full btn-spatial-secondary text-xs text-white border border-[#06B6D4]/40"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2 rounded-full btn-spatial-primary text-xs font-semibold text-white shadow-xl"
                  >
                    {isSubmitting ? 'Evaluating on Server...' : 'Submit Assessment'}
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
