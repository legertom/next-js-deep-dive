import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function UseReducer() {
  return (
    <>
      <h1>useReducer</h1>

      <p>
        <code>useReducer</code> is <code>useState</code>&apos;s cousin
        for when state logic gets complex. Instead of multiple{" "}
        <code>useState</code> calls scattered across handlers, you have
        one state object and one function (a <strong>reducer</strong>)
        that handles every transition. It&apos;s the same idea as Redux,
        scoped to a single component.
      </p>

      <h2>The shape</h2>

      <CodeBlock language="tsx">
        {`const [state, dispatch] = useReducer(reducer, initialState);

// state    — the current value
// dispatch — call dispatch(action) to update state
// reducer  — a function (state, action) => newState`}
      </CodeBlock>

      <p>
        Three ingredients:
      </p>

      <ol>
        <li>
          A <strong>state</strong> object holding all the related data.
        </li>
        <li>
          A <strong>reducer</strong> function: takes the current state
          and an action, returns the new state. Pure — no side effects,
          no mutations.
        </li>
        <li>
          <strong>Dispatch</strong>: the function you call to fire an
          action. React then calls the reducer with the current state
          and your action.
        </li>
      </ol>

      <h2>useState vs useReducer side by side</h2>

      <p>Counter with useState:</p>

      <CodeBlock language="tsx">
        {`function Counter() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>-</button>
      <button onClick={() => setCount(0)}>reset</button>
      <p>{count}</p>
    </>
  );
}`}
      </CodeBlock>

      <p>Same counter with useReducer:</p>

      <CodeBlock language="tsx">
        {`type Action = { type: "increment" } | { type: "decrement" } | { type: "reset" };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "increment": return state + 1;
    case "decrement": return state - 1;
    case "reset":     return 0;
  }
}

function Counter() {
  const [count, dispatch] = useReducer(reducer, 0);
  return (
    <>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <button onClick={() => dispatch({ type: "reset" })}>reset</button>
      <p>{count}</p>
    </>
  );
}`}
      </CodeBlock>

      <p>
        For a counter, this is overkill. The reducer&apos;s value
        becomes obvious as state grows.
      </p>

      <h2>Where useReducer wins</h2>

      <p>Three signs you&apos;ve outgrown useState:</p>

      <ul>
        <li>
          <strong>Many useStates that always change together.</strong>{" "}
          Every action touches 4 useStates in sequence — easy to forget
          one and create an inconsistent state.
        </li>
        <li>
          <strong>Updates that depend on multiple pieces of state.</strong>{" "}
          &quot;If filter is X and sort is Y, then change Z.&quot;
          Spread across handlers, the logic is hard to follow.
        </li>
        <li>
          <strong>State transitions you want to test or trace.</strong>{" "}
          Reducers are pure functions — easy to unit test, easy to log,
          easy to time-travel.
        </li>
      </ul>

      <h2>A flashcard reducer</h2>

      <p>
        Your current app has <code>cards</code>, <code>knownIds</code>,
        and a few handlers. Each is fine alone but related changes are
        spread across multiple handlers (<code>setCards</code>,{" "}
        <code>setKnownIds</code>). A reducer collects them:
      </p>

      <CodeBlock language="tsx">
        {`type Card = { id: number; question: string; answer: string };

type State = {
  cards: Card[];
  knownIds: Set<number>;
};

type Action =
  | { type: "add"; question: string; answer: string }
  | { type: "remove"; id: number }
  | { type: "markKnown"; id: number }
  | { type: "markAllKnown" }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":
      return {
        ...state,
        cards: [
          ...state.cards,
          { id: Date.now(), question: action.question, answer: action.answer },
        ],
      };
    case "remove":
      return {
        cards: state.cards.filter(c => c.id !== action.id),
        knownIds: new Set([...state.knownIds].filter(id => id !== action.id)),
      };
    case "markKnown":
      return {
        ...state,
        knownIds: new Set(state.knownIds).add(action.id),
      };
    case "markAllKnown":
      return {
        ...state,
        knownIds: new Set(state.cards.map(c => c.id)),
      };
    case "reset":
      return { ...state, knownIds: new Set() };
  }
}`}
      </CodeBlock>

      <p>
        Now every state mutation is documented in one place. Adding a
        new action means adding a case. Removing an action means
        removing a case. The component just dispatches:
      </p>

      <CodeBlock language="tsx">
        {`const [state, dispatch] = useReducer(reducer, initialState);

<button onClick={() => dispatch({ type: "markKnown", id: card.id })}>
  Mark as known
</button>

<button onClick={() => dispatch({ type: "markAllKnown" })}>
  Mark all
</button>`}
      </CodeBlock>

      <h2>Lazy initialization</h2>

      <p>
        Like <code>useState</code>, <code>useReducer</code> supports a
        lazy initializer for expensive setup (e.g., reading from
        localStorage):
      </p>

      <CodeBlock language="tsx">
        {`function init(): State {
  const stored = localStorage.getItem("cards");
  const cards = stored ? JSON.parse(stored) : [];
  return { cards, knownIds: new Set() };
}

const [state, dispatch] = useReducer(reducer, undefined, init);
//                                              ^^^^^^^^^  third arg: lazy init
//                       ^^^^^^^^^  second arg: initial arg passed to init`}
      </CodeBlock>

      <h2>useReducer + useContext = small Redux</h2>

      <p>
        The combination of <code>useReducer</code> in a context Provider
        is the canonical &quot;state management without a library&quot;
        recipe. The Provider holds the state and dispatch. Any consumer
        reads either or both via the hook.
      </p>

      <CodeBlock language="tsx">
        {`type CardsContextValue = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

const CardsContext = createContext<CardsContextValue | null>(null);

export function CardsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  return <CardsContext value={{ state, dispatch }}>{children}</CardsContext>;
}

export function useCards() {
  const ctx = useContext(CardsContext);
  if (!ctx) throw new Error("useCards must be inside CardsProvider");
  return ctx;
}`}
      </CodeBlock>

      <p>
        For app-wide state, this is often the simplest option. No
        external library, no boilerplate, just two hooks composed. We
        won&apos;t go all-in on it for the flashcard app — but
        we&apos;ll use the reducer.
      </p>

      <h2>Refactoring to a reducer</h2>

      <HandsOn
        title="Move card state into a reducer"
        projectStep="Module 5 · Step 3"
        projectContext="You'll combine cards and knownIds into one state object managed by a reducer. The number of state hooks in App drops, transitions become atomic, and adding a 'remove card' button becomes a one-line change."
        steps={[
          "In `src/App.tsx`, add `useReducer` to the React import: ```tsx\nimport { useState, useEffect, useRef, useReducer } from 'react';\n```",
          "Above your `App` component, define the types, initial state, and reducer: ```tsx\ntype Card = { id: number; question: string; answer: string };\ntype CardsState = { cards: Card[]; knownIds: Set<number> };\ntype CardsAction =\n  | { type: 'add'; question: string; answer: string }\n  | { type: 'remove'; id: number }\n  | { type: 'markKnown'; id: number }\n  | { type: 'markAllKnown' }\n  | { type: 'resetKnown' };\n\nfunction cardsReducer(state: CardsState, action: CardsAction): CardsState {\n  switch (action.type) {\n    case 'add':\n      return { ...state, cards: [...state.cards, { id: Date.now(), question: action.question, answer: action.answer }] };\n    case 'remove':\n      return {\n        cards: state.cards.filter(c => c.id !== action.id),\n        knownIds: new Set([...state.knownIds].filter(id => id !== action.id)),\n      };\n    case 'markKnown':\n      return { ...state, knownIds: new Set(state.knownIds).add(action.id) };\n    case 'markAllKnown':\n      return { ...state, knownIds: new Set(state.cards.map(c => c.id)) };\n    case 'resetKnown':\n      return { ...state, knownIds: new Set() };\n  }\n}\n\nfunction initCards(): CardsState {\n  const stored = localStorage.getItem('flashcards');\n  if (stored) {\n    try { return { cards: JSON.parse(stored), knownIds: new Set() }; } catch { /* fall through */ }\n  }\n  return {\n    cards: [\n      { id: 1, question: 'What is a React Element?', answer: 'A plain JS object that describes UI.' },\n      { id: 2, question: 'What does className do?', answer: \"It's React's class attribute. Renamed because class is a JS reserved word.\" },\n    ],\n    knownIds: new Set(),\n  };\n}\n```",
          "Inside App, replace the two old hooks (`const [cards, setCards] = ...` and `const [knownIds, setKnownIds] = ...`) and the `markKnown` helper with: ```tsx\nconst [state, dispatch] = useReducer(cardsReducer, undefined, initCards);\nconst { cards, knownIds } = state;\n```",
          "Update the localStorage effect to listen on `cards`: ```tsx\nuseEffect(() => {\n  localStorage.setItem('flashcards', JSON.stringify(cards));\n}, [cards]);\n```",
          "Update the AddCardForm callback: ```tsx\n<AddCardForm onAdd={(question, answer) => dispatch({ type: 'add', question, answer })} />\n```",
          "Update the Flashcard `onMarkKnown` to dispatch: ```tsx\nonMarkKnown={() => dispatch({ type: 'markKnown', id: card.id })}\n```",
          "Update the 'Mark all as known' button: ```tsx\nonClick={() => dispatch({ type: 'markAllKnown' })}\n```",
          "Add a 'Reset known' button next to it: ```tsx\n<button\n  type=\"button\"\n  className=\"bulk-action\"\n  onClick={() => dispatch({ type: 'resetKnown' })}\n  disabled={knownIds.size === 0}\n>\n  Reset progress\n</button>\n```",
          "Save. Test all the actions: add a card, mark some as known, mark all, reset, mark again. Everything still works, but now App is much simpler — one source of truth for cards state, and every transition is documented in the reducer.",
          "Bonus: add a delete button to Flashcard. Add an `onRemove` prop, render an X button in the corner that fires `dispatch({ type: 'remove', id: card.id })`. Notice how trivial it is to add a new action — the reducer is the only place you need to think about it.",
        ]}
      />

      <Quiz
        question="What's the contract a reducer function must follow?"
        options={[
          { label: "Take state and action, mutate state in place, return nothing" },
          {
            label: "Take state and action, return a new state. Pure function: no side effects, no mutations of input",
            correct: true,
            explanation:
              "Reducers are pure functions. They must return a new state object (or the same one if nothing changed) without mutating the inputs. This is what lets React skip re-renders when nothing changed and what makes reducers easy to test and reason about.",
          },
          { label: "Take state, action, and dispatch; can call dispatch recursively" },
          { label: "Take state and action, but it can be async — useReducer awaits the result" },
        ]}
      />

      <Quiz
        question="When is useReducer better than useState?"
        options={[
          { label: "Always — useReducer is just useState with a different API" },
          { label: "Whenever you have more than one piece of state" },
          {
            label: "When state logic is complex: many transitions, transitions that touch multiple values atomically, or logic you want to test in isolation",
            correct: true,
            explanation:
              "useState is fine for simple stuff. Reach for useReducer when transitions span multiple values (and you keep forgetting to update them all together), or when you want one centralized place for the logic that's testable as a pure function.",
          },
          { label: "When you need to share state across components — useReducer is built for that" },
        ]}
      />

      <ShortAnswer
        question="In your flashcard app, the `remove` action updates both `cards` and `knownIds` in one transition. Why is putting that logic in a reducer better than splitting it across two `setState` calls?"
        rubric={[
          "Atomic transition: the reducer returns one new state object containing both updated cards and updated knownIds, so the two changes apply in the same render — no intermediate state where cards is updated but knownIds isn't",
          "Centralized logic: the rule 'when removing a card, also clean it from knownIds' lives in one place; with two setStates spread across handlers, this logic could easily get forgotten in another handler",
          "Bonus: reducers are pure functions, which are easy to unit-test in isolation — you can test 'remove the card with id 3' without rendering anything",
        ]}
        topic="Why useReducer for atomic, multi-value state transitions"
      />

      <h2>What&apos;s next</h2>

      <p>
        You now have <code>useState</code>, <code>useEffect</code>,{" "}
        <code>useRef</code>, <code>useContext</code>, and{" "}
        <code>useReducer</code>. The next lesson is the &quot;extract
        these into reusable patterns&quot; lesson: <strong>custom
        hooks</strong>. They&apos;re how you take any combination of
        these primitives and package them into a tidy{" "}
        <code>useThing()</code> with its own API.
      </p>
    </>
  );
}
