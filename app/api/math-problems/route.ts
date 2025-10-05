import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getGemini } from "@/lib/gemini";

type ProblemJSON = {
  problem_text: string;
  correct_answer: number | string;
};

function extractJson(text: string): string {
  const fenced = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start)
    return fenced.slice(start, end + 1);
  return fenced;
}

export async function POST() {
  try {
    const model = getGemini();

    const prompt = `
You are a Singapore Primary 5 math teacher.
Create ONE real-world math word problem that a Primary 5 student can solve without a calculator.

Return ONLY JSON (no backticks/markdown, no extra text) with EXACT fields:
{
  "problem_text": string,
  "correct_answer": number
}

Constraints:
- Numbers suitable for P5 pen-and-paper.
- If money appears, use Singapore dollars.
- Do NOT include solution steps or hints inside "problem_text".
- "correct_answer" must be correct and numeric.
`.trim();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const raw = result.response.text();
    const cleaned = extractJson(raw);
    const json = JSON.parse(cleaned) as ProblemJSON;

    const problem_text = (json.problem_text ?? "").toString().trim();
    const numericAnswer = Number(json.correct_answer);

    if (!problem_text || Number.isNaN(numericAnswer)) {
      throw new Error(
        "Model did not return valid fields problem_text + correct_answer."
      );
    }

    const { data, error } = await supabase
      .from("math_problem_sessions")
      .insert({
        problem_text,
        correct_answer: numericAnswer,
      })
      .select("id, problem_text")
      .single();

    if (error) throw error;

    return NextResponse.json({
      sessionId: data.id,
      problem_text: data.problem_text,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to generate problem" },
      { status: 500 }
    );
  }
}
