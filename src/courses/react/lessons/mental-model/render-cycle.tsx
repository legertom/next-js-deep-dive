import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function RenderCycle() {
  return (
    <>
      <h1>The Render Cycle</h1>

      <p>
        When React people say &quot;render,&quot; they don&apos;t mean
        &quot;paint pixels.&quot; They mean something specific: <strong>
        React called your component function and got back a tree of React
        Elements</strong>. Painting comes after. Knowing the difference
        between those two things is the unlock for everything that comes
        next.
      </p>

      <p>
        This lesson is short on code and heavy on mental model. Slow down
        on it. Every weird hook behavior in later modules — stale state,
        infinite loops, why the dependency array exists — comes back to
        what you learn here.
      </p>

      <h2>The three phases</h2>

      <p>Every update in React goes through the same three phases:</p>

      <ol>
        <li>
          <strong>Trigger.</strong> Something tells React the UI may need
          to change. Either an initial render (your app boots) or a state
          update (a hook setter is called).
        </li>
        <li>
          <strong>Render.</strong> React calls your component function — and
          all of its descendants&apos; functions — to get back a fresh tree
          of React Elements describing the new UI. <em>Your function is
          called by React, top to bottom, on every render.</em>
        </li>
        <li>
          <strong>Commit.</strong> React diffs the new tree against the
          previous one (this is &quot;reconciliation&quot;), works out the
          minimum DOM operations needed, and applies them.
        </li>
      </ol>

      <p>
        Important: only step 3 touches the DOM. Steps 1 and 2 are pure
        JavaScript inside React&apos;s world. A render that produces an
        identical tree to the previous one results in zero DOM work.
      </p>

      <Callout type="important" title="The single most useful fact">
        Your component function runs again, from the top, every time React
        re-renders that component. Every variable you declare inside is
        recreated. Every JSX expression is re-evaluated. This is why
        plain variables can&apos;t hold state across renders — they
        evaporate the moment the function returns.
      </Callout>

      <h2>What does a render actually do?</h2>

      <p>
        Concretely, when React renders your <code>Flashcard</code> component:
      </p>

      <CodeBlock filename="Flashcard.tsx" language="tsx">
        {`function Flashcard({ question }: { question: string }) {
  console.log("Flashcard rendered with:", question);
  return (
    <div className="flashcard">
      <p>{question}</p>
    </div>
  );
}`}
      </CodeBlock>

      <ol>
        <li>
          React calls <code>Flashcard({`{ question: "..." }`})</code>.
        </li>
        <li>
          The <code>console.log</code> runs. The JSX evaluates. The
          function returns a plain object that looks roughly like:{" "}
          <code>{`{ type: "div", props: { className: "flashcard", children: { type: "p", props: { children: "..." } } } }`}</code>.
        </li>
        <li>
          React takes that object, compares it to the previous one, and
          updates the DOM where they differ.
        </li>
      </ol>

      <p>
        Notice: <strong>your function returning</strong> is not the same
        as <strong>the screen updating</strong>. There&apos;s a queue, a
        diff, and DOM work between them.
      </p>

      <h2>Components must be pure</h2>

      <p>
        Because React calls your function over and over — sometimes twice
        before it commits anything (Strict Mode does this on purpose in
        development) — your component <strong>must be a pure function of
        its props and state</strong>. Pure means:
      </p>

      <ul>
        <li>
          Same inputs → same output. <code>Flashcard({`{ question: "X" }`})</code>{" "}
          should return the same JSX tree every time.
        </li>
        <li>
          No side effects during render. Don&apos;t mutate variables outside
          the function. Don&apos;t call <code>fetch()</code>. Don&apos;t set{" "}
          <code>document.title</code>. Don&apos;t modify props.
        </li>
      </ul>

      <p>This breaks the rules:</p>

      <CodeBlock language="tsx">
        {`let renderCount = 0; // shared mutable state — bad

function Flashcard({ question }: { question: string }) {
  renderCount++;                   // mutating outside scope (bad)
  document.title = question;       // touching the DOM (bad)
  fetch("/api/log");               // network during render (bad)
  return <p>{question}</p>;
}`}
      </CodeBlock>

      <p>
        Anything that affects the world outside your function&apos;s return
        value belongs in an <strong>Effect</strong> (Module 3) or an event
        handler — not in the body of the render function.
      </p>

      <h2>Why mutating a variable doesn&apos;t update the UI</h2>

      <p>
        Here&apos;s a tempting but broken counter. It illustrates the gap
        between &quot;the variable changed&quot; and &quot;React re-renders&quot;:
      </p>

      <CodeBlock language="tsx">
        {`function BrokenCounter() {
  let count = 0;

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => { count++; console.log(count); }}>+1</button>
    </div>
  );
}`}
      </CodeBlock>

      <p>
        Click the button. The console logs <code>1, 2, 3...</code> — so the
        variable <em>is</em> incrementing. The screen never changes. Why?
      </p>

      <p>
        Two reasons that compound:
      </p>

      <ol>
        <li>
          <strong>React doesn&apos;t know the variable changed.</strong>{" "}
          Mutating <code>count</code> doesn&apos;t trigger React&apos;s
          schedule-a-render machinery. There was no setter call, no
          subscription. React doesn&apos;t watch your variables.
        </li>
        <li>
          <strong>Even if it did re-render, <code>count</code> resets to 0 every time.</strong>{" "}
          Because <code>let count = 0</code> is inside the function, every
          render recreates it from scratch. The increment from the
          previous render is gone.
        </li>
      </ol>

      <p>
        That&apos;s exactly the problem <code>useState</code> solves — and
        it&apos;s the next lesson.
      </p>

      <h2>Strict Mode and the double render</h2>

      <p>
        If you scaffold a Vite or Next.js app, Strict Mode is on by
        default. In development, it intentionally calls your component
        function <strong>twice</strong> per render. This is so you notice
        impure code — if your component breaks when called twice, that&apos;s
        a bug you&apos;d eventually have hit anyway.
      </p>

      <CodeBlock language="tsx">
        {`function Flashcard({ question }: { question: string }) {
  console.log("rendering"); // logs TWICE in development
  return <p>{question}</p>;
}`}
      </CodeBlock>

      <p>
        This is a feature, not noise. The doubling only happens in dev,
        and it surfaces problems the second invocation would expose.
      </p>

      <Callout type="tip" title="Treat the double render as a smoke test">
        If anything in your component breaks under Strict Mode&apos;s
        double render — you fetched twice, you wrote to a file twice, a
        ref got mutated twice — your code wasn&apos;t pure to begin with.
        Move that work into an Effect or an event handler.
      </Callout>

      <h2>The mental model in one sentence</h2>

      <Callout type="important" title="The whole thing">
        React renders your component by calling it like a regular
        function. The return value describes what the UI should look like
        right now. To make anything change between renders — to remember
        anything — you need a hook.
      </Callout>

      <p>
        That&apos;s the bridge into the rest of the course. Hooks
        (<code>useState</code>, <code>useEffect</code>, <code>useRef</code>,
        custom hooks) are how a function that gets called over and over
        manages to feel like a stateful, alive thing.
      </p>

      <HandsOn
        title="Watch the render cycle in action"
        projectStep="Module 1 · Step 2"
        projectContext="You'll add a console.log to see when Flashcard runs, then try a 'broken' counter to feel exactly why hooks exist. No state yet — that's next module."
        steps={[
          "Open `src/App.tsx` and add a `console.log` at the top of the `Flashcard` function: `console.log('rendering Flashcard:', question);`",
          "Save and check your browser DevTools console. Each Flashcard logs **twice** — that's Strict Mode's double-render warning you about purity. Each card prints two lines.",
          "Now add a broken counter to the bottom of `App` to feel the issue firsthand: ```tsx\nfunction BrokenCounter() {\n  let count = 0;\n  return (\n    <button onClick={() => { count++; console.log('count is now', count); }}>\n      Count: {count}\n    </button>\n  );\n}\n```",
          "Render `<BrokenCounter />` inside `App`'s `<main>`.",
          "Click the button several times. The console will log `1, 2, 3...` — the variable is changing. But the button label still says `Count: 0`. The UI doesn't update.",
          "Take a moment to understand why: clicking the button doesn't trigger React to re-render, so the JSX stays whatever it was on the last render. And even if it did re-render, `let count = 0` would reset on every render anyway.",
          "Leave both pieces in. We'll fix `BrokenCounter` properly in the very first lesson of Module 2 with `useState`.",
        ]}
      />

      <Quiz
        question="Why does this component log 'render' twice in development but only once in production?"
        options={[
          { label: "React renders every component twice as a fallback in case the first render errors out" },
          {
            label: "Strict Mode intentionally double-invokes components in dev to surface impure code",
            correct: true,
            explanation:
              "Strict Mode calls your component function twice in development on purpose. It's a smoke test: if anything breaks on the second call (a fetch fires twice, a counter doubles, a ref mutates), the component wasn't pure. Production runs it once.",
          },
          { label: "There's a bug in your code causing the component to mount twice" },
          { label: "It's a React DevTools artifact that shows up only when DevTools are open" },
        ]}
      />

      <Quiz
        question="Inside a component's body, you write `let total = price * quantity;` and use it in JSX. The next render, total is the same value. What's true?"
        options={[
          { label: "React caches the variable so it doesn't recompute" },
          {
            label: "The variable is recreated from scratch every render — that's normal",
            correct: true,
            explanation:
              "Every render runs your function top to bottom. `let total = ...` runs every render and recomputes from props/state. This is by design and almost always free. Only when computation is genuinely expensive do you reach for memoization (Module 11).",
          },
          { label: "You should always wrap simple expressions in useMemo to avoid recomputation" },
          { label: "The variable persists across renders because of closure semantics" },
        ]}
      />

      <ShortAnswer
        question="In your own words, why does the BrokenCounter from this lesson fail to update the UI even though clicking the button does mutate the count variable? Give the two reasons. 2–3 sentences."
        rubric={[
          "Mutating a plain variable doesn't tell React anything happened — there's no setter call, so React never schedules a re-render",
          "Even if React did re-render, `let count = 0` runs every render, so the value would reset to 0 each time",
          "Bonus: notes that this is exactly what useState fixes (it both signals a re-render and persists the value across renders)",
        ]}
        topic="Why mutating a local variable doesn't update React UI"
      />

      <h2>What&apos;s next</h2>

      <p>
        You now have the full mental model: React calls your function
        whenever something might have changed; your function returns a
        description of UI; React reconciles and commits. The next module
        introduces <code>useState</code>, the hook that bridges &quot;a
        function that runs over and over&quot; with &quot;a stateful UI.&quot;
        That&apos;s where your flashcards finally get to flip.
      </p>
    </>
  );
}
