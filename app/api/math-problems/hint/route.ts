import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const { data: session, error: sErr } = await supabase
      .from("math_problem_sessions")
      .select("id, problem_text, correct_answer, hint_text")
      .eq("id", sessionId)
      .single();

    if (sErr || !session) {
      throw new Error("Session not found");
    }

    if (session.hint_text) {
      return NextResponse.json({ hint: session.hint_text });
    }

    const model = getGemini();
    const hintPrompt = `
You are a kind Singapore Primary 5 math tutor.
Give ONE short, constructive hint for the student to solve the problem.
Do NOT reveal the final numeric answer.

Problem: "${session.problem_text}"

Rules:
- 1–2 sentences only.
- Nudge the method (operation/strategy), do not compute the answer.
Return only plain text.
`.trim();

    const aiRes = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: hintPrompt }] }],
    });

    const hint = aiRes.response.text().trim();

    const { error: upErr } = await supabase
      .from("math_problem_sessions")
      .update({ hint_text: hint })
      .eq("id", sessionId);

    if (upErr) {
      console.error("Failed to persist hint:", upErr);
    }

    return NextResponse.json({ hint });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to generate hint" },
      { status: 500 }
    );
  }
}
