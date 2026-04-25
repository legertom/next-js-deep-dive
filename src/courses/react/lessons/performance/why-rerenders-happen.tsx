import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { ShortAnswer } from "@/components/short-answer";

export function WhyRerendersHappen() {
  return (
    <>
      <h1>Why Re-renders Happen</h1>

      <p>
        Performance work in React almost always reduces to one
        question: <strong>why is this component re-rendering?</strong>{" "}
        Once you can answer that consistently, you can debug any slow
        page. This lesson is the rules. The next lesson is the
        profiling tools that help you apply them.
      </p>

      <h2>The four reasons</h2>

      <p>
        A component re-renders if and only if one of these is true:
      </p>

      <ol>
        <li>
          <strong>Its state changed.</strong> A <code>useState</code>{" "}
          setter (or <code>useReducer</code> dispatch) was called and
          the new value differs from the previous (by{" "}
          <code>Object.is</code>).
        </li>
        <li>
          <strong>Its props changed.</strong> The parent re-rendered
          with different prop values for this child (again, compared
          by <code>Object.is</code>).
        </li>
        <li>
          <strong>Its parent re-rendered.</strong> By default, React
          re-renders <em>all</em> children of a re-rendered parent —
          even children whose props haven&apos;t changed. This is the
          surprise that bites most newcomers.
        </li>
        <li>
          <strong>A context it consumes changed.</strong> If the
          component calls <code>useContext(X)</code>, any change to
          the value provided to <code>X</code> re-renders all consumers.
        </li>
      </ol>

      <p>
        Read that list once more. Cause #3 is the one that catches
        people: <em>a child re-renders when its parent re-renders even
        if its props are identical</em>. React&apos;s default is &quot;render
        the whole subtree.&quot; Memoization is how you opt out.
      </p>

      <h2>Why is the default to re-render everything?</h2>

      <p>
        Because re-rendering is <strong>cheap</strong> for most
        components. Calling a function and producing a tree of plain
        objects costs microseconds. The expensive part — actually
        committing changes to the DOM — only happens for the parts
        that actually changed (reconciliation handles that). So
        re-rendering 100 components and committing zero DOM updates is
        usually fine.
      </p>

      <p>
        The cost shows up when:
      </p>

      <ul>
        <li>A component does expensive work during render (heavy filter, complex JSX, big <code>map</code>).</li>
        <li>A component renders a deep subtree.</li>
        <li>A child component is wrapped in <code>React.memo</code> but its props are accidentally fresh references.</li>
        <li>The whole render path takes more than ~10ms and starts dropping frames.</li>
      </ul>

      <h2>The reference-equality gotcha</h2>

      <p>
        Props are compared by reference (<code>Object.is</code>).
        Primitive values (<code>string</code>, <code>number</code>,{" "}
        <code>boolean</code>) compare by value, so they&apos;re fine.
        Objects, arrays, and functions are compared by reference — and
        every render produces fresh references:
      </p>

      <CodeBlock language="tsx">
        {`function Parent() {
  return (
    <Child
      data={{ a: 1, b: 2 }}             // NEW object every render
      items={[1, 2, 3]}                 // NEW array every render
      onClick={() => doSomething()}     // NEW function every render
    />
  );
}`}
      </CodeBlock>

      <p>
        Even if Parent re-renders for an unrelated reason, Child gets
        new props by reference (the contents are equal but the
        identity isn&apos;t). If Child is wrapped in{" "}
        <code>React.memo</code>, the memo check fails — same problem
        as before, just disguised.
      </p>

      <h2>The three traditional fixes</h2>

      <h3>1. <code>React.memo</code></h3>

      <CodeBlock language="tsx">
        {`const Card = React.memo(function Card({ question, answer }: Props) {
  return <div>{question} — {answer}</div>;
});

// Now Card only re-renders if its props change by reference
<Card question="What is JSX?" answer="..." />`}
      </CodeBlock>

      <p>
        <code>React.memo</code> wraps a component and skips re-renders
        when props haven&apos;t changed. It doesn&apos;t do anything
        about cause #1 (own state) or #4 (context). And it&apos;s
        useless if the parent passes fresh references every render.
      </p>

      <h3>2. <code>useMemo</code></h3>

      <CodeBlock language="tsx">
        {`function Parent() {
  // Memoize the object so its reference is stable across renders
  const data = useMemo(() => ({ a: 1, b: 2 }), []);
  return <Child data={data} />;
}`}
      </CodeBlock>

      <p>
        <code>useMemo</code> caches a value across renders, returning
        the same reference unless its deps change. Useful for stable
        prop references and for caching expensive computations.
      </p>

      <h3>3. <code>useCallback</code></h3>

      <CodeBlock language="tsx">
        {`function Parent({ id }: { id: number }) {
  const handleClick = useCallback(() => doSomething(id), [id]);
  return <Child onClick={handleClick} />;
}`}
      </CodeBlock>

      <p>
        <code>useCallback</code> is <code>useMemo</code> for functions.
        Same reference until deps change.
      </p>

      <h2>The new world: the React Compiler</h2>

      <p>
        Manual memoization is fiddly and error-prone — pick the wrong
        deps and you have a memoization bug. The React Compiler
        (Module 11 Lesson 3) automates all of this. Once enabled, you
        write components without <code>useMemo</code>,{" "}
        <code>useCallback</code>, or <code>React.memo</code>, and the
        compiler inserts the right memoization automatically.
      </p>

      <p>
        For now, just understand that the manual tools exist and how
        they work. We&apos;ll wire up the Compiler at the end of this
        module — most apps in 2026 should use it.
      </p>

      <Callout type="important" title="Don't optimize prematurely">
        Reaching for memoization without measuring is the single most
        common mistake. Most React renders are fast. Adding{" "}
        <code>useMemo</code> &quot;just to be safe&quot; can actually
        slow things down (memoization has its own overhead). Profile
        first, optimize second. The next lesson teaches you how.
      </Callout>

      <h2>The mental flowchart</h2>

      <CodeBlock language="text">
        {`Component is rendering more than I expected. Why?

Did its state change? → that's #1. Likely intentional, but check.
Did its props change? → did the parent pass new values, or just
                       new references for the same values?
Did its parent render? → that's #3. Default behavior. Memoize the
                       child if it's expensive.
Did a context change? → that's #4. Split the context if many
                       components consume it.`}
      </CodeBlock>

      <p>
        That flowchart is the entire performance debugging procedure
        in React. Profile, identify which cause it is, apply the right
        fix.
      </p>

      <Quiz
        question="A child component receives the same props as last render but its parent re-rendered for an unrelated reason. Does the child re-render?"
        options={[
          { label: "No — React skips re-rendering when props haven't changed" },
          {
            label: "Yes — by default, React re-renders all descendants of any component that re-renders, regardless of props",
            correct: true,
            explanation:
              "This is the surprise. The default is 'render everything down the tree.' Reconciliation makes this cheap most of the time (no actual DOM changes), but if the child's render is expensive, you wrap it in React.memo (or rely on the React Compiler) to skip the re-render when its props haven't changed.",
          },
          { label: "Only if it's a class component" },
          { label: "Only if React DevTools is enabled" },
        ]}
      />

      <Quiz
        question="You wrap Child in React.memo, but it still re-renders every time the parent does. The parent passes `<Child config={{ x: 1 }} />`. Why does memo not help?"
        options={[
          { label: "React.memo doesn't work with object props" },
          {
            label: "The parent creates a new object literal every render. The reference changes even though the contents are equal, so memo's reference comparison fails.",
            correct: true,
            explanation:
              "Reference equality is the trap. `{ x: 1 }` is a new object every time. memo sees 'different prop' and re-renders. Fix: useMemo to stabilize the object, or have the parent declare the value outside the render path. Or just use the React Compiler and stop thinking about this.",
          },
          { label: "memo only works on built-in HTML elements" },
          { label: "TypeScript erases the type at runtime, breaking memo" },
        ]}
      />

      <ShortAnswer
        question="A junior dev wraps every component in their app in React.memo, claiming it improves performance. What do you tell them?"
        rubric={[
          "Memoization isn't free — comparing props on every render has its own cost; for simple components, the comparison can cost more than the re-render it skips",
          "Memo only helps if the props are reference-stable AND the component's render is expensive enough to be worth skipping",
          "The right approach is profile-first: measure where actual slowness shows up and apply memoization surgically; the React Compiler is making manual memoization mostly obsolete anyway",
        ]}
        topic="When NOT to memoize prematurely"
      />

      <h2>What&apos;s next</h2>

      <p>
        Theory&apos;s done. Next lesson is the practical skill:
        profiling. React DevTools shows you exactly which components
        re-rendered and why. Once you can answer &quot;why did this
        render?&quot; with data instead of guessing, performance work
        gets dramatically easier.
      </p>
    </>
  );
}
