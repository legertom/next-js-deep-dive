import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function UseTransition() {
  return (
    <>
      <h1>useTransition</h1>

      <p>
        React 18 introduced <strong>concurrent rendering</strong> — the
        ability to start a render, pause it if something more urgent
        comes in, and resume later. <code>useTransition</code> is how
        you tell React which updates are &quot;not urgent&quot; so it
        can keep the UI responsive while a heavy update is in
        progress. In practice: typing in a search box stays smooth
        even when each keystroke triggers a slow filter of 10,000
        items.
      </p>

      <h2>The problem it solves</h2>

      <p>
        Imagine a search input that filters a 5,000-item list. With
        regular state:
      </p>

      <CodeBlock language="tsx">
        {`function App() {
  const [query, setQuery] = useState("");
  const filtered = bigList.filter(item => item.name.includes(query));

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {filtered.map(...)}  {/* expensive */}
    </>
  );
}`}
      </CodeBlock>

      <p>
        Every keystroke updates <code>query</code>, which causes a
        re-render, which re-filters 5,000 items, which renders a huge
        DOM update. The input lags. By the time React finishes the
        filter and DOM update, the user is two keystrokes ahead, and
        the input feels janky.
      </p>

      <h2>The fix: split urgent and non-urgent updates</h2>

      <CodeBlock language="tsx">
        {`function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>(bigList);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setQuery(next);  // urgent: input value
    startTransition(() => {
      setResults(bigList.filter(item => item.name.includes(next)));  // not urgent: list
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <p>Filtering...</p>}
      {results.map(...)}
    </>
  );
}`}
      </CodeBlock>

      <p>
        Two state updates per keystroke. The first (<code>setQuery</code>)
        runs at normal priority — the input updates immediately. The
        second is wrapped in <code>startTransition</code>, telling
        React &quot;this is fine to interrupt.&quot; If the user types
        another letter mid-filter, React abandons the current render
        and starts over with the new query. <em>The input stays
        responsive.</em>
      </p>

      <h2>The hook&apos;s shape</h2>

      <CodeBlock language="tsx">
        {`const [isPending, startTransition] = useTransition();
//      ^^^^^^^^^^                       boolean: a transition is in progress
//                  ^^^^^^^^^^^^^^^^^    function: wrap state updates that are not urgent`}
      </CodeBlock>

      <p>
        <code>isPending</code> lets you show a loading indicator while
        a transition is in flight. <code>startTransition</code> takes a
        callback; any state updates inside it are marked as
        non-urgent.
      </p>

      <h2>What &quot;not urgent&quot; means</h2>

      <p>
        Updates marked as transitions can be:
      </p>

      <ul>
        <li>
          <strong>Deferred.</strong> If a more urgent update comes in
          (like another keystroke), React works on that first.
        </li>
        <li>
          <strong>Interrupted.</strong> A transition in progress can be
          abandoned mid-render if a new transition supersedes it.
        </li>
        <li>
          <strong>Run in chunks.</strong> React can break a long render
          into smaller chunks, yielding to the browser between them so
          input events stay responsive.
        </li>
      </ul>

      <p>
        Updates not marked as transitions stay synchronous and
        always-immediate, like before. That&apos;s why the input keeps
        responding while the filter renders are deferred.
      </p>

      <Callout type="important" title="When to reach for transitions">
        <code>useTransition</code> earns its keep when a state update
        triggers a noticeably slow render — large lists, complex
        layouts, expensive computations. For trivial state changes,
        the overhead isn&apos;t worth it. The rule: profile first
        (Module 11), reach for transitions when you see the input lag
        or the UI freezing during a state update.
      </Callout>

      <h2>Where it shows up in real apps</h2>

      <h3>Search-as-you-type with a heavy result list</h3>

      <p>
        Most common case. User types, the input is urgent, the
        filtered results aren&apos;t.
      </p>

      <h3>Tabs with expensive content</h3>

      <CodeBlock language="tsx">
        {`function Tabs() {
  const [tab, setTab] = useState<"posts" | "stats">("posts");
  const [isPending, startTransition] = useTransition();

  function selectTab(next: typeof tab) {
    startTransition(() => setTab(next));
  }

  return (
    <>
      <button onClick={() => selectTab("posts")}>Posts</button>
      <button onClick={() => selectTab("stats")}>Stats</button>
      {isPending && <Spinner />}
      {tab === "posts" ? <Posts /> : <ExpensiveChart />}
    </>
  );
}`}
      </CodeBlock>

      <p>
        Clicking the Stats tab takes 800ms to render the chart. With
        the transition, the Posts content stays interactive during
        the switch, the spinner shows, and the user can change their
        mind without the UI freezing.
      </p>

      <h3>Navigation in routers</h3>

      <p>
        Next.js&apos;s router uses <code>useTransition</code> under the
        hood. Clicking a link starts a transition; while it&apos;s
        loading, the previous page stays interactive. That&apos;s why
        link clicks in modern Next.js feel snappy — clicks register
        immediately, even if the new page takes a moment to load.
      </p>

      <h2>Wrapping non-state work doesn&apos;t help</h2>

      <p>
        <code>startTransition</code> only affects state updates that
        happen <em>inside</em> its callback. Wrapping pure computation
        does nothing:
      </p>

      <CodeBlock language="tsx">
        {`// ❌ doesn't help — no setState inside the transition
startTransition(() => {
  const result = expensiveCalc(input); // sync, blocks anyway
});

// ✅ the setState inside is the transition's payload
startTransition(() => {
  setResults(expensiveCalc(input));
});`}
      </CodeBlock>

      <p>
        The transition is &quot;these state updates are low priority,&quot;
        not &quot;this code runs in the background.&quot; If you want
        to yield to the browser during a sync calculation, you need
        <code>scheduler</code> APIs or web workers — outside React&apos;s
        scope.
      </p>

      <h2>Adding transitions to your search</h2>

      <p>
        Your flashcard search is fast (a few cards, simple filter).
        Let&apos;s simulate a slower scenario by wrapping the result
        rendering in something expensive — and watch{" "}
        <code>useTransition</code> rescue the input&apos;s
        responsiveness.
      </p>

      <HandsOn
        title="Use useTransition to keep the search input responsive"
        projectStep="Module 10 · Step 1"
        projectContext="You'll add an artificial slowdown to simulate a heavy filter, then wrap the filter update in a transition. Toggle between with and without to feel the difference."
        steps={[
          "In your `flashcards-next` project, open `src/app/Flashcards.tsx`. Add `useTransition` to the React import: ```tsx\nimport { useState, useEffect, useRef, useTransition } from 'react';\n```",
          "Inside Flashcards, add the hook: ```tsx\nconst [isPending, startTransition] = useTransition();\n```",
          "Currently your search input directly updates `searchInput`. Let's introduce two states: an immediate one for the input value (urgent) and a deferred one for filtering (non-urgent). Replace your existing `searchInput` and `searchTerm` state with: ```tsx\nconst [searchInput, setSearchInput] = useState('');\nconst [searchTerm, setSearchTerm] = useState('');\n```\nand remove the debouncing useEffect (we'll replace it).",
          "Update the search input's onChange to use a transition: ```tsx\n<input\n  ref={searchRef}\n  type=\"search\"\n  className=\"search\"\n  placeholder=\"Search cards... (press /)\"\n  value={searchInput}\n  onChange={(e) => {\n    const next = e.target.value;\n    setSearchInput(next);  // urgent\n    startTransition(() => {\n      setSearchTerm(next);  // non-urgent — won't block typing\n    });\n  }}\n/>\n```",
          "Show a 'Filtering...' indicator when a transition is in flight. Add it next to the search input: ```tsx\n<div className=\"search-row\">\n  <input ... />\n  {isPending && <span className=\"search-pending\">Filtering...</span>}\n</div>\n```",
          "Add CSS: ```css\n.search-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }\n.search-pending { font-size: 0.75rem; color: #71717a; }\n```",
          "To actually feel the benefit (since your real filter is fast), simulate a slow filter by adding a sync busy-loop in the render path. WARNING: this is just to feel the effect — never ship busy-loops. ```tsx\nconst filtered = (() => {\n  // Artificial slowdown to simulate a heavy filter\n  const start = performance.now();\n  while (performance.now() - start < 50) {\n    // burn 50ms per filter\n  }\n  return searchTerm.trim() === ''\n    ? cards\n    : cards.filter(c =>\n        c.question.toLowerCase().includes(searchTerm.toLowerCase()) ||\n        c.answer.toLowerCase().includes(searchTerm.toLowerCase())\n      );\n})();\n```",
          "Save and type quickly into the search box. The input stays smooth — your typing isn't blocked by the 50ms-per-keystroke filter rendering. The 'Filtering...' indicator flickers as transitions resolve.",
          "Compare: temporarily remove the `startTransition` wrapper (just call `setSearchTerm(next)` directly). Type quickly. Notice how the input lags — characters appear in bursts because each keystroke blocks for 50ms. Restore the transition.",
          "Important: remove the 50ms busy-loop from the production code path. It's only for the experiment.",
        ]}
      />

      <Callout type="info" title="The big picture">
        Concurrent rendering is React&apos;s answer to &quot;keeping the
        UI responsive when an update is doing real work.&quot;{" "}
        <code>useTransition</code> is the lever you pull to mark
        updates as interruptible. Most apps don&apos;t need it
        most of the time — but when you have a slow filter, a heavy
        chart, or a route transition, it&apos;s the right tool.
      </Callout>

      <Quiz
        question="What does wrapping a state update in `startTransition` actually do?"
        options={[
          { label: "It runs the update on a Web Worker" },
          {
            label: "It marks the update as non-urgent. React will defer it, interrupt it if a more urgent update comes in, or render it in chunks — keeping the rest of the UI responsive.",
            correct: true,
            explanation:
              "Transitions are about priority, not parallelism. The work still runs on the main thread, but React's scheduler treats it as interruptible. Urgent updates (other state changes outside the transition) take precedence. The transition can be discarded if a newer one supersedes it.",
          },
          { label: "It runs the update inside a setTimeout" },
          { label: "It makes the update synchronous and blocking" },
        ]}
      />

      <Quiz
        question="Your input lags when typing because each keystroke triggers an expensive render. You wrap the input's `setValue` call in `startTransition`. What happens?"
        options={[
          { label: "The input becomes responsive — that's exactly what useTransition is for" },
          {
            label: "Nothing helpful — the input itself becomes laggy because the input's value update is now low-priority. You need to keep the input update urgent and only wrap the expensive downstream state in a transition.",
            correct: true,
            explanation:
              "Common mistake. The trick is two states: keep the input value update urgent (so typing feels immediate) and put the expensive derived state inside the transition. If you mark the input value as non-urgent, the input itself feels laggy because what you type is low-priority.",
          },
          { label: "It crashes — you can't wrap input handlers in transitions" },
          { label: "It depends on whether React is in concurrent mode" },
        ]}
      />

      <ShortAnswer
        question="Imagine a tab switcher where one tab renders a 1-second chart. Walk through how useTransition makes the experience better when a user clicks that tab. What does the user see, and what would they see without it?"
        rubric={[
          "Without useTransition: clicking the slow tab freezes the UI for ~1s while the chart renders; user can't interact, can't change their mind",
          "With useTransition: the click registers immediately, the previous tab content stays interactive (you can show a pending indicator via isPending), and React renders the new content in the background — interruptible if the user clicks another tab",
          "Bonus: notes that this is exactly how Next.js's router uses useTransition for navigation — link clicks register instantly, the previous page stays alive while the new one loads",
        ]}
        topic="useTransition for tab switching with expensive content"
      />

      <h2>What&apos;s next</h2>

      <p>
        <code>useTransition</code> wraps an action you control —
        explicit state setters. The next lesson covers{" "}
        <code>useDeferredValue</code>, which works on a value you
        receive (like a prop) when you can&apos;t wrap the source. Same
        idea, slightly different ergonomics.
      </p>
    </>
  );
}
