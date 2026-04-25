import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function ControlledVsUncontrolled() {
  return (
    <>
      <h1>Controlled vs Uncontrolled</h1>

      <p>
        We previewed this in Module 2: a controlled input has its{" "}
        <code>value</code> driven by React state. There&apos;s a second
        approach — <strong>uncontrolled inputs</strong> — where the DOM
        owns the value and React only reads it on submit. Each pattern
        has its place. This lesson is the trade-off.
      </p>

      <h2>Recap: the controlled pattern</h2>

      <CodeBlock language="tsx">
        {`function NameInput() {
  const [name, setName] = useState("");
  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}`}
      </CodeBlock>

      <p>
        State is the source of truth. Input value follows state. Every
        keystroke causes a re-render.
      </p>

      <h2>The uncontrolled pattern</h2>

      <CodeBlock language="tsx">
        {`function NameForm() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    console.log(name);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" defaultValue="" />
      <button type="submit">Save</button>
    </form>
  );
}`}
      </CodeBlock>

      <p>
        The DOM owns the value. React doesn&apos;t track every keystroke.
        On submit, you read the form data via <code>FormData</code> (or a
        ref). Two key differences:
      </p>

      <ul>
        <li>
          <code>defaultValue</code> instead of <code>value</code>. It
          sets the <em>initial</em> DOM value, then doesn&apos;t enforce
          anything.
        </li>
        <li>
          No <code>onChange</code> handler needed. The browser handles
          input itself.
        </li>
      </ul>

      <h2>When to choose which</h2>

      <h3>Controlled is better when:</h3>

      <ul>
        <li>
          You need to validate or transform on every keystroke
          (formatting a phone number, character count, error display).
        </li>
        <li>
          You need to disable a button based on field values.
        </li>
        <li>
          You need to derive other UI from the value (live preview,
          search-as-you-type).
        </li>
        <li>
          You need to clear or reset the input from JS.
        </li>
      </ul>

      <h3>Uncontrolled is better when:</h3>

      <ul>
        <li>
          You only care about the value at submit time (a simple form
          that posts to a server).
        </li>
        <li>
          You&apos;re integrating with a non-React form library or DOM
          API that expects to read values directly.
        </li>
        <li>
          The form is large and you want to avoid the per-keystroke
          re-render cost (this matters less than people think — see
          performance lesson).
        </li>
        <li>
          You&apos;re using React 19&apos;s <code>action</code> prop on{" "}
          <code>&lt;form&gt;</code> (next lesson).
        </li>
      </ul>

      <Callout type="important" title="React 19 nudges you toward uncontrolled for forms">
        The new form actions API (next lesson) is built on top of native
        form submission, which means uncontrolled inputs +{" "}
        <code>FormData</code>. For React 19+ apps, expect to write more
        uncontrolled code than you used to. Controlled is still right for
        every per-keystroke concern; uncontrolled handles the
        submit-and-go cases more elegantly.
      </Callout>

      <h2>The hybrid: refs + uncontrolled</h2>

      <p>
        Sometimes you want to <em>read</em> an uncontrolled input&apos;s
        value without going through a full submit. Use a ref:
      </p>

      <CodeBlock language="tsx">
        {`function CharCounter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [count, setCount] = useState(0);

  return (
    <>
      <input
        ref={inputRef}
        defaultValue=""
        onInput={() => setCount(inputRef.current?.value.length ?? 0)}
      />
      <p>{count} characters</p>
    </>
  );
}`}
      </CodeBlock>

      <p>
        The DOM owns the value, but we tap into <code>onInput</code> to
        update a derived state. Marginal benefit over fully controlled,
        but useful when integrating with libraries that need direct DOM
        ownership.
      </p>

      <h2>FormData — the secret weapon</h2>

      <p>
        <code>FormData</code> is a built-in browser API that turns a form
        element into an iterable map of name/value pairs. It&apos;s
        underused outside React because state-of-the-art frontend
        frameworks usually steal that responsibility. With React&apos;s
        push toward uncontrolled forms, it&apos;s worth knowing well:
      </p>

      <CodeBlock language="tsx">
        {`function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);

  // Read individual fields
  const name = formData.get("name");
  const email = formData.get("email");

  // Iterate
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  // Convert to plain object
  const data = Object.fromEntries(formData);

  // Send directly to a server
  fetch("/api/submit", { method: "POST", body: formData });
}`}
      </CodeBlock>

      <p>
        Forms with file inputs, multi-value fields (multi-select,
        checkbox groups), and arrays all work without any additional
        glue. React 19&apos;s action API leans into this — your action
        receives <code>FormData</code> directly.
      </p>

      <h2>Common gotchas</h2>

      <h3>Don&apos;t mix <code>value</code> and <code>defaultValue</code></h3>

      <p>
        Pick one. <code>value</code> = controlled.{" "}
        <code>defaultValue</code> = uncontrolled. Setting both will
        confuse React (and you).
      </p>

      <h3>Controlled inputs need <code>onChange</code></h3>

      <p>
        If you set <code>value=&quot;foo&quot;</code> without an{" "}
        <code>onChange</code>, the input is read-only. The user can
        type, but every keystroke gets reverted because state never
        updates. React warns about this.
      </p>

      <h3>Don&apos;t initialize controlled with <code>undefined</code></h3>

      <p>
        Going from <code>undefined</code> to a real value transitions an
        input from uncontrolled to controlled, which logs a warning. Use
        <code> &quot;&quot;</code> as the empty initial value, not{" "}
        <code>undefined</code>.
      </p>

      <h2>Adding a bulk import form</h2>

      <p>
        Time to use uncontrolled. We&apos;ll add a form that lets you
        paste in a chunk of cards (one per line, format{" "}
        <code>question | answer</code>) and import them all at once. The
        form has just one big textarea — perfect for uncontrolled
        because we only care about the final value at submit.
      </p>

      <HandsOn
        title="Add a bulk import using FormData"
        projectStep="Module 7 · Step 1"
        projectContext="A textarea where the user pastes 'question | answer' lines, one per row. On submit, you parse FormData and append the new cards. Uncontrolled because we only care about the value when they hit submit, not per-keystroke."
        steps={[
          "In `src/App.tsx`, below your `AddCardForm` component, add a `BulkImportForm`: ```tsx\nfunction BulkImportForm({ onImport }: { onImport: (cards: { question: string; answer: string }[]) => void }) {\n  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {\n    e.preventDefault();\n    const data = new FormData(e.currentTarget);\n    const text = String(data.get('cards') ?? '');\n    const parsed = text\n      .split('\\n')\n      .map((line) => line.trim())\n      .filter(Boolean)\n      .map((line) => {\n        const [question, ...rest] = line.split('|');\n        return { question: question.trim(), answer: rest.join('|').trim() };\n      })\n      .filter((c) => c.question && c.answer);\n    if (parsed.length === 0) return;\n    onImport(parsed);\n    e.currentTarget.reset();\n  }\n\n  return (\n    <details className=\"bulk-import\">\n      <summary>Bulk import...</summary>\n      <form onSubmit={handleSubmit}>\n        <textarea\n          name=\"cards\"\n          rows={6}\n          placeholder=\"What is JSX? | Syntactic sugar for React.createElement\\nWhat is a hook? | A function starting with 'use' that lets you tap into React features\"\n          defaultValue=\"\"\n        />\n        <button type=\"submit\">Import</button>\n      </form>\n    </details>\n  );\n}\n```",
          "Render it in App, below the existing `AddCardForm`: ```tsx\n<BulkImportForm\n  onImport={(parsed) => {\n    setCards(prev => [\n      ...prev,\n      ...parsed.map((c, i) => ({ ...c, id: Date.now() + i })),\n    ]);\n  }}\n/>\n```",
          "Add CSS: ```css\n.bulk-import { margin-bottom: 1rem; }\n.bulk-import summary { cursor: pointer; font-size: 0.85rem; color: #71717a; }\n.bulk-import textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d4d4d8; border-radius: 8px; font: inherit; margin-top: 0.5rem; }\n.bulk-import button { padding: 0.5rem 0.75rem; border: 0; border-radius: 8px; background: #18181b; color: white; cursor: pointer; margin-top: 0.5rem; }\n```",
          "Save. Click 'Bulk import...', paste a few `question | answer` lines, click Import. They should all appear as new cards.",
          "Notice what we *didn't* need: a useState for the textarea value, an onChange handler, a useEffect to clear it. Just `name=\"cards\"`, `defaultValue=\"\"`, FormData on submit, and the form's own `.reset()` to clear. That's the uncontrolled win.",
          "Reflect: this form would be miserable as controlled because you'd need state for every keystroke of a multi-line textarea, and you'd never use the value until submit anyway. Choose the right pattern for the job.",
        ]}
      />

      <Quiz
        question="When you write `<input value={text} />` without an `onChange`, what happens?"
        options={[
          { label: "It's a one-way input — the user types but the value reverts because React keeps overwriting it" },
          {
            label: "Same — React warns that you've created a read-only input. The DOM tries to update on input, but React forces it back to `text` on the next render.",
            correct: true,
            explanation:
              "Setting `value` without `onChange` is the classic 'why can't I type in this input' bug. React enforces the controlled pattern strictly: if you tell it the value is `text`, it'll keep the DOM in sync with `text`, even when the user types something different. Add `onChange`, or use `defaultValue` for uncontrolled.",
          },
          { label: "The input becomes uncontrolled automatically" },
          { label: "Nothing — it works fine" },
        ]}
      />

      <Quiz
        question="Why does FormData pair so well with uncontrolled inputs?"
        options={[
          { label: "FormData is React-specific and only works with React forms" },
          {
            label: "FormData reads the current values directly from the DOM, which is exactly where uncontrolled inputs store them — no need to mirror values into React state",
            correct: true,
            explanation:
              "FormData is a built-in browser API that walks the form's children and pulls out name/value pairs. With uncontrolled inputs, the DOM is the source of truth — so FormData captures everything you need at submit time without any state. Files, multi-selects, and checkbox groups just work.",
          },
          { label: "FormData is faster than state-based access" },
          { label: "Only because of React 19; older versions don't support it" },
        ]}
      />

      <ShortAnswer
        question="A form has a Submit button that should be disabled until the user has typed something in every required field. Should you use controlled or uncontrolled inputs? Why?"
        rubric={[
          "Controlled — the disabled state of the button depends on the current value of every input on every keystroke, so the values have to flow through React state",
          "With uncontrolled, you'd only have access to values at submit, which is too late to drive the disabled state",
          "Bonus: notes that the disabled-when-empty case is a textbook example of needing per-keystroke knowledge of the values, which is what controlled gives you",
        ]}
        topic="Choosing controlled vs uncontrolled based on per-keystroke needs"
      />

      <h2>What&apos;s next</h2>

      <p>
        With both patterns in your toolkit, the next lesson covers
        React 19&apos;s big form upgrade: the <code>action</code> prop on{" "}
        <code>&lt;form&gt;</code>. It builds on uncontrolled inputs and
        makes pending states, error handling, and even server submission
        feel native again.
      </p>
    </>
  );
}
