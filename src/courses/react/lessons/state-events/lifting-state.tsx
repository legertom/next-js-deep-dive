import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function LiftingState() {
  return (
    <>
      <h1>Lifting State Up</h1>

      <p>
        Each component you&apos;ve written so far holds its own state.
        That&apos;s great when state is truly local — like whether one
        flashcard is flipped. It breaks down the moment two components
        need to <em>agree</em> on something. This lesson is about the
        pattern React uses to solve that:{" "}
        <strong>lift the state to the closest common parent</strong>, then
        pass it down.
      </p>

      <h2>The problem</h2>

      <p>
        Imagine your flashcard app gains a &quot;study mode&quot; with a
        progress counter at the top: &quot;Card 3 of 12 · 7 known.&quot;
        Each card has a &quot;Mark as known&quot; button. The counter and
        the cards both need to know which cards are marked.
      </p>

      <p>If you put the &quot;known&quot; flag inside each Flashcard:</p>

      <CodeBlock language="tsx">
        {`function Flashcard({ question, answer }) {
  const [isKnown, setIsKnown] = useState(false); // local
  // ...
}`}
      </CodeBlock>

      <p>
        ...the counter at the top has no way to read those values. State
        in <code>Flashcard</code> is invisible to its siblings and to its
        parent. <strong>Data flows down through props, never up or
        sideways.</strong>
      </p>

      <h2>The solution</h2>

      <p>
        Move the state up to the closest component that contains both the
        counter and the cards — likely <code>App</code>. Then pass it
        down as props. The diagram:
      </p>

      <CodeBlock language="text">
        {`Before:                          After:
                                                   App  (owns: cards array
       App                                              owns: which cards are known)
      / | \\                                       / | \\
     /  |  \\                                     /  |  \\
  Counter  Flashcard                          Counter  Flashcard  Flashcard
  (no data!)  (knows itself)                  (gets count          (gets isKnown,
                                               from App)            onMark from App)`}
      </CodeBlock>

      <h3>The two-way pattern: data down, callbacks up</h3>

      <p>
        This is the most-used pattern in all of React, so look at it
        carefully:
      </p>

      <CodeBlock language="tsx">
        {`function App() {
  const [cards, setCards] = useState<Card[]>(initial);
  const [knownIds, setKnownIds] = useState<Set<number>>(new Set());

  function markKnown(id: number) {
    setKnownIds(prev => new Set(prev).add(id));
  }

  return (
    <div>
      <Counter total={cards.length} known={knownIds.size} />
      {cards.map(card => (
        <Flashcard
          key={card.id}
          question={card.question}
          answer={card.answer}
          isKnown={knownIds.has(card.id)}    // data DOWN
          onMarkKnown={() => markKnown(card.id)}  // callback to push UP
        />
      ))}
    </div>
  );
}

function Counter({ total, known }: { total: number; known: number }) {
  return <p>{known} of {total} known</p>;
}

function Flashcard({ question, answer, isKnown, onMarkKnown }) {
  const [isFlipped, setIsFlipped] = useState(false); // STILL local — only this card cares

  return (
    <div>
      <button onClick={() => setIsFlipped(f => !f)}>{isFlipped ? answer : question}</button>
      <button onClick={onMarkKnown} disabled={isKnown}>
        {isKnown ? "✓ Known" : "Mark as known"}
      </button>
    </div>
  );
}`}
      </CodeBlock>

      <p>The flow when the user clicks &quot;Mark as known&quot;:</p>

      <ol>
        <li>The button&apos;s <code>onClick</code> runs <code>onMarkKnown</code>.</li>
        <li><code>onMarkKnown</code> is the arrow function App passed in: <code>{"() => markKnown(card.id)"}</code>.</li>
        <li>That calls <code>markKnown(id)</code> in App, which calls <code>setKnownIds</code>.</li>
        <li>App re-renders. New <code>knownIds.size</code> flows down to <code>Counter</code> as a new <code>known</code> prop.</li>
        <li>The <code>isKnown</code> prop also flows down to that <code>Flashcard</code>, flipping it to &quot;✓ Known&quot;.</li>
      </ol>

      <Callout type="important" title="The shape of the pattern">
        <strong>Props go down. Events go up.</strong> A child cannot
        directly modify its parent&apos;s state — it can only call a
        function the parent gave it. That function is the parent&apos;s
        decision about what to do with the event. The parent stays in
        control.
      </Callout>

      <h2>Single source of truth</h2>

      <p>
        The principle behind lifting is &quot;single source of truth&quot;.
        For any piece of state, exactly one component owns it. Everyone
        else either receives it as a prop or asks the owner to change it
        via a callback. Two components shouldn&apos;t hold copies of the
        same state — they&apos;ll go out of sync.
      </p>

      <p>This is wrong:</p>

      <CodeBlock language="tsx">
        {`function App() {
  const [cards, setCards] = useState([]);
  const [count, setCount] = useState(0); // duplicated state — derived from cards.length

  function addCard(c) {
    setCards(prev => [...prev, c]);
    setCount(prev => prev + 1); // DON'T do this — easy to drift
  }
}`}
      </CodeBlock>

      <p>
        <code>count</code> is <em>derived</em> from <code>cards.length</code>.
        If you have it in two places, one will eventually disagree. Just
        derive it where you need it:
      </p>

      <CodeBlock language="tsx">
        {`const count = cards.length; // computed every render — always correct`}
      </CodeBlock>

      <Callout type="tip" title="Rule: don't store what you can compute">
        If a value can be calculated from props or other state, calculate
        it during render. Storing &quot;known count&quot; when you can
        compute it from <code>knownIds.size</code>, or storing
        &quot;filtered list&quot; when you can compute it from
        <code> cards</code> + <code>filter</code> — these are bugs waiting
        to happen.
      </Callout>

      <h2>When NOT to lift</h2>

      <p>
        Don&apos;t lift state that&apos;s genuinely local. The{" "}
        <code>isFlipped</code> state belongs in <code>Flashcard</code>
        because no other component cares about it. Lifting it to{" "}
        <code>App</code> would mean App holding 100 flip flags for 100
        cards, when only the card itself ever needs to know. Keep state
        as low as possible. Lift only when you must.
      </p>

      <p>The decision tree:</p>

      <ul>
        <li>Does any other component need to read this value? → maybe lift.</li>
        <li>Does any other component need to change it? → definitely lift.</li>
        <li>Otherwise → keep it local.</li>
      </ul>

      <h2>What about really deep trees?</h2>

      <p>
        Lifting works great for a few levels. When the same prop has to
        thread through 5+ components that don&apos;t care about it, you
        get <strong>prop drilling</strong>, which gets tedious. Module 4
        covers a composition trick that flattens that. Module 5&apos;s{" "}
        <code>useContext</code> covers the &quot;broadcast&quot; tool for
        truly app-wide values like theme or current user. For most cases,
        though, plain props are enough — and they&apos;re always the right
        first answer.
      </p>

      <h2>Adding a study counter to your app</h2>

      <p>
        Time to apply the pattern. You&apos;ll add a counter at the top
        showing total cards and how many you&apos;ve marked as known. The
        counter and each card both need to read this state, so it has to
        live in <code>App</code>.
      </p>

      <HandsOn
        title="Lift state into App for a study counter"
        projectStep="Module 2 · Step 3"
        projectContext="You'll add a Set of 'known' card IDs to App's state, render a counter at the top, and pass isKnown + onMarkKnown into each Flashcard. The flipped state stays local — only known status gets lifted."
        steps={[
          "In `src/App.tsx`, add a new `useState` to App (above the cards state): ```tsx\nconst [knownIds, setKnownIds] = useState<Set<number>>(new Set());\n```",
          "Add a helper inside App, above the return: ```tsx\nfunction markKnown(id: number) {\n  setKnownIds(prev => new Set(prev).add(id));\n}\n```",
          "Add a `Counter` component below the existing components: ```tsx\nfunction Counter({ total, known }: { total: number; known: number }) {\n  return (\n    <p className=\"counter\">\n      {known} of {total} known\n    </p>\n  );\n}\n```",
          "Update `Flashcard` to accept the lifted props. Replace its signature and add a Mark button: ```tsx\ntype FlashcardProps = {\n  question: string;\n  answer: string;\n  isKnown: boolean;\n  onMarkKnown: () => void;\n};\n\nfunction Flashcard({ question, answer, isKnown, onMarkKnown }: FlashcardProps) {\n  const [isFlipped, setIsFlipped] = useState(false);\n\n  return (\n    <div className=\"flashcard\" data-known={isKnown}>\n      <button\n        type=\"button\"\n        className=\"flashcard-face\"\n        onClick={() => setIsFlipped(f => !f)}\n      >\n        <p className=\"flashcard-label\">{isFlipped ? 'Answer' : 'Question'}</p>\n        <p className=\"flashcard-text\">{isFlipped ? answer : question}</p>\n      </button>\n      <button\n        type=\"button\"\n        className=\"flashcard-mark\"\n        onClick={onMarkKnown}\n        disabled={isKnown}\n      >\n        {isKnown ? '✓ Known' : 'Mark as known'}\n      </button>\n    </div>\n  );\n}\n```",
          "Update App's JSX to render the counter and pass the new props down: ```tsx\nreturn (\n  <main className=\"app\">\n    <h1>Flashcards</h1>\n    <Counter total={cards.length} known={knownIds.size} />\n    <AddCardForm onAdd={(question, answer) => {\n      setCards(prev => [...prev, { id: Date.now(), question, answer }]);\n    }} />\n    {cards.map(card => (\n      <Flashcard\n        key={card.id}\n        question={card.question}\n        answer={card.answer}\n        isKnown={knownIds.has(card.id)}\n        onMarkKnown={() => markKnown(card.id)}\n      />\n    ))}\n  </main>\n);\n```",
          "Add a few CSS rules: ```css\n.counter { font-size: 0.9rem; color: #71717a; margin: 0 0 1rem; }\n.flashcard[data-known='true'] { border-color: #86efac; background: #f0fdf4; }\n.flashcard-face { all: unset; cursor: pointer; padding: 1.25rem; display: block; }\n.flashcard-mark { width: 100%; padding: 0.5rem; border: 0; border-top: 1px solid #e4e4e7; background: transparent; cursor: pointer; font: inherit; color: #18181b; }\n.flashcard-mark:disabled { color: #16a34a; cursor: default; }\n```",
          "Save. Click 'Mark as known' on a card — its background should turn green and the counter at the top should increment. Mark another. Counter goes up. Click flip on a marked card — it still flips, because the flipped state is still local. Two pieces of state, two scopes, one app.",
        ]}
      />

      <Callout type="info" title="What you just felt">
        Notice the asymmetry: <code>isFlipped</code> stayed in{" "}
        <code>Flashcard</code> because nothing else cares. <code>knownIds</code>{" "}
        moved up to <code>App</code> because the counter needs it. Same
        component, two pieces of state, different homes. That&apos;s the
        thinking that scales.
      </Callout>

      <Quiz
        question="Two sibling components need to display the same value. Where should that value's state live?"
        options={[
          { label: "In one of the siblings, with the other reading it via... some way (this doesn't actually work)" },
          {
            label: "In their closest common parent, passed down to both as props",
            correct: true,
            explanation:
              "This is lifting state up. Data flows down through props in React, never up or sideways. The closest ancestor that contains both siblings is the natural owner.",
          },
          { label: "In a global variable outside any component" },
          { label: "Duplicated in both, kept in sync via setInterval" },
        ]}
      />

      <Quiz
        question="A child component wants to update state that lives in its parent. How does it do that?"
        options={[
          { label: "By directly accessing parent.state and mutating it" },
          { label: "By dispatching a custom DOM event" },
          {
            label: "By calling a callback function the parent passed in as a prop",
            correct: true,
            explanation:
              "Props go down, events go up. The parent owns the state and exposes a function the child can call. The child doesn't know it's updating parent state — it just knows it's calling onAdd or onMarkKnown. The parent decides what that means.",
          },
          { label: "Children can't update parent state — they need to use context" },
        ]}
      />

      <ShortAnswer
        question="In your flashcard app, why does `isFlipped` stay local to each Flashcard while `knownIds` got lifted up to App? Apply the rule from this lesson."
        rubric={[
          "isFlipped is only relevant to that one card — no other component reads or changes it, so it stays local",
          "knownIds is needed by both the Counter (to display known/total) and each Flashcard (to show its own marked status), so it has to live in their closest common ancestor (App)",
          "The general rule: lift state when more than one component needs to read or change it, otherwise keep it as local as possible",
        ]}
        topic="When to lift state vs keep it local"
      />

      <h2>Module 2 wrap-up</h2>

      <p>
        You&apos;ve gone from static JSX to a real interactive app: cards
        that flip, a form that adds new cards, a counter that tracks
        progress. Three modules in, your flashcard playground is starting
        to look like a real product.
      </p>

      <p>
        Next module shifts gears: <strong>effects</strong>. So far
        everything we&apos;ve done lives entirely inside React. But real
        apps need to talk to the world outside — localStorage, fetch,
        timers, subscriptions. <code>useEffect</code> is how you do that
        without breaking purity. It&apos;s also the most-misused hook in
        React, so we&apos;ll spend a whole lesson on when <em>not</em> to
        use it.
      </p>
    </>
  );
}
