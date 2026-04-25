import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function SuspenseInPractice() {
  return (
    <>
      <h1>Suspense in Practice</h1>

      <p>
        You know the mechanism. Now the patterns: where to place
        Suspense boundaries, how to control loading granularity, and
        how to use <code>use()</code> with promises in a way that
        doesn&apos;t shoot you in the foot.
      </p>

      <h2>Boundary placement is UX design</h2>

      <p>
        A single Suspense at the top of your app gives you the
        &quot;whole page loading&quot; experience. Many small Suspense
        boundaries gives you progressive loading — the parts of the UI
        ready fastest appear first. Both are valid; the choice is a
        design decision.
      </p>

      <CodeBlock language="tsx">
        {`// Coarse: whole page loads at once
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Sidebar />
  <Content />
  <Footer />
</Suspense>

// Fine: each region loads independently
<Suspense fallback={<HeaderSkeleton />}><Header /></Suspense>
<Suspense fallback={<SidebarSkeleton />}><Sidebar /></Suspense>
<Suspense fallback={<ContentSkeleton />}><Content /></Suspense>
<Footer />`}
      </CodeBlock>

      <p>
        In the fine version, the slowest region holds up only its own
        space. Users see structure form before all data is in. This is
        called <strong>streaming</strong> when paired with Server
        Components — your Next.js course covers it.
      </p>

      <Callout type="important" title="The choice rule">
        Each Suspense boundary is a place where the user sees a layout
        snap into place. <strong>Don&apos;t put boundaries where you
        don&apos;t want a flash of fallback</strong>. Place them around
        the parts of the UI that can take meaningfully longer than the
        rest, and design the fallback to match the final layout (so the
        page doesn&apos;t jump).
      </Callout>

      <h2>Stable promises with <code>use()</code></h2>

      <p>
        <code>use(promise)</code> needs the same promise across renders.
        Here&apos;s the right pattern when you control the data fetch:
      </p>

      <CodeBlock language="tsx">
        {`// 1. Create the promise OUTSIDE the component (stable reference)
const userPromise = fetchUser(1);

function UserCard() {
  const user = use(userPromise);
  return <p>Hi, {user.name}</p>;
}`}
      </CodeBlock>

      <p>Or pass it in as a prop from a parent:</p>

      <CodeBlock language="tsx">
        {`function App() {
  // Promise created once. Stable across re-renders.
  const userPromise = useMemo(() => fetchUser(currentId), [currentId]);
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <UserCard promise={userPromise} />
    </Suspense>
  );
}

function UserCard({ promise }: { promise: Promise<User> }) {
  const user = use(promise);
  return <p>Hi, {user.name}</p>;
}`}
      </CodeBlock>

      <p>
        Or — the cleanest pattern — let a Server Component fetch the
        data and pass it down. Server Components are <em>natively</em>{" "}
        async (Module 9). For now, in a pure-Vite/CSR app, useMemo or
        a top-level promise is the way.
      </p>

      <h2>Caching with <code>React.cache</code></h2>

      <p>
        React 19 includes <code>cache()</code> — a memoizer for
        functions that returns the same Promise for the same args
        within a single render pass. Useful when multiple components
        request the same data and you want to deduplicate:
      </p>

      <CodeBlock language="tsx">
        {`import { cache } from "react";

const getUser = cache(async (id: number) => {
  return fetch(\`/api/users/\${id}\`).then(r => r.json());
});

// Five components calling getUser(1) within one render → ONE fetch.
function Header()  { const user = use(getUser(1)); /* ... */ }
function Sidebar() { const user = use(getUser(1)); /* ... */ }`}
      </CodeBlock>

      <p>
        On the server (Server Components), this is <em>per-request</em>
        caching, which deduplicates within one page render. On the
        client, it&apos;s per-render. Both are useful in different
        ways, but client-side data fetching usually wants a real cache
        (TanStack Query, SWR) anyway.
      </p>

      <h2>Loading skeletons that don&apos;t feel cheap</h2>

      <p>
        The fallback is the user&apos;s entire experience while they
        wait. A spinner is fine for &lt;500ms. Past that, structural
        skeletons feel much faster:
      </p>

      <CodeBlock language="tsx">
        {`function CardSkeleton() {
  return (
    <div className="card" aria-hidden>
      <div style={{ width: "60%", height: 16, background: "#e4e4e7", borderRadius: 4 }} />
      <div style={{ width: "85%", height: 12, background: "#e4e4e7", borderRadius: 4, marginTop: 8 }} />
    </div>
  );
}

<Suspense fallback={<CardSkeleton />}>
  <Card id={1} />
</Suspense>`}
      </CodeBlock>

      <p>
        Skeletons that match the final layout&apos;s dimensions
        eliminate Cumulative Layout Shift. They also visually
        communicate &quot;here&apos;s where this thing will be&quot;
        instead of &quot;something is loading.&quot;
      </p>

      <h2>Adding a deck stats fetcher</h2>

      <p>
        Your flashcards app is currently fully synchronous. Let&apos;s
        add an async &quot;stats&quot; component that pretends to fetch
        analytics, suspends while it loads, and uses Suspense to handle
        the loading state. We&apos;ll fake the network with a Promise
        that resolves after a delay.
      </p>

      <HandsOn
        title="Add an async stats panel with use() and Suspense"
        projectStep="Module 8 · Step 1"
        projectContext="You'll add a 'Stats' component that simulates fetching analytics asynchronously. While it loads, a skeleton appears. After ~700ms, the real stats render. The whole thing is a few lines of code."
        steps={[
          "In `src/App.tsx`, import `Suspense` and `use` from React: ```tsx\nimport { useState, useEffect, useRef, Suspense, use } from 'react';\n```",
          "Above your `App` component, add a fake fetcher that returns a promise resolving after 700ms with stats: ```tsx\nfunction fetchStats(cards: Card[], knownIds: Set<number>): Promise<{ total: number; known: number; oldest: string }> {\n  return new Promise(resolve => {\n    setTimeout(() => {\n      const sorted = [...cards].sort((a, b) => a.id - b.id);\n      resolve({\n        total: cards.length,\n        known: knownIds.size,\n        oldest: sorted[0]?.question ?? 'no cards yet',\n      });\n    }, 700);\n  });\n}\n```",
          "Add a `Stats` component that consumes a stats promise via `use()`: ```tsx\nfunction Stats({ promise }: { promise: ReturnType<typeof fetchStats> }) {\n  const stats = use(promise);\n  return (\n    <Card>\n      <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>\n        <div><strong>{stats.total}</strong> cards total</div>\n        <div><strong>{stats.known}</strong> known</div>\n        <div style={{ color: '#71717a' }}>oldest: {stats.oldest}</div>\n      </div>\n    </Card>\n  );\n}\n```",
          "Add a skeleton component for the loading state: ```tsx\nfunction StatsSkeleton() {\n  return (\n    <Card>\n      <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '2rem' }} aria-hidden>\n        <div style={{ width: 80, height: 16, background: '#e4e4e7', borderRadius: 4 }} />\n        <div style={{ width: 80, height: 16, background: '#e4e4e7', borderRadius: 4 }} />\n        <div style={{ width: 200, height: 16, background: '#e4e4e7', borderRadius: 4 }} />\n      </div>\n    </Card>\n  );\n}\n```",
          "Inside App, create a stable promise per change of cards/knownIds. We need a stable promise reference, so wrap it in useMemo: ```tsx\nconst statsPromise = useMemo(() => fetchStats(cards, knownIds), [cards, knownIds]);\n```\nDon't forget to add `useMemo` to the React import.",
          "Render the Stats inside a Suspense boundary, just below the search input: ```tsx\n<Suspense fallback={<StatsSkeleton />}>\n  <Stats promise={statsPromise} />\n</Suspense>\n```",
          "Save and refresh. You should see the skeleton briefly, then the stats appear. Add a card or mark one as known — the stats refetch (because the promise changes), the skeleton flashes, then the new stats appear.",
          "Bonus: try moving the Suspense up to wrap the entire App. Now the whole app shows the skeleton during stat fetches. Move it back down. Notice how the boundary placement controls the loading scope.",
        ]}
      />

      <Callout type="info" title="Where this leads">
        In a Vite/CSR app, you usually use a data library (TanStack
        Query, SWR) instead of raw <code>use()</code>. In a Next.js app,
        Server Components fetch directly without Suspense plumbing — the
        framework wires it up. Either way, the mental model from this
        lesson stays the same: a Suspense boundary catches loading,
        and the fallback is your loading UX.
      </Callout>

      <Quiz
        question="Why might you place several small Suspense boundaries instead of one big one?"
        options={[
          { label: "Performance — small boundaries are faster" },
          {
            label: "UX — each region loads and reveals independently, so the page builds up progressively instead of waiting for the slowest piece",
            correct: true,
            explanation:
              "Boundary granularity is a UX design lever. Coarse boundaries are simpler but force the user to wait for everything. Fine boundaries let fast things appear first while slow things show their fallback in place. Both are valid; choose based on the page's structure and which pieces are independent.",
          },
          { label: "TypeScript can't infer types past the second Suspense level" },
          { label: "Suspense fallbacks can only render small content" },
        ]}
      />

      <Quiz
        question="Inside a component, you write `use(fetchData(id))`. The component renders in an infinite loop. What's the bug?"
        options={[
          { label: "fetchData is async — use can only consume sync values" },
          {
            label: "fetchData(id) creates a new Promise on every render. use() throws the new promise, the suspense fallback shows, the parent retries, you call fetchData again, infinite loop.",
            correct: true,
            explanation:
              "use() needs a stable promise reference across renders. Move the call out of the component (top-level), into a useMemo with stable deps, into a parent's prop, or into a cached fetcher. Inline fresh promises always loop.",
          },
          { label: "useState is missing — use() requires it" },
          { label: "Suspense boundaries can only handle one promise at a time" },
        ]}
      />

      <ShortAnswer
        question="You're loading a dashboard with a header (fast), a chart (medium), and a heavy table (slow). All three need separate fetches. How would you place Suspense boundaries to give the user the best UX, and why?"
        rubric={[
          "Wrap the chart and the table each in their own Suspense boundary so the slowest piece doesn't hold up the others",
          "Don't wrap the header (or the whole page) in a single big boundary — that would make the user wait for the slowest fetch before anything appears",
          "Bonus: notes that each fallback should match the final layout dimensions to prevent layout shift, and that this pattern is exactly how Next.js streams Server Components into pages",
        ]}
        topic="Designing Suspense boundary placement for progressive loading"
      />

      <h2>What&apos;s next</h2>

      <p>
        Suspense handles loading. The other half of declarative async
        UI is failure. Next lesson covers <strong>Error
        Boundaries</strong> — how to catch render errors gracefully,
        why they exist as a separate boundary from Suspense, and how
        to combine them.
      </p>
    </>
  );
}
