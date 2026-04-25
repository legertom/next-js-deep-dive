import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { ShortAnswer } from "@/components/short-answer";

export function TypingComponents() {
  return (
    <>
      <h1>Typing Components &amp; Hooks</h1>

      <p>
        You&apos;ve been using TypeScript with React throughout this
        course. This module collects the patterns explicitly so you
        can spot the right idiom on demand. Two short lessons. This
        one is the day-to-day stuff: props, children, events, hooks.
        The next is generic components.
      </p>

      <h2>Component props — start with a type</h2>

      <p>
        Always define a <code>Props</code> type alias (or interface)
        and destructure in the parameter:
      </p>

      <CodeBlock language="tsx">
        {`type FlashcardProps = {
  question: string;
  answer: string;
  isKnown?: boolean;        // optional
  onMarkKnown: () => void;  // function prop
};

function Flashcard({ question, answer, isKnown = false, onMarkKnown }: FlashcardProps) {
  // ...
}`}
      </CodeBlock>

      <p>
        Conventions:
      </p>

      <ul>
        <li>
          <code>type</code> vs <code>interface</code> — both work for
          props. Most React teams use <code>type</code> for
          consistency with non-component types. Pick one and stick to
          it.
        </li>
        <li>
          Default values in destructuring (<code>isKnown = false</code>)
          are cleaner than <code>?? false</code> inside the component.
        </li>
        <li>
          Function props named <code>onSomething</code> by convention.
        </li>
      </ul>

      <h2>Children: <code>React.ReactNode</code></h2>

      <CodeBlock language="tsx">
        {`type CardProps = {
  children: React.ReactNode;  // anything renderable
};

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}`}
      </CodeBlock>

      <p>
        <code>ReactNode</code> covers every renderable thing: strings,
        numbers, JSX, arrays, fragments, <code>null</code>,{" "}
        <code>undefined</code>, <code>false</code>. Almost always the
        right type for <code>children</code>. Reach for narrower types
        (<code>ReactElement</code>, <code>string</code>) only when you
        specifically need them.
      </p>

      <h2>Event handler types</h2>

      <p>
        Event handlers receive a typed event object. Use the right
        flavor:
      </p>

      <CodeBlock language="tsx">
        {`function Form() {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    // e.currentTarget is HTMLButtonElement
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value; // string
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} onKeyDown={handleKeyDown} />
      <button onClick={handleClick}>Save</button>
    </form>
  );
}`}
      </CodeBlock>

      <p>
        The pattern: <code>React.&lt;EventName&gt;Event&lt;HTMLElement&gt;</code>.
        The element type generic on the event lets TypeScript narrow
        <code>e.target</code> and <code>e.currentTarget</code>.
      </p>

      <Callout type="tip" title="Inline handlers usually need no annotation">
        When you write <code>onClick={`{(e) => ...}`}</code> inline on
        a JSX element, TypeScript infers the event type from the
        element. You only need explicit types when you extract the
        handler to a separate function.
      </Callout>

      <h2>Spreading HTML props</h2>

      <p>
        For wrapper components that decorate a native element,
        accept its full prop shape with TypeScript&apos;s built-in
        types:
      </p>

      <CodeBlock language="tsx">
        {`type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={\`btn btn-\${variant} \${className}\`}
      {...rest}
    />
  );
}

// Usage — gets all native button props for free
<Button onClick={save} disabled={loading} type="submit">Save</Button>`}
      </CodeBlock>

      <p>
        <code>React.ButtonHTMLAttributes&lt;HTMLButtonElement&gt;</code>{" "}
        is the type of every prop a native button accepts.
        Intersecting with your own props extends the surface. The{" "}
        <code>...rest</code> pattern forwards all native props
        unchanged.
      </p>

      <h2>Typing hooks</h2>

      <h3><code>useState</code></h3>

      <CodeBlock language="tsx">
        {`// Type usually inferred from initial value
const [count, setCount] = useState(0);             // number
const [name, setName] = useState("");              // string
const [user, setUser] = useState<User | null>(null); // explicit when initial is null/empty
const [items, setItems] = useState<Item[]>([]);    // explicit for empty arrays`}
      </CodeBlock>

      <p>
        TypeScript infers the type from the initial value when it
        can. Provide an explicit generic when the initial value is{" "}
        <code>null</code>, <code>undefined</code>, or an empty
        array/object that doesn&apos;t pin down the type you actually
        want.
      </p>

      <h3><code>useRef</code></h3>

      <CodeBlock language="tsx">
        {`// DOM ref — initial null, type the element
const inputRef = useRef<HTMLInputElement>(null);

// Mutable value — initial value, type inferred
const counter = useRef(0);

// Mutable value, can be reassigned to anything of type T (initial undefined)
const previousValue = useRef<number | undefined>(undefined);`}
      </CodeBlock>

      <h3><code>useReducer</code></h3>

      <CodeBlock language="tsx">
        {`type State = { cards: Card[]; knownIds: Set<number> };
type Action = { type: "add"; card: Card } | { type: "remove"; id: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":    return { ...state, cards: [...state.cards, action.card] };
    case "remove": return { ...state, cards: state.cards.filter(c => c.id !== action.id) };
  }
}

const [state, dispatch] = useReducer(reducer, initialState);
//      ^ State    ^ React.Dispatch<Action>`}
      </CodeBlock>

      <p>
        Type the state and action shapes; the hook&apos;s types come
        out of the reducer. The discriminated union of action types
        gives you exhaustive type-checking inside the reducer.
      </p>

      <h3><code>useContext</code></h3>

      <CodeBlock language="tsx">
        {`type ThemeContextValue = { theme: "light" | "dark"; toggle: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}`}
      </CodeBlock>

      <p>
        The pattern: type the context as <code>X | null</code>,
        provide the real value at the top, and assert non-null in a
        custom hook so consumers get the clean type without the null.
      </p>

      <h2>Common patterns</h2>

      <h3>Discriminated unions for component variants</h3>

      <CodeBlock language="tsx">
        {`type AlertProps =
  | { variant: "info"; message: string }
  | { variant: "error"; message: string; retry: () => void };

function Alert(props: AlertProps) {
  if (props.variant === "error") {
    return (
      <div>
        {props.message}
        <button onClick={props.retry}>Try again</button>
      </div>
    );
  }
  return <div>{props.message}</div>;
}

// Usage:
<Alert variant="info" message="Hi" />
<Alert variant="error" message="Oops" retry={() => location.reload()} />
// <Alert variant="info" message="Hi" retry={...} /> // ❌ TS error: retry not allowed`}
      </CodeBlock>

      <p>
        Discriminated unions let you make some props
        situation-specific. <code>retry</code> is required when{" "}
        <code>variant=&quot;error&quot;</code> and forbidden otherwise.
        Cleaner than optional props with manual validation.
      </p>

      <h3>Component types</h3>

      <CodeBlock language="tsx">
        {`type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
};

// React.ComponentType<P> — accepts a component that receives props P
type CardProps = { card: Card };
const cardComponents: React.ComponentType<CardProps>[] = [Flashcard, MiniCard, FlippedCard];

// React.FC — historically common, now generally avoided (implicit children prop, etc.)
// Just use a regular function with typed props.`}
      </CodeBlock>

      <p>
        <code>React.ComponentType</code> is &quot;a component that
        accepts these props&quot; — useful for component-as-prop
        patterns. Avoid <code>React.FC</code>: it implicitly adds a{" "}
        <code>children</code> prop you may not want, and most React
        style guides recommend the plain function alternative.
      </p>

      <h2>Useful built-in types, briefly</h2>

      <ul>
        <li><code>React.ReactNode</code> — anything renderable.</li>
        <li><code>React.ReactElement</code> — a JSX element specifically.</li>
        <li><code>React.ComponentType&lt;P&gt;</code> — a component accepting props P.</li>
        <li><code>React.PropsWithChildren&lt;P&gt;</code> — adds <code>children</code> to your props type.</li>
        <li><code>React.HTMLAttributes&lt;T&gt;</code> — all native props for an HTML element.</li>
        <li><code>React.CSSProperties</code> — type for an inline <code>style</code> object.</li>
        <li><code>React.Dispatch&lt;A&gt;</code> — type of a reducer dispatch.</li>
        <li><code>React.SetStateAction&lt;T&gt;</code> — type of a useState setter argument.</li>
      </ul>

      <Quiz
        question="What's the most useful default type for `children` props in component types?"
        options={[
          { label: "string" },
          {
            label: "React.ReactNode",
            correct: true,
            explanation:
              "ReactNode covers everything React knows how to render: strings, numbers, JSX elements, arrays, fragments, null, undefined, false. It's the maximally flexible type for children. Reach for narrower types only when you have a specific reason.",
          },
          { label: "JSX.Element" },
          { label: "any" },
        ]}
      />

      <Quiz
        question="When should you provide an explicit type generic to useState (e.g. `useState<User | null>(null)`)?"
        options={[
          { label: "Always — explicit types are best practice" },
          {
            label: "When the initial value doesn't pin down the full type you actually want — null, undefined, an empty array, or an empty object",
            correct: true,
            explanation:
              "TypeScript infers the type from the initial value when it can. `useState(0)` is correctly inferred as `number`. But `useState(null)` infers `null`, not `User | null` — so you'd never be able to set it to a User. Same for empty arrays/objects.",
          },
          { label: "Only for class components" },
          { label: "Only when the value will be set asynchronously" },
        ]}
      />

      <ShortAnswer
        question="A teammate writes `function Button({ children, onClick, type, disabled, className }: { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; className?: string })`. What's a cleaner way to type this so it accepts all native button props plus their additions, without re-listing every native one?"
        rubric={[
          "Use `React.ButtonHTMLAttributes<HTMLButtonElement>` to get the full native button prop surface (covers onClick, type, disabled, className, all aria-* and data-* attributes, ref, etc.)",
          "Intersect with the component's specific extras: `React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }`",
          "Spread `...rest` onto the underlying <button> to forward unchanged props, only handling the ones you care about explicitly",
        ]}
        topic="Typing wrapper components with native HTML attributes"
      />

      <h2>What&apos;s next</h2>

      <p>
        The last lesson of the course covers <strong>generic
        components</strong> — components that work with any type of
        data the consumer provides. The flashcard app&apos;s{" "}
        <code>List&lt;T&gt;</code> component from Module 4 was a small
        example; we&apos;ll go deeper on the patterns.
      </p>
    </>
  );
}
