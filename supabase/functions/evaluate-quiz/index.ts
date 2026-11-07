// Supabase Edge Function: evaluate-quiz
// Secure server-side quiz grading to prevent student answer leakage
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmitPayload {
  quizId: string;
  attemptId: string;
  studentId: string;
  answers: { questionId: string; selectedAnswer: string }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: SubmitPayload = await req.json();
    const { quizId, attemptId, studentId, answers } = payload;

    if (!quizId || !attemptId || !studentId || !answers) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Verify the attempt belongs to this student and is in_progress
    const { data: attempt, error: attemptErr } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("student_id", studentId)
      .single();

    if (attemptErr || !attempt) {
      return new Response(JSON.stringify({ error: "Invalid quiz attempt" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (attempt.status === "completed") {
      return new Response(JSON.stringify({ error: "Attempt already submitted" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch official quiz questions with correct answers on the secure backend
    const { data: questions, error: qErr } = await supabase
      .from("quiz_questions")
      .select("id, correct_answer, marks, explanation")
      .eq("quiz_id", quizId);

    if (qErr || !questions) {
      return new Response(JSON.stringify({ error: "Failed to retrieve questions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const questionMap = new Map(questions.map((q) => [q.id, q]));
    let totalScore = 0;
    let maxScore = 0;
    const answerRecords: any[] = [];
    const evaluationResults: any[] = [];

    for (const q of questions) {
      maxScore += q.marks || 1;
    }

    for (const userAns of answers) {
      const q = questionMap.get(userAns.questionId);
      if (!q) continue;

      const isCorrect = userAns.selectedAnswer.toUpperCase() === q.correct_answer.toUpperCase();
      const marksAwarded = isCorrect ? (q.marks || 1) : 0;
      totalScore += marksAwarded;

      answerRecords.push({
        attempt_id: attemptId,
        question_id: userAns.questionId,
        selected_answer: userAns.selectedAnswer,
        is_correct: isCorrect,
        marks_awarded: marksAwarded,
      });

      evaluationResults.push({
        questionId: userAns.questionId,
        selectedAnswer: userAns.selectedAnswer,
        correctAnswer: q.correct_answer,
        isCorrect,
        marksAwarded,
        explanation: q.explanation,
      });
    }

    // 3. Insert or update answer records
    await supabase.from("quiz_answers").upsert(answerRecords);

    // 4. Update attempt status and final score
    await supabase
      .from("quiz_attempts")
      .update({
        score: totalScore,
        max_score: maxScore,
        submitted_at: new Date().toISOString(),
        status: "completed",
      })
      .eq("id", attemptId);

    // 5. Notify the student about quiz result
    await supabase.from("notifications").insert({
      user_id: studentId,
      title: "Quiz Completed & Evaluated",
      message: `Your quiz was submitted with score ${totalScore} / ${maxScore}.`,
      notification_type: "result",
      related_id: attemptId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        score: totalScore,
        maxScore,
        results: evaluationResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
