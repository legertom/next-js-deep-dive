import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function CompositionAcrossBoundary() {
  return (
    <>
      <h1>Composition Across the Boundary</h1>

      <p>
        The strict rule from last lesson — <em>Client Components
        can&apos;t import Server Components</em> — sounds limiting. In
        practice, it almost never gets in your way, because of one
        elegant pattern: <strong>passing Server Components as children
        to Client Components</strong>. This is the trick that makes
        the whole architecture pleasant. By the end of this lesson it
        should feel obvious.
      </p>

      <h2>The pattern</h2>

      <CodeBlock language="tsx">
        {`// page.tsx — Server Component
import { ClientWrapper } from "./ClientWrapper";
import { ServerContent } from "./ServerContent";

export default function Page() {
  return (
    <ClientWrapper>
      <ServerContent />
    </ClientWrapper>
  );
}`}
      </CodeBlock>

      <p>
        At first glance this looks like the forbidden thing. But it
        isn&apos;t. The Server Component (<code>page.tsx</code>) is
        rendering <code>ServerContent</code>. The output of that render
        is then passed to <code>ClientWrapper</code> via{" "}
        <code>children</code>. The <code>ClientWrapper</code> never{" "}
        <em>imports</em> the Server Component — it just receives an
        already-rendered React tree as a prop.
      </p>

      <CodeBlock language="tsx">
        {`// ClientWrapper.tsx
"use client";
import { useState } from "react";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}>Toggle</button>
      {open && <div>{children}</div>}  {/* server-rendered tree */}
    </div>
  );
}`}
      </CodeBlock>

      <p>
        <code>ClientWrapper</code> wraps interactivity around content
        it didn&apos;t generate. The content is a Server Component
        rendered before the client even existed. Magic.
      </p>

      <h2>Why this works</h2>

      <p>
        At render time, the Server Component renders fully on the
        server. <code>ServerContent</code> resolves to a tree of React
        Elements (plain JS objects). Those objects get serialized into
        the page payload alongside <code>ClientWrapper</code>&apos;s
        instructions to render them as children. The browser receives
        both: the client component&apos;s code, and the rendered tree
        to put inside it.
      </p>

      <p>
        The client component never has to <em>execute</em> the server
        component. It just gets handed the result. So the rule
        &quot;client can&apos;t import server&quot; isn&apos;t violated.
      </p>

      <Callout type="important" title="The mental shift">
        Don&apos;t think &quot;ClientWrapper renders ServerContent.&quot;
        Think &quot;the page (server) renders both, and tells the
        ClientWrapper to put ServerContent in its children
        slot.&quot; The composition happens at the page level. The
        wrappers are just shells.
      </Callout>

      <h2>The patterns this enables</h2>

      <h3>1. Server data inside client interactivity</h3>

      <CodeBlock language="tsx">
        {`// page.tsx (server)
async function FlashcardPage() {
  const cards = await db.cards.findMany();
  return (
    <FlashcardList>
      {cards.map(card => <Flashcard key={card.id} card={card} />)}
    </FlashcardList>
  );
}

// FlashcardList.tsx (client)
"use client";
export function FlashcardList({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<"grid" | "list">("list");
  return (
    <div>
      <button onClick={() => setLayout(l => l === "grid" ? "list" : "grid")}>
        Switch to {layout === "grid" ? "list" : "grid"}
      </button>
      <div className={layout}>{children}</div>
    </div>
  );
}`}
      </CodeBlock>

      <p>
        The cards (server) compose into the layout switcher (client).
        The cards never become Client Components; their JS isn&apos;t
        in the bundle. The layout switcher is interactive. The user
        gets the best of both worlds: server-fetched data, client-side
        layout state.
      </p>

      <h3>2. Server-rendered defaults inside client editors</h3>

      <CodeBlock language="tsx">
        {`// page.tsx
async function EditorPage({ id }) {
  const initial = await db.posts.findUnique({ where: { id } });
  return (
    <RichEditor>
      <ServerRenderedMarkdown content={initial.body} />
    </RichEditor>
  );
}`}
      </CodeBlock>

      <p>
        The Markdown library (potentially huge — 100KB+) runs only on
        the server. The user gets server-rendered HTML inside their
        editor shell. Heavy parsing libraries don&apos;t enter the
        client bundle.
      </p>

      <h3>3. Server analytics inside client dashboards</h3>

      <CodeBlock language="tsx">
        {`// page.tsx
async function Dashboard() {
  const stats = await analytics.fetch();
  return (
    <DashboardShell> {/* client: nav, theme, layout */}
      <StatsPanel data={stats} />  {/* server: chart, calculations */}
      <UserActivity />  {/* server: more data */}
    </DashboardShell>
  );
}`}
      </CodeBlock>

      <h2>The contrast: when you can&apos;t do this</h2>

      <p>
        The pattern requires that the parent (where composition
        happens) be a Server Component. If you&apos;re inside a Client
        Component and you want to render a Server Component
        conditionally based on client state — you can&apos;t. The
        boundary is one-way.
      </p>

      <CodeBlock language="tsx">
        {`// ❌ doesn't work
"use client";
function ClientPage() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button onClick={() => setShow(true)}>Show</button>
      {show && <ServerComponent />}  {/* can't import a Server Component here */}
    </div>
  );
}`}
      </CodeBlock>

      <p>
        The fix is to lift the Server Component up to a Server parent,
        pass it as a prop, and conditionally render the prop:
      </p>

      <CodeBlock language="tsx">
        {`// page.tsx (server)
function Page() {
  return <ClientPage extraContent={<ServerComponent />} />;
}

// ClientPage.tsx (client)
"use client";
function ClientPage({ extraContent }: { extraContent: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button onClick={() => setShow(true)}>Show</button>
      {show && extraContent}  {/* already-rendered server output */}
    </div>
  );
}`}
      </CodeBlock>

      <p>
        Same outcome (server output rendered conditionally on client),
        achieved by composition at the server parent.
      </p>

      <h2>Restructuring your flashcard app</h2>

      <p>
        We&apos;ll apply this pattern to put the deck heading,
        description, and any server-fetchable data on the server,
        with the interactive cards as a client child.
      </p>

      <HandsOn
        title="Compose server content inside client interactivity"
        projectStep="Module 9 · Step 3"
        projectContext="You'll add a server-rendered deck description above the cards. The Flashcards client component receives it as children. The description text never gets bundled into the client JS — but it's still composed inside the client component's UI."
        steps={[
          "In `src/app/page.tsx`, add a server-rendered description above where Flashcards renders. Pass it as children: ```tsx\nimport { Flashcards } from './Flashcards';\n\nasync function getDeckDescription() {\n  // Pretend this comes from a CMS or database\n  await new Promise(r => setTimeout(r, 100));\n  return 'A study deck for React fundamentals. Click any card to flip it. Mark cards as known when you can answer them confidently.';\n}\n\nexport default async function Page() {\n  const description = await getDeckDescription();\n  return (\n    <main className=\"app\">\n      <header className=\"app-header\">\n        <h1>Flashcards</h1>\n      </header>\n      <Flashcards>\n        <p className=\"deck-description\">{description}</p>\n      </Flashcards>\n    </main>\n  );\n}\n```",
          "Update `src/app/Flashcards.tsx` to accept `children` and render it: ```tsx\n'use client';\n// imports...\n\nexport function Flashcards({ children }: { children: React.ReactNode }) {\n  // existing state and effects...\n  return (\n    <>\n      {children}  {/* server-rendered description, no JS shipped for it */}\n      <Counter total={cards.length} known={knownIds.size} />\n      {/* ...rest of the existing JSX */}\n    </>\n  );\n}\n```",
          "Add CSS in `globals.css`: ```css\n.deck-description { color: #71717a; font-size: 0.9rem; line-height: 1.5; margin: 0 0 1rem; }\n```",
          "Save and refresh. The description appears above the cards. Open DevTools → Sources or use `view-source:` on the page URL — the description text is in the HTML payload, not loaded by JS afterward.",
          "Reflect on the pattern: Page (server) is the composer. It fetches the description AND renders the client Flashcards component. The description is passed as a child. Flashcards (client) doesn't import or even know about getDeckDescription — it just gets handed a rendered child to put in its UI.",
          "Bonus: try moving the description fetch into Flashcards directly (without `'use client'` removed). It won't work — useState etc need client. So the only way to get server-fetched content inside a client component IS the children pattern. That's the lesson.",
        ]}
      />

      <Callout type="info" title="What you've internalized">
        Server Components for content and data. Client Components for
        interactivity. Composition at the Server level passes
        server-rendered subtrees into client wrappers. This is the
        architecture every modern Next.js app uses, and it&apos;s the
        starting point for the Next.js course.
      </Callout>

      <Quiz
        question="A Client Component receives `children`. What's true about whatever JSX is passed in as children?"
        options={[
          { label: "It must also be a Client Component" },
          {
            label: "It can be anything — Server Components, Client Components, plain HTML — because the children prop is already a rendered React Element by the time the client component receives it",
            correct: true,
            explanation:
              "Children passed to a Client Component are pre-rendered. The client component never executes their code; it just receives the resulting React Element tree and inserts it. That's why a Server Component composed via children works: the server rendered it, the result rode along as part of the page payload, and the client component slots it into its UI.",
          },
          { label: "Only string children are allowed for client components" },
          { label: "It depends on whether the client component uses children directly or via a wrapper" },
        ]}
      />

      <Quiz
        question="You're inside a Client Component and want to conditionally render a Server Component based on client state. What's the right approach?"
        options={[
          { label: "Import the Server Component into the client file with a special async loader" },
          {
            label: "Lift the Server Component up to a Server parent, pass it as a prop, and conditionally render the prop in the client",
            correct: true,
            explanation:
              "The boundary is one-way: server parent can compose client child + server children, but client can't import server. Push the composition up to a Server parent. The Client Component receives a prop containing the rendered server output and decides whether/how to display it.",
          },
          { label: "Use Suspense to defer the import until client state changes" },
          { label: "It's not possible — Server Components can never be conditional" },
        ]}
      />

      <ShortAnswer
        question="Explain why passing a Server Component as `children` to a Client Component doesn't violate the rule that Client Components can't import Server Components."
        rubric={[
          "The Server Component is rendered (executed) on the server before the page reaches the browser, producing a tree of React Elements (plain serializable objects)",
          "The Client Component receives those already-rendered objects via the children prop — it never imports or executes the Server Component's code",
          "Composition happens at the Server parent level, not inside the Client Component itself; the rule is about IMPORTS, not about what can appear in a tree",
        ]}
        topic="Why server-component-as-children works"
      />

      <h2>Module 9 wrap-up</h2>

      <p>
        Three lessons. The mental shift (server is the new default).
        The boundary rules (what crosses, what doesn&apos;t). The
        composition pattern (children as the boundary-bridging
        mechanism). With these, you can read any modern Next.js code
        and understand <em>why</em> the file structure looks the way it
        does — which is exactly the bridge into the rest of your
        Next.js course.
      </p>

      <p>
        Module 10 returns to plain React with two performance-related
        hooks: <code>useTransition</code> and{" "}
        <code>useDeferredValue</code>. They unlock concurrent rendering
        — the feature that lets React keep the UI responsive even when
        an update is doing a lot of work.
      </p>
    </>
  );
}
