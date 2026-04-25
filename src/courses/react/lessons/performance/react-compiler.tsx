import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function ReactCompiler() {
  return (
    <>
      <h1>The React Compiler</h1>

      <p>
        The React Compiler is the biggest single quality-of-life
        upgrade React has shipped in years. It&apos;s a build-time
        compiler that automatically inserts memoization (the same
        thing <code>useMemo</code>, <code>useCallback</code>, and{" "}
        <code>React.memo</code> do) wherever your code would benefit
        from it. The result: you stop writing those by hand, and your
        app gets faster anyway.
      </p>

      <h2>What problem it solves</h2>

      <p>
        For a decade, React performance optimization meant manually
        deciding which values to cache and which functions to stabilize.
        Choose the wrong dependencies and you have a stale-state bug.
        Forget to wrap a component in <code>React.memo</code> and you
        ship slow code. Wrap too many things and you ship slow{" "}
        <em>and</em> bloated code (memoization isn&apos;t free).
      </p>

      <p>
        The Compiler reads your code and figures it out for you. Any
        value computed inside a component, any function defined inline,
        any JSX tree returned — the compiler analyzes the data flow
        and inserts memoization where the analysis says it&apos;s
        safe and beneficial. You write idiomatic code; the compiler
        produces optimized code.
      </p>

      <h2>What the compiled output looks like</h2>

      <p>
        You write this:
      </p>

      <CodeBlock language="tsx">
        {`function Cards({ cards, query }: Props) {
  const filtered = cards.filter(c => c.question.includes(query));
  function handleClick(id: number) {
    console.log("clicked", id);
  }
  return filtered.map(c => <Card key={c.id} card={c} onClick={() => handleClick(c.id)} />);
}`}
      </CodeBlock>

      <p>
        The compiler produces (conceptually) this:
      </p>

      <CodeBlock language="tsx">
        {`function Cards({ cards, query }: Props) {
  const $ = useMemoCache(...);  // a per-component cache the compiler manages
  const filtered = $.cards === cards && $.query === query
    ? $.filtered
    : (() => {
        const result = cards.filter(c => c.question.includes(query));
        $.filtered = result;
        $.cards = cards;
        $.query = query;
        return result;
      })();

  const handleClick = $.handleClick ?? (() => {
    const fn = (id: number) => console.log("clicked", id);
    $.handleClick = fn;
    return fn;
  })();

  // ... and so on for each per-card click handler, the JSX, etc.
}`}
      </CodeBlock>

      <p>
        Auto-memoization at every level. Pure values are cached. Inline
        functions get stable references. The output is what
        you&apos;d hand-write if you optimized everything carefully —
        but you didn&apos;t have to write it.
      </p>

      <Callout type="important" title="Idiomatic code becomes fast code">
        The Compiler&apos;s real value: you can write the cleanest,
        most readable code (no <code>useMemo</code>, no{" "}
        <code>useCallback</code>, no <code>React.memo</code>) and the
        compiler optimizes it. The cognitive load of &quot;am I
        re-creating an object every render?&quot; goes away. Code
        review stops needing to be a memoization audit.
      </Callout>

      <h2>The cost: your code must be Rules-of-React-pure</h2>

      <p>
        The compiler is conservative. It only memoizes when it can
        prove that doing so is safe — meaning your component must
        follow the React rules:
      </p>

      <ul>
        <li>
          Pure rendering: no mutating props, no calling{" "}
          <code>setState</code> during render.
        </li>
        <li>Hooks called at the top level only, never conditionally.</li>
        <li>State updates wrapped in setters (no mutating state arrays/objects in place).</li>
      </ul>

      <p>
        These are rules you should be following anyway. The compiler
        ships with an ESLint plugin (<code>eslint-plugin-react-hooks</code>{" "}
        plus the <code>recommended-latest</code> config) that catches
        violations. If you&apos;ve been following the rules, the
        compiler will work without changes. If you&apos;ve been
        sloppy, the linter will tell you what to fix.
      </p>

      <h2>How to enable it</h2>

      <p>
        In Next.js 16+, the compiler is on by default. You don&apos;t
        have to do anything. Older versions need a config flag:
      </p>

      <CodeBlock filename="next.config.ts" language="ts">
        {`import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
};

export default config;`}
      </CodeBlock>

      <p>
        For Vite, install the babel plugin:{" "}
        <code>npm install babel-plugin-react-compiler</code> and add
        it to your Vite config. The Compiler docs cover other build
        tools.
      </p>

      <h2>What stops being necessary</h2>

      <p>
        Once the compiler is on, you can:
      </p>

      <ul>
        <li>
          <strong>Stop using <code>useMemo</code></strong> for
          memoizing computed values. The compiler does it.
        </li>
        <li>
          <strong>Stop using <code>useCallback</code></strong> for
          stabilizing function references. Same.
        </li>
        <li>
          <strong>Stop wrapping components in <code>React.memo</code></strong>{" "}
          to prevent re-renders. Compiler-generated memoization
          handles props.
        </li>
        <li>
          <strong>Stop worrying about referential equality of inline
          objects / arrays / functions in props</strong>. It&apos;s
          handled.
        </li>
      </ul>

      <h2>What still matters</h2>

      <p>
        The Compiler removes the <em>tedium</em> but doesn&apos;t
        eliminate the need to think about architecture:
      </p>

      <ul>
        <li>
          <strong>Where state lives.</strong> Lifting too high causes
          big subtrees to re-render. Composition still helps.
        </li>
        <li>
          <strong>Heavy computations.</strong> If a single render is
          slow, memoization can help skip <em>repeated</em> renders,
          but the first run is still slow. Concurrent rendering
          (Module 10) and virtualization still apply.
        </li>
        <li>
          <strong>Context fan-out.</strong> Many consumers of a
          frequently-changing context still all re-render. Splitting
          contexts is still the fix.
        </li>
        <li>
          <strong>List size.</strong> Rendering 10,000 list items is
          still 10,000 things; virtualize.
        </li>
      </ul>

      <h2>What about my existing useMemo / useCallback?</h2>

      <p>
        Existing code with manual memoization keeps working. The
        compiler doesn&apos;t fight you; it just adds memoization
        where it&apos;s missing. You can leave them alone, remove
        them gradually, or remove them all at once. There&apos;s a
        codemod for the cleanup.
      </p>

      <p>
        That said: leaving them in is a documentation cost. Future you
        (or your teammates) will wonder if there&apos;s a real reason,
        or if it was just &quot;old code.&quot; If you have time, the
        cleanup is worth it.
      </p>

      <h2>Cleaning up your flashcard app</h2>

      <HandsOn
        title="Verify the Compiler is on and remove manual memoization"
        projectStep="Module 11 · Step 2"
        projectContext="You'll verify the React Compiler is enabled, remove the manual React.memo from last lesson, and confirm the compiler still skips unnecessary renders. Idiomatic code becomes fast code."
        steps={[
          "Open `next.config.ts` (or `next.config.js`) in your `flashcards-next` project. In Next.js 16+ the compiler is on by default. If you see no `experimental.reactCompiler` config, you're good. Otherwise, ensure: ```ts\nconst config: NextConfig = {\n  experimental: { reactCompiler: true },\n};\n```",
          "In `src/app/Flashcards.tsx`, find the `Flashcard = memo(...)` from last lesson. Remove the memo wrapping: ```tsx\nfunction Flashcard({ question, answer, isKnown, onMarkKnown }: FlashcardProps) {\n  // body unchanged\n}\n```\nAlso clean up your imports — remove `memo` if it's no longer used.",
          "Restart the dev server (compiler changes need a fresh build). Open React DevTools Profiler.",
          "Record a search keystroke (same as last lesson). Hover the Flashcards in the flame chart. Most of them should still show as grey (skipped) — even though there's no manual React.memo anywhere.",
          "That's the compiler at work. It saw that Flashcard is a child of an unchanged subtree, with stable props by reference (because it inserted memoization for the inline `() => markKnown(card.id)` arrow), and skipped the re-render automatically.",
          "Bonus: temporarily remove the React Compiler from the config (or set `reactCompiler: false`). Restart. Profile again. Notice the Flashcards now re-render on every keystroke. Re-enable the compiler.",
          "Reflect: from this lesson forward, write idiomatic React. Don't pre-emptively memoize. Profile only when something feels slow. Trust the compiler. The mental load of 'is this prop reference-stable?' is gone.",
        ]}
      />

      <Callout type="info" title="A note on reading older code">
        Real codebases will have years of <code>useMemo</code>/<code>useCallback</code>{" "}
        before the compiler. They&apos;re not wrong, just redundant
        with the compiler enabled. When refactoring, keep them if
        you&apos;re unsure (they don&apos;t hurt), and use the official
        codemod to remove them safely. New code: write without
        manual memoization unless you have a specific reason.
      </Callout>

      <Quiz
        question="The React Compiler is enabled. Should you still write `useMemo` and `useCallback`?"
        options={[
          { label: "Yes, always — they don't hurt and may catch edge cases" },
          {
            label: "Generally no, for new code. The compiler does the same thing automatically. Keep them only when you have a specific reason (e.g. forcing referential stability for an external library that requires it).",
            correct: true,
            explanation:
              "The compiler's auto-memoization is more thorough and less error-prone than manual annotations. Writing them is now redundant. Existing useMemo/useCallback don't hurt — but for new code, just write the inline version.",
          },
          { label: "Yes, the compiler is just an experiment that will be removed" },
          { label: "No — the compiler refuses to compile any file that uses them" },
        ]}
      />

      <Quiz
        question="The compiler doesn't memoize my component. What's the most likely reason?"
        options={[
          { label: "The compiler is broken" },
          {
            label: "The component violates a Rule of React (mutates props, calls setState during render, conditional hooks). The linter flags this and the compiler refuses to optimize unsafe code.",
            correct: true,
            explanation:
              "The compiler is conservative — it only optimizes code it can prove is safe. The eslint-plugin-react-hooks (recommended-latest config) catches violations. Fix the rule violation and the compiler will memoize.",
          },
          { label: "Your component has too many hooks" },
          { label: "The component is a Server Component (compiler doesn't work on those)" },
        ]}
      />

      <ShortAnswer
        question="Imagine you're onboarding a new dev to a React codebase that has the React Compiler enabled. What guidance would you give them about useMemo, useCallback, and React.memo?"
        rubric={[
          "Don't write new useMemo/useCallback/React.memo without a specific reason — the compiler handles memoization automatically and your code stays cleaner",
          "Existing manual memoization in the codebase isn't wrong, just often redundant; you can leave it or remove it via the official codemod when refactoring",
          "Bonus: notes that the discipline becomes 'follow the rules of React' (caught by lint) and 'profile when slow' (apply targeted fixes); the compiler removes the constant 'is this prop stable?' worry",
        ]}
        topic="Onboarding guidance for the React Compiler"
      />

      <h2>Module 11 wrap-up</h2>

      <p>
        Three lessons. Why re-renders happen (the four causes).
        Profile-driven performance work (DevTools Profiler is the
        single best skill). The React Compiler (which is making manual
        memoization mostly obsolete). Combined, you have everything
        you need to debug, measure, and fix React performance issues
        — and to <em>write less optimization code</em> than React devs
        have written for the last decade.
      </p>

      <p>
        One module left. Module 12 wraps the course with{" "}
        <strong>TypeScript with React</strong>: typing components,
        props, hooks, events, and generic components. You&apos;ve been
        using TypeScript throughout, but Module 12 collects the
        patterns explicitly.
      </p>
    </>
  );
}
