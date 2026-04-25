import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { ShortAnswer } from "@/components/short-answer";

export function WhatIsSuspending() {
  return (
    <>
      <h1>What &quot;Suspending&quot; Means</h1>

      <p>
        <strong>Suspense</strong> is React&apos;s built-in mechanism for
        declarative loading states. You wrap a part of your tree in{" "}
        <code>&lt;Suspense fallback=...&gt;</code>, and any component
        inside that tree can &quot;suspend&quot; — pause its render
        until something async resolves. While suspended, the fallback
        shows. When the async work completes, React tries again, and
        the real UI renders.
      </p>

      <p>
        That&apos;s the model. The implementation is interesting and
        worth understanding before we get to the practical patterns.
      </p>

      <h2>Suspending = throwing a Promise</h2>

      <p>
        Here&apos;s the surprising mechanism: when a component
        &quot;suspends,&quot; it literally <strong>throws a
        Promise</strong> from inside its render function. React catches
        the thrown promise, walks up the tree to find the nearest{" "}
        <code>&lt;Suspense&gt;</code>, and renders the fallback. When
        the promise resolves, React tries to render the suspended
        component again.
      </p>

      <CodeBlock language="tsx">
        {`// Conceptually, this is what suspending looks like:
function Card({ id }: { id: number }) {
  const data = fetchData(id);
  if (!data.ready) {
    throw data.promise; // SUSPEND
  }
  return <p>{data.value}</p>;
}

<Suspense fallback={<p>Loading...</p>}>
  <Card id={1} />
</Suspense>`}
      </CodeBlock>

      <p>
        First render: <code>data.ready</code> is false, so the component
        throws its promise. React unwinds, finds the Suspense boundary,
        renders &quot;Loading...&quot; The promise resolves. React
        retries the render. <code>data.ready</code> is now true.{" "}
        <code>&lt;p&gt;...&lt;/p&gt;</code> renders.
      </p>

      <p>
        You almost never write &quot;throw promise&quot; by hand.{" "}
        <code>use()</code> (the React 19 hook), data-fetching libraries
        like SWR/TanStack Query, and frameworks like Next.js do it for
        you. But knowing the mechanism explains everything else.
      </p>

      <Callout type="important" title="Why this design">
        Throwing-then-recovering sounds odd, but it has a beautiful
        property: <strong>any synchronous code path can be made
        async</strong>. You don&apos;t change function signatures. You
        don&apos;t add <code>await</code>. The component just runs, and
        if its data isn&apos;t ready, it bails out cleanly. Async data
        feels like sync data with a single boundary catch.
      </Callout>

      <h2>The <code>use()</code> hook</h2>

      <p>
        React 19 introduced <code>use()</code> — a hook that takes a
        Promise (or a Context) and either returns the resolved value or
        suspends until it resolves. It&apos;s the modern way to consume
        async data in components:
      </p>

      <CodeBlock language="tsx">
        {`import { use } from "react";

function User({ promise }: { promise: Promise<User> }) {
  const user = use(promise);
  return <p>Hi, {user.name}</p>;
}

<Suspense fallback={<p>Loading...</p>}>
  <User promise={fetchUser(1)} />
</Suspense>`}
      </CodeBlock>

      <p>
        Three things to know about <code>use()</code>:
      </p>

      <ul>
        <li>
          It can be called inside <code>if</code>, <code>else</code>, and
          loops — unlike regular hooks. It&apos;s closer to a primitive
          than a hook.
        </li>
        <li>
          The same Promise must be passed across renders. Don&apos;t
          create promises inline (<code>{`use(fetch("/api"))`}</code>) —
          that creates a new promise every render and triggers an
          infinite suspend loop.
        </li>
        <li>
          The promise should usually come from a stable source: a
          server-component prop, a cached fetcher, or React&apos;s{" "}
          <code>cache()</code> function.
        </li>
      </ul>

      <h2>What can suspend</h2>

      <p>Three things in modern React can suspend:</p>

      <ol>
        <li>
          <code>use(promise)</code> — most direct.
        </li>
        <li>
          <code>React.lazy(() =&gt; import(...))</code> — code-splitting
          a component. The <code>lazy</code> component suspends until the
          chunk loads.
        </li>
        <li>
          <strong>Async Server Components</strong> (Next.js / RSC) — an
          async function component is, conceptually, suspended until its
          body resolves. We&apos;ll cover this in Module 9.
        </li>
      </ol>

      <p>
        Frameworks and libraries layer on top: TanStack Query&apos;s
        suspense mode, SWR&apos;s suspense mode, Relay&apos;s suspense,
        Next.js&apos;s Server Components — all of them ultimately throw
        a Promise that React&apos;s Suspense boundary catches.
      </p>

      <h2>What suspending is NOT</h2>

      <h3>Not for any general loading state</h3>

      <p>
        If you have <code>{`const [loading, setLoading] = useState(true)`}</code>{" "}
        wrapped around a fetch, that&apos;s the old <em>conditional
        rendering</em> pattern. Suspense isn&apos;t a drop-in
        replacement — you have to actually have a thing that throws a
        promise. State-based loading and Suspense are different
        mechanisms; they don&apos;t interoperate.
      </p>

      <h3>Not the same as React.lazy in older code</h3>

      <p>
        <code>React.lazy</code> has been around since 2018 and uses the
        same Suspense machinery. Lazy-loaded components were the first
        practical use of Suspense. The big change in React 19 is that
        suspense for <em>data</em> finally works in production —
        previously it was experimental.
      </p>

      <h3>Not a substitute for error handling</h3>

      <p>
        Suspense catches throws of <em>Promises</em>. It doesn&apos;t
        catch errors. If your async work rejects, the Promise rejects,
        which becomes a render error — caught by an{" "}
        <strong>Error Boundary</strong> (Lesson 3 of this module). Both
        boundaries usually appear together.
      </p>

      <h2>The full mental model</h2>

      <CodeBlock language="text">
        {`Render starts.
A component reads data via use(promise) or similar.
Data isn't ready → throw promise.
React unwinds the render until it hits a <Suspense>.
React renders the <Suspense fallback>.
Promise resolves.
React retries the suspended render.
This time, data is ready. Real UI replaces the fallback.`}
      </CodeBlock>

      <p>
        Two boundaries, two purposes: Suspense catches thrown promises
        (loading), Error Boundaries catch thrown errors (failure). Both
        let you handle async UX declaratively, where the fallback lives
        with the layout — not scattered across loading/error/data
        branches inside every component.
      </p>

      <Quiz
        question="What does it actually mean for a component to 'suspend'?"
        options={[
          { label: "It returns null and waits to be re-rendered later" },
          {
            label: "It throws a Promise during render. React catches the throw, finds the nearest Suspense boundary, and renders the fallback until the Promise resolves.",
            correct: true,
            explanation:
              "Suspense uses JS's exception-handling machinery as a control-flow mechanism. The 'thrown' value is a Promise (not an Error), and React handles it specially: render the fallback, wait for resolution, retry the suspended render.",
          },
          { label: "It enters a special 'paused' lifecycle method" },
          { label: "It returns a Promise as JSX" },
        ]}
      />

      <Quiz
        question="Why can't you write `use(fetch('/api/data'))` directly inside a component?"
        options={[
          { label: "fetch isn't supported in components" },
          {
            label: "Each render creates a new promise (a new fetch), which suspends — and the next render makes a new promise again, suspending forever",
            correct: true,
            explanation:
              "use() expects a stable promise across renders. A fresh promise every render means React keeps suspending and retrying with a new promise that's always pending. The promise needs to come from a stable source: a prop passed in from a parent, a cached fetcher, or React's cache() helper for memoization.",
          },
          { label: "fetch returns a Response, not a Promise" },
          { label: "It's a legal but slow pattern — don't worry about it" },
        ]}
      />

      <ShortAnswer
        question="Walk through what happens, step by step, when a component calls `use(promise)` and the promise hasn't resolved yet. Where does the fallback come from, and what triggers the retry?"
        rubric={[
          "use() throws the unresolved promise during render",
          "React catches the thrown promise and walks up the tree to find the nearest <Suspense> boundary, then renders that boundary's fallback prop",
          "When the promise resolves, React retries the render of the suspended component; this time use() returns the resolved value, the component renders normally, and the fallback is replaced with the real UI",
        ]}
        topic="Step-by-step: what happens during a Suspense suspension"
      />

      <h2>What&apos;s next</h2>

      <p>
        Now the mechanism is demystified. The next lesson is the
        practical one: where to place Suspense boundaries, how
        granularity affects UX, and how to use <code>use()</code> with
        a real fetch in your flashcard app.
      </p>
    </>
  );
}
