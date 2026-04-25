import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function GenericComponents() {
  return (
    <>
      <h1>Generic Components</h1>

      <p>
        Welcome to the last lesson of the React course. Generic
        components — components parameterized by a type — are the
        capstone for typed React. They&apos;re how you build a{" "}
        <code>List</code>, <code>Select</code>, <code>Table</code>, or{" "}
        <code>Combobox</code> that works with any kind of data while
        keeping full type safety from the items all the way through
        to the render functions.
      </p>

      <h2>The shape</h2>

      <p>
        A generic component is a function with a type parameter:
      </p>

      <CodeBlock language="tsx">
        {`type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
};

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}</ul>;
}

// Usage:
<List
  items={users}                         // T inferred as User
  renderItem={(user) => <p>{user.name}</p>}  // user: User
/>

<List
  items={["a", "b", "c"]}              // T inferred as string
  renderItem={(s) => <p>{s.toUpperCase()}</p>}  // s: string
/>`}
      </CodeBlock>

      <p>
        At the call site, TypeScript infers <code>T</code> from{" "}
        <code>items</code>. <code>renderItem</code> then receives that
        same <code>T</code> in its callback. No casting, no <code>any</code>;
        the consumer gets full autocomplete on item properties.
      </p>

      <h2>Adding constraints</h2>

      <p>
        Sometimes you need <code>T</code> to satisfy a constraint —
        like having an <code>id</code> for keys:
      </p>

      <CodeBlock language="tsx">
        {`type ListProps<T extends { id: string | number }> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
};

function List<T extends { id: string | number }>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(item => <li key={item.id}>{renderItem(item)}</li>)}</ul>;
}`}
      </CodeBlock>

      <p>
        <code>T extends &#123; id: string | number &#125;</code>{" "}
        means &quot;T must be at least an object with an{" "}
        <code>id</code> property.&quot; You get to use{" "}
        <code>item.id</code> safely inside, and consumers passing items
        without <code>id</code> get a TypeScript error.
      </p>

      <h2>The Select / Combobox pattern</h2>

      <p>
        Generic components shine for inputs that work with arbitrary
        option types:
      </p>

      <CodeBlock language="tsx">
        {`type SelectProps<T> = {
  options: T[];
  value: T;
  onChange: (next: T) => void;
  getKey: (option: T) => string | number;
  getLabel: (option: T) => string;
};

function Select<T>({ options, value, onChange, getKey, getLabel }: SelectProps<T>) {
  return (
    <select
      value={getKey(value)}
      onChange={(e) => {
        const next = options.find(o => String(getKey(o)) === e.target.value);
        if (next) onChange(next);
      }}
    >
      {options.map(o => (
        <option key={getKey(o)} value={getKey(o)}>
          {getLabel(o)}
        </option>
      ))}
    </select>
  );
}

// Works for any object shape:
<Select
  options={users}
  value={selectedUser}
  onChange={setSelectedUser}
  getKey={(u) => u.id}
  getLabel={(u) => u.name}
/>`}
      </CodeBlock>

      <p>
        The <code>getKey</code>/<code>getLabel</code> functions are
        the consumer&apos;s adapter. The Select doesn&apos;t need to
        know what shape the options are; it just asks how to extract
        the bits it cares about. Result: one Select, infinite use cases.
      </p>

      <h2>Generic forwardRef-ish components</h2>

      <p>
        In React 19 (where ref is just a prop), generic components
        with refs are simpler than they used to be:
      </p>

      <CodeBlock language="tsx">
        {`type GenericInputProps<T extends string | number> = {
  value: T;
  onChange: (v: T) => void;
  ref?: React.Ref<HTMLInputElement>;
};

function GenericInput<T extends string | number>({ value, onChange, ref }: GenericInputProps<T>) {
  return (
    <input
      ref={ref}
      value={String(value)}
      onChange={(e) => {
        const v = typeof value === "number" ? Number(e.target.value) : e.target.value;
        onChange(v as T);
      }}
    />
  );
}`}
      </CodeBlock>

      <p>
        Pre-React-19 you needed <code>forwardRef</code> with a generic,
        which had clunky syntax. The new ref-as-prop API makes generics
        feel natural.
      </p>

      <h2>Multiple type parameters</h2>

      <p>
        Components can have several generics:
      </p>

      <CodeBlock language="tsx">
        {`type TableProps<T, K extends keyof T> = {
  items: T[];
  columns: K[];
  renderCell?: (item: T, key: K) => React.ReactNode;
};

function Table<T, K extends keyof T>({ items, columns, renderCell }: TableProps<T, K>) {
  return (
    <table>
      <thead>
        <tr>{columns.map(c => <th key={String(c)}>{String(c)}</th>)}</tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i}>
            {columns.map(c => (
              <td key={String(c)}>{renderCell ? renderCell(item, c) : String(item[c])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage — TS infers T from items, K must be a key of T
<Table items={users} columns={["name", "email"]} />
// columns must be valid User keys; "foo" would be rejected.`}
      </CodeBlock>

      <p>
        <code>K extends keyof T</code> ties the second parameter to
        the first. Now <code>columns</code> can only contain keys that
        actually exist on each item. TypeScript catches typos at the
        call site.
      </p>

      <h2>Common pitfalls</h2>

      <h3>Inline arrow components and JSX ambiguity</h3>

      <p>
        In <code>.tsx</code>, <code>&lt;T&gt;</code> looks like JSX.
        Adding a comma helps: <code>const wrap = &lt;T,&gt;(x: T) =&gt; x</code>.
        Or use <code>function</code> declarations, where there&apos;s
        no ambiguity.
      </p>

      <h3>Default values for generics</h3>

      <CodeBlock language="tsx">
        {`type ListProps<T = unknown> = {
  items: T[];
  renderItem?: (item: T) => React.ReactNode;
};`}
      </CodeBlock>

      <p>
        Useful for components used both with and without explicit
        types. The default <code>unknown</code> forces consumers to
        type-narrow before using items, which is safer than{" "}
        <code>any</code>.
      </p>

      <h3>Don&apos;t make everything generic</h3>

      <p>
        Generics are a tool, not a goal. A specific{" "}
        <code>FlashcardList</code> that takes <code>Card[]</code> is
        often clearer than a generic <code>List&lt;T&gt;</code> that
        could take anything. Reach for generics when the same
        component is genuinely used with multiple types.
      </p>

      <h2>One last refactor of your flashcard app</h2>

      <HandsOn
        title="Build a generic Select for filter options"
        projectStep="Module 12 · Final Step"
        projectContext="You'll build a generic <Select> that can be reused for any dropdown in the app. Use it to filter the cards list by 'all', 'known', or 'unknown'. Type safety end-to-end."
        steps={[
          "In `src/app/Flashcards.tsx`, add a generic Select component above your existing components: ```tsx\ntype SelectProps<T> = {\n  options: T[];\n  value: T;\n  onChange: (next: T) => void;\n  getKey: (option: T) => string;\n  getLabel: (option: T) => string;\n};\n\nfunction Select<T>({ options, value, onChange, getKey, getLabel }: SelectProps<T>) {\n  return (\n    <select\n      className=\"select\"\n      value={getKey(value)}\n      onChange={(e) => {\n        const next = options.find(o => getKey(o) === e.target.value);\n        if (next) onChange(next);\n      }}\n    >\n      {options.map(o => (\n        <option key={getKey(o)} value={getKey(o)}>\n          {getLabel(o)}\n        </option>\n      ))}\n    </select>\n  );\n}\n```",
          "Add a filter state. Below your other state hooks: ```tsx\ntype Filter = { id: 'all' | 'known' | 'unknown'; label: string };\n\nconst FILTERS: Filter[] = [\n  { id: 'all', label: 'All cards' },\n  { id: 'known', label: 'Known' },\n  { id: 'unknown', label: 'Unknown' },\n];\n\nconst [filter, setFilter] = useState<Filter>(FILTERS[0]);\n```",
          "Update the `filtered` computation to also apply the filter: ```tsx\nconst filtered = useMemo(() => {\n  let result = cards;\n  if (filter.id === 'known') result = result.filter(c => knownIds.has(c.id));\n  if (filter.id === 'unknown') result = result.filter(c => !knownIds.has(c.id));\n  if (deferredSearch.trim() !== '') {\n    result = result.filter(c =>\n      c.question.toLowerCase().includes(deferredSearch.toLowerCase()) ||\n      c.answer.toLowerCase().includes(deferredSearch.toLowerCase())\n    );\n  }\n  return result;\n}, [cards, knownIds, filter, deferredSearch]);\n```",
          "Render the Select. Add it next to the search input: ```tsx\n<div className=\"toolbar\">\n  <input ref={searchRef} ... />\n  <Select<Filter>\n    options={FILTERS}\n    value={filter}\n    onChange={setFilter}\n    getKey={(f) => f.id}\n    getLabel={(f) => f.label}\n  />\n</div>\n```",
          "Add styling: ```css\n.toolbar { display: flex; gap: 0.5rem; margin-bottom: 1rem; }\n.toolbar .search { margin: 0; flex: 1; }\n.select { padding: 0.5rem 0.75rem; border: 1px solid #d4d4d8; border-radius: 8px; font: inherit; background: white; cursor: pointer; }\n.theme-dark .select { background: #27272a; color: #fafafa; border-color: #3f3f46; }\n```",
          "Save. The dropdown filters cards by status. The Select component is fully generic — try it: in your VS Code, hover over `<Select<Filter>` and notice how everything flows from one type. The `value` prop, the `onChange` parameter, the `getKey` and `getLabel` callbacks all infer Filter automatically.",
          "Bonus: try removing `<Filter>` from the component call site (just `<Select options={FILTERS} ...>`). TypeScript still infers T as Filter from the options array. Generics make the call site dramatically cleaner.",
          "🎉 You've completed the React Foundations to Fluency course. Your flashcard app now demonstrates: components, props, JSX, state, effects, refs, context, reducers, custom hooks, lists, reconciliation, modern forms, Suspense, error boundaries, server components, concurrent rendering, the React compiler, and full TypeScript generics. From here, the Next.js Deep Dive course is a smooth continuation.",
        ]}
      />

      <Callout type="info" title="The course in one sentence">
        React 19 is small but conceptually rich: components are
        functions, hooks let those functions remember things, and
        a Suspense / Server-Components layer makes async UI feel sync.
        Everything else — performance, TypeScript, forms, refs — is
        about applying those primitives well.
      </Callout>

      <Quiz
        question="Why use a generic component instead of a concrete one?"
        options={[
          { label: "Performance — generics are faster than concrete types" },
          {
            label: "Reusability with type safety — the same component works with any item type the consumer provides, while preserving full autocomplete and type checking on item fields",
            correct: true,
            explanation:
              "Generic components let the consumer pass in any data shape, and the component's render-prop callbacks receive the exact same type back. No casting, no any. The reuse is real (same Select for users, products, statuses) and the type safety is end-to-end.",
          },
          { label: "Generics avoid runtime errors that concrete types cause" },
          { label: "Generics are required for any component used in more than one place" },
        ]}
      />

      <Quiz
        question="What's the meaning of `T extends { id: string | number }` in a generic component's signature?"
        options={[
          { label: "T must be exactly the type `{ id: string | number }`" },
          {
            label: "T must be a type compatible with `{ id: string | number }` — meaning it has at least an id property of type string or number, but can have any other properties too",
            correct: true,
            explanation:
              "`extends` is the constraint. T can be any type that's structurally compatible with the constraint — at minimum it has the id field. The component is then free to use T's id safely, and consumers passing types without an id get a compile error.",
          },
          { label: "T must inherit (in an OO sense) from the base type" },
          { label: "It only allows primitive id values, not objects" },
        ]}
      />

      <ShortAnswer
        question="A teammate proposes making every component in the app generic 'just in case it's needed someday.' What do you tell them?"
        rubric={[
          "Generics add cognitive load and signature complexity, so they're worth using when the component is genuinely reused across multiple types",
          "Concrete components (e.g. FlashcardList that takes Card[]) are clearer when only one item type is ever used; generics buy nothing in that case",
          "The right rule: introduce generics when you have (or expect) at least two distinct callers with different types — not preemptively",
        ]}
        topic="When to introduce generics vs keep components concrete"
      />

      <h2>Course wrap-up</h2>

      <p>
        That&apos;s the end of <strong>React Foundations to
        Fluency</strong>. Twelve modules, thirty-four lessons, one
        flashcard app from blank Vite project to feature-rich,
        TypeScript-safe, Next.js-deployed, server-rendered app.
      </p>

      <p>
        Where to go from here:
      </p>

      <ul>
        <li>
          <strong>Next.js Deep Dive</strong> — the sibling course to
          this one. Picks up exactly where Module 9 left off and goes
          deep on Server Components, Cache Components, Server Actions,
          routing, and deployment.
        </li>
        <li>
          <strong>The flashcard app</strong> — keep building. Add
          decks (a CRUD layer), spaced repetition, AI-generated cards
          (your AI SDK course covers this), study sessions, sync to a
          backend.
        </li>
        <li>
          <strong>The official React docs</strong> — once you have the
          mental model, the docs at react.dev are a great reference.
          They&apos;re built on the same primitives this course
          taught.
        </li>
      </ul>

      <p>
        Thanks for going through it. You&apos;re no longer rusty.
      </p>
    </>
  );
}
