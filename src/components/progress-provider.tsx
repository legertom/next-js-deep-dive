"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface ProgressContextType {
  completedLessons: Set<string>;
  markComplete: (key: string) => void;
  markIncomplete: (key: string) => void;
  isComplete: (key: string) => boolean;
  totalCompleted: number;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("course-progress");
    if (stored) {
      try {
        setCompletedLessons(new Set(JSON.parse(stored)));
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("course-progress", JSON.stringify([...completedLessons]));
    }
  }, [completedLessons, loaded]);

  const markComplete = useCallback((key: string) => {
    setCompletedLessons((prev) => new Set([...prev, key]));
  }, []);

  const markIncomplete = useCallback((key: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const isComplete = useCallback((key: string) => completedLessons.has(key), [completedLessons]);

  return (
    <ProgressContext.Provider
      value={{ completedLessons, markComplete, markIncomplete, isComplete, totalCompleted: completedLessons.size }}
    >
      {children}
    </ProgressContext.Provider>
  );
}
