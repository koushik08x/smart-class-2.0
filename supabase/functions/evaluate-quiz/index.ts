// Supabase Edge Function: evaluate-quiz
// Secure server-side quiz grading to prevent student answer leakage
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// In-memory sliding rate limiter per user (10 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) {
    return false;
  }
  record.count += 1;
  return true;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const isAllowedOrigin =
    origin.includes("smart-class-20.vercel.app") ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin === (Deno.env.get("APP_URL") || "");

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "https://smart-class-20.vercel.app",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

interface SubmitPayload {
  quizId: string;
  attemptId: string;
  studentId: string;
  answers: { questionId: string; selectedAnswer: string }[];
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    // 1. Mandatory JWT Authentication & Session Token Verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await authClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid or expired session token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Rate Limiting Protection (Rate Limit: 10 quiz evaluations per minute)
    if (!checkRateLimit(user.id, 10, 60000)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait before retrying." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: SubmitPayload = await req.json();
    const { quizId, attemptId, studentId, answers } = payload;

    if (!quizId || !attemptId || !studentId || !answers || !Array.isArray(answers)) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. IDOR Defense: Enforce that the authenticated user matches studentId
    if (user.id !== studentId) {
      return new Response(JSON.stringify({ error: "Forbidden: You cannot submit an assessment for another user" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Elevated client for privileged database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Verify the attempt belongs to this student and is in_progress
    const { data: attempt, error: attemptErr } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("student_id", user.id)
      .single();

    if (attemptErr || !attempt) {
      return new Response(JSON.stringify({ error: "Invalid quiz attempt or attempt not found" }), {
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

    // 5. Fetch official quiz questions with correct answers on the secure backend
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

    // 6. Insert or update answer records
    await supabase.from("quiz_answers").upsert(answerRecords);

    // 7. Update attempt status and final score
    await supabase
      .from("quiz_attempts")
      .update({
        score: totalScore,
        max_score: maxScore,
        submitted_at: new Date().toISOString(),
        status: "completed",
      })
      .eq("id", attemptId);

    // 8. Notify the student about quiz result
    await supabase.from("notifications").insert({
      user_id: user.id,
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
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
