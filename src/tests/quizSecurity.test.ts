import { describe, it, expect, beforeEach } from 'vitest';
import { quizService } from '../services/quizService';
import { dbStore } from '../services/mockDatabase';

describe('Quiz Security & Answer Key Protection Tests', () => {
  beforeEach(() => {
    dbStore.resetToDefault();
    localStorage.clear();
  });

  it('guarantees correct_answer is never exposed to students before submission', async () => {
    const quizId = 'quiz-001';
    const questions = await quizService.getQuizQuestionsForStudent(quizId);

    expect(questions.length).toBeGreaterThan(0);
    questions.forEach((q: any) => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('question');
      expect(q).toHaveProperty('option_a');
      expect(q).toHaveProperty('option_b');
      expect(q).toHaveProperty('option_c');
      expect(q).toHaveProperty('option_d');
      // CRITICAL SECURITY ASSERTION: correct_answer must be undefined
      expect(q.correct_answer).toBeUndefined();
    });
  });

  it('prevents starting multiple duplicate completed attempts', async () => {
    const quizId = 'quiz-001';
    const studentId = '00000000-0000-0000-0000-000000000010';
    const studentName = 'Aarav Sharma';

    const attempt1 = await quizService.startAttempt(quizId, studentId, studentName);
    expect(attempt1.id).toBeDefined();
    expect(attempt1.status).toBe('in_progress');

    // Submit attempt
    await quizService.submitAttempt(attempt1.id, [
      { questionId: 'q-001-1', selectedAnswer: 'C' },
    ]);

    // Try starting attempt again
    const attempt2 = await quizService.startAttempt(quizId, studentId, studentName);
    expect(attempt2.id).toBe(attempt1.id);
    expect(attempt2.status).toBe('completed');
  });

  it('evaluates answers correctly and records score server-side', async () => {
    const quizId = 'quiz-001';
    const studentId = '00000000-0000-0000-0000-000000000010';
    const attempt = await quizService.startAttempt(quizId, studentId, 'Aarav Sharma');

    // Retrieve official questions from mock store to test evaluation accuracy
    const rawQuestions = dbStore.quizQuestions.filter((q) => q.quiz_id === quizId);
    expect(rawQuestions.length).toBeGreaterThan(0);

    const firstQ = rawQuestions[0];
    const correctAns = firstQ.correct_answer || 'A';

    const evaluation = await quizService.submitAttempt(attempt.id, [
      { questionId: firstQ.id, selectedAnswer: correctAns },
    ]);

    expect(evaluation.score).toBeGreaterThanOrEqual(1);
    expect(evaluation.results.length).toBeGreaterThanOrEqual(1);
    expect(evaluation.results[0].isCorrect).toBe(true);
  });
});
