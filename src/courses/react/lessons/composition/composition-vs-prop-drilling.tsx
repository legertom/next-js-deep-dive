import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function CompositionVsPropDrilling() {
  return (
    <>
      <h1>Composition vs Prop Drilling</h1>

      <p>
        You learned in Module 2 that data flows down through props.
        That&apos;s great when components are close together. It gets
        ugly when a piece of data has to travel through several
        components that don&apos;t actually <em>use</em> it. This is{" "}
        <strong>prop drilling</strong> — and the cure is almost always
        composition, not context.
      </p>

      <h2>The shape of prop drilling</h2>

      <CodeBlock language="tsx">
        {`function App() {
  const [user, setUser] = useState(currentUser);

  return <Page user={user} />;
}

function Page({ user }: { user: User }) {
  // Page doesn't use \`user\`. Just passes it on.
  return <Layout user={user} />;
}

function Layout({ user }: { user: User }) {
  // Layout doesn't use \`user\` either.
  return (
    <div>
      <Header user={user} />
      <Content />
    </div>
  );
}

function Header({ user }: { user: User }) {
  // Header is the only component that ACTUALLY uses user.
  return <p>Hi, {user.name}</p>;
}`}
      </CodeBlock>

      <p>
        <code>user</code> threads through three components that don&apos;t
        care about it. Every time you add another piece of data —{" "}
        <code>theme</code>, <code>locale</code>, <code>cart</code> —
        you touch all of them. The signal-to-noise ratio of these
        components keeps getting worse.
      </p>

      <h2>The first instinct: context</h2>

      <p>
        A lot of React devs reach for <code>useContext</code> here.
        That&apos;s sometimes right, but often the wrong first answer.
        Before context, ask: <strong>can I just compose differently?</strong>
      </p>

      <h2>The composition fix</h2>

      <p>
        The reason data has to drill is that the parent renders the
        child, and the child renders its child, and so on. If you flip
        the relationship and let the <em>top</em> component compose the
        tree directly, the intermediate layers don&apos;t need to know
        about the data.
      </p>

      <CodeBlock language="tsx">
        {`function App() {
  const [user, setUser] = useState(currentUser);

  return (
    <Page>
      <Layout
        header={<Header user={user} />}
      >
        <Content />
      </Layout>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <div className="page">{children}</div>;
}

function Layout({
  header,
  children,
}: { header: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      {header}
      {children}
    </div>
  );
}

function Header({ user }: { user: User }) {
  return <p>Hi, {user.name}</p>;
}`}
      </CodeBlock>

      <p>
        Now <code>Page</code> and <code>Layout</code> don&apos;t see{" "}
        <code>user</code>. They just receive whatever JSX they&apos;re
        given and stick it in the right slot. <code>Header</code>{" "}
        receives <code>user</code> directly because <code>App</code>{" "}
        constructs it directly.
      </p>

      <Callout type="important" title="The mental flip">
        Prop drilling makes intermediate components <em>relay</em> data.
        Composition makes the top-level component <em>construct</em> the
        whole subtree, so data only flows where it&apos;s actually used.
        The intermediate components become structure-only.
      </Callout>

      <h2>When composition isn&apos;t enough — context</h2>

      <p>
        Composition handles maybe 80% of cases. The remaining 20% is when
        the same data is needed in many components scattered across the
        tree, far apart, and lifting/composing them all to the same
        parent isn&apos;t practical:
      </p>

      <ul>
        <li>Theme (light/dark) — read by 100+ components.</li>
        <li>Current user / auth — read by anything that personalizes.</li>
        <li>Locale / translation function — read everywhere.</li>
        <li>A router&apos;s current location.</li>
      </ul>

      <p>
        For these, <code>useContext</code> (Module 5) is the right tool.
        Context is essentially &quot;a value any descendant can read
        without props.&quot; It&apos;s great for cross-cutting concerns;
        it&apos;s a hammer for prop drilling.
      </p>

      <Callout type="tip" title="Decision order">
        1. Does the data <em>actually</em> only travel through a few
        layers? → composition (children, slot props).<br />
        2. Is it used so widely that listing every consumer would be
        absurd? → context.<br />
        3. Almost everything else? → just plain props.<br />
        Reach for state libraries (Zustand, Redux, Jotai) only when
        you&apos;ve genuinely outgrown 1+2.
      </Callout>

      <h2>An example from your flashcard app</h2>

      <p>
        Your <code>App</code> currently does this:
      </p>

      <CodeBlock language="tsx">
        {`<Flashcard
  key={card.id}
  question={card.question}
  answer={card.answer}
  isKnown={knownIds.has(card.id)}
  onMarkKnown={() => markKnown(card.id)}
/>`}
      </CodeBlock>

      <p>
        That&apos;s fine — the props go from App directly to Flashcard,
        no middle layer. No drilling. But imagine you wanted to wrap each
        card in a <code>StudyZone</code> component that adds keyboard
        shortcuts. The naive version drills:
      </p>

      <CodeBlock language="tsx">
        {`// Drilling — StudyZone doesn't use these props
<StudyZone
  question={card.question}
  answer={card.answer}
  isKnown={knownIds.has(card.id)}
  onMarkKnown={...}
/>

function StudyZone(props) {
  return (
    <div onKeyDown={...}>
      <Flashcard {...props} />
    </div>
  );
}`}
      </CodeBlock>

      <p>The composed version doesn&apos;t:</p>

      <CodeBlock language="tsx">
        {`// Composition — StudyZone just adds keyboard handling
<StudyZone>
  <Flashcard
    question={card.question}
    answer={card.answer}
    isKnown={knownIds.has(card.id)}
    onMarkKnown={...}
  />
</StudyZone>

function StudyZone({ children }: { children: React.ReactNode }) {
  return <div onKeyDown={...}>{children}</div>;
}`}
      </CodeBlock>

      <p>
        <code>StudyZone</code> is now a single-purpose wrapper.{" "}
        <code>Flashcard</code> still gets its props directly. Adding new
        flashcard props doesn&apos;t require touching{" "}
        <code>StudyZone</code>. That&apos;s the win.
      </p>

      <h2>Building a Deck wrapper</h2>

      <p>
        Time to add a <code>Deck</code> component to your app. A deck
        groups cards under a name, has a heading, and stays a layout
        component — it doesn&apos;t need to know what&apos;s in each
        card. We&apos;ll set this up so it&apos;s ready for
        multi-deck functionality in Module 5.
      </p>

      <HandsOn
        title="Add a Deck wrapper using composition"
        projectStep="Module 4 · Step 2"
        projectContext="You'll wrap your existing card list in a Deck component that takes a name prop and children. The Deck doesn't know or care what cards are inside — that's the point. Later we'll have multiple decks."
        steps={[
          "In `src/App.tsx`, add a `Deck` component below `Card`: ```tsx\nfunction Deck({ name, children }: { name: string; children: React.ReactNode }) {\n  return (\n    <section className=\"deck\">\n      <h2 className=\"deck-name\">{name}</h2>\n      <div className=\"deck-cards\">{children}</div>\n    </section>\n  );\n}\n```",
          "Wrap your cards `.map()` in a Deck inside App's JSX. Replace the bit that renders the cards (and the empty state) with: ```tsx\n<Deck name=\"React Foundations\">\n  {filtered.length === 0 ? (\n    <Card>\n      <p style={{ padding: '1.25rem', margin: 0, color: '#71717a' }}>\n        No cards match \"{searchTerm}\". Try a different search.\n      </p>\n    </Card>\n  ) : (\n    filtered.map(card => (\n      <Flashcard\n        key={card.id}\n        question={card.question}\n        answer={card.answer}\n        isKnown={knownIds.has(card.id)}\n        onMarkKnown={() => markKnown(card.id)}\n      />\n    ))\n  )}\n</Deck>\n```",
          "Notice how `Deck` doesn't know anything about questions, answers, isKnown, or onMarkKnown. It just provides a heading and arranges its children. The data flows from App straight to each Flashcard, skipping Deck.",
          "Add CSS: ```css\n.deck { margin-bottom: 2rem; }\n.deck-name { font-size: 1.25rem; margin: 0 0 0.75rem; color: #18181b; }\n.deck-cards { display: flex; flex-direction: column; gap: 0.5rem; }\n```",
          "Save. You should see a 'React Foundations' heading above your cards. Visually subtle, but architecturally significant: you now have a layout component that's reusable for any deck of any cards.",
          "Bonus: stack two Decks. Above your existing one, add: ```tsx\n<Deck name=\"Pinned\">\n  <Card><p style={{padding:'1.25rem', margin:0}}>Add cards here later.</p></Card>\n</Deck>\n```\nNotice you don't pass any flashcard-specific props to Deck for either one. The composition lets the parent wire things up however it wants.",
        ]}
      />

      <Quiz
        question="A piece of data has to be passed through 4 components, only the deepest one uses it. What's the most surgical fix?"
        options={[
          { label: "Wrap the whole tree in a Context Provider — that's what context is for" },
          { label: "Move the data into a global state library like Zustand or Redux" },
          {
            label: "Compose: have the top-level component construct the deep child directly with the data, and pass it as a slot prop or children",
            correct: true,
            explanation:
              "Composition is the lightest tool. The intermediate components become structure-only (children + maybe a few slot props), and the data only travels where it's used. Context is fine but a heavier hammer; reach for it when many scattered consumers need the same value.",
          },
          { label: "Put the data on window so any component can read it" },
        ]}
      />

      <Quiz
        question="What's the actual cost of prop drilling — why is it considered bad?"
        options={[
          { label: "Performance — passing props through layers is slow" },
          {
            label: "Coupling and noise — intermediate components have to know about data they don't use, so refactors and additions touch many files unnecessarily",
            correct: true,
            explanation:
              "Prop drilling is a maintainability problem, not a performance one. Each new prop forces every layer to declare a type, accept it, and pass it on. That's friction. Composition removes the noise by making intermediate components structure-only.",
          },
          { label: "It causes infinite re-renders if more than 3 levels deep" },
          { label: "TypeScript can't infer the types past two levels" },
        ]}
      />

      <ShortAnswer
        question="When you're tempted to introduce useContext to solve prop drilling, what should you check first? Describe the rule of thumb from this lesson and when each tool is appropriate."
        rubric={[
          "Check whether composition can solve it: can the top component construct the subtree directly so intermediate components don't need to relay the data?",
          "Composition is right when only a few specific layers are involved (the data's path is well-defined)",
          "Context is right for cross-cutting concerns used by many scattered components (theme, auth, locale) — not as a general fix for any prop drilling",
        ]}
        topic="Composition before context"
      />

      <h2>What&apos;s next</h2>

      <p>
        You can pass JSX as <code>children</code> and as named slot props.
        The next lesson goes one step further: passing entire components
        as props (and, the related pattern, render props). It&apos;s how
        UI libraries build truly flexible components that delegate the
        rendering decision to the caller.
      </p>
    </>
  );
}
