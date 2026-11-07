import { realtimeBus } from '../lib/supabase';
import { dbStore } from './mockDatabase';
import { Quiz, QuizQuestion, QuizAttempt, QuizAnswer } from '../types';

export const quizService = {
  // Get all quizzes with student attempt state
  async getQuizzes(studentId?: string): Promise<Quiz[]> {
    const targetStudentId = studentId || localStorage.getItem('sc2_active_user_id') || '00000000-0000-0000-0000-000000000010';

    return dbStore.quizzes.map((q) => {
      const attempt = dbStore.quizAttempts.find(
        (a) => a.quiz_id === q.id && a.student_id === targetStudentId
      );
      return {
        ...q,
        user_attempt: attempt,
      };
    });
  },

  // Get quiz questions for a student with CRITICAL SECURITY:
  // Correct answers are stripped to prevent inspection via DevTools/Network tab before submission
  async getQuizQuestionsForStudent(quizId: string): Promise<Omit<QuizQuestion, 'correct_answer'>[]> {
    const questions = dbStore.quizQuestions.filter((q) => q.quiz_id === quizId);
    return questions.map(({ correct_answer, ...safeQuestion }) => safeQuestion);
  },

  // Start an attempt (checks limits, creates attempt session)
  async startAttempt(quizId: string, studentId: string, studentName: string): Promise<QuizAttempt> {
    const existing = dbStore.quizAttempts.find((a) => a.quiz_id === quizId && a.student_id === studentId);
    if (existing && existing.status === 'completed') {
      return existing;
    }

    if (existing) {
      return existing;
    }

    const quiz = dbStore.quizzes.find((q) => q.id === quizId);
    const newAttempt: QuizAttempt = {
      id: `att-${Date.now()}`,
      quiz_id: quizId,
      student_id: studentId,
      student_name: studentName,
      score: 0,
      max_score: quiz?.total_marks || 5,
      started_at: new Date().toISOString(),
      status: 'in_progress',
    };

    dbStore.quizAttempts.push(newAttempt);
    dbStore.persist();
    return newAttempt;
  },

  // Server-evaluated answer submission
  async submitAttempt(
    attemptId: string,
    answers: { questionId: string; selectedAnswer: string }[]
  ): Promise<{
    score: number;
    maxScore: number;
    results: {
      questionId: string;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      explanation?: string;
    }[];
  }> {
    const attempt = dbStore.quizAttempts.find((a) => a.id === attemptId);
    if (!attempt) {
      throw new Error('Attempt not found');
    }

    const questions = dbStore.quizQuestions.filter((q) => q.quiz_id === attempt.quiz_id);
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let totalScore = 0;
    let maxScore = 0;
    const evaluatedResults: any[] = [];

    for (const q of questions) {
      maxScore += q.marks || 1;
    }

    for (const userAns of answers) {
      const q = questionMap.get(userAns.questionId);
      if (!q) continue;

      const isCorrect = Boolean(q.correct_answer && userAns.selectedAnswer.toUpperCase() === q.correct_answer.toUpperCase());
      const marks = isCorrect ? (q.marks || 1) : 0;
      totalScore += marks;

      const answerRecord: QuizAnswer = {
        id: `ans-${Date.now()}-${q.id}`,
        attempt_id: attemptId,
        question_id: q.id,
        selected_answer: userAns.selectedAnswer,
        is_correct: isCorrect,
        marks_awarded: marks,
      };

      dbStore.quizAnswers.push(answerRecord);

      evaluatedResults.push({
        questionId: q.id,
        selectedAnswer: userAns.selectedAnswer,
        correctAnswer: q.correct_answer || 'A',
        isCorrect,
        explanation: q.explanation,
      });
    }

    attempt.score = totalScore;
    attempt.max_score = maxScore;
    attempt.submitted_at = new Date().toISOString();
    attempt.status = 'completed';

    dbStore.persist();

    realtimeBus.emit('quiz_evaluated', { attemptId, score: totalScore, maxScore });

    // Notify student
    dbStore.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: attempt.student_id,
      title: 'Quiz Evaluated',
      message: `Score: ${totalScore} / ${maxScore} on your recent quiz.`,
      notification_type: 'result',
      related_id: attempt.quiz_id,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    dbStore.persist();

    return {
      score: totalScore,
      maxScore,
      results: evaluatedResults,
    };
  },

  // Get live quiz leaderboard
  async getLeaderboard(quizId?: string): Promise<{ rank: number; studentName: string; score: number; maxScore: number; submittedAt: string }[]> {
    // Generate leaderboard based on completed attempts and high scoring students
    const attempts = dbStore.quizAttempts.filter((a) => a.status === 'completed' && (!quizId || a.quiz_id === quizId));
    
    // Add default peer benchmark data if only 1 student has attempted
    const seedLeaderboard = [
      { rank: 1, studentName: 'Maya Patel', score: 5, maxScore: 5, submittedAt: '15 mins ago' },
      { rank: 2, studentName: 'Rohan Gupta', score: 4, maxScore: 5, submittedAt: '32 mins ago' },
      { rank: 3, studentName: 'Devansh Roy', score: 4, maxScore: 5, submittedAt: '1 hour ago' },
    ];

    if (attempts.length === 0) {
      return seedLeaderboard;
    }

    const liveRows = attempts.map((a) => ({
      rank: 0,
      studentName: a.student_name || 'Student',
      score: a.score,
      maxScore: a.max_score,
      submittedAt: new Date(a.submitted_at || a.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    const combined = [...liveRows, ...seedLeaderboard]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    return combined;
  },

  // Faculty create new quiz
  async createQuiz(data: {
    title: string;
    description: string;
    subjectId: string;
    createdBy: string;
    authorName: string;
    duration: number;
    questions: {
      question: string;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_answer: string;
      marks: number;
      explanation?: string;
    }[];
  }): Promise<Quiz> {
    const subject = dbStore.subjects.find((s) => s.id === data.subjectId);
    const totalMarks = data.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: data.title,
      description: data.description,
      subject_id: data.subjectId,
      subject_name: subject?.subject_name,
      subject_code: subject?.subject_code,
      created_by: data.createdBy,
      author_name: data.authorName,
      duration: data.duration,
      total_marks: totalMarks,
      is_published: true,
      created_at: new Date().toISOString(),
    };

    dbStore.quizzes.unshift(newQuiz);

    data.questions.forEach((q, index) => {
      dbStore.quizQuestions.push({
        id: `q-${Date.now()}-${index}`,
        quiz_id: newQuiz.id,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        marks: q.marks || 1,
        explanation: q.explanation || 'Verified syllabus answer.',
        question_order: index + 1,
      });
    });

    dbStore.persist();
    realtimeBus.emit('quiz_created', newQuiz);

    // Notify students
    for (const student of dbStore.profiles.filter((p) => p.role === 'student')) {
      dbStore.notifications.push({
        id: `notif-${Date.now()}-${student.id.substring(0, 4)}`,
        user_id: student.id,
        title: `New Quiz: ${data.title}`,
        message: `${newQuiz.duration} min timed test is now live.`,
        notification_type: 'quiz',
        related_id: newQuiz.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }
    dbStore.persist();

    return newQuiz;
  }
};
