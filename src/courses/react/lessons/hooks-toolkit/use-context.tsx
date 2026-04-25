import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function UseContext() {
  return (
    <>
      <h1>useContext</h1>

      <p>
        Module 4 introduced context as the right tool when many
        components scattered across the tree need the same data, and
        composition can&apos;t flatten it. This lesson is the API and the
        idiomatic pattern: how to define a context, how to read it,
        and how to wrap it in a custom provider that gives you a clean
        API.
      </p>

      <h2>Three pieces</h2>

      <p>The context API has three parts:</p>

      <ol>
        <li>
          <code>createContext(defaultValue)</code> — defines the shape and
          a fallback for components rendered outside any provider.
        </li>
        <li>
          <code>{`<MyContext value={...}>`}</code> — a Provider that
          publishes a value to all descendants. (In React 19+ you can
          write <code>{`<MyContext>`}</code> directly; older code uses{" "}
          <code>{`<MyContext.Provider>`}</code>.)
        </li>
        <li>
          <code>useContext(MyContext)</code> — a hook any descendant
          calls to read the current value.
        </li>
      </ol>

      <h2>The simplest example</h2>

      <CodeBlock language="tsx">
        {`import { createContext, useContext, useState } from "react";

// 1. Create the context
const ThemeContext = createContext<"light" | "dark">("light");

// 2. Provide a value at the top of the tree
function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <ThemeContext value={theme}>
      <Page />
    </ThemeContext>
  );
}

// 3. Read it anywhere underneath, no props
function Header() {
  const theme = useContext(ThemeContext); // "light"
  return <h1 className={theme}>Hi.</h1>;
}`}
      </CodeBlock>

      <p>
        <code>Header</code> doesn&apos;t need a <code>theme</code> prop.
        It doesn&apos;t need its parent or grandparent to forward
        anything. It just calls <code>useContext</code> and gets
        whatever value the nearest provider published.
      </p>

      <h2>Providing functions, not just values</h2>

      <p>
        A common mistake is providing only the value, then realizing
        consumers also need to <em>change</em> it. The fix: provide an
        object with both a value and an updater:
      </p>

      <CodeBlock language="tsx">
        {`type ThemeContextValue = {
  theme: "light" | "dark";
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const value = {
    theme,
    toggle: () => setTheme(t => (t === "light" ? "dark" : "light")),
  };
  return (
    <ThemeContext value={value}>
      <Page />
    </ThemeContext>
  );
}

function ThemeButton() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("ThemeButton must be inside ThemeProvider");
  return <button onClick={ctx.toggle}>Switch ({ctx.theme})</button>;
}`}
      </CodeBlock>

      <h2>The idiomatic pattern: a custom provider + hook</h2>

      <p>
        The raw API works but boilerplate adds up. The pattern you&apos;ll
        see in real codebases wraps both into a tidy module:
      </p>

      <CodeBlock filename="ThemeContext.tsx" language="tsx">
        {`import { createContext, useContext, useState, type ReactNode } from "react";

type ThemeContextValue = {
  theme: "light" | "dark";
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const value = {
    theme,
    toggle: () => setTheme(t => (t === "light" ? "dark" : "light")),
  };
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}`}
      </CodeBlock>

      <p>
        Now consumers don&apos;t deal with the raw context at all:
      </p>

      <CodeBlock language="tsx">
        {`function App() {
  return (
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );
}

function ThemeButton() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>Switch ({theme})</button>;
}`}
      </CodeBlock>

      <p>
        The named hook (<code>useTheme</code>) gives you a clean import
        site, the &quot;must be inside provider&quot; error catches
        misuse, and the rest of the codebase doesn&apos;t care about the
        underlying context plumbing.
      </p>

      <Callout type="important" title="Always wrap context in a custom hook">
        Almost any context in a real codebase deserves a custom{" "}
        <code>useThing()</code> wrapper. It hides the imports, asserts
        the provider is present, and gives you a single chokepoint to
        change the implementation later (e.g. swap to Zustand, persist
        to localStorage). It also makes test mocking trivial.
      </Callout>

      <h2>What context is NOT</h2>

      <p>
        Three things context isn&apos;t, despite what you&apos;ll hear:
      </p>

      <h3>1. Not a state management library</h3>

      <p>
        Context distributes a value. State management libraries
        distribute, persist, derive, batch, and optimize. For a tiny
        global, context is fine. For complex shared state with frequent
        updates and many consumers, libraries like Zustand or Redux
        often perform better and have nicer DX.
      </p>

      <h3>2. Not free</h3>

      <p>
        Every consumer of a context re-renders whenever the provided
        value changes (technically, when the value reference changes by{" "}
        <code>Object.is</code>). If you put a frequently-changing object
        in context and 200 components consume it, that&apos;s 200
        re-renders per change. The fix: split into multiple smaller
        contexts, or use a state library that subscribes more granularly.
      </p>

      <h3>3. Not a substitute for prop drilling that&apos;s only one or two layers</h3>

      <p>
        Two layers of prop passing is fine. Three is fine if the
        intermediate components actually conceptually own the data.
        Reach for context when you genuinely have a cross-cutting
        concern (theme, auth, locale) — not as a reflex when any prop
        feels tedious. Module 4&apos;s composition tricks fix more cases
        than people realize.
      </p>

      <h2>Adding a theme to your flashcards</h2>

      <p>
        We&apos;ll add a light/dark toggle. The toggle button updates a
        context, the App reads it to apply a class, and any future
        component (a settings panel, a card editor) can read the same
        context without prop changes.
      </p>

      <HandsOn
        title="Add a theme context to the flashcard app"
        projectStep="Module 5 · Step 2"
        projectContext="You'll create a ThemeContext, wrap App in a ThemeProvider, and add a toggle button. The pattern is small but architecturally important — it's exactly how you'd add auth, locale, or any other app-wide value."
        steps={[
          "Create a new file `src/ThemeContext.tsx` with this content: ```tsx\nimport { createContext, useContext, useState, type ReactNode } from 'react';\n\ntype Theme = 'light' | 'dark';\ntype ThemeContextValue = { theme: Theme; toggle: () => void };\n\nconst ThemeContext = createContext<ThemeContextValue | null>(null);\n\nexport function ThemeProvider({ children }: { children: ReactNode }) {\n  const [theme, setTheme] = useState<Theme>(() => {\n    return (localStorage.getItem('theme') as Theme) || 'light';\n  });\n\n  function toggle() {\n    setTheme(t => {\n      const next = t === 'light' ? 'dark' : 'light';\n      localStorage.setItem('theme', next);\n      return next;\n    });\n  }\n\n  return <ThemeContext value={{ theme, toggle }}>{children}</ThemeContext>;\n}\n\nexport function useTheme() {\n  const ctx = useContext(ThemeContext);\n  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');\n  return ctx;\n}\n```",
          "In `src/main.tsx`, wrap `App` with `ThemeProvider`: ```tsx\nimport { ThemeProvider } from './ThemeContext';\n// ...\n<ThemeProvider>\n  <App />\n</ThemeProvider>\n```",
          "In `src/App.tsx`, read the theme inside App and apply it as a class on `<main>`: ```tsx\nimport { useTheme } from './ThemeContext';\n// ...\nexport default function App() {\n  const { theme, toggle } = useTheme();\n  // ... existing state hooks ...\n  return (\n    <main className={`app theme-${theme}`}>\n      <header className=\"app-header\">\n        <h1>Flashcards</h1>\n        <button type=\"button\" onClick={toggle} className=\"theme-toggle\">\n          {theme === 'light' ? '🌙' : '☀️'}\n        </button>\n      </header>\n      {/* rest of your existing JSX */}\n    </main>\n  );\n}\n```",
          "Add CSS for both themes to `src/App.css`: ```css\n.app-header { display: flex; justify-content: space-between; align-items: center; }\n.theme-toggle { background: transparent; border: 1px solid #d4d4d8; border-radius: 8px; padding: 0.4rem 0.6rem; font-size: 1rem; cursor: pointer; }\n\n.theme-light { background: #ffffff; color: #18181b; }\n.theme-dark { background: #18181b; color: #fafafa; }\n.theme-dark .card { background: #27272a; border-color: #3f3f46; color: #fafafa; }\n.theme-dark .card[data-accent='green'] { background: #052e16; border-color: #166534; }\n.theme-dark .search,\n.theme-dark .add-form input,\n.theme-dark .bulk-action { background: #27272a; color: #fafafa; border-color: #3f3f46; }\n```",
          "Save. Click the moon/sun toggle. The app should switch between light and dark, and the choice should persist on refresh thanks to the localStorage write inside `toggle`.",
          "Reflect: any component anywhere under `<App>` can now call `useTheme()` and get the same data without props. Imagine the prop-drilling required to do this through `Deck → List → Flashcard → Card`. Context made it free.",
        ]}
      />

      <Callout type="info" title="When to add another context">
        You'll likely want more contexts as the app grows: an{" "}
        <code>AuthContext</code> for the current user, a{" "}
        <code>SettingsContext</code> for preferences, a{" "}
        <code>NotificationsContext</code> for toasts. Each is its own
        small file with its own provider and hook, just like
        ThemeContext. Don&apos;t cram unrelated concerns into one
        mega-context — that&apos;s how you get the &quot;200 components
        re-render on a single change&quot; problem.
      </Callout>

      <Quiz
        question="A context Provider wraps your tree and provides `value={{ user, login, logout }}`. What re-renders when login is called and the user changes?"
        options={[
          { label: "Only the Provider component" },
          {
            label: "Every component that reads from this context (via useContext), regardless of where it is in the tree",
            correct: true,
            explanation:
              "Context distributes the value to all consumers. When the provided value changes (by reference), React re-renders each component that called useContext on it. This is why frequently-changing values in widely-consumed contexts can be a perf concern, and why splitting into focused contexts often helps.",
          },
          { label: "All descendants of the Provider, even if they don't consume the context" },
          { label: "Nothing — context updates don't trigger re-renders" },
        ]}
      />

      <Quiz
        question="Why is wrapping a context in a custom hook (like useTheme) considered idiomatic?"
        options={[
          { label: "It makes context faster by skipping the usual re-render flow" },
          {
            label: "It hides the implementation, asserts the provider is present, and gives you one chokepoint to change later",
            correct: true,
            explanation:
              "Custom hooks are the standard wrapper for context. Consumers import `useTheme()` instead of dealing with `useContext(ThemeContext)`, and the hook can validate the provider exists, transform the value, or be swapped for a totally different implementation without changing the consumer call sites.",
          },
          { label: "TypeScript requires it" },
          { label: "It's required for context to work in Server Components" },
        ]}
      />

      <ShortAnswer
        question="When is reaching for useContext the wrong call? Give two situations and the right alternative for each."
        rubric={[
          "Situation 1: Data only travels through 1–3 layers of components — composition (children/slot props) is lighter than introducing a context",
          "Situation 2: A frequently-changing value with many consumers — every consumer re-renders on every change; a state library with granular subscriptions (Zustand, Jotai) or splitting into multiple focused contexts handles this better",
          "Bonus: notes that context distributes a value but isn't a state library, and shouldn't be the reflex answer for any prop drilling",
        ]}
        topic="When NOT to use useContext"
      />

      <h2>What&apos;s next</h2>

      <p>
        Next up: <code>useReducer</code>. When state logic gets complex
        — multiple actions, derived state, transitions that must happen
        atomically — <code>useState</code> turns into a bowl of spaghetti.{" "}
        <code>useReducer</code> centralizes the logic into one function
        and pairs beautifully with context for app-level state. We&apos;ll
        refactor your card-management logic next.
      </p>
    </>
  );
}
