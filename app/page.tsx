"use client";

import { useMemo, useState } from "react";

type GenerateResponse = {
  sessionId: string;
  problem_text: string;
  topic?: string;
  difficulty?: string;
};

type SubmitResponse = {
  is_correct: boolean;
  feedback: string;
  created_at: string;
};

export default function Home() {
  const [problem, setProblem] = useState<GenerateResponse | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [error, setError] = useState<string>("");

  const shortSession = useMemo(
    () => (sessionId ? `${sessionId.slice(0, 6)}…` : ""),
    [sessionId]
  );

  async function generateProblem() {
    try {
      setIsLoading(true);
      setError("");
      setFeedback("");
      setIsCorrect(null);
      setUserAnswer("");

      const res = await fetch("/api/math-problems", { method: "POST" });
      const data: GenerateResponse | { error: string } = await res.json();
      if (!res.ok)
        throw new Error((data as any).error || "Failed to generate problem");

      const g = data as GenerateResponse;
      setProblem(g);
      setSessionId(g.sessionId);
    } catch (e: any) {
      setError(
        e.message ?? "Something went wrong while generating the problem."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId) return;

    try {
      setIsSubmitting(true);
      setError("");

      const res = await fetch("/api/math-problems/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          user_answer: Number(userAnswer),
        }),
      });

      const data: SubmitResponse | { error: string } = await res.json();
      if (!res.ok) throw new Error((data as any).error || "Submission failed");

      const s = data as SubmitResponse;
      setIsCorrect(s.is_correct);
      setFeedback(s.feedback);
    } catch (e: any) {
      setError(
        e.message ?? "Something went wrong while submitting your answer."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="bg-red-500 text-white p-4">Hello Tailwind!</div>
      <div className="min-h-dvh bg-linear-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <main className="mx-auto max-w-2xl md:max-w-3xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8">
            Math Problem Generator
          </h1>

          <div className="mb-6">
            <button
              onClick={generateProblem}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 sm:py-3.5 rounded-lg transition"
            >
              {isLoading ? "Generating…" : "Generate New Problem"}
            </button>
            {error && (
              <div className="mt-4 rounded-xs border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {problem && (
            <section className="mb-6 bg-white p-4 sm:p-6 rounded-lg shadow-xs dark:bg-gray-800 dark:border dark:border-gray-700">
              <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400 mb-4">
                {problem.topic && (
                  <span className="border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-xs">
                    Topic: {problem.topic}
                  </span>
                )}
                {problem.difficulty && (
                  <span className="border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-xs">
                    Difficulty: {problem.difficulty}
                  </span>
                )}
                {sessionId && (
                  <span className="border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-xs">
                    Session: {shortSession}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-semibold mb-2 sm:mb-3">Problem</h2>
              <p className="mb-5 sm:mb-6 leading-relaxed">
                {problem.problem_text}
              </p>

              <form onSubmit={submitAnswer} className="space-y-4">
                <div>
                  <label
                    htmlFor="answer"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Your Answer
                  </label>
                  <input
                    id="answer"
                    type="number"
                    inputMode="decimal"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter a number"
                    required
                    className="w-full rounded-xs border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:focus:border-blue-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!userAnswer || isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 sm:py-3.5 rounded-lg transition"
                >
                  {isSubmitting ? "Checking…" : "Submit Answer"}
                </button>
              </form>
            </section>
          )}

          {feedback && (
            <div
              className={
                "p-4 sm:p-5 rounded-lg shadow-xs " +
                (isCorrect
                  ? "bg-green-50 border border-green-200 text-green-900"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-900")
              }
            >
              <h2 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">
                {isCorrect ? "✅ Correct!" : "❌ Oops"}
              </h2>
              <p className="leading-relaxed">{feedback}</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
