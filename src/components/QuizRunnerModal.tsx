import React, { useEffect, useState } from 'react';
import { Quiz, QuizQuestion } from '../types';
import { quizService } from '../services/quizService';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { Clock, CheckCircle, Award, ChevronRight, ChevronLeft, X } from 'lucide-react';

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
    quizService.startAttempt(quiz.id, user.id, user.full_name).then((attempt) => {
      setAttemptId(attempt.id);
      quizService.getQuizQuestionsForStudent(quiz.id).then((qs) => {
        setQuestions(qs);
        setLoading(false);
      });
    });
  }, [quiz.id, user]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-[#FAF7F2] border border-[#E5DCCB] shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[95vh] overflow-y-auto flex flex-col justify-between">
        {/* Top Control Bar in 30% Ink Black */}
        <div className="p-6 bg-[#171717] text-[#F5F0E6] rounded-t-3xl border-b border-[#2B2B2B] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C65D32] font-bold">
                TIMED ASSESSMENT PROTOCOL
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C65D32]" />
              <span className="text-xs text-[#9E978C] font-mono">{quiz.subject_code}</span>
            </div>
            <h3 className="text-lg font-black text-[#F5F0E6] leading-tight mt-0.5">{quiz.title}</h3>
          </div>

          <div className="flex items-center gap-3">
            {!result && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#242424] border border-[#3A3A3A] text-[#C65D32] font-mono text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-[#C65D32] animate-spin" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-[#9E978C] hover:text-[#F5F0E6]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body in 60% Cream Workspace */}
        <div className="p-6 sm:p-8 flex-1">
          {loading ? (
            <div className="h-60 flex items-center justify-center text-[#5C554B] font-mono text-xs">
              Initializing server evaluation session...
            </div>
          ) : result ? (
            /* Results View */
            <div className="space-y-6 animate-in fade-in">
              <div className="p-6 sm:p-8 rounded-3xl bg-[#171717] border border-[#2E2E2E] text-center text-[#F5F0E6]">
                <div className="w-12 h-12 rounded-2xl bg-[#C65D32] flex items-center justify-center mx-auto mb-3 shadow-[0_4px_14px_rgba(198,93,50,0.4)]">
                  <Award className="w-6 h-6 text-[#F5F0E6]" />
                </div>
                <h4 className="text-2xl font-black text-[#F5F0E6]">Assessment Evaluated!</h4>
                <p className="text-sm text-[#D6CFC4] mt-1">
                  Your score: <strong className="text-[#C65D32] text-2xl tabular-nums font-black">{result.score}</strong> / {result.maxScore} marks
                </p>
                <p className="text-xs text-[#9E978C] mt-2 font-mono">
                  Stored in database &bull; Leaderboard updated
                </p>
              </div>

              {/* Explanations Review */}
              <div className="space-y-3">
                <h5 className="text-xs font-mono uppercase text-[#5C554B] font-bold">Answer Review & Explanations</h5>
                {result.results.map((res: any, idx: number) => (
                  <div
                    key={res.questionId}
                    className={`p-4 rounded-2xl border text-xs ${
                      res.isCorrect
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-bold">Q{idx + 1}: Question Evaluation</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${res.isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                        {res.isCorrect ? '+1 Mark (Correct)' : '0 Marks (Incorrect)'}
                      </span>
                    </div>
                    <p className="text-[#171717] mb-1.5 font-medium">
                      Your Choice: <strong className="font-mono">[{res.selectedAnswer || 'None'}]</strong> &bull; Correct Answer: <strong className="font-mono text-emerald-700">[{res.correctAnswer}]</strong>
                    </p>
                    {res.explanation && (
                      <p className="text-[11px] text-[#5C554B] border-t border-black/5 pt-1.5 italic">
                        &bull; Explanation: {res.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl btn-burnt-orange text-xs font-bold shadow-lg"
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
                <div className="flex items-center gap-2 pb-2 overflow-x-auto">
                  {questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.id];
                    const isCurrent = idx === currentIdx;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(idx)}
                        className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                          isCurrent
                            ? 'bg-[#C65D32] text-[#F5F0E6] shadow-md'
                            : isAnswered
                            ? 'bg-[#171717] text-[#F5F0E6]'
                            : 'bg-white border border-[#E5DCCB] text-[#5C554B] hover:text-[#171717]'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Question Body Card */}
                <div className="p-6 rounded-3xl bg-white border border-[#E5DCCB] shadow-sm">
                  <div className="flex justify-between text-xs text-[#5C554B] font-mono font-bold mb-2">
                    <span>Question {currentIdx + 1} of {questions.length}</span>
                    <span>1 Mark</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-[#171717] leading-relaxed">
                    {currentQ.question}
                  </h4>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                    const optText = currentQ[`option_${optKey.toLowerCase()}` as keyof typeof currentQ] as string;
                    if (!optText) return null;
                    const isSelected = selectedAnswers[currentQ.id] === optKey;

                    return (
                      <button
                        key={optKey}
                        type="button"
                        onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQ.id]: optKey })}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-xs text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-2 border-[#C65D32] shadow-md ring-2 ring-[#C65D32]/10'
                            : 'bg-white border border-[#E5DCCB] hover:border-[#171717] text-[#171717]'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-[#C65D32] text-[#F5F0E6]'
                              : 'bg-[#FAF7F2] text-[#171717] border border-[#E5DCCB]'
                          }`}
                        >
                          {optKey}
                        </span>
                        <span className="font-semibold text-sm leading-relaxed">{optText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Nav & Submit Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-[#E5DCCB]">
                  <button
                    type="button"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-cream-outline text-xs font-bold disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {currentIdx < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-ink text-xs font-bold"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSubmitQuiz}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl btn-burnt-orange text-xs font-black shadow-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Evaluating...</span>
                          </>
                        ) : (
                          <span>Submit Assessment</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
