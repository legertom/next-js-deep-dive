import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function Cleanup() {
  return (
    <>
      <h1>Cleanup Functions</h1>

      <p>
        Every effect that <em>does something</em> in the outside world
        (subscribes, attaches a listener, opens a connection, starts a
        timer) needs to know how to <em>undo</em> that thing. The
        cleanup function is how. It&apos;s a small but mighty piece of
        the API — the difference between a tidy app and one that leaks
        memory until the tab dies.
      </p>

      <h2>The shape</h2>

      <CodeBlock language="tsx">
        {`useEffect(() => {
  // setup
  const id = setInterval(tick, 1000);

  // cleanup — the function you return
  return () => {
    clearInterval(id);
  };
}, []);`}
      </CodeBlock>

      <p>
        If the setup function returns a function, React calls that
        returned function to clean up. The return is optional — effects
        that don&apos;t need cleanup (like setting{" "}
        <code>document.title</code>) just don&apos;t return anything.
      </p>

      <h2>When cleanup runs</h2>

      <p>Cleanup runs in two situations:</p>

      <ol>
        <li>
          <strong>Before the next setup runs.</strong> If the effect&apos;s
          dependencies change, React tears down the previous setup
          (cleanup) before running the new one.
        </li>
        <li>
          <strong>When the component unmounts.</strong> If the component
          is removed from the tree, React runs the cleanup one last time.
        </li>
      </ol>

      <p>The full lifecycle of an effect with deps that change:</p>

      <CodeBlock language="text">
        {`Mount:    setup
Re-render (deps changed):    cleanup of previous setup → new setup
Re-render (deps changed):    cleanup of previous setup → new setup
Re-render (deps SAME):       (nothing happens)
Unmount:  cleanup of last setup`}
      </CodeBlock>

      <p>
        The mental model: every setup gets paired with exactly one
        cleanup. If you write the setup to do something, ask &quot;what
        undoes this?&quot; and put that in cleanup. If you can&apos;t
        answer, the effect probably shouldn&apos;t exist.
      </p>

      <h2>Strict Mode and the double mount</h2>

      <p>
        In development, React Strict Mode does something deliberately
        weird: it mounts your component, immediately unmounts it, then
        mounts it again. This means your effect runs <strong>setup →
        cleanup → setup</strong> on the very first mount.
      </p>

      <p>
        Why? It&apos;s a smoke test. If your effect doesn&apos;t survive
        being torn down and re-set-up, your cleanup is wrong (or
        missing), and you&apos;ll have bugs the moment any component
        unmounts in production. Strict Mode forces you to find these now,
        not at 3am.
      </p>

      <CodeBlock language="text">
        {`Without proper cleanup:                With proper cleanup:
Mount:                                 Mount:
  - subscribe to topic A                 - subscribe to topic A
  (Strict Mode tears down)               - cleanup: unsubscribe A
  - subscribe to topic A again           - subscribe to topic A again
                                         - cleanup: unsubscribe A
Result:                                Result:
  TWO subscriptions, leaking            ONE subscription, clean`}
      </CodeBlock>

      <Callout type="important" title="If Strict Mode breaks your effect, your code is broken">
        Strict Mode doesn&apos;t cause bugs. It exposes them. If your
        effect &quot;works&quot; only because it runs once but breaks
        when it runs twice, that effect can&apos;t be unmounted/remounted
        — which means it can&apos;t survive route changes, conditional
        rendering, or hot reload. Cleanup is the fix.
      </Callout>

      <h2>The standard cleanup recipes</h2>

      <h3>setInterval / setTimeout</h3>

      <CodeBlock language="tsx">
        {`useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);`}
      </CodeBlock>

      <h3>Event listeners</h3>

      <CodeBlock language="tsx">
        {`useEffect(() => {
  function handleResize() {
    setWidth(window.innerWidth);
  }
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);`}
      </CodeBlock>

      <p>
        Note: the cleanup must remove the <em>same</em> function reference
        you added. Defining the handler inside the effect (so it&apos;s
        the same name in both calls) is the easy way.
      </p>

      <h3>Subscriptions</h3>

      <CodeBlock language="tsx">
        {`useEffect(() => {
  const unsubscribe = chatRoom.subscribe(roomId, handleMessage);
  return unsubscribe; // many APIs return their own cleanup — convenient
}, [roomId]);`}
      </CodeBlock>

      <h3>Fetch with abort</h3>

      <CodeBlock language="tsx">
        {`useEffect(() => {
  const controller = new AbortController();

  fetch(\`/api/users/\${id}\`, { signal: controller.signal })
    .then(r => r.json())
    .then(setUser)
    .catch(err => {
      if (err.name !== "AbortError") throw err;
    });

  return () => controller.abort();
}, [id]);`}
      </CodeBlock>

      <p>
        When <code>id</code> changes mid-fetch, the cleanup aborts the
        in-flight request before kicking off a new one. Without this, a
        slow response from the old <code>id</code> could overwrite the
        result of a faster response from the new one — the classic
        &quot;race condition&quot; bug.
      </p>

      <h3>Canceling stale state updates without abort</h3>

      <CodeBlock language="tsx">
        {`useEffect(() => {
  let cancelled = false;
  doSomeAsyncWork().then((result) => {
    if (!cancelled) setData(result);
  });
  return () => { cancelled = true; };
}, [id]);`}
      </CodeBlock>

      <p>
        A simpler alternative when you don&apos;t have an abort
        controller: a flag that prevents the late callback from setting
        state on a stale identity.
      </p>

      <h2>The signature of a leak</h2>

      <p>If you forget cleanup, here are the symptoms:</p>

      <ul>
        <li>
          <strong>Memory grows over time.</strong> Each navigation adds a
          subscription that never clears.
        </li>
        <li>
          <strong>Multiple identical events fire.</strong> Three open
          subscriptions = three handlers per message.
        </li>
        <li>
          <strong>State updates after unmount warnings.</strong> An async
          callback fires after the component is gone and tries to call{" "}
          <code>setState</code>.
        </li>
        <li>
          <strong>Strict Mode shows you immediately.</strong> Anything
          that doubles in dev is a missing-cleanup tell.
        </li>
      </ul>

      <h2>What about effects that don&apos;t need cleanup?</h2>

      <p>
        Lots of effects don&apos;t. <code>document.title = title</code>{" "}
        doesn&apos;t need cleanup because the next render will just
        overwrite it. Writing to localStorage doesn&apos;t need cleanup
        because the storage stays valid even after unmount. The rule:{" "}
        <strong>cleanup is needed when the setup creates a thing that
        keeps living without you</strong> — a subscription, a timer, a
        listener, an in-flight network request, a global mutation that
        another component shouldn&apos;t see.
      </p>

      <h2>Adding a debounced search</h2>

      <p>
        Time to use cleanup. We&apos;ll add a search input that filters
        flashcards. To avoid filtering on every keystroke (cheap here,
        but the pattern matters), we&apos;ll debounce: only filter
        300ms after the user stops typing. <code>setTimeout</code> +
        cleanup is the textbook recipe.
      </p>

      <HandsOn
        title="Add a debounced search to filter flashcards"
        projectStep="Module 3 · Step 2"
        projectContext="A search input that filters cards by question or answer text. Filtering happens 300ms after the last keystroke, using setTimeout + cleanup. This is the simplest possible useEffect-with-cleanup pattern."
        steps={[
          "In `src/App.tsx`, add two new state variables to App: ```tsx\nconst [searchInput, setSearchInput] = useState('');\nconst [searchTerm, setSearchTerm] = useState('');\n```\n`searchInput` reflects what's currently typed; `searchTerm` is the debounced version that's actually used to filter.",
          "Add a debouncing effect: ```tsx\nuseEffect(() => {\n  const id = setTimeout(() => setSearchTerm(searchInput), 300);\n  return () => clearTimeout(id);\n}, [searchInput]);\n```",
          "Compute filtered cards during render (no useEffect needed for this — see next lesson): ```tsx\nconst filtered = searchTerm.trim() === ''\n  ? cards\n  : cards.filter(c =>\n      c.question.toLowerCase().includes(searchTerm.toLowerCase()) ||\n      c.answer.toLowerCase().includes(searchTerm.toLowerCase())\n    );\n```",
          "Add a search input above the cards in App's JSX (above the Counter): ```tsx\n<input\n  type=\"search\"\n  className=\"search\"\n  placeholder=\"Search cards...\"\n  value={searchInput}\n  onChange={(e) => setSearchInput(e.target.value)}\n/>\n```",
          "Update the cards `.map()` to render `filtered` instead of `cards`: ```tsx\n{filtered.map(card => (\n  <Flashcard ... />\n))}\n```",
          "Add some styling to `App.css`: ```css\n.search { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d4d4d8; border-radius: 8px; font: inherit; margin-bottom: 1rem; }\n```",
          "Save. Type fast in the search box. Notice that the list doesn't re-filter on every keystroke — it waits 300ms after you stop typing. That's the cleanup at work: every keystroke clears the previous timeout and starts a new one.",
          "Bonus: add `console.log('debounced:', searchTerm)` inside the effect's setTimeout callback to see exactly when the debounced value updates.",
        ]}
      />

      <Callout type="info" title="What just happened on every keystroke">
        Type a letter. <code>searchInput</code> updates → re-render →
        effect re-runs (because <code>searchInput</code> is in deps).
        Cleanup fires <code>clearTimeout</code> on the previous timer.
        Setup starts a new 300ms timer. Type another letter — same
        thing. Stop typing for 300ms — the most recent timer survives,
        fires, and updates <code>searchTerm</code>. That cancellation
        chain is the whole point of cleanup.
      </Callout>

      <Quiz
        question="What's the relationship between setup and cleanup in a useEffect?"
        options={[
          { label: "Setup runs on mount, cleanup runs on unmount, that's it" },
          {
            label: "Every setup is paired with exactly one cleanup. Cleanup runs before the next setup (when deps change) and on unmount.",
            correct: true,
            explanation:
              "This is the most useful framing. If your setup creates 'thing X', cleanup destroys 'thing X' before the next 'thing X' is created. That's why Strict Mode's setup→cleanup→setup pattern in dev is a smoke test: anything that survives that round-trip is correctly paired.",
          },
          { label: "Cleanup runs only if you explicitly mark it, otherwise React garbage-collects automatically" },
          { label: "Setup runs after cleanup — the cleanup of the previous render fires first" },
        ]}
      />

      <Quiz
        question="Your component subscribes to a WebSocket on mount and you forget cleanup. The component never unmounts in production, only on dev hot-reload. What's the consequence?"
        options={[
          { label: "Nothing — production is fine because it never unmounts" },
          {
            label: "Strict Mode in dev will reveal the bug immediately by showing two subscriptions, and any production scenario that conditionally renders or routes the component will leak",
            correct: true,
            explanation:
              "Production may seem fine until it isn't — a route change, a conditional render, or a future refactor will unmount the component and the leak surfaces. Strict Mode's intentional double-mount is what catches this in dev. Treat any 'doubles in dev' symptom as a real bug, not noise.",
          },
          { label: "React will warn at compile time and refuse to build" },
          { label: "TypeScript will catch it because cleanups are required" },
        ]}
      />

      <ShortAnswer
        question="Why does Strict Mode intentionally mount → unmount → mount your component on first mount in development? What is it trying to teach you?"
        rubric={[
          "Strict Mode runs setup → cleanup → setup to simulate a fast unmount and remount",
          "It's a smoke test for missing or incorrect cleanup — if anything breaks or duplicates, your effect isn't truly idempotent",
          "Bonus: catches bugs that would otherwise only appear in production during route changes, conditional rendering, or hot reload",
        ]}
        topic="Why Strict Mode double-mounts effects in development"
      />

      <h2>What&apos;s next</h2>

      <p>
        You can now write effects that talk to the outside world cleanly.
        The next lesson is the most important one in this module — and
        maybe the whole course: <strong>You Might Not Need an Effect</strong>.
        About 80% of the effects in real React codebases shouldn&apos;t
        exist. The next lesson is a guide to recognizing them and
        replacing them with simpler, faster, less buggy code.
      </p>
    </>
  );
}
