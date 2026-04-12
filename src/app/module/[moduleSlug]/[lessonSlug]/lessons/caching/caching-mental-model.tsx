import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function CachingMentalModel() {
  return (
    <div>
      <h1>The Caching Mental Model</h1>
      <p className="lead">
        Next.js 16 completely rethinks how caching works. If you tried Next.js 14 or 15 and found the caching behavior confusing, you are not alone. The framework heard that feedback and rebuilt caching from scratch with one guiding principle: <strong>explicit beats implicit</strong>.
      </p>

      <h2>The Old Model: Implicit and Confusing</h2>
      <p>
        In previous versions of Next.js, caching happened automatically at multiple layers. A <code>fetch()</code> call in a Server Component was cached by default. Route Handlers were cached. Even entire pages were statically rendered unless you explicitly opted out. The problem? Developers constantly got surprised by stale data.
      </p>

      <FlowDiagram
        steps={[
          { label: "fetch()", sublabel: "Auto-cached" },
          { label: "Route Handler", sublabel: "Auto-cached" },
          { label: "Full Page", sublabel: "Statically rendered" },
          { label: "Stale Data", sublabel: "Confused developer", color: "border-error bg-error-light text-red-800" },
        ]}
      />

      <Callout type="warning" title="The old pain points">
        <p>In Next.js 14/15, you had to remember to add <code>cache: &quot;no-store&quot;</code> to fetches, export <code>dynamic = &quot;force-dynamic&quot;</code> from routes, or call <code>revalidatePath</code> to see fresh data. Many developers lost hours debugging stale responses.</p>
      </Callout>

      <h2>The New Model: Dynamic by Default</h2>
      <p>
        Next.js 16 flips the default. Everything is <strong>dynamic</strong> unless you explicitly tell it to cache. No more surprises. When you fetch data, it fetches fresh every time. When you render a page, it renders on demand.
      </p>
      <p>
        Want caching? You opt in with the <code>&quot;use cache&quot;</code> directive -- a new concept inspired by React&apos;s <code>&quot;use client&quot;</code> directive. This makes caching a conscious, visible decision in your code.
      </p>

      <Diagram caption="Next.js 16 caching philosophy: opt-in, not opt-out">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-8">
            <div className="px-6 py-4 rounded-lg border-2 border-red-300 bg-red-50 text-red-800">
              <div className="font-bold">Old Model</div>
              <div className="text-sm">Cached by default</div>
              <div className="text-sm">Opt OUT to get fresh data</div>
            </div>
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="px-6 py-4 rounded-lg border-2 border-green-300 bg-green-50 text-green-800">
              <div className="font-bold">New Model</div>
              <div className="text-sm">Dynamic by default</div>
              <div className="text-sm">Opt IN to cache</div>
            </div>
          </div>
        </div>
      </Diagram>

      <h2>Partial Prerendering (PPR)</h2>
      <p>
        The new caching model unlocks a powerful rendering strategy called <strong>Partial Prerendering</strong> (PPR). Instead of deciding that an entire page is either static OR dynamic, PPR lets you have both on the same page.
      </p>
      <p>
        Think of it like this: your page has a <strong>static shell</strong> (the layout, navigation, any cached content) with <strong>dynamic holes</strong> (user-specific data, real-time content). The static shell is served instantly from the CDN, while the dynamic parts stream in.
      </p>

      <FlowDiagram
        steps={[
          { label: "Request", sublabel: "User visits page" },
          { label: "Static Shell", sublabel: "Instant from CDN", color: "border-green-300 bg-green-50 text-green-800" },
          { label: "Dynamic Holes", sublabel: "Stream in", color: "border-purple-300 bg-purple-50 text-purple-800" },
          { label: "Complete Page", sublabel: "Fully interactive" },
        ]}
      />

      <CodeBlock filename="app/dashboard/page.tsx" language="tsx">
{`// This page uses PPR automatically:
// - The cached component renders instantly (static shell)
// - The dynamic component streams in (dynamic hole)

import { CachedSidebar } from './cached-sidebar'
import { LiveFeed } from './live-feed'

export default function Dashboard() {
  return (
    <div className="grid grid-cols-[250px_1fr]">
      {/* Static shell - served from cache */}
      <CachedSidebar />

      {/* Dynamic hole - renders on demand */}
      <Suspense fallback={<FeedSkeleton />}>
        <LiveFeed />
      </Suspense>
    </div>
  )
}`}
      </CodeBlock>

      <Callout type="important" title="PPR happens automatically">
        <p>You do not need to configure PPR separately. When you use <code>&quot;use cache&quot;</code> on some components and leave others dynamic, Next.js 16 automatically applies Partial Prerendering. The cached parts become the static shell; everything else is a dynamic hole.</p>
      </Callout>

      <h2>The Three Rules</h2>
      <p>Here is the entire mental model in three rules:</p>
      <ol>
        <li><strong>Everything is dynamic by default.</strong> No surprises, no stale data.</li>
        <li><strong>Add <code>&quot;use cache&quot;</code> to opt in.</strong> Pages, components, or functions -- you choose what to cache.</li>
        <li><strong>Control lifetime with <code>cacheLife</code>.</strong> Decide how long cached data stays fresh.</li>
      </ol>

      <Quiz
        question="In Next.js 16, what happens when you make a fetch() call in a Server Component without any cache configuration?"
        options={[
          { label: "The response is cached indefinitely", explanation: "This was the old behavior in Next.js 14. In Next.js 16, everything is dynamic by default." },
          { label: "The response is cached for 60 seconds", explanation: "There is no default cache duration. Without 'use cache', data is always fresh." },
          { label: "The data is fetched fresh on every request", correct: true, explanation: "Correct! Next.js 16 is dynamic by default. Without the 'use cache' directive, every fetch gets fresh data." },
          { label: "The fetch throws an error", explanation: "Fetches work fine without caching -- they just always get fresh data." },
        ]}
      />

      <h2>Enabling Cache Components</h2>
      <p>
        Before using the <code>&quot;use cache&quot;</code> directive, you need to enable it in your Next.js configuration:
      </p>

      <CodeBlock filename="next.config.ts" language="typescript">
{`import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig`}
      </CodeBlock>

      <Callout type="info">
        <p>The <code>cacheComponents</code> flag exists because Cache Components are a major new feature. Once the ecosystem stabilizes, this will likely become the default and the flag will be removed.</p>
      </Callout>

      <Quiz
        question="What is Partial Prerendering (PPR) in Next.js 16?"
        options={[
          { label: "A way to prerender only the first fold of a page" },
          { label: "A technique that serves a static shell instantly while streaming dynamic parts", correct: true, explanation: "Correct! PPR combines cached (static) and dynamic content on the same page. The static shell loads from the CDN instantly, and dynamic holes stream in afterward." },
          { label: "A build optimization that only prerenders pages with no dynamic data" },
          { label: "A client-side rendering strategy for partial hydration" },
        ]}
      />

      <HandsOn
        title="See that your blog is dynamic by default"
        projectStep="Step 15 of 32 — Blog Platform Project"
        projectContext="Open your my-blog project. Make sure npm run dev is running."
        steps={[
          "Open app/posts/page.tsx and add this line inside the component: const now = new Date().toLocaleTimeString() — then render it somewhere on the page, like <p>Rendered at: {now}</p>",
          "Save the file and open http://localhost:3000/posts in your browser. You should see the current time displayed on the page.",
          "Refresh the page several times and watch the time. It changes on every refresh — this means the page is rendered fresh for each request.",
          "This is the default behavior in Next.js 16: every page is dynamic. In the next lesson, you will learn how to cache pages so they load instantly.",
        ]}
      />
    </div>
  );
}
