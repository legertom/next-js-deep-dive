import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function EventHandlers() {
  return (
    <>
      <h1>Event Handlers &amp; Controlled Inputs</h1>

      <p>
        You can render JSX. You can hold state. The missing piece is{" "}
        <em>getting data from the user</em>. This lesson covers React&apos;s
        event system and the single most important pattern in React forms:{" "}
        <strong>controlled inputs</strong>.
      </p>

      <h2>Event handlers</h2>

      <p>
        Every standard DOM event is available in JSX, prefixed with{" "}
        <code>on</code> and camelCased: <code>onClick</code>,{" "}
        <code>onChange</code>, <code>onSubmit</code>, <code>onMouseEnter</code>,{" "}
        <code>onKeyDown</code>, <code>onFocus</code>, <code>onBlur</code>.
        You pass a function — not a function call:
      </p>

      <CodeBlock language="tsx">
        {`<button onClick={handleClick}>Save</button>           // pass the function
<button onClick={() => save(id)}>Save</button>        // inline arrow
<button onClick={handleClick()}>Save</button>         // BUG: calls it during render`}
      </CodeBlock>

      <p>
        That last line is a classic mistake. Putting parentheses there
        calls the function immediately during render and uses the return
        value as the handler. Strip the parens or wrap in an arrow.
      </p>

      <h3>The event object</h3>

      <p>
        Your handler receives a <strong>synthetic event</strong> — React&apos;s
        wrapper around the native browser event. It has the same shape as
        the native event (<code>e.target</code>, <code>e.preventDefault()</code>,
        <code> e.currentTarget</code>) but with cross-browser
        normalization.
      </p>

      <CodeBlock language="tsx">
        {`function Form() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();        // stop the browser from navigating
    const data = new FormData(e.currentTarget);
    console.log(data.get("email"));
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <button type="submit">Send</button>
    </form>
  );
}`}
      </CodeBlock>

      <Callout type="tip" title="e.target vs e.currentTarget">
        <code>e.currentTarget</code> is the element the handler is
        attached to. <code>e.target</code> is the element the user
        actually clicked, which might be a child. For a click on a button
        with a span inside, clicking the span gives{" "}
        <code>e.target = span</code> but{" "}
        <code>e.currentTarget = button</code>. When in doubt, use{" "}
        <code>currentTarget</code>.
      </Callout>

      <h3>Passing arguments to handlers</h3>

      <p>
        You can&apos;t pass arguments by writing{" "}
        <code>onClick={`{deleteCard(id)}`}</code> (that calls it during
        render). Wrap it in an arrow:
      </p>

      <CodeBlock language="tsx">
        {`<button onClick={() => deleteCard(card.id)}>Delete</button>`}
      </CodeBlock>

      <p>
        This creates a new function every render, which is fine — modern
        React is fast at this, and the React Compiler (Module 11) makes
        the cost effectively zero.
      </p>

      <h2>Controlled inputs: the core pattern</h2>

      <p>
        Here&apos;s the pattern you&apos;ll write 10,000 times in your
        React life. An input&apos;s <code>value</code> comes from state,
        and its <code>onChange</code> updates that state. The input is
        &quot;controlled&quot; because React owns the value, not the DOM.
      </p>

      <CodeBlock language="tsx">
        {`function NameInput() {
  const [name, setName] = useState("");

  return (
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}`}
      </CodeBlock>

      <p>The cycle on every keystroke:</p>

      <ol>
        <li>User types a letter.</li>
        <li><code>onChange</code> fires with the new full string in <code>e.target.value</code>.</li>
        <li>You call <code>setName(e.target.value)</code>.</li>
        <li>React re-renders. <code>name</code> is now the new value.</li>
        <li>The input&apos;s <code>value</code> prop reflects the updated state.</li>
      </ol>

      <p>
        It looks circular because it is. The state and the input form a
        loop: <em>state is the source of truth, the input merely
        displays it</em>. This is what gives you the power to validate,
        transform, or react to the value as it changes.
      </p>

      <Callout type="important" title="The mental flip">
        In vanilla HTML, the input owns its value and you read it when
        you need it (<code>input.value</code>). In React, your state owns
        the value and you push it into the input. This inversion is the
        whole game.
      </Callout>

      <h3>Common variants</h3>

      <CodeBlock language="tsx">
        {`// Number input — note the conversion
<input
  type="number"
  value={age}
  onChange={(e) => setAge(Number(e.target.value))}
/>

// Checkbox — value comes from \`checked\`, not \`value\`
<input
  type="checkbox"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>

// Select
<select value={priority} onChange={(e) => setPriority(e.target.value)}>
  <option value="low">Low</option>
  <option value="high">High</option>
</select>

// Textarea (note: in HTML the value lives in children, in JSX it's a prop)
<textarea
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
/>`}
      </CodeBlock>

      <h2>Forms with multiple fields</h2>

      <p>
        Two patterns: separate state per field (clearest), or one object
        with a shared change handler (terser when there are many fields).
      </p>

      <h3>Pattern A: separate states</h3>

      <CodeBlock language="tsx">
        {`function AddCardForm({ onAdd }: { onAdd: (q: string, a: string) => void }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    onAdd(question, answer);
    setQuestion("");
    setAnswer("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <input
        placeholder="Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}`}
      </CodeBlock>

      <h3>Pattern B: one object</h3>

      <CodeBlock language="tsx">
        {`const [form, setForm] = useState({ question: "", answer: "" });

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setForm(f => ({ ...f, [e.target.name]: e.target.value }));
}

return (
  <form onSubmit={handleSubmit}>
    <input name="question" value={form.question} onChange={handleChange} />
    <input name="answer" value={form.answer} onChange={handleChange} />
    <button type="submit">Add</button>
  </form>
);`}
      </CodeBlock>

      <p>
        Both are valid. Pattern B uses the input&apos;s <code>name</code>{" "}
        attribute and computed property keys to handle every field with
        one function. Use it when you have 5+ fields.
      </p>

      <h2>What about uncontrolled inputs?</h2>

      <p>
        You <em>can</em> let the DOM own the input&apos;s value and read
        it on submit (using <code>FormData</code> or refs). It&apos;s
        called the <strong>uncontrolled</strong> pattern. We&apos;ll
        cover the trade-offs in Module 7 (Forms in Modern React) — for
        now, default to controlled. It composes better with everything
        else: validation, conditional rendering, derived state, debouncing.
      </p>

      <h2>Event delegation, briefly</h2>

      <p>
        Behind the scenes, React doesn&apos;t actually attach a listener
        to every <code>onClick</code> you write. It attaches one listener
        to the root and dispatches events to the right handler. You
        don&apos;t need to think about this most days, but it&apos;s why
        adding 1,000 list items with <code>onClick</code> handlers
        doesn&apos;t kill performance.
      </p>

      <h2>Adding a card form to your flashcards</h2>

      <p>
        Your app currently has hardcoded flashcards in <code>App</code>.
        Time to make the deck dynamic. By the end of this exercise,
        you&apos;ll be able to type a question and answer, click Add, and
        see a new card appear in the list.
      </p>

      <HandsOn
        title="Add new flashcards from a form"
        projectStep="Module 2 · Step 2"
        projectContext="You'll move the cards out of hardcoded JSX into App-level state, then build a controlled form that adds new cards. You're touching three concepts at once: state in a parent, controlled inputs, and event handlers."
        steps={[
          "In `src/App.tsx`, replace the body of `App` so the cards live in state. Above the `return`, add: ```tsx\nconst [cards, setCards] = useState([\n  { id: 1, question: 'What is a React Element?', answer: 'A plain JS object that describes UI.' },\n  { id: 2, question: 'What does className do?', answer: \"It's React's class attribute. Renamed because class is a JS reserved word.\" },\n]);\n```",
          "Render the cards from state using `.map()` (we'll cover this properly in Module 6, but for now): ```tsx\n{cards.map(card => (\n  <Flashcard key={card.id} question={card.question} answer={card.answer} />\n))}\n```",
          "Below the `Flashcard` component, add an `AddCardForm` component: ```tsx\ntype AddCardFormProps = {\n  onAdd: (question: string, answer: string) => void;\n};\n\nfunction AddCardForm({ onAdd }: AddCardFormProps) {\n  const [question, setQuestion] = useState('');\n  const [answer, setAnswer] = useState('');\n\n  function handleSubmit(e: React.FormEvent) {\n    e.preventDefault();\n    if (!question.trim() || !answer.trim()) return;\n    onAdd(question.trim(), answer.trim());\n    setQuestion('');\n    setAnswer('');\n  }\n\n  return (\n    <form onSubmit={handleSubmit} className=\"add-form\">\n      <input\n        placeholder=\"Question\"\n        value={question}\n        onChange={(e) => setQuestion(e.target.value)}\n      />\n      <input\n        placeholder=\"Answer\"\n        value={answer}\n        onChange={(e) => setAnswer(e.target.value)}\n      />\n      <button type=\"submit\">Add card</button>\n    </form>\n  );\n}\n```",
          "Render the form inside `App`, above the cards: ```tsx\n<AddCardForm onAdd={(question, answer) => {\n  setCards(prev => [...prev, { id: Date.now(), question, answer }]);\n}} />\n```",
          "Add a few CSS rules to `src/App.css`: ```css\n.add-form { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }\n.add-form input { padding: 0.5rem 0.75rem; border: 1px solid #d4d4d8; border-radius: 8px; font: inherit; }\n.add-form button { padding: 0.5rem 0.75rem; border: 0; border-radius: 8px; background: #18181b; color: white; font: inherit; cursor: pointer; }\n.add-form button:hover { background: #27272a; }\n```",
          "Save. Type a question and answer, click Add. A new card should appear at the bottom of the list. Click it to flip — the new card has its own independent flipped state, just like the original ones.",
          "Bonus: try the empty state. The button should still submit but the form should not add an empty card (the `.trim()` check handles this).",
        ]}
      />

      <Callout type="info" title="What you just did">
        The form held its own input state (controlled inputs). On submit,
        it called the <code>onAdd</code> prop — a function passed down
        from <code>App</code> — which appended a new card to{" "}
        <code>App</code>&apos;s state. Form owns its inputs, parent owns
        the list. That separation of concerns is the bridge into the next
        lesson.
      </Callout>

      <Quiz
        question="What's wrong with this code? `<button onClick={handleClick()}>Save</button>`"
        options={[
          {
            label: "It calls handleClick during render and uses the return value as the click handler",
            correct: true,
            explanation:
              "Parentheses invoke the function. So this runs `handleClick()` while React is rendering the JSX, and whatever it returns (likely `undefined`) becomes the onClick handler. To fix: drop the parens (`onClick={handleClick}`) or wrap in an arrow (`onClick={() => handleClick()}`).",
          },
          { label: "Nothing — that's the correct way to attach a handler" },
          { label: "The component will infinite-loop because handleClick re-renders" },
          { label: "React doesn't support that syntax" },
        ]}
      />

      <Quiz
        question="In a controlled input, where does the source of truth for the input's value live?"
        options={[
          { label: "The DOM input element — React just initializes it" },
          {
            label: "React state — the input displays whatever state currently holds",
            correct: true,
            explanation:
              "That's why it's called controlled: React state owns the value. The `value` prop pushes the state into the input on every render, and `onChange` updates the state. Without that loop, the user could type but state wouldn't update — that's the classic 'input that doesn't accept typing' bug.",
          },
          { label: "Both — they stay in sync automatically via two-way binding" },
          { label: "The browser's form-state cache" },
        ]}
      />

      <ShortAnswer
        question="Explain the controlled input pattern in your own words. What does the `value` prop do, what does `onChange` do, and why does this loop give you more power than letting the DOM own the value?"
        rubric={[
          "value prop pushes state down into the input — what the user sees comes from state",
          "onChange handler updates state on every keystroke",
          "The loop means state is the single source of truth, which makes validation, transformation, and derived UI trivial (you can read the value any time, not just on submit)",
        ]}
        topic="Controlled input pattern"
      />

      <h2>What&apos;s next</h2>

      <p>
        Your <code>AddCardForm</code> already does something subtle: state
        for the inputs lives in the form, but state for the list lives in{" "}
        <code>App</code>. The form calls a prop function to push data up.
        That&apos;s a hint of the next lesson&apos;s topic:{" "}
        <strong>lifting state up</strong> — the standard recipe for sharing
        state between sibling components.
      </p>
    </>
  );
}
