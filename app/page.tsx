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
  const [hint, setHint] = useState<string>("");
  const [isHintLoading, setIsHintLoading] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [answerLocked, setAnswerLocked] = useState(false);

  const shortSession = useMemo(
    () => (sessionId ? `${sessionId.slice(0, 6)}…` : ""),
    [sessionId]
  );

  async function generateProblem() {
    try {
      setIsLoading(true);
      setError("");
      setFeedback("");
      setHint("");
      setIsCorrect(null);
      setUserAnswer("");
      setAnswerLocked(false);
      setProblem(null);

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

  async function fetchHint() {
    if (!sessionId || isHintLoading) return;
    try {
      setIsHintLoading(true);
      const res = await fetch("/api/math-problems/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data: { hint?: string; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch hint");
      setHint(data.hint || "");
    } catch (e: any) {
      setHint("Sorry, I couldn't fetch a hint right now.");
    } finally {
      setIsHintLoading(false);
    }
  }

  async function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId) return;

    try {
      setIsSubmitting(true);
      setAnswerLocked(true);
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
      setAnswerLocked(false);
      setError(
        e.message ?? "Something went wrong while submitting your answer."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const generateBtnLabel =
    problem || isLoading ? "Generate Another Problem" : "Generate New Problem";

  return (
    <>
      <div className="min-h-dvh bg-linear-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <main className="mx-auto max-w-2xl md:max-w-3xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8">
            Math Problem Generator
          </h1>

          <div className="mb-6">
            <button
              onClick={generateProblem}
              disabled={isLoading || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 sm:py-3.5 rounded-lg transition"
            >
              {isLoading ? "Generating…" : generateBtnLabel}
            </button>
            {error && (
              <div className="mt-4 rounded-xs border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {(isLoading || problem) && (
            <section className="mb-6 bg-white p-4 sm:p-6 rounded-lg shadow-xs dark:bg-gray-800 dark:border dark:border-gray-700">
              {isLoading ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center justify-center gap-3 py-6"
                >
                  <svg
                    className="h-6 w-6 animate-spin text-gray-600 dark:text-gray-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Generating a new problem…
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400 mb-4">
                    {problem?.topic && (
                      <span className="border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-xs">
                        Topic: {problem.topic}
                      </span>
                    )}
                    {problem?.difficulty && (
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
                  <div className="mb-5 sm:mb-6">
                    <button
                      type="button"
                      onClick={fetchHint}
                      disabled={
                        isLoading || isSubmitting || isHintLoading || !sessionId
                      }
                      className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                      aria-expanded={!!hint}
                      aria-controls="hint-panel"
                    >
                      <svg
                        className={`h-4 w-4 ${hint ? "" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M9 18h6M10 21h4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 3a7 7 0 00-4.95 11.95c.38.38.78.92 1.04 1.55l.32.76h7.18l.32-.76c.26-.63.66-1.17 1.04-1.55A7 7 0 0012 3z"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                      {isHintLoading
                        ? "Getting hint…"
                        : hint
                        ? "Show hint again"
                        : "Show hint"}
                    </button>

                    <div id="hint-panel" className="mt-3">
                      {isHintLoading && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <svg
                            className="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              className="opacity-25"
                            />
                            <path
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              fill="currentColor"
                              className="opacity-75"
                            />
                          </svg>
                          <span>Generating a helpful hint…</span>
                        </div>
                      )}
                      {!isHintLoading && hint && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-100">
                          <strong className="mr-1">Hint:</strong>
                          <span>{hint}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h2>Problem</h2>
                  <p className="mb-5 sm:mb-6 leading-relaxed">
                    {problem?.problem_text}
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
                        onChange={(e) =>
                          !isSubmitting &&
                          !answerLocked &&
                          setUserAnswer(e.target.value)
                        }
                        onPaste={(e) => {
                          if (isSubmitting || answerLocked) e.preventDefault();
                        }}
                        onKeyDown={(e) => {
                          if (isSubmitting || answerLocked) e.preventDefault();
                        }}
                        onWheel={(e) => {
                          if (isSubmitting || answerLocked)
                            (e.target as HTMLInputElement).blur();
                        }}
                        placeholder="Enter a number"
                        required
                        disabled={isSubmitting || answerLocked}
                        readOnly={isSubmitting || answerLocked}
                        aria-disabled={isSubmitting || answerLocked}
                        className={`w-full rounded-xs border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 dark:focus:border-blue-400 ${
                          isSubmitting || answerLocked
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!userAnswer || isSubmitting || answerLocked}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 sm:py-3.5 rounded-lg transition"
                    >
                      {isSubmitting ? "Checking…" : "Submit Answer"}
                    </button>
                  </form>
                </>
              )}
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
