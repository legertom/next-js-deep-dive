import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function UseRef() {
  return (
    <>
      <h1>useRef</h1>

      <p>
        <code>useRef</code> does two completely different things that
        share an implementation. Once you separate them in your head,
        the API stops feeling weird. Use case 1: <strong>get a handle to
        a DOM element</strong>. Use case 2: <strong>hold a value across
        renders without triggering a re-render</strong>. We&apos;ll cover
        both.
      </p>

      <h2>The shape</h2>

      <CodeBlock language="tsx">
        {`const ref = useRef<HTMLInputElement>(null);
// ref is { current: null } initially
// after render, if you attached it to JSX, ref.current is the DOM node`}
      </CodeBlock>

      <p>
        <code>useRef</code> returns a plain object with a single property,{" "}
        <code>current</code>. The object itself never changes between
        renders — it&apos;s the same reference every time. Mutating{" "}
        <code>ref.current</code> doesn&apos;t cause a re-render.
      </p>

      <h2>Use case 1: DOM access</h2>

      <p>
        Sometimes you need to imperatively interact with a DOM element:
        focus an input, scroll an element into view, measure its size,
        play a video, hand it to a third-party library. JSX is
        declarative, so React doesn&apos;t expose DOM nodes directly. The
        bridge is <code>ref</code>:
      </p>

      <CodeBlock language="tsx">
        {`function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);

  function focusInput() {
    inputRef.current?.focus(); // imperative DOM call
  }

  return (
    <>
      <input ref={inputRef} type="search" />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}`}
      </CodeBlock>

      <p>
        Three things to notice:
      </p>

      <ul>
        <li>
          The <code>ref</code> attribute on the input tells React
          &quot;put the DOM node here.&quot;
        </li>
        <li>
          Before the first render commits, <code>inputRef.current</code>{" "}
          is <code>null</code>. That&apos;s why we use the optional
          chaining <code>?.</code>.
        </li>
        <li>
          We use the ref inside an event handler — never during render.
          Reading or modifying <code>ref.current</code> during render is
          a purity violation.
        </li>
      </ul>

      <Callout type="important" title="When to reach for refs">
        Most of the time you don&apos;t need refs to interact with the
        DOM — React&apos;s declarative model handles it. Use refs for
        the things React doesn&apos;t express well: focus, text
        selection, scroll position, audio/video playback,
        measurements, integrations with non-React libraries. If you
        find yourself reaching for a ref to &quot;reset the
        input,&quot; you probably want state instead.
      </Callout>

      <h2>Use case 2: a mutable value across renders</h2>

      <p>
        State persists across renders but triggers re-renders. Plain
        local variables don&apos;t persist. Refs sit in between: they{" "}
        <em>persist</em> but <em>don&apos;t</em> trigger re-renders. That
        makes them perfect for values you need to remember without the
        UI caring:
      </p>

      <CodeBlock language="tsx">
        {`function Stopwatch() {
  const [time, setTime] = useState(0);
  const intervalRef = useRef<number | null>(null);

  function start() {
    if (intervalRef.current !== null) return;
    intervalRef.current = window.setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
  }

  function stop() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  return (
    <>
      <p>{time}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}`}
      </CodeBlock>

      <p>
        The interval ID has to survive across renders, but the UI
        doesn&apos;t care about its value — only <code>time</code>{" "}
        does. Storing it in a ref keeps it out of the render loop.
      </p>

      <h3>What about... just useState?</h3>

      <p>
        Could you store the interval ID in <code>useState</code>? Yes,
        but every <code>setInterval</code> call would trigger an extra
        re-render that doesn&apos;t change the UI. That&apos;s wasteful.
        For values that don&apos;t affect the UI, refs are the right
        tool.
      </p>

      <h2>Refs don&apos;t cause re-renders</h2>

      <p>
        This is the rule that separates refs from state:
      </p>

      <CodeBlock language="tsx">
        {`function Counter() {
  const countRef = useRef(0);

  return (
    <button onClick={() => {
      countRef.current++;
      console.log(countRef.current); // logs 1, 2, 3...
    }}>
      Count: {countRef.current}      {/* always shows 0 — no re-render */}
    </button>
  );
}`}
      </CodeBlock>

      <p>
        The console logs show the ref is incrementing. The button label
        never updates because nothing tells React to re-render. <strong>If
        the value affects the UI, use state. If it doesn&apos;t, a ref
        is fine.</strong>
      </p>

      <h2>The subtle commit-timing rule</h2>

      <p>
        <code>ref.current</code> is set <em>after</em> the commit phase —
        which means it&apos;s set after your component returned the JSX
        but before any effects run. Reading{" "}
        <code>inputRef.current</code> during render gets you the value
        from the <em>previous</em> commit (or <code>null</code> on first
        render).
      </p>

      <CodeBlock language="tsx">
        {`function Auto() {
  const ref = useRef<HTMLInputElement>(null);

  // ❌ wrong place — ref.current is from the last commit, not this render
  ref.current?.focus();

  useEffect(() => {
    // ✅ effects run after commit, ref.current is fresh
    ref.current?.focus();
  }, []);

  return <input ref={ref} />;
}`}
      </CodeBlock>

      <p>
        Practical takeaway: <strong>access refs in event handlers and
        effects, never in the render body</strong>.
      </p>

      <h2>Forwarding refs (React 19+)</h2>

      <p>
        Sometimes you have a wrapper component (<code>FancyInput</code>)
        and the consumer wants a ref to the underlying input element. In
        React 19, <code>ref</code> is just a regular prop, so the
        wrapper can accept and forward it like any other prop:
      </p>

      <CodeBlock language="tsx">
        {`function FancyInput({ ref, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} className="fancy" {...props} />;
}

// Consumer:
const inputRef = useRef<HTMLInputElement>(null);
<FancyInput ref={inputRef} />
inputRef.current?.focus(); // works`}
      </CodeBlock>

      <p>
        If you&apos;re reading older codebases, you&apos;ll see{" "}
        <code>React.forwardRef()</code> used for this. React 19 made
        that obsolete — refs are now just props. The old function still
        works for compat.
      </p>

      <h2>Adding a focus shortcut to your search</h2>

      <p>
        Time to apply this. Most apps with search support &quot;press /
        to focus&quot; or similar. We&apos;ll add a global key listener
        that focuses your search input on <kbd>/</kbd>.
      </p>

      <HandsOn
        title="Focus the search input on a keypress"
        projectStep="Module 5 · Step 1"
        projectContext="You'll add a ref to the search input, then use a useEffect with a global key listener to focus it. Two of this lesson's concepts at once: ref for DOM access, ref-free useEffect for the listener."
        steps={[
          "In `src/App.tsx`, import `useRef` from React: ```tsx\nimport { useState, useEffect, useRef } from 'react';\n```",
          "Above your search state, add a ref: ```tsx\nconst searchRef = useRef<HTMLInputElement>(null);\n```",
          "Attach it to the search input: ```tsx\n<input\n  ref={searchRef}\n  type=\"search\"\n  className=\"search\"\n  ...\n/>\n```",
          "Add a useEffect that listens for the `/` key globally and focuses the input: ```tsx\nuseEffect(() => {\n  function handleKey(e: KeyboardEvent) {\n    // Skip if user is already typing in an input\n    const tag = (e.target as HTMLElement).tagName;\n    if (tag === 'INPUT' || tag === 'TEXTAREA') return;\n    if (e.key === '/') {\n      e.preventDefault();\n      searchRef.current?.focus();\n    }\n  }\n  window.addEventListener('keydown', handleKey);\n  return () => window.removeEventListener('keydown', handleKey);\n}, []);\n```",
          "Save. Click somewhere on the page to deselect anything, then press `/`. The search input should focus instantly. Test it from different parts of the page.",
          "Update the search input's placeholder to hint at this: `placeholder=\"Search cards...  (press /)\"`. Now users know about the shortcut.",
          "Reflect: notice the cleanup pattern from Module 3 in action. Without `removeEventListener`, every Strict Mode remount would stack listeners.",
        ]}
      />

      <Quiz
        question="What's the actual difference between `useState` and `useRef`?"
        options={[
          { label: "useRef is faster than useState" },
          {
            label: "useState triggers a re-render when its setter is called; useRef stores a value that persists across renders without triggering re-renders",
            correct: true,
            explanation:
              "Both persist values across renders. Only useState participates in the render cycle. If a value affects what's on screen, use state; if it's bookkeeping (timer IDs, scroll positions, mutable counters that don't show), use a ref.",
          },
          { label: "useRef stores DOM nodes, useState stores any value" },
          { label: "useRef is for class components; useState is for function components" },
        ]}
      />

      <Quiz
        question="When should you read or write `ref.current`?"
        options={[
          { label: "Anywhere — refs are just plain JS objects, no rules" },
          {
            label: "In event handlers, effects, and other places that run after render — never during render",
            correct: true,
            explanation:
              "ref.current is set after the commit phase, so during render it holds the value from the previous commit (or null on first render). Reading or writing it during render also makes the component impure. Always access refs from handlers or effects.",
          },
          { label: "Only inside useEffect — never in event handlers" },
          { label: "Only in custom hooks" },
        ]}
      />

      <ShortAnswer
        question="When would you reach for useRef instead of useState? Give two specific examples and explain why each fits."
        rubric={[
          "Example 1: holding a DOM node for imperative actions like focus, scroll, or measurements (state isn't needed because the DOM node isn't part of the rendered UI logic)",
          "Example 2: holding a mutable bookkeeping value like an interval ID, the previous value of a prop, or a debounce timer (UI doesn't depend on these so triggering re-renders for them would be wasteful)",
          "Bonus: notes the rule — if the value affects what's on screen, use state; if it doesn't, a ref is the right call",
        ]}
        topic="Choosing between useRef and useState"
      />

      <h2>What&apos;s next</h2>

      <p>
        With <code>useRef</code> in your toolkit, the next lesson tackles
        the cross-tree data problem we previewed in Module 4:{" "}
        <code>useContext</code>. You&apos;ll add a theme that any
        component can read without props.
      </p>
    </>
  );
}
