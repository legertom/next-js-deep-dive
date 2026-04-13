import Link from "next/link";
import { modules, getTotalLessons } from "@/lib/course-data";

export default function HomePage() {
  const totalLessons = getTotalLessons();
  const totalMinutes = modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + l.estimatedMinutes, 0),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(37,99,235,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6 backdrop-blur-sm border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Updated for Next.js 16.2 &middot; React 19.2
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Next.js 16
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Deep Dive
            </span>
          </h1>
          <p className="text-lg text-stone-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Go beyond tutorials. Understand <strong className="text-white">how</strong> and{" "}
            <strong className="text-white">why</strong> every feature works.
            Build a production app from scratch while mastering
            Cache Components, Turbopack, Server Actions, proxy.ts, and React 19.2.
          </p>
          <div className="flex items-center justify-center gap-6 mb-10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{modules.length}</div>
              <div className="text-xs text-stone-400">Modules</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalLessons}</div>
              <div className="text-xs text-stone-400">Lessons</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">~{Math.round(totalMinutes / 60)}h</div>
              <div className="text-xs text-stone-400">Content</div>
            </div>
          </div>
          <Link
            href="/module/why-nextjs/the-problem"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-stone-900 rounded-xl font-bold text-base hover:bg-stone-100 transition-colors no-underline shadow-lg shadow-black/20"
          >
            Start the Course
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </header>

      {/* What you'll learn */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-2">What You&apos;ll Master</h2>
        <p className="text-center text-muted mb-12 max-w-xl mx-auto">
          Each module builds on the last. By the end, you&apos;ll have deep knowledge of every Next.js 16 feature
          and a real app to prove it.
        </p>

        <div className="grid gap-4">
          {modules.map((mod) => (
            <Link
              key={mod.slug}
              href={`/module/${mod.slug}/${mod.lessons[0].slug}`}
              className="group flex items-start gap-5 p-5 rounded-xl border border-card-border bg-card hover:border-accent/30 hover:shadow-md transition-all no-underline"
            >
              <div className="w-12 h-12 rounded-xl bg-subtle flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                {mod.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent">MODULE {mod.id}</span>
                  <span className="text-xs text-muted">&middot; {mod.lessons.length} lessons</span>
                </div>
                <h3 className="font-bold text-foreground mt-0.5 group-hover:text-accent transition-colors">
                  {mod.title}
                </h3>
                <p className="text-sm text-muted mt-0.5">{mod.subtitle}</p>
              </div>
              <svg className="w-5 h-5 text-muted group-hover:text-accent mt-3 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        Built with Next.js 16 &middot; The course <em>is</em> the app
      </footer>
    </div>
  );
}
