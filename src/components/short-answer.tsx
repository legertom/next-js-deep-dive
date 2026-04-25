"use client";

import { useState } from "react";

interface ShortAnswerProps {
  question: string;
  /**
   * Bullet points the AI grader uses as a rubric. Each is a quality the
   * answer should ideally cover. Phrase them as expectations, not as
   * full criteria — the grader expands on them.
   */
  rubric: string[];
  /**
   * Short topic label used in the AI's system prompt to anchor grading
   * (e.g. "Why imperative DOM updates are error-prone").
   */
  topic: string;
}

interface Feedback {
  score: "strong" | "partial" | "weak";
  summary: string;
  hits: string[];
  misses: string[];
}

const scoreLabel: Record<Feedback["score"], string> = {
  strong: "Strong",
  partial: "Partial",
  weak: "Needs work",
};

const scoreColor: Record<Feedback["score"], { bg: string; text: string; border: string }> = {
  strong: { bg: "bg-success-light", text: "text-success-text", border: "border-success/30" },
  partial: {
    bg: "bg-accent-light",
    text: "text-accent-text",
    border: "border-accent/30",
  },
  weak: { bg: "bg-error-light", text: "text-error-text", border: "border-error/30" },
};

export function ShortAnswer({ question, rubric, topic }: ShortAnswerProps) {
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!answer.trim() || grading) return;
    setGrading(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, rubric, topic, answer }),
      });
      if (!res.ok) throw new Error(`Grader returned ${res.status}`);
      const data = (await res.json()) as Feedback;
      setFeedback(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGrading(false);
    }
  };

  const handleReset = () => {
    setAnswer("");
    setFeedback(null);
    setError(null);
  };

  const colors = feedback ? scoreColor[feedback.score] : null;

  return (
    <div className="my-8 rounded-xl border border-card-border bg-card overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-accent/5 to-transparent border-b border-card-border">
        <div className="flex items-center gap-2 text-sm font-semibold text-accent mb-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Short Answer · AI-graded
        </div>
        <p className="text-foreground font-medium">{question}</p>
      </div>

      <div className="p-6 space-y-4">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={grading}
          placeholder="Write your answer here. Aim for 2–3 sentences."
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-foreground text-[0.9375rem] leading-relaxed resize-y focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all disabled:opacity-60"
        />

        <div className="flex items-center gap-3">
          {feedback ? (
            <button
              onClick={handleReset}
              className="px-5 py-2 bg-subtle text-muted rounded-lg font-medium text-sm hover:bg-border transition-colors cursor-pointer"
            >
              Try again
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || grading}
              className="px-5 py-2 bg-accent text-white rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/80 transition-colors cursor-pointer flex items-center gap-2"
            >
              {grading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Grading…
                </>
              ) : (
                "Get feedback"
              )}
            </button>
          )}
          <span className="text-xs text-muted">
            Feedback is for self-checking — it never affects your progress.
          </span>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-error-light border border-error/20 text-error-text text-sm">
            {error}
          </div>
        )}

        {feedback && colors && (
          <div className={`p-4 rounded-lg ${colors.bg} border ${colors.border} space-y-3`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                {scoreLabel[feedback.score]}
              </span>
            </div>
            <p className={`text-sm ${colors.text}`}>{feedback.summary}</p>

            {feedback.hits.length > 0 && (
              <div>
                <div className={`text-xs font-semibold mb-1 ${colors.text}`}>What you got</div>
                <ul className={`text-sm space-y-1 ${colors.text}`}>
                  {feedback.hits.map((h, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex-shrink-0">✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {feedback.misses.length > 0 && (
              <div>
                <div className={`text-xs font-semibold mb-1 ${colors.text}`}>What to add next time</div>
                <ul className={`text-sm space-y-1 ${colors.text}`}>
                  {feedback.misses.map((m, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex-shrink-0">→</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
