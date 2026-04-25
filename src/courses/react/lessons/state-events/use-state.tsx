import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function UseState() {
  return (
    <>
      <h1>useState</h1>

      <p>
        Last lesson ended with a broken counter — proof that plain
        variables can&apos;t hold state across renders. Today we fix it.
        <code> useState</code> is the hook that bridges &quot;a function that
        runs over and over&quot; with &quot;a value that persists.&quot;
        It&apos;s the most-used hook in React, and once you understand it,
        the rest of the hook ecosystem follows the same shape.
      </p>

      <h2>The shape of useState</h2>

      <CodeBlock language="tsx">
        {`import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`}
      </CodeBlock>

      <p>
        Three things to read carefully on that first line:
      </p>

      <ul>
        <li>
          <code>useState(0)</code> — you give it the <strong>initial value</strong>.
        </li>
        <li>
          It returns a tuple: <code>[currentValue, setterFunction]</code>.
          The names are yours; <code>count</code> and <code>setCount</code>{" "}
          are convention.
        </li>
        <li>
          You destructure that tuple. <code>count</code> is the value to
          read; <code>setCount</code> is the function to call when you want
          to change it.
        </li>
      </ul>

      <p>The flow on click:</p>

      <ol>
        <li>You call <code>setCount(count + 1)</code>.</li>
        <li>React notes &quot;state changed&quot; and schedules a re-render.</li>
        <li>
          On the next render, <code>useState(0)</code> returns the{" "}
          <em>updated</em> value (not 0 — that initial value is only used
          on the first render).
        </li>
        <li>JSX evaluates with the new value. The DOM updates.</li>
      </ol>

      <Callout type="important" title="The two superpowers of useState">
        <code>useState</code> does two things plain variables can&apos;t:
        (1) it persists the value across renders, and (2) calling its
        setter tells React to re-render. Both halves matter — that&apos;s
        why <code>let count = 0</code> failed last lesson on both counts.
      </Callout>

      <h2>The initial value runs once</h2>

      <p>
        The argument to <code>useState</code> is only used on the very
        first render of that component instance. After that, it&apos;s
        ignored. This is a common confusion:
      </p>

      <CodeBlock language="tsx">
        {`function Counter({ start }: { start: number }) {
  const [count, setCount] = useState(start);
  // After the first render, changing the \`start\` prop does NOT
  // change \`count\`. The initial value was already locked in.
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`}
      </CodeBlock>

      <p>
        If you need <code>count</code> to follow <code>start</code> when
        the prop changes, that&apos;s a different pattern (we&apos;ll cover
        it in Module 3 with effects, and Module 6 covers the cleaner
        &quot;reset state with a key&quot; trick).
      </p>

      <h3>Lazy initial state</h3>

      <p>
        If computing the initial value is expensive (parsing localStorage,
        running an algorithm), pass a function instead of a value. React
        only calls the function on the first render:
      </p>

      <CodeBlock language="tsx">
        {`// Bad: parses localStorage on EVERY render, wasted work
const [decks, setDecks] = useState(JSON.parse(localStorage.getItem("decks") ?? "[]"));

// Good: only runs on the first render
const [decks, setDecks] = useState(() =>
  JSON.parse(localStorage.getItem("decks") ?? "[]")
);`}
      </CodeBlock>

      <h2>State updates are asynchronous</h2>

      <p>
        This is the gotcha that catches everyone. Calling the setter does
        not change the variable in your current scope — it schedules an
        update for the <em>next</em> render. Watch:
      </p>

      <CodeBlock language="tsx">
        {`function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count); // Still the OLD value (e.g. 0), not 1
  }

  return <button onClick={handleClick}>{count}</button>;
}`}
      </CodeBlock>

      <p>
        Why? Because <code>count</code> is a <em>const</em> in the current
        render. The setter says &quot;use this for next time.&quot; The
        next render of the function gets a fresh <code>count</code>. The
        current render already locked in the old one.
      </p>

      <p>
        This also means batched updates collapse:
      </p>

      <CodeBlock language="tsx">
        {`function handleClick() {
  setCount(count + 1); // count is 0, schedules count = 1
  setCount(count + 1); // count is STILL 0, schedules count = 1 again
  setCount(count + 1); // same — final state will be 1, not 3
}`}
      </CodeBlock>

      <h3>The updater function form</h3>

      <p>
        When you need to base the new value on the most recent value
        (instead of the value captured at render time), pass a function to
        the setter:
      </p>

      <CodeBlock language="tsx">
        {`function handleClick() {
  setCount(c => c + 1); // c is the latest value React has
  setCount(c => c + 1); // gets the result of the previous update
  setCount(c => c + 1); // final state: 3, not 1
}`}
      </CodeBlock>

      <Callout type="tip" title="When to use the updater form">
        Default to the updater form when the new state depends on the old
        state. It&apos;s a small extra character but prevents an entire
        category of stale-closure bugs. Use the value form for fresh
        values that don&apos;t depend on the previous one (e.g.{" "}
        <code>setName(input)</code>).
      </Callout>

      <h2>State is per component instance</h2>

      <p>
        Every time you render a component, that instance gets its own
        independent state. Two <code>&lt;Counter /&gt;</code>s side by
        side don&apos;t share anything:
      </p>

      <CodeBlock language="tsx">
        {`<div>
  <Counter />  {/* its own count */}
  <Counter />  {/* its own count */}
  <Counter />  {/* its own count */}
</div>`}
      </CodeBlock>

      <p>
        React tracks state by the component&apos;s position in the tree.
        This is also why moving a component up or down can reset state —
        but that&apos;s a Module 6 concern.
      </p>

      <h2>Don&apos;t mutate state — replace it</h2>

      <p>
        State must be treated as <strong>immutable</strong>. If you mutate
        an array or object held in state, React doesn&apos;t notice (the
        reference didn&apos;t change), so it doesn&apos;t re-render.
      </p>

      <CodeBlock language="tsx">
        {`function FlashcardList() {
  const [cards, setCards] = useState<string[]>([]);

  function addCardWrong(text: string) {
    cards.push(text);    // mutates the existing array — React sees no change
    setCards(cards);     // same reference, no re-render
  }

  function addCardRight(text: string) {
    setCards([...cards, text]); // new array — React re-renders
  }

  // For objects, the same idea:
  // setUser({ ...user, name: "Tom" });
  // For nested updates, spread at every level you change.

  return null;
}`}
      </CodeBlock>

      <p>
        This rule is the source of half the &quot;why doesn&apos;t my
        component update?&quot; bugs in any React codebase. Internalize:{" "}
        <strong>setState always takes a new value.</strong>
      </p>

      <h2>Multiple state variables vs one object</h2>

      <p>
        You can have as many <code>useState</code> calls in a component as
        you want. They&apos;re independent.
      </p>

      <CodeBlock language="tsx">
        {`function Form() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  // ...
}`}
      </CodeBlock>

      <p>
        Or you can hold one object:
      </p>

      <CodeBlock language="tsx">
        {`const [form, setForm] = useState({ name: "", email: "", agreed: false });
// To update one field:
setForm(f => ({ ...f, name: "Tom" }));`}
      </CodeBlock>

      <p>
        Rule of thumb: <strong>separate states for fields that update
        independently</strong>; one object when fields always change
        together. When state logic gets complex,{" "}
        <code>useReducer</code> (Module 5) is often cleaner than either
        approach.
      </p>

      <h2>Fixing the broken counter</h2>

      <p>Remember last lesson&apos;s <code>BrokenCounter</code>:</p>

      <CodeBlock language="tsx">
        {`function BrokenCounter() {
  let count = 0;
  return <button onClick={() => { count++; }}>{count}</button>;
}`}
      </CodeBlock>

      <p>The fixed version:</p>

      <CodeBlock language="tsx">
        {`function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}`}
      </CodeBlock>

      <p>
        Three things changed: import <code>useState</code>, replace{" "}
        <code>let count = 0</code> with the hook, replace{" "}
        <code>count++</code> with the setter. Now React knows about the
        change, persists it across renders, and re-renders the button.
      </p>

      <h2>Adding flip state to your Flashcard</h2>

      <p>
        Time to make your flashcards <em>actually flashcards</em>. Each
        card should have a question on the front and an answer on the
        back, and clicking should flip it. The flipped state lives inside
        each card — independent per instance, which is exactly what local
        state is for.
      </p>

      <HandsOn
        title="Make Flashcard interactive"
        projectStep="Module 2 · Step 1"
        projectContext="You'll add an `answer` prop, an `isFlipped` state hook, and a click handler. Each card will track its own flipped state independently."
        steps={[
          "Open `src/App.tsx`. Add `useState` to your React import: ```tsx\nimport { useState } from 'react';\n```",
          "Replace the `Flashcard` component with this version: ```tsx\ntype FlashcardProps = {\n  question: string;\n  answer: string;\n};\n\nfunction Flashcard({ question, answer }: FlashcardProps) {\n  const [isFlipped, setIsFlipped] = useState(false);\n\n  return (\n    <button\n      type=\"button\"\n      className=\"flashcard\"\n      onClick={() => setIsFlipped(f => !f)}\n    >\n      <p className=\"flashcard-label\">\n        {isFlipped ? 'Answer' : 'Question'}\n      </p>\n      <p className=\"flashcard-text\">\n        {isFlipped ? answer : question}\n      </p>\n    </button>\n  );\n}\n```",
          "Update the calls in `App` to pass an `answer` prop too: ```tsx\n<Flashcard\n  question=\"What is a React Element?\"\n  answer=\"A plain JS object that describes UI. React reads it and updates the DOM.\"\n/>\n<Flashcard\n  question=\"What does the className prop do?\"\n  answer=\"It's the React equivalent of HTML's class attribute. Renamed because `class` is a JS reserved word.\"\n/>\n<Flashcard\n  question=\"Why must JSX return a single root?\"\n  answer=\"A function can only return one value. Wrap siblings in a div or a Fragment <>...</>.\"\n/>\n```",
          "Add a few CSS rules to `src/App.css`: ```css\n.flashcard { width: 100%; text-align: left; cursor: pointer; transition: background 0.15s; }\n.flashcard:hover { background: #f4f4f5; }\n.flashcard-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; margin: 0 0 0.5rem 0; }\n.flashcard-text { margin: 0; font-size: 1.05rem; line-height: 1.5; }\n```",
          "Save and click each card. They should flip independently — flip the first one, the others stay on Question. That's local state per instance.",
          "Bonus: while you're here, delete the old `BrokenCounter` if you still have it. We don't need it anymore — useState fixed it.",
        ]}
      />

      <Quiz
        question="What's the difference between `setCount(count + 1)` and `setCount(c => c + 1)`?"
        options={[
          { label: "There's no functional difference — the second form is just stylistic" },
          {
            label: "The first uses the count value captured at render time. The updater form gets the latest queued value, so it composes correctly when called multiple times in a row.",
            correct: true,
            explanation:
              "When state updates are batched (or fire from inside async code), `count` may already be stale by the time React processes the update. The updater form sidesteps this by always operating on the latest value React has.",
          },
          { label: "The updater form runs synchronously, the value form runs asynchronously" },
          { label: "Only the updater form triggers a re-render" },
        ]}
      />

      <Quiz
        question="You have `const [items, setItems] = useState([1, 2, 3])`. Which call correctly adds 4 to the list?"
        options={[
          { label: "items.push(4); setItems(items);" },
          {
            label: "setItems([...items, 4]);",
            correct: true,
            explanation:
              "State must be replaced, not mutated. Pushing to the existing array doesn't change the array's reference, so React's bailout check (`oldState === newState`) sees no change and skips the re-render. Spreading creates a new array.",
          },
          { label: "items[items.length] = 4; setItems(items);" },
          { label: "setItems(items + 4);" },
        ]}
      />

      <ShortAnswer
        question="Why does calling `setCount(count + 1)` three times in a row only increment count by 1, not 3? And how does the updater form fix it?"
        rubric={[
          "Inside one render, `count` is captured as a constant value (e.g. 0); all three calls compute `0 + 1 = 1`",
          "React batches the updates, so the final scheduled value is 1 (not 3) and the component re-renders once with count = 1",
          "The updater form `setCount(c => c + 1)` receives the latest queued value each time, so the three calls compose into 0 → 1 → 2 → 3",
        ]}
        topic="State updates are batched and asynchronous"
      />

      <h2>What&apos;s next</h2>

      <p>
        You can now hold state and update it. The next lesson covers how
        you actually <em>get input</em> from the user — event handlers
        beyond <code>onClick</code>, and the controlled-input pattern that
        ties form state to <code>useState</code>. After that, you&apos;ll
        be able to add new flashcards through a form.
      </p>
    </>
  );
}
