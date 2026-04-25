import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function CustomHooks() {
  return (
    <>
      <h1>Custom Hooks</h1>

      <p>
        A <strong>custom hook</strong> is just a JavaScript function that
        starts with the word <code>use</code> and uses other hooks. There
        is no separate API. There&apos;s no list of approved patterns.
        It&apos;s a regular function. The naming convention plus the
        ability to call hooks inside is the whole concept.
      </p>

      <p>
        And yet it&apos;s the <em>most</em> useful pattern in React,
        because it&apos;s how you extract behavior the way you&apos;d
        extract any other function. Instead of repeating the same{" "}
        <code>useState + useEffect</code> dance in three components, you
        write it once as <code>useThing()</code>.
      </p>

      <h2>Your first custom hook</h2>

      <p>
        You wrote a localStorage-sync pattern back in Module 3. Let&apos;s
        package it as a hook:
      </p>

      <CodeBlock language="tsx">
        {`function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try { return JSON.parse(stored); } catch { /* fall through */ }
    }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`}
      </CodeBlock>

      <p>That&apos;s it. That&apos;s a custom hook. Use it like state:</p>

      <CodeBlock language="tsx">
        {`function App() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
  const [decks, setDecks] = useLocalStorage<Deck[]>("decks", []);
  // ...
}`}
      </CodeBlock>

      <p>
        Two persistent values, two lines. The hook handles read on
        mount, write on change, JSON parsing, and the lazy initial
        state. Whoever wrote that one function paid the complexity tax
        once for everyone.
      </p>

      <h2>The rules of hooks (still apply)</h2>

      <ul>
        <li>
          Names must start with <code>use</code> (so React/lint can find
          them and apply the rules).
        </li>
        <li>
          Only call hooks at the top level of a function. Not inside
          loops, not inside conditionals, not inside event handlers.
        </li>
        <li>
          Only call hooks from React components or other custom hooks.
        </li>
      </ul>

      <p>
        Why? React tracks hooks by call order. The first{" "}
        <code>useState</code> in your component maps to slot 1, the
        second to slot 2, etc. If conditional logic skips a hook on one
        render, the slots shift and React loses track of which state
        belongs to which hook. The lint rule{" "}
        <code>react-hooks/rules-of-hooks</code> catches violations;
        trust it.
      </p>

      <Callout type="important" title="Custom hooks compose">
        Hooks calling hooks calling hooks is how complex behavior gets
        layered cleanly. <code>useChat</code> might call{" "}
        <code>useState</code>, <code>useEffect</code>, and your custom
        <code> useDebounce</code>. That hook composition is the entire
        appeal — small focused hooks combining into bigger ones with
        zero ceremony.
      </Callout>

      <h2>Patterns by example</h2>

      <h3>useToggle — for boolean state</h3>

      <CodeBlock language="tsx">
        {`function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue] as const;
}

// Usage:
const [isOpen, toggleOpen] = useToggle();`}
      </CodeBlock>

      <h3>useDebounce — for debounced values</h3>

      <CodeBlock language="tsx">
        {`function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// Usage — replaces the manual debouncing from Module 3:
const [searchInput, setSearchInput] = useState("");
const searchTerm = useDebounce(searchInput, 300);`}
      </CodeBlock>

      <h3>useEventListener — for global listeners</h3>

      <CodeBlock language="tsx">
        {`function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (e: WindowEventMap[K]) => void,
) {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }, [event, handler]);
}

// Usage:
useEventListener("keydown", (e) => {
  if (e.key === "/") focusSearch();
});`}
      </CodeBlock>

      <h3>useChat / useSWR / useQuery — domain-specific</h3>

      <p>
        Big libraries are built on this exact pattern. The{" "}
        <code>@ai-sdk/react</code> package&apos;s <code>useChat</code> is
        a custom hook combining <code>useState</code>,{" "}
        <code>useEffect</code>, and a network connection.{" "}
        <code>useSWR</code> and <code>useQuery</code> are custom hooks
        wrapping fetch + cache + revalidation logic. Once you can write
        your own, you can read theirs.
      </p>

      <h2>What custom hooks return</h2>

      <p>
        Custom hooks can return anything. Common shapes:
      </p>

      <ul>
        <li>
          A tuple <code>[value, setter]</code> — mirrors{" "}
          <code>useState</code>. Nice when there&apos;s one main value.
        </li>
        <li>
          An object <code>{`{ data, loading, error, refetch }`}</code> —
          better when there are 3+ pieces. Named access is clearer.
        </li>
        <li>
          A single value — when the hook just computes something (e.g.{" "}
          <code>useMediaQuery(&quot;(min-width: 768px)&quot;)</code>{" "}
          returns a boolean).
        </li>
        <li>
          A void return — when the hook is purely for side effects (e.g.{" "}
          <code>useEventListener</code> attaches a listener and that&apos;s
          all the caller cares about).
        </li>
      </ul>

      <h2>What custom hooks are NOT</h2>

      <p>
        Two things they don&apos;t give you:
      </p>

      <h3>1. Shared state between components</h3>

      <p>
        Each call to a custom hook creates its own independent
        state. <code>useToggle()</code> in component A and{" "}
        <code>useToggle()</code> in component B are unrelated. If you
        want shared state, use context or a state library — not a custom
        hook.
      </p>

      <CodeBlock language="tsx">
        {`function Counter1() {
  const [count, setCount] = useCounter(); // independent
}

function Counter2() {
  const [count, setCount] = useCounter(); // also independent
}
// The two counters never share state, even though they call the same hook.`}
      </CodeBlock>

      <h3>2. Component code organization</h3>

      <p>
        Don&apos;t extract a hook just to move logic out of a long
        component. Extract a hook when the logic is <em>genuinely
        reusable</em> across components, or when the logic forms a
        cohesive concept (&quot;the data fetching for users&quot;) that
        deserves to be testable in isolation. Otherwise, just write a
        helper function or split the component.
      </p>

      <h2>Extracting useLocalStorage</h2>

      <p>
        Last big refactor of the module. We&apos;ll extract the
        localStorage logic from your <code>App</code> and your{" "}
        <code>ThemeProvider</code> into a single <code>useLocalStorage</code>{" "}
        hook. Two reads-on-mount, two writes-on-change → one hook.
      </p>

      <HandsOn
        title="Extract a useLocalStorage custom hook"
        projectStep="Module 5 · Step 4"
        projectContext="You'll create a generic useLocalStorage hook that handles read, write, and JSON serialization. Then refactor your existing localStorage usage to use it. After this, persisting any new state is a one-line operation."
        steps={[
          "Create `src/useLocalStorage.ts` with this content: ```ts\nimport { useState, useEffect } from 'react';\n\nexport function useLocalStorage<T>(key: string, initial: T) {\n  const [value, setValue] = useState<T>(() => {\n    const stored = localStorage.getItem(key);\n    if (stored !== null) {\n      try { return JSON.parse(stored) as T; } catch { /* fall through */ }\n    }\n    return initial;\n  });\n\n  useEffect(() => {\n    localStorage.setItem(key, JSON.stringify(value));\n  }, [key, value]);\n\n  return [value, setValue] as const;\n}\n```",
          "Refactor `ThemeContext.tsx` to use it. Replace the manual `useState` + `localStorage.setItem` logic with: ```tsx\nimport { useLocalStorage } from './useLocalStorage';\n\nexport function ThemeProvider({ children }: { children: ReactNode }) {\n  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');\n  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));\n  return <ThemeContext value={{ theme, toggle }}>{children}</ThemeContext>;\n}\n```",
          "Note that `ThemeContext.tsx` no longer needs to think about localStorage — the hook handles it.",
          "Refactor App's card persistence next. The reducer's lazy initialization needs to read from storage, but the write happens via useEffect. Replace the read+write pair with the hook: ```tsx\n// Replace your existing useReducer call AND the localStorage useEffect.\n// The useLocalStorage hook handles the storage round-trip on its own.\n\n// Step a: store the cards array via useLocalStorage\nconst [cards, setCards] = useLocalStorage<Card[]>('flashcards', [\n  { id: 1, question: 'What is a React Element?', answer: 'A plain JS object that describes UI.' },\n  { id: 2, question: 'What does className do?', answer: \"It's React's class attribute. Renamed because class is a JS reserved word.\" },\n]);\n\n// Step b: keep knownIds as plain useState (we don't persist it)\nconst [knownIds, setKnownIds] = useState<Set<number>>(new Set());\n```",
          "Now you have a choice: keep the reducer pattern from Module 5 Lesson 3, or simplify back to direct state setters. For learning purposes the reducer is great; for the rest of the course we'll keep it simpler with direct setters. Replace dispatches with direct setter calls: `dispatch({ type: 'add', question, answer })` becomes `setCards(prev => [...prev, { id: Date.now(), question, answer }])`, and so on. Or just delete the old useReducer block and copy this complete updated App body: refer to the Custom Hooks section in your reference notes for the full pattern.",
          "Delete the old `useEffect(() => { localStorage.setItem('flashcards', ...) }, [cards])` — useLocalStorage handles it.",
          "Save. Add a card, refresh — it persists. Toggle the theme, refresh — it persists. Both with one hook. That's the win.",
          "Bonus: extract the keyboard listener from Lesson 1 into a `useKeyboardShortcut(key, handler)` hook in `src/useKeyboardShortcut.ts`. Use it from App: `useKeyboardShortcut('/', () => searchRef.current?.focus())`. Notice how the App's useEffect noise drops while the behavior stays identical.",
        ]}
      />

      <Quiz
        question="What's the difference between a custom hook and a regular utility function?"
        options={[
          { label: "Custom hooks are slower because they go through React's hook machinery" },
          {
            label: "Custom hooks can call other hooks (useState, useEffect, useContext, etc.); regular functions cannot",
            correct: true,
            explanation:
              "That's the only meaningful technical difference. The 'use' prefix is convention plus a signal to the linter to enforce the rules of hooks. If your function doesn't use any hooks, it's just a function — name it whatever you want.",
          },
          { label: "Custom hooks must return JSX; regular functions don't" },
          { label: "Custom hooks share state across components; regular functions don't" },
        ]}
      />

      <Quiz
        question="`useToggle()` is called in Component A and in Component B. Are they sharing state?"
        options={[
          {
            label: "No — each call creates its own independent state, just like useState",
            correct: true,
            explanation:
              "Custom hooks don't create shared state. They're just composable pieces of logic. Each call gets its own state slots. To share state across components, lift it up, use context, or use a state library — never assume two custom-hook calls are connected.",
          },
          { label: "Yes — that's the whole point of custom hooks" },
          { label: "Only if Component A is an ancestor of Component B" },
          { label: "Only if you wrap them in a Provider" },
        ]}
      />

      <ShortAnswer
        question="You're tempted to write a custom hook to organize a component's local logic, even though no other component will use it. Should you? What's the right rule of thumb for when to extract a hook?"
        rubric={[
          "Don't extract a hook purely for code organization — split the component or extract a helper function instead",
          "Extract when the logic is genuinely reusable across components OR when it represents a cohesive concept worth testing in isolation",
          "Bonus: notes that 'extracting a custom hook just to shorten a component' often hides logic without making it any more reusable, and that hook composition is best used to package real reusable behavior",
        ]}
        topic="When to extract a custom hook vs split the component"
      />

      <h2>Module 5 wrap-up</h2>

      <p>
        Five hooks down: <code>useState</code>, <code>useEffect</code>,{" "}
        <code>useRef</code>, <code>useContext</code>,{" "}
        <code>useReducer</code>, plus the meta-pattern of custom hooks.
        That&apos;s the entire core hook surface. Anything else
        (<code>useMemo</code>, <code>useCallback</code>,{" "}
        <code>useTransition</code>, <code>useDeferredValue</code>) is a
        specialization for performance or concurrency. We&apos;ll cover
        them in Modules 10 and 11.
      </p>

      <p>
        Module 6 zooms back out: how lists work, why keys matter, and
        how reconciliation actually decides what to update. It&apos;s a
        short module that fills in a piece you&apos;ve been using
        intuitively (<code>.map()</code> + <code>key</code>) but
        haven&apos;t fully understood.
      </p>
    </>
  );
}
