import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function ChildrenProp() {
  return (
    <>
      <h1>The <code>children</code> Prop</h1>

      <p>
        We mentioned <code>children</code> in passing back in Module 1.
        This module&apos;s about structure rather than behavior, and{" "}
        <code>children</code> is the foundation for almost every flexible
        component API in React. It&apos;s also one of the most-underused
        tools in rusty-React codebases — devs reach for context or
        prop drilling when a tiny bit of composition would have done it.
      </p>

      <h2>What it is</h2>

      <p>
        Anything you put between a component&apos;s opening and closing
        tags arrives as a prop named <code>children</code>:
      </p>

      <CodeBlock language="tsx">
        {`function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

// Usage:
<Card>
  <h2>Hello</h2>
  <p>Some content</p>
</Card>`}
      </CodeBlock>

      <p>
        It&apos;s not magic. <code>children</code> is just a regular prop.
        JSX has special syntax for it (the stuff between tags), but
        underneath it&apos;s the same as any other prop. You could write{" "}
        <code>{`<Card children={<h2>Hello</h2>} />`}</code> and it would
        work — it&apos;s just ugly.
      </p>

      <h2>Why this is so useful</h2>

      <p>
        Consider a <code>Card</code> component you want to reuse across
        many pages. Without <code>children</code>, you&apos;d have to
        anticipate every possible content shape:
      </p>

      <CodeBlock language="tsx">
        {`// Inflexible — locks you into a specific shape
function Card({ title, body, image, footer }) {
  return (
    <div className="card">
      {image && <img src={image} />}
      <h2>{title}</h2>
      <p>{body}</p>
      {footer && <div>{footer}</div>}
    </div>
  );
}`}
      </CodeBlock>

      <p>
        What if some cards have a list inside? A form? A chart? You&apos;d
        keep adding props forever. Or you accept a <code>children</code>{" "}
        prop and let the caller decide:
      </p>

      <CodeBlock language="tsx">
        {`function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

// Now anyone can put anything inside:
<Card>
  <h2>Quick stats</h2>
  <BarChart data={data} />
</Card>

<Card>
  <form onSubmit={handleSubmit}>
    <input name="email" />
    <button>Subscribe</button>
  </form>
</Card>`}
      </CodeBlock>

      <p>
        You wrote one component. You can use it for anything. The{" "}
        <code>Card</code> doesn&apos;t care what&apos;s inside; it just
        provides padding, border, and shadow.
      </p>

      <Callout type="important" title="The shift">
        Without children, components describe <em>what they contain</em>.
        With children, they describe <em>what they do to whatever
        you put inside them</em>. That second framing is way more
        flexible.
      </Callout>

      <h2>What can <code>children</code> hold?</h2>

      <p>
        Almost anything you can put in JSX. Strings. Numbers. JSX
        elements. Arrays of JSX. <code>null</code>, <code>undefined</code>,{" "}
        <code>false</code> (which render nothing). Other components. The
        type that captures all of these is <code>React.ReactNode</code>:
      </p>

      <CodeBlock language="tsx">
        {`function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

<Card>Just text</Card>
<Card>{42}</Card>
<Card>{null}</Card>
<Card>
  {items.map(i => <li key={i.id}>{i.name}</li>)}
</Card>
<Card>
  <h1>Mixed</h1>
  Text and <strong>elements</strong> together.
</Card>`}
      </CodeBlock>

      <h2>Layout components — the most common use case</h2>

      <p>
        Half the components in any real app are layout components: things
        that arrange or decorate whatever you give them. <code>Card</code>,{" "}
        <code>Stack</code>, <code>Grid</code>, <code>Sidebar</code>,{" "}
        <code>Modal</code>, <code>Section</code>. They all use{" "}
        <code>children</code>:
      </p>

      <CodeBlock language="tsx">
        {`function Stack({ gap = 8, children }: { gap?: number; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {children}
    </div>
  );
}

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}`}
      </CodeBlock>

      <p>
        Notice <code>Stack</code> has zero idea what it&apos;s
        stacking. <code>Modal</code> has zero idea what it&apos;s
        showing. They just provide structure. The caller fills in the
        rest.
      </p>

      <h2>Multiple slots — when one children isn&apos;t enough</h2>

      <p>
        Sometimes you want a component with <em>multiple</em> content
        slots: a card with a header, body, and footer. <code>children</code>{" "}
        is one slot. For more, you pass other props with JSX values:
      </p>

      <CodeBlock language="tsx">
        {`type SidebarLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  return (
    <div className="layout">
      <aside className="layout-side">{sidebar}</aside>
      <main className="layout-main">{children}</main>
    </div>
  );
}

// Usage:
<SidebarLayout sidebar={<NavTree />}>
  <ArticleContent />
</SidebarLayout>`}
      </CodeBlock>

      <p>
        Both <code>sidebar</code> and <code>children</code> are JSX
        slots. <code>children</code> is just the conventional default
        slot. Using named-slot props is great when you have 2–3 distinct
        content areas. Past that, look at the &quot;compound
        component&quot; pattern (Module 4&apos;s next lesson sets it up).
      </p>

      <h2>Refactoring your flashcard app</h2>

      <p>
        Time to extract a <code>Card</code> component from your{" "}
        <code>Flashcard</code>. Eventually you&apos;ll want{" "}
        <code>Card</code> for non-flashcard things — a deck summary, a
        stats panel, an empty state. Today we just refactor the existing
        flashcard to use it.
      </p>

      <HandsOn
        title="Extract a Card component using children"
        projectStep="Module 4 · Step 1"
        projectContext="You'll build a generic Card component that handles the border/padding/background, and refactor Flashcard to use it. The Flashcard becomes purely about flashcard logic; Card handles visual structure."
        steps={[
          "In `src/App.tsx`, add a `Card` component above `Flashcard`: ```tsx\nfunction Card({ children, accent }: { children: React.ReactNode; accent?: 'green' }) {\n  return (\n    <div className=\"card\" data-accent={accent ?? 'none'}>\n      {children}\n    </div>\n  );\n}\n```",
          "Refactor `Flashcard` to use it. Replace the outer `<div className=\"flashcard\">` with `<Card accent={isKnown ? 'green' : undefined}>`: ```tsx\nfunction Flashcard({ question, answer, isKnown, onMarkKnown }: FlashcardProps) {\n  const [isFlipped, setIsFlipped] = useState(false);\n  return (\n    <Card accent={isKnown ? 'green' : undefined}>\n      <button\n        type=\"button\"\n        className=\"flashcard-face\"\n        onClick={() => setIsFlipped(f => !f)}\n      >\n        <p className=\"flashcard-label\">{isFlipped ? 'Answer' : 'Question'}</p>\n        <p className=\"flashcard-text\">{isFlipped ? answer : question}</p>\n      </button>\n      <button\n        type=\"button\"\n        className=\"flashcard-mark\"\n        onClick={onMarkKnown}\n        disabled={isKnown}\n      >\n        {isKnown ? '✓ Known' : 'Mark as known'}\n      </button>\n    </Card>\n  );\n}\n```",
          "Update your `App.css` so `.card` is the generic style and the flashcard-specific styles use `.flashcard-face` etc. Replace the existing `.flashcard` rules with: ```css\n.card { border: 1px solid #d4d4d8; border-radius: 12px; margin-bottom: 0.75rem; background: #fafafa; overflow: hidden; }\n.card[data-accent='green'] { border-color: #86efac; background: #f0fdf4; }\n```",
          "Save. The cards should look identical to before — but now the `Card` component is reusable.",
          "Add an empty state. When `filtered.length === 0` (no search results), show a friendly message inside a Card: ```tsx\n{filtered.length === 0 ? (\n  <Card>\n    <p style={{ padding: '1.25rem', margin: 0, color: '#71717a' }}>\n      No cards match \"{searchTerm}\". Try a different search.\n    </p>\n  </Card>\n) : (\n  filtered.map(card => (\n    <Flashcard\n      key={card.id}\n      question={card.question}\n      answer={card.answer}\n      isKnown={knownIds.has(card.id)}\n      onMarkKnown={() => markKnown(card.id)}\n    />\n  ))\n)}\n```",
          "Type a nonsense search term in the search box. The empty state appears in the same Card shell. That's the children prop earning its keep — one component, two completely different uses.",
        ]}
      />

      <Quiz
        question="What is `children` in React, technically?"
        options={[
          { label: "A special slot in the React Element that only certain components can access" },
          {
            label: "A regular prop with special JSX syntax (whatever's between the tags becomes the value of the children prop)",
            correct: true,
            explanation:
              "It's just a prop named `children`, with JSX sugar that lets you write content between tags instead of as an attribute. You can pass it explicitly with `children={...}` and the result is identical.",
          },
          { label: "A React-internal API for accessing the DOM tree" },
          { label: "Only available on Server Components" },
        ]}
      />

      <Quiz
        question="When does `<Card>{children}</Card>` accept anything inside it without needing changes?"
        options={[
          { label: "Only when children is typed as `string`" },
          {
            label: "When children is typed as `React.ReactNode` — covers strings, numbers, JSX, arrays, null, etc.",
            correct: true,
            explanation:
              "ReactNode is the catch-all. It includes everything React knows how to render: primitives, JSX, fragments, arrays of any of those, and renderable falsy values (null, undefined, false). Use it whenever you want a true wildcard slot.",
          },
          { label: "Only when the parent component declares all possible child shapes upfront" },
          { label: "Always — TypeScript doesn't matter for children" },
        ]}
      />

      <ShortAnswer
        question="Explain why a `Card` component that accepts children is more reusable than one that takes specific props like title, body, and footer. What kind of UI does each shape support?"
        rubric={[
          "A children-based Card lets the caller put anything inside — text, charts, forms, lists, other components — without the Card needing to know about any of them",
          "A title/body/footer Card locks the caller into a fixed shape; if they need a list, an image, or something custom, they have to extend the API",
          "Bonus: notes that the children pattern flips the relationship — Card describes 'what to do with content' rather than 'what content goes inside it'",
        ]}
        topic="Why children makes components more reusable"
      />

      <h2>What&apos;s next</h2>

      <p>
        With <code>children</code> in your toolkit, you have a powerful
        alternative to passing props through layers of components. The
        next lesson is the &quot;why&quot; of that: <strong>composition
        vs prop drilling</strong>. When you find yourself passing a prop
        through three components that don&apos;t use it, composition is
        usually the right answer — long before context.
      </p>
    </>
  );
}
