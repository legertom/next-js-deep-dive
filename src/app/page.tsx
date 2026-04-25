import Link from "next/link";
import { courses, getTotalLessons, getCourseDuration } from "@/lib/course-data";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(37,99,235,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.12),transparent_50%)]" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6 backdrop-blur-sm border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Two courses · React 19.2 · Next.js 16.2
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Learn modern{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              React &amp; Next.js
            </span>{" "}
            from the ground up
          </h1>
          <p className="text-lg text-stone-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Two deep, hands-on courses. Pick where you are. Each one builds a
            real app while you master the <strong className="text-white">why</strong>{" "}
            behind every feature.
          </p>
        </div>
      </header>

      {/* Course picker */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-2">Choose your course</h2>
        <p className="text-center text-muted mb-12 max-w-xl mx-auto">
          Start with React if you&apos;re rusty or new to it. Jump to Next.js if React
          fundamentals feel solid.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const lessons = getTotalLessons(course.slug);
            const minutes = getCourseDuration(course.slug);
            const firstLesson = course.modules[0]?.lessons[0];
            const accentGradient =
              course.accent === "cyan"
                ? "from-cyan-500 to-blue-500"
                : "from-blue-500 to-purple-500";
            const cardAccent =
              course.accent === "cyan"
                ? "hover:border-cyan-500/40 hover:shadow-cyan-500/10"
                : "hover:border-blue-500/40 hover:shadow-blue-500/10";

            return (
              <Link
                key={course.slug}
                href={
                  firstLesson
                    ? `/course/${course.slug}/${course.modules[0].slug}/${firstLesson.slug}`
                    : "/"
                }
                className={`group relative overflow-hidden rounded-2xl border border-card-border bg-card p-7 transition-all hover:shadow-xl no-underline ${cardAccent}`}
              >
                <div
                  className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${accentGradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}
                />
                <div className="relative">
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center text-white text-2xl font-black shadow-md`}
                    >
                      {course.icon}
                    </div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted bg-subtle px-2 py-1 rounded-full">
                      {course.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors mb-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed mb-5">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted mb-5 pb-5 border-b border-card-border">
                    <span>
                      <strong className="text-foreground">{course.modules.length}</strong>{" "}
                      modules
                    </span>
                    <span>
                      <strong className="text-foreground">{lessons}</strong> lessons
                    </span>
                    <span>
                      ~<strong className="text-foreground">{Math.round(minutes / 60)}h</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                      Start course
                    </span>
                    <svg
                      className="w-5 h-5 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        Built with Next.js 16 &middot; The course <em>is</em> the app
      </footer>
    </div>
  );
}
