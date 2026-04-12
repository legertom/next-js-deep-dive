"use client";

import { useState } from "react";

interface QuizOption {
  label: string;
  correct?: boolean;
  explanation?: string;
}

interface QuizProps {
  question: string;
  options: QuizOption[];
}

export function Quiz({ question, options }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
  };

  const handleCheck = () => {
    if (selected === null) return;
    setRevealed(true);
  };

  const handleReset = () => {
    setSelected(null);
    setRevealed(false);
  };

  const correctIndex = options.findIndex((o) => o.correct);
  const isCorrect = selected === correctIndex;

  return (
    <div className="my-8 rounded-xl border border-card-border bg-card overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-accent/5 to-transparent border-b border-card-border">
        <div className="flex items-center gap-2 text-sm font-semibold text-accent mb-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Check Your Understanding
        </div>
        <p className="text-foreground font-medium">{question}</p>
      </div>
      <div className="p-6 space-y-3">
        {options.map((option, i) => {
          let borderColor = "border-card-border";
          let bgColor = "bg-white";
          let textColor = "text-foreground";

          if (revealed && i === correctIndex) {
            borderColor = "border-success";
            bgColor = "bg-success-light";
            textColor = "text-green-800";
          } else if (revealed && i === selected && !isCorrect) {
            borderColor = "border-error";
            bgColor = "bg-error-light";
            textColor = "text-red-800";
          } else if (selected === i && !revealed) {
            borderColor = "border-accent";
            bgColor = "bg-accent-light";
            textColor = "text-blue-800";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 ${borderColor} ${bgColor} ${textColor} transition-all ${!revealed ? "hover:border-accent/50 cursor-pointer" : "cursor-default"}`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold mt-0.5 ${selected === i ? "border-current bg-current/10" : "border-current/30"}`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-[0.9375rem] leading-relaxed">{option.label}</span>
              </div>
            </button>
          );
        })}

        <div className="flex items-center gap-3 pt-2">
          {!revealed ? (
            <button
              onClick={handleCheck}
              disabled={selected === null}
              className="px-5 py-2 bg-accent text-white rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-5 py-2 bg-stone-200 text-stone-700 rounded-lg font-medium text-sm hover:bg-stone-300 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          )}
        </div>

        {revealed && (
          <div className={`mt-4 p-4 rounded-lg ${isCorrect ? "bg-success-light border border-success/20" : "bg-error-light border border-error/20"}`}>
            <p className={`font-semibold text-sm ${isCorrect ? "text-green-800" : "text-red-800"}`}>
              {isCorrect ? "Correct!" : "Not quite."}
            </p>
            {options[correctIndex]?.explanation && (
              <p className={`text-sm mt-1 ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                {options[correctIndex].explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
