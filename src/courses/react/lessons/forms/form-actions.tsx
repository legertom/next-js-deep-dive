import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function FormActions() {
  return (
    <>
      <h1>Form Actions</h1>

      <p>
        React 19 introduced one of the biggest form-handling upgrades in
        the library&apos;s history: a new <code>action</code> prop on{" "}
        <code>&lt;form&gt;</code>. It looks like the HTML <code>action</code>{" "}
        attribute, but it takes a JS function — and it ties together
        everything from the last few modules: uncontrolled forms,{" "}
        <code>FormData</code>, async work, and pending states.
      </p>

      <h2>The setup</h2>

      <p>
        Before React 19, every form looked the same:
      </p>

      <CodeBlock language="tsx">
        {`function AddCardForm({ onAdd }: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onAdd(question, answer);
      setQuestion("");
      setAnswer("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={question} onChange={(e) => setQuestion(e.target.value)} />
      <input value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add"}
      </button>
    </form>
  );
}`}
      </CodeBlock>

      <p>
        Three pieces of state, a try/finally for the submitting flag,
        controlled inputs you have to manually clear. That&apos;s a lot of
        ceremony for a normal form.
      </p>

      <h2>The action prop</h2>

      <p>
        React 19 lets you pass a function to <code>action</code> on a{" "}
        <code>&lt;form&gt;</code>. The function receives a{" "}
        <code>FormData</code>, can be async, and React handles the
        pending state and form reset for you:
      </p>

      <CodeBlock language="tsx">
        {`function AddCardForm({ onAdd }: Props) {
  async function addCard(formData: FormData) {
    const question = String(formData.get("question") ?? "").trim();
    const answer = String(formData.get("answer") ?? "").trim();
    if (!question || !answer) return;
    await onAdd(question, answer);
    // The form resets automatically when the action completes successfully.
  }

  return (
    <form action={addCard}>
      <input name="question" />
      <input name="answer" />
      <button type="submit">Add</button>
    </form>
  );
}`}
      </CodeBlock>

      <p>
        That&apos;s the whole component. Three pieces of state are gone.{" "}
        <code>preventDefault</code> is gone. The try/finally is gone.
        Manual reset is gone. The action just receives FormData and does
        its thing.
      </p>

      <h2>What React does for you</h2>

      <ol>
        <li>
          <strong>Prevents default form submission.</strong> The browser
          doesn&apos;t navigate. You don&apos;t need <code>preventDefault</code>.
        </li>
        <li>
          <strong>Tracks pending state.</strong> While your action is
          running, React knows the form is submitting. The next lesson
          covers how to read this state with <code>useFormStatus</code>{" "}
          and <code>useActionState</code>.
        </li>
        <li>
          <strong>Resets the form on success.</strong> When your action
          returns without throwing, React resets all uncontrolled inputs
          to their defaults. (You can opt out — see below.)
        </li>
        <li>
          <strong>Disables the form during submission.</strong>{" "}
          Specifically, repeat submissions while pending are queued or
          ignored, depending on the form&apos;s configuration.
        </li>
        <li>
          <strong>Works without JavaScript.</strong> If JS hasn&apos;t
          loaded yet (or fails), the form falls back to native
          submission. This is huge in Next.js apps where actions can be
          server-side and forms work even before hydration.
        </li>
      </ol>

      <h2>Inputs and the action prop</h2>

      <p>
        Form actions are designed for <strong>uncontrolled</strong>{" "}
        inputs. Each input needs a <code>name</code> attribute (so it
        shows up in <code>FormData</code>). You usually don&apos;t need{" "}
        <code>defaultValue</code> unless you want a starting value:
      </p>

      <CodeBlock language="tsx">
        {`<form action={addCard}>
  <input name="question" placeholder="Question" />
  <input name="answer" placeholder="Answer" />
  <input type="hidden" name="deckId" value={deckId} />
  <button type="submit">Add</button>
</form>`}
      </CodeBlock>

      <p>
        Hidden inputs are great for passing component-level data
        (<code>deckId</code>, <code>userId</code>) to the action without
        relying on closures.
      </p>

      <h2>Async actions, with no extra effort</h2>

      <p>
        The action can be <code>async</code>. React tracks its lifecycle:
      </p>

      <CodeBlock language="tsx">
        {`async function addCard(formData: FormData) {
  const data = Object.fromEntries(formData);
  await fetch("/api/cards", {
    method: "POST",
    body: JSON.stringify(data),
  });
}`}
      </CodeBlock>

      <p>
        While the fetch is in flight, React considers the form
        &quot;pending.&quot; A submit button inside the form can read
        that pending state via <code>useFormStatus</code> and show a
        spinner. We&apos;ll cover that hook next lesson.
      </p>

      <h2>Server Actions (a Next.js preview)</h2>

      <p>
        In Next.js, the action function can run on the <em>server</em> by
        adding the <code>&quot;use server&quot;</code> directive at the
        top. The form sends a network request to the server, the server
        runs the action, and React handles all the wire-up:
      </p>

      <CodeBlock language="tsx">
        {`async function addCard(formData: FormData) {
  "use server"; // marks this as a Server Action
  const question = String(formData.get("question"));
  await db.cards.create({ data: { question } });
  revalidatePath("/cards");
}

// Anywhere in your app:
<form action={addCard}>
  <input name="question" />
  <button type="submit">Add</button>
</form>`}
      </CodeBlock>

      <p>
        That&apos;s it. The form posts to the server, no API route
        needed. We&apos;ll go deep on Server Actions in Module 9 and the
        Next.js course; for now, just know the same{" "}
        <code>action</code> prop powers both client and server actions.
      </p>

      <Callout type="important" title="Why this matters">
        Form actions take ~10 lines of ceremony out of every form in
        your app. The pattern is uniform: define a function that takes
        FormData, do the work, throw on failure, return on success.
        Pending state, reset, and JS-less fallback are handled by React.
        Once you start using them, the old pattern feels archaic.
      </Callout>

      <h2>When to opt out of the auto-reset</h2>

      <p>
        Sometimes you don&apos;t want the form to reset on success — for
        example, an editor where the user keeps tweaking. To prevent the
        reset, throw to indicate failure or return a status. Or use
        controlled inputs, which aren&apos;t affected by the reset:
      </p>

      <CodeBlock language="tsx">
        {`async function save(formData: FormData) {
  const result = await api.update(formData);
  if (result.error) {
    throw new Error(result.error); // form does NOT reset
  }
  // returns successfully → form resets uncontrolled inputs
}`}
      </CodeBlock>

      <h2>Refactoring AddCardForm</h2>

      <p>
        Time to apply this. Your <code>AddCardForm</code> currently uses
        controlled inputs and a manual onSubmit. Let&apos;s convert it to
        the action API and feel the simplification.
      </p>

      <HandsOn
        title="Convert AddCardForm to use the action prop"
        projectStep="Module 7 · Step 2"
        projectContext="You'll replace the controlled inputs and onSubmit handler with a single action function. Notice how much code disappears."
        steps={[
          "In `src/App.tsx`, replace the entire `AddCardForm` component with this version: ```tsx\ntype AddCardFormProps = {\n  onAdd: (question: string, answer: string) => void;\n};\n\nfunction AddCardForm({ onAdd }: AddCardFormProps) {\n  function addCard(formData: FormData) {\n    const question = String(formData.get('question') ?? '').trim();\n    const answer = String(formData.get('answer') ?? '').trim();\n    if (!question || !answer) return;\n    onAdd(question, answer);\n    // No need to clear inputs manually — React resets the form.\n  }\n\n  return (\n    <form action={addCard} className=\"add-form\">\n      <input name=\"question\" placeholder=\"Question\" required />\n      <input name=\"answer\" placeholder=\"Answer\" required />\n      <button type=\"submit\">Add card</button>\n    </form>\n  );\n}\n```",
          "Save. Add a card. The form should clear automatically after submission, just like before — but with no useState calls, no onSubmit boilerplate, no preventDefault.",
          "Notice the new `required` attribute on the inputs. The browser handles the validation: if a field is empty, the browser blocks submit and shows its native error UI. No JS needed for basic 'must not be empty' validation. With form actions, leaning on browser features pays off because the form falls back to native submission anyway.",
          "Refactor the BulkImportForm too — it's almost there already since it was uncontrolled. Replace its `onSubmit` with `action`: ```tsx\nfunction BulkImportForm({ onImport }: { onImport: (cards: { question: string; answer: string }[]) => void }) {\n  function importCards(formData: FormData) {\n    const text = String(formData.get('cards') ?? '');\n    const parsed = text\n      .split('\\n')\n      .map((line) => line.trim())\n      .filter(Boolean)\n      .map((line) => {\n        const [question, ...rest] = line.split('|');\n        return { question: question.trim(), answer: rest.join('|').trim() };\n      })\n      .filter((c) => c.question && c.answer);\n    if (parsed.length === 0) return;\n    onImport(parsed);\n  }\n\n  return (\n    <details className=\"bulk-import\">\n      <summary>Bulk import...</summary>\n      <form action={importCards}>\n        <textarea name=\"cards\" rows={6} placeholder=\"What is JSX? | Syntactic sugar...\" />\n        <button type=\"submit\">Import</button>\n      </form>\n    </details>\n  );\n}\n```",
          "Save. Try bulk-importing. The textarea clears automatically after each import.",
          "Reflect: action functions are tiny. They take FormData, do work, return. The pattern is uniform across every form in the app. When you start writing more complex forms — validation, loading states, optimistic updates — the next lesson's hooks plug into this same shape with zero refactoring.",
        ]}
      />

      <Quiz
        question="What advantages does `<form action={fn}>` have over `<form onSubmit={handler}>`?"
        options={[
          { label: "It's faster" },
          {
            label: "React handles preventDefault, pending state, form reset on success, and progressive enhancement (working without JS) — the action is just async work that takes FormData",
            correct: true,
            explanation:
              "The action prop turns several pieces of boilerplate into framework concerns. You write the action; React wires up the lifecycle. The bonus on Next.js: the same shape works for Server Actions, so the function can move to the server with one directive change.",
          },
          { label: "It supports older browsers that onSubmit doesn't" },
          { label: "It can't be async, so it's faster" },
        ]}
      />

      <Quiz
        question="What happens to uncontrolled inputs in a form when the action completes successfully?"
        options={[
          { label: "Nothing — you have to reset them manually" },
          { label: "They keep their submitted values until the next submit" },
          {
            label: "React resets them to their defaultValue (or empty if no defaultValue is set)",
            correct: true,
            explanation:
              "Auto-reset on successful action is one of the conveniences of the action prop. Throw from the action to prevent the reset (signal failure) or use controlled inputs if you want full control over reset behavior.",
          },
          { label: "They get cleared only if you call form.reset() inside the action" },
        ]}
      />

      <ShortAnswer
        question="Why does the form action API push you toward uncontrolled inputs? What's the relationship between the action signature, FormData, and progressive enhancement?"
        rubric={[
          "Action signature is `(formData: FormData) => void | Promise<void>` — the data comes from the DOM via FormData, so inputs need names but not React state",
          "Uncontrolled fits because there's no per-keystroke React state to manage; the DOM is already the source of truth at submit time",
          "Progressive enhancement: if JS hasn't loaded, the form falls back to native HTML submission (also using FormData) — controlled inputs would not survive this fallback because they require React to be alive",
        ]}
        topic="Why form actions favor uncontrolled inputs"
      />

      <h2>What&apos;s next</h2>

      <p>
        Your forms are simpler now, but they&apos;re missing two things
        production forms need: a pending state on the submit button, and
        a way to display validation errors. Next lesson covers the three
        hooks that complete the action API:{" "}
        <code>useActionState</code>, <code>useFormStatus</code>, and{" "}
        <code>useOptimistic</code>.
      </p>
    </>
  );
}
