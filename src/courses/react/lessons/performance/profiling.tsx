import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function Profiling() {
  return (
    <>
      <h1>Profiling with React DevTools</h1>

      <p>
        Last lesson covered the four reasons a component re-renders.
        This one covers how to figure out which reason applies to a
        specific render in your app. The tool is React DevTools&apos;s
        Profiler tab. Knowing it well is what separates &quot;guess and
        check&quot; performance work from &quot;measure and fix.&quot;
      </p>

      <h2>The setup</h2>

      <p>
        You should already have React DevTools installed from Module 6.
        If not: install the browser extension. The Components tab
        shows your tree; the Profiler tab is what we&apos;re about to
        use.
      </p>

      <h2>Recording a session</h2>

      <ol>
        <li>Open the Profiler tab.</li>
        <li>Click the blue circle (Record).</li>
        <li>Do the interaction you want to measure (click a button, type a letter, navigate).</li>
        <li>Click the red circle (Stop).</li>
      </ol>

      <p>
        DevTools shows you a flame chart: every component that
        rendered during the recording, color-coded by render time.
        Each bar is a commit. Yellow/red bars are slow renders;
        gray means the component didn&apos;t render this commit (only
        re-rendered children of it did).
      </p>

      <h2>The two views you&apos;ll use</h2>

      <h3>Flamegraph</h3>

      <p>
        The default view. Each commit (render pass) shows the entire
        tree with each component sized by its render time. Hover any
        component to see how long it took, which props changed, and
        why it rendered.
      </p>

      <h3>Ranked</h3>

      <p>
        Switch via the dropdown. Sorts components by render time,
        slowest first. Useful when you want to know &quot;which one
        component is the bottleneck&quot; without traversing the tree.
      </p>

      <h2>The most useful question: why did this render?</h2>

      <p>
        Hover a component. DevTools shows one of:
      </p>

      <ul>
        <li><strong>Initial mount</strong> — first render of this instance.</li>
        <li><strong>Hooks changed</strong> — its own state or a context it consumes changed.</li>
        <li><strong>Props changed</strong> — followed by a list of the specific props that differ from the previous render.</li>
        <li><strong>Parent rendered</strong> — the silent killer. The component re-rendered because its parent did, even though props are the same.</li>
      </ul>

      <p>
        That last one is what you&apos;re looking for when you&apos;re
        trying to figure out unnecessary work. If you see &quot;Parent
        rendered&quot; on a component you want to be stable, that&apos;s
        the candidate for memoization (or for restructuring the parent).
      </p>

      <h2>Settings worth turning on</h2>

      <p>
        In Profiler settings (the gear icon):
      </p>

      <ul>
        <li>
          <strong>Record why each component rendered while profiling.</strong>{" "}
          Should be on. This is what gives you the &quot;Parent
          rendered&quot; reasoning.
        </li>
        <li>
          <strong>Highlight updates when components render.</strong> In
          Components tab settings. Shows a flashing border around any
          component that re-renders, in real-time. Great for casual
          observation while clicking around.
        </li>
      </ul>

      <h2>The console logger pattern</h2>

      <p>
        Sometimes the Profiler is overkill. A quick{" "}
        <code>console.log</code> at the top of a component tells you
        when it renders:
      </p>

      <CodeBlock language="tsx">
        {`function Card({ card }) {
  console.log("Card render:", card.id);
  return <div>{card.question}</div>;
}`}
      </CodeBlock>

      <p>
        Open DevTools console, do an interaction, count the logs.
        Frequently the simplest tool. Just remember to remove the logs
        when you&apos;re done.
      </p>

      <h2>The optimizations, in order</h2>

      <p>
        Once you&apos;ve identified an unwanted re-render via the
        Profiler, here&apos;s the order to try fixes:
      </p>

      <ol>
        <li>
          <strong>Move state down.</strong> If a parent holds state
          that only one of its children needs, push the state into
          that child. The parent stops re-rendering on every change.
        </li>
        <li>
          <strong>Lift slow children up via children prop.</strong> If
          a slow child sits inside a parent that re-renders often, pass
          the child in as <code>children</code> to a wrapper that
          doesn&apos;t care about the changing state. (See Module 4 —
          composition wins again.)
        </li>
        <li>
          <strong>Memoize.</strong> <code>React.memo</code> the slow
          child, then make sure its props are reference-stable
          (<code>useMemo</code>, <code>useCallback</code>, or the React
          Compiler).
        </li>
        <li>
          <strong>Defer.</strong> If the work is genuinely heavy and
          unavoidable, wrap it in a transition (Module 10).
        </li>
        <li>
          <strong>Virtualize.</strong> If you&apos;re rendering a
          1000-item list, use a library like <code>react-virtual</code>{" "}
          or <code>react-window</code> to render only the visible
          rows.
        </li>
      </ol>

      <p>
        Most performance wins come from #1 and #2 — better
        architecture. #3 is the next reach. #4 and #5 are
        situation-specific.
      </p>

      <Callout type="tip" title="Production builds matter">
        Always profile production builds, not dev. Dev mode runs
        Strict Mode (double rendering), the React DevTools hook, and
        misses many optimizations. A page that feels slow in dev may
        be fine in prod, and vice versa. <code>npm run build &amp;&amp; npm run start</code>{" "}
        before declaring victory or panic.
      </Callout>

      <h2>Profiling your flashcard app</h2>

      <HandsOn
        title="Find and remove an unnecessary re-render"
        projectStep="Module 11 · Step 1"
        projectContext="You'll profile a typing interaction in the search box, identify which components re-rendered unnecessarily, and apply React.memo to one of them. The win is small (your app is fast already), but the procedure scales to bigger apps."
        steps={[
          "Open your `flashcards-next` app and the React DevTools Profiler tab. Make sure you have a handful of cards in the deck.",
          "Click Record. Type one letter in the search box. Stop recording.",
          "Look at the flame chart. You'll see App rendered, then several Flashcards. Hover one of the Flashcard renders. The reason will say 'Parent rendered' even though its props (question, answer, isKnown) didn't change.",
          "This is the cause #3 from last lesson — children re-render when the parent does, even with identical props. Each Flashcard is cheap, but on a deck of 1000 cards this would matter.",
          "Wrap `Flashcard` in `React.memo`. Find the Flashcard function in `src/app/Flashcards.tsx` and change `function Flashcard(...)` to `const Flashcard = React.memo(function Flashcard(...))`. You'll need to import `React` (or use `memo` from React directly): ```tsx\nimport { memo, useState, useEffect, ... } from 'react';\n// ...\nconst Flashcard = memo(function Flashcard({ question, answer, isKnown, onMarkKnown }: FlashcardProps) {\n  // ... existing body ...\n});\n```",
          "Profile again. Type a letter. Hover the Flashcards in the flame chart — most of them should now be GREY (didn't render this commit) instead of yellow.",
          "But check the ones that DO still render. The reason: `onMarkKnown` is a fresh function reference every render (it's defined inline as `() => markKnown(card.id)`). To get the full memo benefit, that function needs to be stable too.",
          "Wrap the per-card click handler in useCallback (or move the dispatch inline): ```tsx\n// Easiest: lift the markKnown logic to take an id and call it inside Flashcard, passing just the id\n// or use useCallback for each card (which gets fiddly).\n// The clean fix: pass `id` and the bare markKnown function, and let Flashcard call markKnown(id):\n```\nFor this hands-on, the React Compiler in the next lesson will eliminate this whole class of problem. Don't over-engineer it now.",
          "Profile one more time and observe how few components actually rendered for a search keystroke. Most of the tree is grey (skipped). That's the goal: do the minimum work for each interaction.",
          "Reflect: profiling-first is the discipline. You found a real cause (props' reference instability), saw the effect (still re-rendering despite memo), and have a clean path to a fix (next lesson — the Compiler does it for you).",
        ]}
      />

      <Quiz
        question="In the React DevTools Profiler, you see a component rendered with the reason 'Parent rendered'. What does that mean?"
        options={[
          { label: "Its parent component crashed and re-rendered" },
          {
            label: "The parent re-rendered for some reason, and React's default is to re-render all children — even those whose props are identical",
            correct: true,
            explanation:
              "That's the classic 'cascade' re-render. It's perfectly normal and usually fine, but if it shows up on a component whose render is expensive, you've found a memoization candidate. The fix is some combination of restructuring (move state down, pass children up) and React.memo.",
          },
          { label: "The component's parent's props changed" },
          { label: "The component's parent caught an error" },
        ]}
      />

      <Quiz
        question="You apply React.memo to a child component, but profiling still shows it re-rendering. What's the most likely cause?"
        options={[
          { label: "React.memo doesn't work in production" },
          {
            label: "The parent is passing a new object/array/function reference each render, so memo's reference comparison fails — even though the actual values are equivalent",
            correct: true,
            explanation:
              "memo compares props by reference. Inline objects (`{...}`), arrays (`[...]`), and arrow functions (`() => ...`) are fresh references every render. Either stabilize them via useMemo/useCallback, or rely on the React Compiler (next lesson) to handle it automatically.",
          },
          { label: "memo only works for class components" },
          { label: "memo causes hooks to misbehave so React skips it" },
        ]}
      />

      <ShortAnswer
        question="A user reports that typing in your search box feels slow. Walk through your debugging procedure: what would you do first, and how would the Profiler help you find the cause?"
        rubric={[
          "First: profile the typing interaction — record, type a letter, stop, look at the flame chart and which components have the slowest render times",
          "Hover slow components to see why they rendered (props changed? parent rendered? state changed?) and identify the bottleneck — likely either an expensive filter, a deeply nested re-render, or a list rendering many items",
          "Apply the right fix in order: move state, pass slow children up via children, memoize the heavy component (with reference-stable props), defer with useTransition, or virtualize if it's a giant list",
        ]}
        topic="Profile-driven performance debugging procedure"
      />

      <h2>What&apos;s next</h2>

      <p>
        You can profile and reason about re-renders. The last lesson
        of the module is the future-of-React-perf piece: the{" "}
        <strong>React Compiler</strong>. Once it&apos;s on, almost
        everything you just learned about <code>useMemo</code>,{" "}
        <code>useCallback</code>, and <code>React.memo</code> happens
        automatically — and you stop writing them by hand.
      </p>
    </>
  );
}
