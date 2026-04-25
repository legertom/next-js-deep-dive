import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function UseEffectEvent() {
  return (
    <div>
      <h1>useEffectEvent</h1>

      <p>
        React 19.2 stabilizes the <code>useEffectEvent</code> hook, solving one
        of the most common pain points in React: reading the latest values
        inside effects without adding them to the dependency array. It cleanly
        separates reactive logic (what triggers the effect) from non-reactive
        logic (what the effect does with current values).
      </p>

      <h2>The Stale Closure Problem</h2>

      <p>
        Consider a chat room component that logs analytics when a message
        arrives. You want the effect to reconnect when the <code>roomId</code>{" "}
        changes, but you also want to read the current <code>theme</code> for
        the analytics event — without reconnecting every time the theme changes.
      </p>

      <CodeBlock
        language="tsx"
        filename="The problem (before useEffectEvent)">
{`"use client";

import { useEffect } from "react";

function ChatRoom({ roomId, theme }: { roomId: string; theme: string }) {
  useEffect(() => {
    const conn = createConnection(roomId);
    conn.on("message", (msg) => {
      // Problem: if theme is in deps, we reconnect on theme change
      // If theme is NOT in deps, we read a stale value
      logAnalytics("message_received", { roomId, theme });
      showNotification(msg);
    });
    conn.connect();
    return () => conn.disconnect();
  }, [roomId, theme]); // Adding theme causes unnecessary reconnections!

  return <div>Chat: {roomId}</div>;
}`}
      </CodeBlock>

      <Callout type="warning">
        This is the classic dilemma: either you include <code>theme</code> in
        the dependency array (causing reconnections whenever theme changes) or
        you omit it (reading a stale closure value and violating the exhaustive
        deps rule).
      </Callout>

      <h2>The Solution: useEffectEvent</h2>

      <p>
        <code>useEffectEvent</code> lets you extract a piece of logic that
        always reads the latest props/state but is not reactive — it does not
        cause the effect to re-run when the values it reads change.
      </p>

      <CodeBlock
        language="tsx"
        filename="components/chat-room.tsx">
{`"use client";

import { useEffect, useEffectEvent } from "react";

function ChatRoom({ roomId, theme }: { roomId: string; theme: string }) {
  // This function always reads the latest 'theme'
  // but does NOT cause the effect to re-synchronize
  const onMessage = useEffectEvent((msg: Message) => {
    logAnalytics("message_received", { roomId, theme });
    showNotification(msg, theme);
  });

  useEffect(() => {
    const conn = createConnection(roomId);
    conn.on("message", onMessage); // safe to use — not reactive
    conn.connect();
    return () => conn.disconnect();
  }, [roomId]); // Only reconnect when roomId changes!

  return <div>Chat: {roomId}</div>;
}`}
      </CodeBlock>

      <FlowDiagram
        title="Reactive vs Non-Reactive Logic"
        steps={[
          "roomId changes → effect re-runs (reactive)",
          "theme changes → onMessage reads latest value (non-reactive)",
          "Connection stays open when only theme changes",
          "Analytics always log the current theme correctly",
        ]}
      />

      <h2>How It Works Under the Hood</h2>

      <p>
        An Effect Event is conceptually like a ref that holds a callback. React
        updates the callback on every render (so it always closes over the
        latest values), but the identity of the function returned by{" "}
        <code>useEffectEvent</code> is stable — it never changes between
        renders. This means:
      </p>

      <ul>
        <li>You can call it inside effects without adding it to dependencies</li>
        <li>It always reads the latest props and state</li>
        <li>It cannot be called during rendering — only from effects or event handlers</li>
      </ul>

      <Callout type="info">
        Think of <code>useEffectEvent</code> as the complement to{" "}
        <code>useEffect</code>. The effect declares <em>when</em> to
        synchronize (via its dependency array). The effect event declares{" "}
        <em>what to do</em> with the latest values when that happens.
      </Callout>

      <h2>Rules of useEffectEvent</h2>

      <CodeBlock
        language="tsx"
        filename="Rules and constraints">
{`import { useEffectEvent } from "react";

function MyComponent({ url, options }: Props) {
  const onFetch = useEffectEvent(() => {
    // Always reads latest 'options' — no stale closure
    return fetch(url, options);
  });

  useEffect(() => {
    // Correct: calling from inside an effect
    onFetch().then(handleResponse);
  }, [url]); // 'options' intentionally excluded — handled by effect event

  // WRONG: Do not call effect events during render
  // const data = onFetch(); // This would be an error

  // WRONG: Do not pass effect events to other components
  // <Child onFetch={onFetch} /> // Not allowed

  return <div>...</div>;
}`}
      </CodeBlock>

      <h2>Common Patterns</h2>

      <h3>Timer with Latest State</h3>

      <CodeBlock
        language="tsx"
        filename="components/auto-save.tsx">
{`"use client";

import { useEffect, useEffectEvent, useState } from "react";

function AutoSaveForm() {
  const [formData, setFormData] = useState({ title: "", body: "" });
  const [saveInterval, setSaveInterval] = useState(5000);

  // Always saves the latest form data
  const onSave = useEffectEvent(() => {
    saveToServer(formData);
  });

  useEffect(() => {
    // Only re-creates the interval when saveInterval changes
    // But always saves the latest formData
    const id = setInterval(onSave, saveInterval);
    return () => clearInterval(id);
  }, [saveInterval]);

  return (
    <form>
      <input
        value={formData.title}
        onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
      />
      <textarea
        value={formData.body}
        onChange={(e) => setFormData((d) => ({ ...d, body: e.target.value }))}
      />
    </form>
  );
}`}
      </CodeBlock>

      <h3>Logging and Analytics</h3>

      <CodeBlock
        language="tsx"
        filename="hooks/use-page-view.ts">
{`import { useEffect, useEffectEvent } from "react";

export function usePageView(route: string, userId: string | null) {
  // userId changes frequently (login/logout) but should not
  // cause the page view to re-fire
  const onPageView = useEffectEvent(() => {
    analytics.track("page_view", {
      route,
      userId, // always the latest value
      timestamp: Date.now(),
    });
  });

  useEffect(() => {
    // Only fires when route changes
    onPageView();
  }, [route]);
}`}
      </CodeBlock>

      <Callout type="tip">
        A helpful mental model: dependencies in your effect answer "when should
        this effect re-synchronize?" and the effect event answers "what should
        it read when it does?"
      </Callout>

      <Quiz
        question="What is the primary purpose of useEffectEvent?"
        options={[
          { label: "To memoize event handler functions for performance" },
          { label: "To read the latest values in effects without adding them to the dependency array", correct: true, explanation: "useEffectEvent solves the stale closure problem by providing a stable function that always reads the latest props/state, without forcing the parent effect to re-synchronize when those values change." },
          { label: "To replace useCallback in all cases" },
          { label: "To schedule effects to run on specific browser events" },
        ]}
      />

      <Quiz
        question="Which of the following is NOT allowed with useEffectEvent?"
        options={[
          { label: "Calling the effect event inside a useEffect callback" },
          { label: "Reading props and state inside the effect event" },
          { label: "Passing the effect event as a prop to a child component", correct: true, explanation: "Effect events must not be passed to child components or called during rendering. They are meant to be called only from inside effects or event handlers within the same component." },
          { label: "Using the effect event inside an event handler" },
        ]}
      />

      <HandsOn
        title="Use useEffectEvent for a stable callback"
        projectStep="Step 25 of 40 — Blog Platform Project"
        projectContext="Your blog should be running with `npm run dev`. You will add a simple logger that shows how useEffectEvent prevents unnecessary re-runs."
        steps={[
          "Create a new file `app/logger-demo/page.tsx`. Make it a client component with two pieces of state: `const [count, setCount] = useState(0)` and `const [label, setLabel] = useState(\"hello\")`. Add a button that increments count and an input that changes label. Display both values on the page.",
          "Add a `useEffect` that logs to the console: `console.log(\"Effect ran! label is:\", label)` with `[count]` as the dependency array. Open /logger-demo in your browser, open the browser Console, and click the increment button. You should see the log — but notice it shows a stale label if you change the input first.",
          "Now fix it: import `useEffectEvent` from `\"react\"`. Create a stable callback: `const onCountChange = useEffectEvent(() => { console.log(\"Count changed! label is:\", label); })`. Update the useEffect to call `onCountChange()` instead of logging directly. Keep `[count]` as the only dependency.",
          "Test again: change the label text in the input, then click the increment button. The console log now shows the correct, latest label value every time — without re-running the effect when label changes.",
          "Try changing just the label input without clicking the button. The effect does not re-run. That is the key benefit: useEffectEvent reads the latest values without being reactive.",
        ]}
      />
    </div>
  );
}
