import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function UseDeferredValue() {
  return (
    <>
      <h1>useDeferredValue</h1>

      <p>
        <code>useTransition</code> works when you control the state
        setter. <code>useDeferredValue</code> works when you only have
        the value — like a prop you didn&apos;t write the setter for,
        or a derived value you want a &quot;lagging&quot; copy of. Same
        priority concept, different application.
      </p>

      <h2>The shape</h2>

      <CodeBlock language="tsx">
        {`function FilteredList({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => bigFilter(deferredQuery), [deferredQuery]);
  return <List items={results} />;
}`}
      </CodeBlock>

      <p>
        The hook returns a copy of the value that &quot;lags&quot;
        behind the real one when React is busy. On urgent updates,{" "}
        <code>deferredQuery</code> stays at the old value while the
        rest of the UI updates. Once the urgent stuff is done, React
        re-renders with the new <code>deferredQuery</code> and the
        list updates.
      </p>

      <h2>When you reach for which</h2>

      <ul>
        <li>
          <strong><code>useTransition</code></strong> — when you own the
          state. Wrap the setter call in <code>startTransition</code>.
          Best when you have an explicit pending indicator you want to
          show.
        </li>
        <li>
          <strong><code>useDeferredValue</code></strong> — when you
          receive a value (prop, derived computation) and want a lagging
          copy. Common in deeply-nested components that consume a
          search query without controlling the input.
        </li>
      </ul>

      <p>
        They&apos;re two ways into the same machinery. Sometimes either
        works.
      </p>

      <h2>Real example: a child component with a heavy render</h2>

      <CodeBlock language="tsx">
        {`function App() {
  const [query, setQuery] = useState("");
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <SearchResults query={query} />
    </>
  );
}

// SearchResults is in a library; you can't change how it gets the prop.
function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => expensiveSearch(deferredQuery), [deferredQuery]);
  return (
    <ul style={{ opacity: query !== deferredQuery ? 0.5 : 1 }}>
      {results.map(r => <li key={r.id}>{r.name}</li>)}
    </ul>
  );
}`}
      </CodeBlock>

      <p>
        Two things to notice:
      </p>

      <ul>
        <li>
          <code>SearchResults</code> doesn&apos;t care that the parent
          owns the state. It just defers the prop locally.
        </li>
        <li>
          <code>query !== deferredQuery</code> tells you a deferred
          render is in flight. Common pattern: dim the stale results
          while the new ones compute.
        </li>
      </ul>

      <h2>Pairing with useMemo</h2>

      <p>
        <code>useDeferredValue</code> by itself doesn&apos;t skip the
        expensive computation — it just runs it at lower priority. To
        actually save work between renders, pair it with{" "}
        <code>useMemo</code> that depends on the deferred value:
      </p>

      <CodeBlock language="tsx">
        {`// expensiveSearch only runs when deferredQuery changes (memoized),
// AND the rendering is non-urgent (deferred).
const results = useMemo(() => expensiveSearch(deferredQuery), [deferredQuery]);`}
      </CodeBlock>

      <p>
        Without <code>useMemo</code>, every render of{" "}
        <code>SearchResults</code> still recomputes the expensive
        search even when <code>deferredQuery</code> hasn&apos;t changed.
        With it, the calculation is skipped when the deferred value is
        the same as last render.
      </p>

      <h2>The &quot;dim the stale UI&quot; pattern</h2>

      <p>
        When you defer a value, the UI renders the old results until
        the deferred render completes. Users can find this confusing
        without a hint. The pattern:
      </p>

      <CodeBlock language="tsx">
        {`function Results({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  const results = useMemo(() => search(deferredQuery), [deferredQuery]);
  return (
    <div style={{
      opacity: isStale ? 0.5 : 1,
      transition: "opacity 0.2s",
    }}>
      {results.map(r => <li key={r.id}>{r.name}</li>)}
    </div>
  );
}`}
      </CodeBlock>

      <p>
        Dimmed = old data, fresh data is on its way. Full opacity =
        synchronized. Subtle but communicates &quot;your input is
        being processed.&quot;
      </p>

      <h2>Refactoring your search to useDeferredValue</h2>

      <p>
        Last lesson you used <code>useTransition</code> with two
        explicit state variables. Same effect can be achieved with one
        state and <code>useDeferredValue</code> — sometimes cleaner.
        Refactor to feel the difference.
      </p>

      <HandsOn
        title="Switch the search to useDeferredValue"
        projectStep="Module 10 · Step 2"
        projectContext="You'll replace the two-state + useTransition setup with a single state + useDeferredValue. Same UX, less plumbing."
        steps={[
          "In `src/app/Flashcards.tsx`, change the React import: ```tsx\nimport { useState, useEffect, useRef, useDeferredValue, useMemo } from 'react';\n```\nRemove `useTransition` if you had it.",
          "Replace the two state hooks (`searchInput`, `searchTerm`) with a single one: ```tsx\nconst [searchInput, setSearchInput] = useState('');\nconst deferredSearch = useDeferredValue(searchInput);\nconst isStale = searchInput !== deferredSearch;\n```",
          "Update the search input back to a simple onChange (no transition wrapping needed): ```tsx\n<input\n  ref={searchRef}\n  type=\"search\"\n  className=\"search\"\n  placeholder=\"Search cards... (press /)\"\n  value={searchInput}\n  onChange={(e) => setSearchInput(e.target.value)}\n/>\n```",
          "Update the filter to use `deferredSearch` and wrap it in `useMemo` so the expensive filter only runs when deferredSearch changes: ```tsx\nconst filtered = useMemo(() => {\n  // (Remove the 50ms busy-loop from last lesson if you still have it)\n  return deferredSearch.trim() === ''\n    ? cards\n    : cards.filter(c =>\n        c.question.toLowerCase().includes(deferredSearch.toLowerCase()) ||\n        c.answer.toLowerCase().includes(deferredSearch.toLowerCase())\n      );\n}, [cards, deferredSearch]);\n```",
          "Show stale-state visually using `isStale`. Wrap your card list in a div that dims when stale: ```tsx\n<div style={{ opacity: isStale ? 0.5 : 1, transition: 'opacity 0.2s' }}>\n  {/* existing Deck and List rendering */}\n</div>\n```",
          "If you want to feel the effect again, temporarily restore the 50ms busy-loop INSIDE the useMemo callback. Type fast — the input stays smooth, the list briefly dims, then snaps back to full opacity when the new results render.",
          "Reflect: useDeferredValue is one hook in one place. The two-state useTransition approach worked too, but if you only need 'show the stale results until the new ones are ready' UX, useDeferredValue is the leaner option.",
        ]}
      />

      <Callout type="info" title="When to choose which">
        <code>useTransition</code> when you want explicit
        <code>isPending</code> feedback at the action site (like a
        button label). <code>useDeferredValue</code> when you want a
        lagging value with maybe a stale-UI visual cue. Both produce
        the same priority effect; pick the one that fits your component
        boundary.
      </Callout>

      <Quiz
        question="What's the practical difference between useTransition and useDeferredValue?"
        options={[
          { label: "useTransition is faster" },
          {
            label: "useTransition wraps a state update you control; useDeferredValue takes a value you receive (a prop, a derived expression) and returns a lagging copy",
            correct: true,
            explanation:
              "Both produce the 'low priority' effect, but they hook in at different points. If you own the setter, useTransition is the most explicit. If you only have the value (e.g. a prop you can't change), useDeferredValue is the way in.",
          },
          { label: "Only useTransition works in concurrent mode" },
          { label: "useDeferredValue is for class components" },
        ]}
      />

      <Quiz
        question="Why is useDeferredValue often paired with useMemo?"
        options={[
          { label: "useMemo is required by useDeferredValue" },
          {
            label: "useDeferredValue defers the render priority but doesn't skip work between renders. useMemo skips the recomputation when the deferred value hasn't changed.",
            correct: true,
            explanation:
              "Two complementary tools: useDeferredValue lowers the priority of an update; useMemo lets you avoid redoing the expensive computation when the inputs haven't changed. Together they give you both 'don't block the UI' and 'don't redo work'.",
          },
          { label: "useDeferredValue causes infinite loops without useMemo" },
          { label: "useMemo is required for any deferred state" },
        ]}
      />

      <ShortAnswer
        question="A search component receives a `query` prop from a parent it doesn't control. The component renders an expensive list. The user types in the parent's input and it lags. Walk through how to fix it with useDeferredValue, and what the user will visually experience."
        rubric={[
          "Inside the search component, call useDeferredValue(query) to get a deferred copy of the prop",
          "Use the deferred value (not the original) for the expensive computation, ideally wrapped in useMemo",
          "While the deferred render is in flight (query !== deferredQuery), the user sees the input update immediately and the old results dim/visually-mark as stale; once the deferred render completes, the dim lifts and new results show",
        ]}
        topic="Using useDeferredValue with a prop you don't control"
      />

      <h2>Module 10 wrap-up</h2>

      <p>
        Two hooks for concurrent rendering. <code>useTransition</code>{" "}
        when you own the state. <code>useDeferredValue</code> when you
        receive the value. Both let you tell React &quot;this update
        can wait&quot; — keeping interactive elements responsive even
        when downstream renders are heavy.
      </p>

      <p>
        Module 11 dives into performance more broadly: why re-renders
        happen, how to profile them, and the React Compiler — which
        is making manual <code>useMemo</code> and <code>useCallback</code>{" "}
        almost obsolete.
      </p>
    </>
  );
}
