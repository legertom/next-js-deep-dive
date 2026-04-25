import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function UseEffect() {
  return (
    <>
      <h1>useEffect</h1>

      <p>
        So far, your components have lived entirely inside React&apos;s
        world. State updates trigger re-renders. Re-renders update the
        DOM. Clean. But real apps need to talk to things <em>outside</em>{" "}
        React: <code>localStorage</code>, the network, timers, the
        document title, third-party libraries. <code>useEffect</code> is
        how you do that without breaking the purity rules from Module 1.
      </p>

      <p>
        Heads up: this is also the most-misused hook. The next two
        lessons will be partly about <em>not</em> using it. But first,
        the right way.
      </p>

      <h2>The mental model</h2>

      <p>
        <code>useEffect</code> lets you <strong>synchronize your component
        with an external system</strong>. &quot;External&quot; means
        anything not managed by React: the browser DOM (including the
        document title), localStorage, the network, a WebSocket, a
        third-party canvas library.
      </p>

      <p>The shape:</p>

      <CodeBlock language="tsx">
        {`useEffect(() => {
  // setup: run AFTER React has committed to the DOM
}, [dependencies]);`}
      </CodeBlock>

      <p>
        Two parts: a setup function (what to do) and a dependency array
        (when to do it). React calls setup after the render commits, then
        again whenever any value in the dependency array has changed
        since the last render.
      </p>

      <h3>The simplest example</h3>

      <CodeBlock language="tsx">
        {`function Page({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <h1>{title}</h1>;
}`}
      </CodeBlock>

      <p>
        On first render: React renders the JSX, commits it to the DOM,
        then runs the effect, which sets <code>document.title</code>. On
        every subsequent render where <code>title</code> has changed:
        React re-runs the effect with the new value. If <code>title</code>{" "}
        is the same as last render, React skips the effect entirely.
      </p>

      <Callout type="important" title="Why not just set document.title in the body?">
        Setting <code>document.title</code> directly during render breaks
        purity (Lesson 3 of Module 1). It would run twice in Strict Mode,
        run during reconciliation when no commit may even happen, and
        generally couple your render logic to the outside world. Effects
        run <em>after</em> the commit, when React knows the new UI is
        actually showing.
      </Callout>

      <h2>The dependency array — three flavors</h2>

      <p>
        The second argument decides when the effect re-runs. It changes
        the effect&apos;s behavior dramatically.
      </p>

      <h3>1. <code>[deps]</code> — runs when those values change</h3>

      <CodeBlock language="tsx">
        {`useEffect(() => {
  document.title = title;
}, [title]); // re-runs only when \`title\` changes`}
      </CodeBlock>

      <p>
        The most common form. Include every value from the component
        scope that the effect uses: props, state, derived values, other
        functions. Forgetting one creates a <strong>stale closure</strong>{" "}
        — the effect uses an old value because it didn&apos;t re-run.
        ESLint&apos;s <code>react-hooks/exhaustive-deps</code> rule catches
        this; trust it by default.
      </p>

      <h3>2. <code>[]</code> — runs once after mount</h3>

      <CodeBlock language="tsx">
        {`useEffect(() => {
  console.log("component mounted");
}, []); // empty array — runs once`}
      </CodeBlock>

      <p>
        An empty array means &quot;there are no dependencies, so this
        never needs to re-run.&quot; Useful for one-time setup like
        attaching a global event listener. Be careful: in Strict Mode,
        React calls setup → cleanup → setup in development to surface
        bugs (we&apos;ll cover that next lesson). If you see your
        &quot;mount&quot; effect firing twice in dev, that&apos;s why,
        and it means your effect needs cleanup.
      </p>

      <h3>3. <em>No</em> array — runs after every render</h3>

      <CodeBlock language="tsx">
        {`useEffect(() => {
  console.log("rendered");
}); // no array — fires every render`}
      </CodeBlock>

      <p>
        Almost never what you want. It runs after every commit, including
        ones triggered by the effect itself if it sets state. Useful
        sometimes for debugging; usually a bug.
      </p>

      <Callout type="tip" title="The dependency array is not 'when to re-run' — it's 'what the effect depends on'">
        Don&apos;t pick the dependency array based on when you want the
        effect to run. Pick it by listing every reactive value the effect
        reads. The behavior follows. Trying to outsmart this rule (e.g.
        omitting a dep to skip a re-run) is how you create stale-closure
        bugs.
      </Callout>

      <h2>The classic uses</h2>

      <h3>Sync to localStorage</h3>

      <CodeBlock language="tsx">
        {`function Notes() {
  const [notes, setNotes] = useState(() => {
    return JSON.parse(localStorage.getItem("notes") ?? "[]");
  });

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // ...
}`}
      </CodeBlock>

      <p>
        Read on first render with lazy initial state, write on every
        change with an effect. localStorage stays in sync with state.
      </p>

      <h3>Fetching data (the simple version)</h3>

      <CodeBlock language="tsx">
        {`function User({ id }: { id: number }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(\`/api/users/\${id}\`)
      .then((r) => r.json())
      .then((u) => { if (!cancelled) setUser(u); });
    return () => { cancelled = true; };
  }, [id]);

  return user ? <p>{user.name}</p> : <p>Loading...</p>;
}`}
      </CodeBlock>

      <p>
        Fetch on mount, refetch when <code>id</code> changes. The cleanup
        sets a flag so a stale response from a previous <code>id</code>
        can&apos;t overwrite a newer one. (We&apos;ll cover cleanup next
        lesson.)
      </p>

      <Callout type="info" title="Real apps don't fetch like this">
        Hand-rolled fetch effects are fine for small things, but for
        production data fetching you almost always want a library
        (TanStack Query, SWR) or — if you&apos;re in Next.js — Server
        Components and Server Actions. Module 9 covers why. For now,
        learning the raw pattern matters because it teaches you how
        effects work.
      </Callout>

      <h3>Subscriptions and timers</h3>

      <CodeBlock language="tsx">
        {`function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return <p>{now.toLocaleTimeString()}</p>;
}`}
      </CodeBlock>

      <h2>What about effects that fight you</h2>

      <p>
        Three failure modes you will hit:
      </p>

      <h3>Infinite loop</h3>

      <CodeBlock language="tsx">
        {`useEffect(() => {
  setCount(count + 1);
}, [count]); // setting count changes count, which re-runs the effect, forever`}
      </CodeBlock>

      <p>
        If an effect&apos;s job is &quot;keep <code>x</code> in sync with{" "}
        <code>y</code>&quot; and <code>x</code> is in the deps, you&apos;ll
        loop. Usually the right fix is <em>delete the effect</em> and
        derive <code>x</code> from <code>y</code> during render.
        Lesson 3 of this module is dedicated to that.
      </p>

      <h3>Stale closure</h3>

      <CodeBlock language="tsx">
        {`useEffect(() => {
  const id = setInterval(() => {
    console.log(count); // captured \`count\` from when the effect ran
  }, 1000);
  return () => clearInterval(id);
}, []); // empty deps — closure never refreshes`}
      </CodeBlock>

      <p>
        The interval logs whatever <code>count</code> was when the effect
        ran (probably 0), forever. Either add <code>count</code> to deps
        (so the effect re-runs and the interval gets a fresh value), or
        use the updater form / <code>useRef</code> if you don&apos;t want
        the timer to restart.
      </p>

      <h3>Object-in-deps churn</h3>

      <CodeBlock language="tsx">
        {`function Component({ user }) {
  // Every render, options is a NEW object → effect re-runs every render
  const options = { method: "GET", headers: { Auth: user.token } };

  useEffect(() => {
    fetch("/api", options);
  }, [options]); // bad — options is always different by reference
}`}
      </CodeBlock>

      <p>
        Either move the object inside the effect, list its primitive
        fields in the deps, or memoize it with <code>useMemo</code>{" "}
        (Module 11). Putting freshly-created objects/arrays in the
        dependency array always burns.
      </p>

      <h2>Persisting your flashcards</h2>

      <p>
        Time to apply this. Right now, every time you refresh the page,
        the cards reset to the hardcoded list. We&apos;ll fix that with
        two effects: read from localStorage on mount via lazy initial
        state, write to localStorage every time the cards change.
      </p>

      <HandsOn
        title="Persist flashcards to localStorage"
        projectStep="Module 3 · Step 1"
        projectContext="Lazy initial state for the read, useEffect for the write. After this, cards you add survive a page refresh."
        steps={[
          "In `src/App.tsx`, add `useEffect` to the React import: ```tsx\nimport { useState, useEffect } from 'react';\n```",
          "Replace the cards `useState` initializer with a lazy version that reads localStorage: ```tsx\nconst [cards, setCards] = useState(() => {\n  const stored = localStorage.getItem('flashcards');\n  if (stored) {\n    try { return JSON.parse(stored); } catch { /* fall through */ }\n  }\n  return [\n    { id: 1, question: 'What is a React Element?', answer: 'A plain JS object that describes UI.' },\n    { id: 2, question: 'What does className do?', answer: \"It's React's class attribute. Renamed because class is a JS reserved word.\" },\n  ];\n});\n```",
          "Right below the state, add an effect that writes whenever cards change: ```tsx\nuseEffect(() => {\n  localStorage.setItem('flashcards', JSON.stringify(cards));\n}, [cards]);\n```",
          "Save. Add a new card via the form. Refresh the page. The card should still be there.",
          "Open DevTools → Application → Local Storage → your localhost. You'll see a `flashcards` key with the JSON of your cards. Edit one of the questions in DevTools and refresh — the new question should show up. State and storage are now synced.",
          "Bonus: add an effect that updates `document.title` to show the count of unknown cards: ```tsx\nuseEffect(() => {\n  const remaining = cards.length - knownIds.size;\n  document.title = remaining > 0 ? `(${remaining}) Flashcards` : 'Flashcards';\n}, [cards.length, knownIds.size]);\n```",
        ]}
      />

      <Callout type="info" title="What you just did">
        State is the source of truth. <code>localStorage</code> is now a
        derived projection of state, kept in sync by the effect. If you
        ever change <code>cards</code> through any path — adding,
        removing, editing — the effect will run and storage will follow.
        That&apos;s the &quot;synchronize with an external system&quot;
        framing in action.
      </Callout>

      <Quiz
        question="When does an effect with `[count]` as its dependency array run?"
        options={[
          { label: "Only on the very first render" },
          { label: "After every single render, no matter what" },
          {
            label: "After the first render, and after any re-render where `count` is different from its previous value",
            correct: true,
            explanation:
              "Dependency arrays compare each value to the previous render's value (with Object.is). The effect runs after a render where any dep changed. If they're all the same, React skips it.",
          },
          { label: "Before the render — that's why it's called the 'commit phase'" },
        ]}
      />

      <Quiz
        question="What does this code do? `useEffect(() => { setCount(count + 1); }, [count]);`"
        options={[
          { label: "Increments count once, on mount" },
          { label: "Nothing — React detects this pattern and ignores it" },
          {
            label: "Loops forever: setting count triggers a re-render with new count, which triggers the effect again",
            correct: true,
            explanation:
              "Classic infinite loop. The effect's job ('keep count one ahead of itself') is impossible. Almost always the fix is to delete the effect — whatever you're computing should be derived during render, not stored as separate state.",
          },
          { label: "Crashes immediately because you can't call setState in an effect" },
        ]}
      />

      <ShortAnswer
        question="Explain why the dependency array isn't really 'when to re-run'. What's the right way to think about it, and what goes wrong if you treat it as a re-run schedule?"
        rubric={[
          "Dependency array is a list of every reactive value the effect reads from the surrounding scope",
          "If you read a value but don't list it, the effect closes over a stale version (stale closure bug)",
          "If you treat it as a re-run schedule and omit deps to skip re-runs, you'll get bugs that look like 'the effect remembers an old value'",
        ]}
        topic="The dependency array as a list of dependencies, not a re-run schedule"
      />

      <h2>What&apos;s next</h2>

      <p>
        You&apos;ve seen the pattern <code>{`return () => clearInterval(id)`}</code>{" "}
        and <code>{`return () => { cancelled = true; }`}</code> a couple
        of times now. That return value is the <strong>cleanup
        function</strong> — the second half of <code>useEffect</code>.
        Effects without proper cleanup leak memory, pile up event
        listeners, and create those infamous &quot;state update on
        unmounted component&quot; warnings. Next lesson digs in.
      </p>
    </>
  );
}
