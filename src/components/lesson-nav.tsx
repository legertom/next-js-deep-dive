"use client";

import Link from "next/link";
import { useProgress } from "./progress-provider";

interface LessonNavProps {
  currentKey: string;
  prev: { moduleSlug: string; lessonSlug: string; title: string; moduleTitle: string } | null;
  next: { moduleSlug: string; lessonSlug: string; title: string; moduleTitle: string } | null;
}

export function LessonNav({ currentKey, prev, next }: LessonNavProps) {
  const { isComplete, markComplete, markIncomplete } = useProgress();
  const done = isComplete(currentKey);

  return (
    <div className="mt-16 pt-8 border-t border-border">
      {/* Mark Complete */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => (done ? markIncomplete(currentKey) : markComplete(currentKey))}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
            done
              ? "bg-success-light text-green-800 border-2 border-success/30 hover:bg-green-100"
              : "bg-accent text-white hover:bg-blue-700 border-2 border-transparent"
          }`}
        >
          {done ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Lesson Complete
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mark as Complete
            </>
          )}
        </button>
      </div>

      {/* Prev/Next */}
      <div className="flex justify-between gap-4">
        {prev ? (
          <Link
            href={`/module/${prev.moduleSlug}/${prev.lessonSlug}`}
            className="group flex-1 p-4 rounded-xl border border-card-border bg-card hover:border-accent/30 hover:shadow-sm transition-all no-underline"
          >
            <div className="text-xs text-muted mb-1 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </div>
            <div className="font-semibold text-sm text-foreground group-hover:text-accent truncate">{prev.title}</div>
            <div className="text-xs text-muted truncate">{prev.moduleTitle}</div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/module/${next.moduleSlug}/${next.lessonSlug}`}
            className="group flex-1 p-4 rounded-xl border border-card-border bg-card hover:border-accent/30 hover:shadow-sm transition-all no-underline text-right"
          >
            <div className="text-xs text-muted mb-1 flex items-center justify-end gap-1">
              Next
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="font-semibold text-sm text-foreground group-hover:text-accent truncate">{next.title}</div>
            <div className="text-xs text-muted truncate">{next.moduleTitle}</div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
