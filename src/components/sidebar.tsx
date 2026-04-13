"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { modules, getTotalLessons } from "@/lib/course-data";
import { useProgress } from "./progress-provider";
import { useTheme } from "./theme-provider";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { isComplete, totalCompleted } = useProgress();
  const { theme, toggleTheme } = useTheme();
  const totalLessons = getTotalLessons();
  const progressPercent = Math.round((totalCompleted / totalLessons) * 100);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    // Auto-expand the module matching current path
    const match = pathname.match(/\/module\/([^/]+)/);
    return new Set(match ? [match[1]] : [modules[0].slug]);
  });

  const toggleModule = (slug: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <aside className="w-72 flex-shrink-0 bg-sidebar border-r border-border h-screen sticky top-0 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background font-black text-sm">N</span>
          </div>
          <div>
            <div className="font-bold text-sm text-foreground leading-tight">Next.js Deep Dive</div>
            <div className="text-xs text-muted">v16 Course</div>
          </div>
        </Link>
      </div>

      {/* Progress */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between text-xs text-muted mb-2">
          <span>Progress</span>
          <span className="font-semibold">{totalCompleted}/{totalLessons} lessons</span>
        </div>
        <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Modules */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {modules.map((mod) => {
          const isExpanded = expandedModules.has(mod.slug);
          const completedInModule = mod.lessons.filter((l) =>
            isComplete(`${mod.slug}/${l.slug}`)
          ).length;

          return (
            <div key={mod.slug} className="mb-1">
              <button
                onClick={() => toggleModule(mod.slug)}
                className="w-full flex items-center gap-2.5 px-5 py-2.5 text-left hover:bg-subtle transition-colors cursor-pointer"
              >
                <span className="text-base">{mod.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.8125rem] font-semibold text-foreground truncate">
                    {mod.id}. {mod.title}
                  </div>
                  <div className="text-[0.6875rem] text-muted">
                    {completedInModule}/{mod.lessons.length} complete
                  </div>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {isExpanded && (
                <div className="pb-2">
                  {mod.lessons.map((lesson) => {
                    const href = `/module/${mod.slug}/${lesson.slug}`;
                    const isActive = pathname === href;
                    const done = isComplete(`${mod.slug}/${lesson.slug}`);

                    return (
                      <Link
                        key={lesson.slug}
                        href={href}
                        className={`flex items-center gap-2.5 pl-12 pr-5 py-2 text-[0.8125rem] no-underline transition-colors ${
                          isActive
                            ? "bg-sidebar-active text-accent font-medium"
                            : "text-muted hover:text-foreground hover:bg-subtle"
                        }`}
                      >
                        <span className={`w-4 h-4 flex-shrink-0 rounded-full border-2 flex items-center justify-center ${
                          done
                            ? "border-success bg-success text-white"
                            : isActive
                              ? "border-accent"
                              : "border-border"
                        }`}>
                          {done && (
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className="truncate">{lesson.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {/* Theme toggle */}
      <div className="px-5 py-4 border-t border-border">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-subtle transition-colors cursor-pointer"
        >
          {theme === "dark" ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
          {theme === "dark" ? "Light mode" : "Night mode"}
        </button>
      </div>
    </aside>
  );
}
