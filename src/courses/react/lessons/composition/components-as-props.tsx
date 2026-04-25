import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function ComponentsAsProps() {
  return (
    <>
      <h1>Components as Props</h1>

      <p>
        Last lesson covered <em>JSX</em> as props. This lesson is the
        next level: passing entire <em>components</em> (uninstantiated)
        and <em>functions that return JSX</em> as props. These two
        patterns — sometimes called &quot;render props&quot; and
        &quot;headless components&quot; — are how flexible UI libraries
        let you customize what they render without forking them.
      </p>

      <p>
        Don&apos;t panic if these feel abstract on first read. We&apos;ll
        ground them with concrete examples and a small refactor of your
        flashcard app at the end.
      </p>

      <h2>Pattern 1: passing a JSX element</h2>

      <p>
        You already saw this last lesson — slot props that hold JSX:
      </p>

      <CodeBlock language="tsx">
        {`<Layout
  header={<Header user={user} />}
  sidebar={<Sidebar />}
>
  <Content />
</Layout>`}
      </CodeBlock>

      <p>
        <code>{"<Header user={user} />"}</code> is a JSX expression that
        evaluates to a React Element (a plain JS object). Layout receives
        the already-built element and decides where to put it.
      </p>

      <h2>Pattern 2: passing a component type</h2>

      <p>
        Sometimes the consumer can&apos;t pre-build the JSX because the
        component needs to know <em>per-row</em> or <em>per-item</em>{" "}
        data that only the parent has. So instead of giving them the
        finished element, you give them the component type and let them
        instantiate it for you:
      </p>

      <CodeBlock language="tsx">
        {`type ListProps<T> = {
  items: T[];
  ItemComponent: React.ComponentType<{ item: T }>;
};

function List<T>({ items, ItemComponent }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>
          <ItemComponent item={item} />
        </li>
      ))}
    </ul>
  );
}

// Usage:
<List items={users} ItemComponent={UserRow} />
<List items={products} ItemComponent={ProductCard} />`}
      </CodeBlock>

      <p>
        The capital-P convention (<code>ItemComponent</code>) signals
        &quot;this is a component type, render it with{" "}
        <code>{"<ItemComponent />"}</code>.&quot; <code>List</code> calls
        it once per item with the item as a prop. The same{" "}
        <code>List</code> renders any kind of row.
      </p>

      <h2>Pattern 3: render props (a function as a child)</h2>

      <p>
        This is the most flexible pattern. Instead of passing a component
        type, you pass a function. The component calls your function with
        whatever data it has, and you return JSX.
      </p>

      <CodeBlock language="tsx">
        {`type ListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
};

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{renderItem(item, i)}</li>
      ))}
    </ul>
  );
}

// Usage:
<List
  items={users}
  renderItem={(user) => <UserRow user={user} />}
/>

<List
  items={products}
  renderItem={(p, i) => <ProductCard product={p} index={i} />}
/>`}
      </CodeBlock>

      <p>
        The render-prop form is more flexible than the component-as-prop
        form because the consumer can decide on the fly — close over local
        state, render conditionally, transform the data before
        rendering — without needing a separate component for each
        variation.
      </p>

      <Callout type="info" title="Same idea, three flavors">
        All three patterns answer the same question: &quot;how does the
        parent decide what gets rendered inside a generic child
        component?&quot; Slot prop = pre-built. Component type = type
        only, child instantiates. Render prop = function the child
        calls with data. The right choice depends on whether the child
        has data the parent doesn&apos;t.
      </Callout>

      <h2>Headless components: the modern application</h2>

      <p>
        The render-prop pattern is the foundation of <strong>headless
        components</strong> — UI primitives that handle behavior, state,
        and accessibility but give you complete control over markup and
        styles. The popular &quot;headless UI&quot; libraries (Headless
        UI, Radix, Tanstack Table, React Aria) are render-prop or hook-
        based at their core.
      </p>

      <p>The general shape:</p>

      <CodeBlock language="tsx">
        {`// A headless dropdown that handles open/close, keyboard nav, focus
// management, but lets YOU render the trigger and items.

<Dropdown
  options={fruits}
  renderTrigger={({ isOpen, toggle }) => (
    <button onClick={toggle}>{isOpen ? "Close" : "Open"} fruits</button>
  )}
  renderOption={(fruit, { isHighlighted, select }) => (
    <div
      className={isHighlighted ? "active" : ""}
      onClick={select}
    >
      🍎 {fruit.name}
    </div>
  )}
/>`}
      </CodeBlock>

      <p>
        The dropdown owns the hard logic (which option is highlighted,
        how arrow keys move focus, when to close on outside click). The
        consumer owns 100% of the visual design. That separation is why
        headless libraries dominate modern UI work.
      </p>

      <h2>When to use which</h2>

      <ul>
        <li>
          <strong>JSX prop / children</strong> — the default. Use when
          the parent already has all the info to build the JSX.
        </li>
        <li>
          <strong>Component type prop</strong> — the parent has data per
          item but can&apos;t inline the JSX (e.g. when you want to be
          able to swap out the item component cleanly).
        </li>
        <li>
          <strong>Render prop</strong> — the child needs to expose
          internal state (open/closed, highlighted, dragging) to the
          consumer&apos;s rendering. This is the most flexible but also
          the most verbose at the call site.
        </li>
      </ul>

      <Callout type="tip" title="A note on hooks">
        In modern React, custom hooks have largely replaced render props
        for the &quot;expose internal state&quot; case. We&apos;ll cover
        custom hooks in Module 5. The mental model is the same: separate
        behavior from markup. Hooks are usually cleaner; render props are
        still useful when the behavior <em>has</em> to render something
        (like a positioned overlay).
      </Callout>

      <h2>Refactoring the flashcard list with a render prop</h2>

      <p>
        Time to apply this. We&apos;ll generalize <code>Deck</code> into
        a <code>List</code> component that takes any items and a render
        prop. The flashcard list becomes one specific use of it. The
        empty-state Card and search filtering can move into the List.
      </p>

      <HandsOn
        title="Generalize the cards list with a render prop"
        projectStep="Module 4 · Step 3"
        projectContext="You'll build a generic List component with a render prop. It handles the empty state for you. Then you'll use it for your cards. The same List would work for any kind of item — that's the win."
        steps={[
          "In `src/App.tsx`, above `Deck`, add a generic `List` component: ```tsx\ntype ListProps<T> = {\n  items: T[];\n  renderItem: (item: T) => React.ReactNode;\n  empty: React.ReactNode;\n};\n\nfunction List<T>({ items, renderItem, empty }: ListProps<T>) {\n  if (items.length === 0) return <>{empty}</>;\n  return <>{items.map(renderItem)}</>;\n}\n```",
          "Use it inside the existing Deck. Replace the conditional and `.map()` block with: ```tsx\n<Deck name=\"React Foundations\">\n  <List\n    items={filtered}\n    renderItem={(card) => (\n      <Flashcard\n        key={card.id}\n        question={card.question}\n        answer={card.answer}\n        isKnown={knownIds.has(card.id)}\n        onMarkKnown={() => markKnown(card.id)}\n      />\n    )}\n    empty={\n      <Card>\n        <p style={{ padding: '1.25rem', margin: 0, color: '#71717a' }}>\n          No cards match \"{searchTerm}\". Try a different search.\n        </p>\n      </Card>\n    }\n  />\n</Deck>\n```",
          "Save. The cards should look identical. But notice: `List` knows nothing about flashcards. It's pure data → render mapping with an empty-state hook.",
          "Prove the abstraction by reusing it. Below your existing Deck, add another Deck that lists *known* cards using the same List: ```tsx\n<Deck name=\"Mastered\">\n  <List\n    items={cards.filter(c => knownIds.has(c.id))}\n    renderItem={(card) => (\n      <Card key={card.id} accent=\"green\">\n        <p style={{ padding: '1rem 1.25rem', margin: 0 }}>\n          ✓ {card.question}\n        </p>\n      </Card>\n    )}\n    empty={\n      <p style={{ color: '#71717a', fontSize: '0.9rem' }}>\n        Mark cards as known to see them here.\n      </p>\n    }\n  />\n</Deck>\n```",
          "Save. Mark a card as known. It should appear in the Mastered deck instantly. Same `List` component, completely different render. That's the power of components-as-props.",
          "Bonus reflection: notice how the rendering decision lives at the call site, where you have access to all the props (`knownIds`, `markKnown`, etc.) without needing to thread them through `List`. That's exactly the prop-drilling escape we talked about last lesson.",
        ]}
      />

      <Quiz
        question="What's the difference between passing `<UserRow />` as a prop and passing `UserRow` as a prop?"
        options={[
          { label: "No difference — JSX and component types are interchangeable" },
          {
            label: "The first is a pre-built React Element. The second is the component type, which the receiver instantiates with its own props.",
            correct: true,
            explanation:
              "If you pass `<UserRow />`, you've already decided the props (or used defaults). If you pass `UserRow` (capitalized prop name), the consumer renders `<UserRow item={item} />` per row, plumbing in its own data. Both are valid; they answer different questions.",
          },
          { label: "JSX is for Server Components, types are for Client Components" },
          { label: "Only the JSX form supports keys" },
        ]}
      />

      <Quiz
        question="Why are render props especially powerful for components like dropdowns, tooltips, and tables?"
        options={[
          { label: "They're faster than other patterns at runtime" },
          {
            label: "They expose internal state (highlighted item, open/closed, sort direction) to the consumer's rendering, so the same logic can drive any visual style",
            correct: true,
            explanation:
              "Headless components separate behavior from appearance. The render prop is how the behavior layer hands its state to your styling layer. The result: one library handles accessibility and keyboard navigation correctly; you write whatever markup matches your design.",
          },
          { label: "Render props are the only pattern that works with TypeScript generics" },
          { label: "They avoid re-renders entirely by skipping reconciliation" },
        ]}
      />

      <ShortAnswer
        question="Imagine a generic Table component you want to reuse across your app. Some tables show users, some show products, some show invoices — and each row looks different. Which composition pattern lets the same Table handle all three, and how would you structure the props?"
        rubric={[
          "A render prop or component-type prop is the right answer — pass `renderRow` (function) or `RowComponent` (component type) along with the items array",
          "The Table handles structure (table tag, headers, sorting, pagination); the consumer decides what each row looks like by providing the render function",
          "Bonus: notes that you can also pass column definitions or a renderHeader prop for full flexibility, and that this is exactly how libraries like TanStack Table work",
        ]}
        topic="Designing a reusable Table with render props or component-as-prop"
      />

      <h2>Module 4 wrap-up</h2>

      <p>
        Three composition patterns. <code>children</code> for layout
        wrappers. Slot props for multi-region layouts. Render props /
        component-as-prop for generic data-rendering components. With
        these, you can build APIs where intermediate components stay
        clean and the data only flows where it&apos;s used.
      </p>

      <p>
        Module 5 dives into the rest of the hooks toolkit:{" "}
        <code>useRef</code>, <code>useContext</code>,{" "}
        <code>useReducer</code>, and custom hooks. Together with{" "}
        <code>useState</code> and <code>useEffect</code>, that&apos;s
        the entire core hook surface — and once you have all six, you can
        build any pattern you&apos;ve seen in any React codebase.
      </p>
    </>
  );
}
