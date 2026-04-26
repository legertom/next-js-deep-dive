import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";
import { ShortAnswer } from "@/components/short-answer";

export function ReactCompiler() {
  return (
    <div>
      <h1>React Compiler (Stable)</h1>

      <p>
        The React Compiler is now stable in Next.js 16. It is a build-time tool
        that automatically memoizes your components and hooks — eliminating the
        need for manual <code>useMemo</code>, <code>useCallback</code>, and{" "}
        <code>React.memo</code>. The compiler analyzes your code at build time
        and inserts fine-grained memoization where it will actually help.
      </p>

      <h2>The Manual Memoization Problem</h2>

      <p>Before the React Compiler, developers had to manually decide:</p>
      <ul>
        <li>Which values to memoize with <code>useMemo</code></li>
        <li>Which callbacks to stabilize with <code>useCallback</code></li>
        <li>Which components to wrap with <code>React.memo</code></li>
      </ul>

      <p>
        This was error-prone. Developers either under-memoized (causing
        unnecessary re-renders) or over-memoized (adding complexity without
        benefit). Getting the dependency arrays right was another source of bugs.
      </p>

      <CodeBlock
        language="tsx"
        filename="Before: Manual memoization everywhere">
{`"use client";

import { useMemo, useCallback, memo } from "react";

// Manually wrapped in memo
const ExpensiveList = memo(function ExpensiveList({
  items,
  onItemClick,
}: {
  items: Item[];
  onItemClick: (id: string) => void;
}) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});

function Dashboard({ data, userId }: Props) {
  // Manual useMemo to avoid recalculating on every render
  const processedItems = useMemo(
    () => data.items.filter((i) => i.active).sort((a, b) => a.name.localeCompare(b.name)),
    [data.items]
  );

  // Manual useCallback to stabilize the reference
  const handleItemClick = useCallback(
    (id: string) => {
      analytics.track("item_click", { userId, itemId: id });
    },
    [userId]
  );

  return <ExpensiveList items={processedItems} onItemClick={handleItemClick} />;
}`}
      </CodeBlock>

      <h2>With the React Compiler: Just Write Normal Code</h2>

      <CodeBlock
        language="tsx"
        filename="After: The compiler handles memoization">
{`"use client";

// No memo, no useMemo, no useCallback — the compiler does it all

function ExpensiveList({
  items,
  onItemClick,
}: {
  items: Item[];
  onItemClick: (id: string) => void;
}) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}

function Dashboard({ data, userId }: Props) {
  // The compiler detects this is derived data and memoizes it
  const processedItems = data.items
    .filter((i) => i.active)
    .sort((a, b) => a.name.localeCompare(b.name));

  // The compiler detects this only depends on userId and stabilizes it
  const handleItemClick = (id: string) => {
    analytics.track("item_click", { userId, itemId: id });
  };

  return <ExpensiveList items={processedItems} onItemClick={handleItemClick} />;
}`}
      </CodeBlock>

      <Callout type="info">
        The compiled output is functionally identical to well-written manual
        memoization — but it is more precise. The compiler can memoize at a
        finer granularity than humans typically bother with, memoizing individual
        JSX elements and expressions rather than whole components.
      </Callout>

      <h2>Enabling the React Compiler in Next.js 16</h2>

      <CodeBlock
        language="ts"
        filename="next.config.ts">
{`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;`}
      </CodeBlock>

      <p>
        That's it. One line of configuration. The compiler runs at build time as
        a Babel plugin, transforming your components before they reach the
        bundler.
      </p>

      <Callout type="tip">
        You do not need to remove existing <code>useMemo</code>,{" "}
        <code>useCallback</code>, or <code>React.memo</code> calls. The
        compiler recognizes them and either keeps them or replaces them with its
        own optimizations. You can migrate gradually.
      </Callout>

      <h2>What the Compiler Does Under the Hood</h2>

      <FlowDiagram
        title="React Compiler Build Pipeline"
        steps={[
          "Parse component source code into AST",
          "Analyze data flow and identify reactive dependencies",
          "Determine which values change between renders",
          "Insert cache slots for stable expressions",
          "Wrap derived computations in conditional checks",
          "Output optimized component code",
        ]}
      />

      <p>The compiler transforms your code by:</p>
      <ul>
        <li>
          <strong>Tracking dependencies</strong> — it builds a dependency graph
          of every variable, prop, and state value in your component
        </li>
        <li>
          <strong>Inserting cache checks</strong> — for each expression, it
          checks if inputs have changed since last render. If not, it returns
          the cached result.
        </li>
        <li>
          <strong>Granular memoization</strong> — it can memoize individual JSX
          elements, not just top-level returns, preventing child re-renders at a
          precision humans rarely achieve
        </li>
      </ul>

      <CodeBlock
        language="tsx"
        filename="What the compiler produces (simplified)">
{`// Original:
function Greeting({ name, color }) {
  const style = { color };
  return <h1 style={style}>Hello, {name}</h1>;
}

// After compilation (conceptual):
function Greeting({ name, color }) {
  const $ = _useMemoCache(3); // internal cache with 3 slots

  let style;
  if ($[0] !== color) {
    style = { color };
    $[0] = color;
    $[1] = style;
  } else {
    style = $[1];
  }

  let t0;
  if ($[0] !== color || $[2] !== name) {
    t0 = <h1 style={style}>Hello, {name}</h1>;
    $[2] = name;
  } else {
    t0 = $[3]; // Return cached JSX
  }

  return t0;
}`}
      </CodeBlock>

      <h2>Rules the Compiler Enforces</h2>

      <p>
        The React Compiler assumes your code follows the Rules of React. If your
        code violates these rules, the compiler will either skip that component
        or produce incorrect optimizations:
      </p>

      <ul>
        <li>Components must be pure during rendering (no side effects)</li>
        <li>Props and state are immutable — never mutate them directly</li>
        <li>Hook return values and arguments are immutable</li>
        <li>Values passed to JSX are immutable after being passed</li>
      </ul>

      <CodeBlock
        language="tsx"
        filename="Code the compiler cannot optimize">
{`// BAD: Mutating during render — compiler cannot memoize this
function BadComponent({ items }: { items: Item[] }) {
  items.sort((a, b) => a.name.localeCompare(b.name)); // Mutates prop!
  return <List items={items} />;
}

// GOOD: Create a new array — compiler can memoize
function GoodComponent({ items }: { items: Item[] }) {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
  return <List items={sorted} />;
}`}
      </CodeBlock>

      <Callout type="warning">
        The compiler includes an optional strict mode ESLint plugin (
        <code>eslint-plugin-react-compiler</code>) that flags code patterns it
        cannot safely optimize. Enable it during migration to catch issues early.
      </Callout>

      <h2>Build Time Implications</h2>

      <p>
        The compiler adds processing time to your build. In practice:
      </p>
      <ul>
        <li>
          Build times increase by roughly 5-15% depending on codebase size
        </li>
        <li>
          The compiler processes each component independently, so it
          parallelizes well
        </li>
        <li>
          Dev mode (next dev) uses the compiler too, so you see the same
          behavior in development and production
        </li>
        <li>
          Bundle size may slightly increase due to cache arrays, but this is
          offset by fewer re-renders at runtime
        </li>
      </ul>

      <h2>When to Still Use Manual Memoization</h2>

      <p>
        In rare cases, you might still want explicit memoization:
      </p>
      <ul>
        <li>
          When you need to guarantee referential stability for an external
          library that checks identity
        </li>
        <li>
          When the compiler skips a component (it logs warnings when it does)
        </li>
        <li>
          When you want to be explicit about performance-critical paths in
          documentation
        </li>
      </ul>

      <Quiz
        question="How do you enable the React Compiler in Next.js 16?"
        options={[
          { label: "Install a separate babel-plugin-react-compiler package and configure .babelrc" },
          { label: "Set reactCompiler: true in next.config.ts", correct: true, explanation: "In Next.js 16, enabling the React Compiler is a single configuration option: set reactCompiler: true in your next.config.ts. No separate packages or per-file directives needed." },
          { label: "Add 'use compiler' at the top of each file" },
          { label: "Run npx react-compiler init in your project" },
        ]}
      />

      <Quiz
        question="What happens if a component mutates its props during rendering?"
        options={[
          { label: "The compiler throws a build error and stops compilation" },
          { label: "The compiler may skip the component or produce incorrect memoization", correct: true, explanation: "The React Compiler assumes code follows the Rules of React (immutable props and state, pure render). If you mutate props, the compiler either skips that component (not optimizing it) or may produce incorrect caching behavior since it assumes values don't change between checks." },
          { label: "The compiler automatically adds a deep clone to fix it" },
          { label: "Nothing — the compiler handles mutations gracefully" },
        ]}
      />

      <HandsOn
        title="Turn on the React Compiler"
        projectStep="Step 26 of 40 — Blog Platform Project"
        projectContext="Your blog should be running with `npm run dev`. Open `next.config.ts` in your editor."
        steps={[
          "In `next.config.ts`, add `reactCompiler: true` inside the config object (next to any other options you already have). Save the file. That is the only setup needed.",
          "Restart your dev server with `npm run dev`. Open your blog in the browser. Everything should look and work exactly the same — the compiler optimizes your code behind the scenes without changing behavior.",
          "If you have any `useMemo` or `useCallback` calls in your components, try removing one of them. Save and test — the page should still work the same because the compiler now handles that memoization for you automatically.",
          "The React Compiler only works correctly when your components follow the Rules of React: do not mutate props or state directly. For example, never write `items.sort()` — always copy first with `[...items].sort()`. Your blog already follows these rules, so the compiler works out of the box!",
        ]}
      />

      <ShortAnswer
        question="The React Compiler refuses to memoize components that violate the Rules of React (mutating props, conditional hooks, etc.). Why is this conservative behavior actually a feature, not a limitation?"
        rubric={[
          "If the compiler memoized impure code, it would cache values that should be recomputed — silently introducing stale-data bugs that are very hard to debug",
          "The compiler's refusal is paired with the eslint-plugin-react-hooks rule that flags violations — so you fix the rule break (which was already a latent bug) and gain auto-memoization as a result",
          "Bonus: notes that the compiler's correctness guarantee is what makes it safe to remove all manual useMemo/useCallback/React.memo — you can trust the optimization without verifying every component yourself",
        ]}
        topic="Why the React Compiler being conservative is a feature"
      />
    </div>
  );
}
