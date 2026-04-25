import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function ActionHooks() {
  return (
    <>
      <h1><code>useActionState</code>, <code>useFormStatus</code>, <code>useOptimistic</code></h1>

      <p>
        Last lesson got you to a clean form action. Real forms also need
        validation errors, pending states, and snappy UX. React 19 ships
        three hooks that plug into the action API with no rewiring:
      </p>

      <ul>
        <li><code>useActionState</code> — track an action&apos;s result + pending state.</li>
        <li><code>useFormStatus</code> — read pending state from any descendant of a form.</li>
        <li><code>useOptimistic</code> — show optimistic UI while an action is in flight.</li>
      </ul>

      <p>
        Each is small and composable. By the end of this lesson, your
        flashcard form will be production-grade.
      </p>

      <h2><code>useFormStatus</code> — pending state for the submit button</h2>

      <p>
        The simplest of the three. <code>useFormStatus</code> reads the
        pending state of the <em>nearest enclosing form</em> from a
        descendant component:
      </p>

      <CodeBlock language="tsx">
        {`import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add card"}
    </button>
  );
}

function AddCardForm() {
  return (
    <form action={addCard}>
      <input name="question" />
      <input name="answer" />
      <SubmitButton />  {/* reads its parent form's pending state */}
    </form>
  );
}`}
      </CodeBlock>

      <p>
        Three rules:
      </p>

      <ul>
        <li>It&apos;s imported from <code>react-dom</code>, not <code>react</code>.</li>
        <li>It only works inside a form&apos;s descendant. Hooks called <em>at</em> the form level (the same component that renders the <code>&lt;form&gt;</code>) won&apos;t see the form they&apos;re in — that&apos;s why we extract the button into its own component.</li>
        <li>It returns more than just <code>pending</code>: also <code>data</code> (the FormData being submitted), <code>method</code>, and <code>action</code>.</li>
      </ul>

      <Callout type="tip" title="Why does it have to be a child component?">
        <code>useFormStatus</code> uses React&apos;s context-like mechanism
        to read the form&apos;s state. The Provider is the form element
        itself, and like context, the Provider&apos;s parent component
        can&apos;t consume what its own children provide. Extract the
        consumer (button, status text) into a child component.
      </Callout>

      <h2><code>useActionState</code> — return values, errors, and history</h2>

      <p>
        <code>useFormStatus</code> tells you &quot;is something pending?&quot;
        It doesn&apos;t tell you what the action returned, what error it
        threw, or what the user submitted. <code>useActionState</code>{" "}
        does:
      </p>

      <CodeBlock language="tsx">
        {`import { useActionState } from "react";

type State = { error?: string };

async function addCard(prevState: State, formData: FormData): Promise<State> {
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question) return { error: "Question is required." };
  if (!answer) return { error: "Answer is required." };
  await save({ question, answer });
  return {}; // success — no error
}

function AddCardForm() {
  const [state, formAction, isPending] = useActionState(addCard, {});

  return (
    <form action={formAction}>
      <input name="question" />
      <input name="answer" />
      {state.error && <p className="error">{state.error}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}`}
      </CodeBlock>

      <p>The shape:</p>

      <ul>
        <li>
          The <strong>action</strong> takes <code>(prevState, formData)</code> and returns the new state.
        </li>
        <li>
          The <strong>hook</strong> returns <code>[state, formAction, isPending]</code>:
          current state, a wrapped action you pass to{" "}
          <code>&lt;form action&gt;</code>, and a pending boolean.
        </li>
        <li>
          The state can be anything — an error message, a success flag,
          a counter, a server response.
        </li>
      </ul>

      <Callout type="important" title="The point of prevState">
        Receiving the previous state lets the action build incrementally:
        a counter, a list of all errors so far, a streaming text response.
        For a simple form, you usually ignore <code>prevState</code> and
        just return the new state. But the API supports the full
        reducer-like shape.
      </Callout>

      <h2><code>useOptimistic</code> — instant feedback for slow actions</h2>

      <p>
        When an action involves a network round-trip, the user
        shouldn&apos;t have to wait to see their result. The optimistic
        pattern: assume success, render the new state immediately, and
        revert if the server rejects.
      </p>

      <CodeBlock language="tsx">
        {`import { useOptimistic } from "react";

function CardList({ cards, addCard }: Props) {
  const [optimisticCards, addOptimisticCard] = useOptimistic(
    cards,
    (current: Card[], pending: Card) => [...current, pending],
  );

  async function action(formData: FormData) {
    const question = String(formData.get("question") ?? "");
    const answer = String(formData.get("answer") ?? "");
    const optimistic = { id: -1, question, answer, pending: true };
    addOptimisticCard(optimistic);  // shows up immediately
    await addCard(question, answer); // network round-trip
    // optimisticCards reverts to \`cards\` on next render — but cards now
    // includes the real (saved) card, so visually nothing changes.
  }

  return (
    <>
      <form action={action}>...</form>
      {optimisticCards.map(c => <Flashcard key={c.id} card={c} />)}
    </>
  );
}`}
      </CodeBlock>

      <p>
        The hook takes the &quot;real&quot; state and a reducer that
        applies an optimistic update. While the action is running, your
        UI reads from <code>optimisticCards</code>, which includes the
        pending change. When the action finishes, React re-renders with
        the actual <code>cards</code> — which by then should reflect the
        change for real.
      </p>

      <p>
        If the action fails, you don&apos;t need to do anything special:
        the optimistic state is just discarded, and the UI reverts to
        the actual state.
      </p>

      <h2>Putting them together</h2>

      <p>
        Real production forms use these hooks together:
      </p>

      <ul>
        <li>
          <code>useActionState</code> for validation errors and the
          server response.
        </li>
        <li>
          <code>useFormStatus</code> for the submit button&apos;s pending
          state (cleaner than threading isPending through props).
        </li>
        <li>
          <code>useOptimistic</code> for instant list updates while the
          server saves.
        </li>
      </ul>

      <p>
        Each plugs into the same form action — no rewiring required.
        That&apos;s the design payoff of the React 19 form story.
      </p>

      <h2>Upgrading your AddCardForm</h2>

      <p>
        Time to make the form production-grade. We&apos;ll add validation
        errors, a pending submit button, and optimistic insertion of new
        cards. Each piece is one of the hooks.
      </p>

      <HandsOn
        title="Add validation, pending state, and optimistic updates"
        projectStep="Module 7 · Step 3"
        projectContext="You'll wire useActionState (for validation errors), useFormStatus (for the button's pending state), and useOptimistic (for instant insertion). To make the optimistic update visible, you'll add an artificial 600ms delay to simulate a server round-trip."
        steps={[
          "In `src/App.tsx`, import the new hooks: ```tsx\nimport { useActionState, useOptimistic } from 'react';\nimport { useFormStatus } from 'react-dom';\n```",
          "Replace `AddCardForm` with the production version: ```tsx\ntype AddCardFormProps = {\n  onAdd: (question: string, answer: string) => Promise<void>;\n};\n\ntype AddCardState = { error?: string };\n\nfunction SubmitButton() {\n  const { pending } = useFormStatus();\n  return (\n    <button type=\"submit\" disabled={pending}>\n      {pending ? 'Adding…' : 'Add card'}\n    </button>\n  );\n}\n\nfunction AddCardForm({ onAdd }: AddCardFormProps) {\n  async function addCard(_prev: AddCardState, formData: FormData): Promise<AddCardState> {\n    const question = String(formData.get('question') ?? '').trim();\n    const answer = String(formData.get('answer') ?? '').trim();\n    if (!question) return { error: 'Question is required.' };\n    if (!answer) return { error: 'Answer is required.' };\n    if (question.length > 200) return { error: 'Question must be under 200 characters.' };\n    await onAdd(question, answer);\n    return {};\n  }\n\n  const [state, formAction] = useActionState(addCard, {});\n\n  return (\n    <form action={formAction} className=\"add-form\">\n      <input name=\"question\" placeholder=\"Question\" />\n      <input name=\"answer\" placeholder=\"Answer\" />\n      {state.error && <p className=\"form-error\">{state.error}</p>}\n      <SubmitButton />\n    </form>\n  );\n}\n```",
          "Update App's `onAdd` callback to be async with an artificial delay so you can see the pending and optimistic states clearly: ```tsx\n<AddCardForm\n  onAdd={async (question, answer) => {\n    // Pretend this hits a server\n    await new Promise(r => setTimeout(r, 600));\n    setCards(prev => [...prev, { id: Date.now(), question, answer }]);\n  }}\n/>\n```",
          "Now wire up optimistic updates. Inside App, derive an optimistic version of `cards`: ```tsx\nconst [optimisticCards, addOptimisticCard] = useOptimistic(\n  cards,\n  (current: Card[], pending: Card) => [...current, pending],\n);\n```",
          "Update the AddCardForm `onAdd` to add an optimistic card before the await: ```tsx\nonAdd={async (question, answer) => {\n  addOptimisticCard({ id: Date.now(), question, answer });\n  await new Promise(r => setTimeout(r, 600));\n  setCards(prev => [...prev, { id: Date.now() + 1, question, answer }]);\n}}\n```",
          "Replace `cards.length` and `cards.filter(...)` etc in App's render with `optimisticCards`: any place you read `cards` for display, switch to `optimisticCards`. Keep `setCards` for actual writes.",
          "Add CSS for the error message: ```css\n.form-error { color: #dc2626; font-size: 0.85rem; margin: 0; }\n```",
          "Save and test: type a question with no answer and submit — the validation error should appear without changing the URL. Type a valid card and submit — the button shows 'Adding…' for ~600ms while the optimistic card appears immediately in the list, then the actual one replaces it after the delay.",
          "Bonus: try removing `addOptimisticCard(...)` from the onAdd. The card now takes 600ms to appear after submit. The optimistic version felt instant. That's the UX win.",
        ]}
      />

      <Callout type="info" title="Why these hooks were worth designing">
        Pre-React 19, every team rolled their own loading state, error
        state, and optimistic update logic. The patterns were
        fundamentally the same but the implementations differed —
        meaning every codebase had its own bugs around stale state,
        race conditions on rapid submits, and forgotten resets. These
        three hooks give you the same correct behavior in 5–10 lines.
      </Callout>

      <Quiz
        question="Why does `useFormStatus` only work in a form's descendant component, not in the same component that renders the form?"
        options={[
          { label: "It's a bug — they're working on a fix" },
          {
            label: "The form element provides the status; like context, a Provider's parent can't consume what its own children provide. So you extract the consumer (button, indicator) into a child component.",
            correct: true,
            explanation:
              "The form is acting like a context Provider for its own status. A component that renders the form is at the same scope as the form's parent — outside the Provider. The fix is the same as with context: extract the consumer into a child of the form.",
          },
          { label: "useFormStatus is for class components only" },
          { label: "You can put it in the parent if you wrap it in useEffect" },
        ]}
      />

      <Quiz
        question="What does `useOptimistic` do when the underlying real state changes?"
        options={[
          { label: "It permanently keeps the optimistic version" },
          {
            label: "It re-derives from the real state, discarding any optimistic updates that aren't reflected in the new real state",
            correct: true,
            explanation:
              "useOptimistic returns a derived state. When the real state changes (because your action committed), the optimistic state recomputes from the new real value. If the optimistic update made it into the real state, the user sees no flash. If the action failed and the real state didn't change, the optimistic update is simply gone.",
          },
          { label: "It throws an error if there's a conflict" },
          { label: "It triggers a reconciliation merge" },
        ]}
      />

      <ShortAnswer
        question="Imagine adding a comment in a chat app. Walk through what each of the three hooks would do for that flow: useActionState, useFormStatus, useOptimistic."
        rubric={[
          "useActionState: handles the action lifecycle — receives the form, returns validation/server error in state, and exposes a pending flag (e.g. 'Comment too long' on submit failure)",
          "useFormStatus: lets the submit button show a 'Sending...' label and a disabled state without threading isPending through props from the form's parent",
          "useOptimistic: appends the comment to the visible list immediately on submit so the user sees their message right away; if the server rejects, the optimistic message disappears as state reverts",
        ]}
        topic="The three React 19 form action hooks in a chat-comment scenario"
      />

      <h2>Module 7 wrap-up</h2>

      <p>
        Three lessons in. Forms in modern React are leaner and more
        capable than what you remember. You can choose controlled or
        uncontrolled per situation, lean on the new <code>action</code>{" "}
        prop for almost every form, and add validation, pending state,
        and optimistic UX with three small hooks. The same pattern
        works in Next.js with Server Actions — same shape, different
        runtime.
      </p>

      <p>
        Module 8 takes us back to React fundamentals one more time
        before the big &quot;React-and-Next.js-merge&quot; module.{" "}
        <strong>Suspense and Error Boundaries</strong> — declarative
        loading and error states. The mental model is unintuitive
        until it clicks; once it does, it&apos;s how you&apos;ll write
        every async UI from now on.
      </p>
    </>
  );
}
