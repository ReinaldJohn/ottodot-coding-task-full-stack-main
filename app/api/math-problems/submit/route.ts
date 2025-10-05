import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { sessionId, user_answer } = await req.json();

    if (!sessionId || user_answer === undefined || user_answer === null) {
      return NextResponse.json(
        { error: "sessionId and user_answer are required" },
        { status: 400 }
      );
    }

    const { data: session, error: sErr } = await supabase
      .from("math_problem_sessions")
      .select("id, problem_text, correct_answer")
      .eq("id", sessionId)
      .single();

    if (sErr || !session) throw new Error("Session not found");

    const studentAns = Number(user_answer);
    const correctAns = Number(session.correct_answer);
    if (Number.isNaN(studentAns) || Number.isNaN(correctAns)) {
      throw new Error("Invalid numeric values.");
    }

    const is_correct = Math.abs(studentAns - correctAns) < 1e-9;

    const model = getGemini();
    const feedbackPrompt = `
You are a kind Singapore Primary 5 math tutor.
Give personalized feedback (2–4 sentences) based on:
- Problem: "${session.problem_text}"
- Correct answer: ${correctAns}
- Student answer: ${studentAns}
- Correct? ${is_correct}

Rules:
- Encourage and be specific.
- If wrong, point likely misconception and suggest a hint to fix.
- If right, praise and suggest a short extension challenge.
Return ONLY plain text.
`.trim();

    const feedbackRes = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: feedbackPrompt }] }],
    });
    const feedback_text = feedbackRes.response.text().trim();

    const { data: submission, error: subErr } = await supabase
      .from("math_problem_submissions")
      .insert({
        session_id: session.id,
        user_answer: studentAns,
        is_correct,
        feedback_text,
      })
      .select("id, is_correct, feedback_text, created_at")
      .single();

    if (subErr) throw subErr;

    return NextResponse.json({
      is_correct: submission.is_correct,
      feedback: submission.feedback_text,
      created_at: submission.created_at,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Submission failed" },
      { status: 500 }
    );
  }
}
