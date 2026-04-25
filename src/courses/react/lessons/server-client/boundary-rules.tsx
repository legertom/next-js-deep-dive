import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function BoundaryRules() {
  return (
    <>
      <h1>Boundary Rules</h1>

      <p>
        The Server/Client split is governed by a small set of strict
        rules. Once you internalize them, the &quot;why does this not
        work&quot; questions stop happening. This lesson is the rules.
      </p>

      <h2>The directive: <code>&quot;use client&quot;</code></h2>

      <p>
        At the top of any file, before all imports:
      </p>

      <CodeBlock language="tsx">
        {`"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}`}
      </CodeBlock>

      <p>
        That directive marks the file as a <strong>client boundary</strong>.
        Everything in the file, plus everything it transitively imports,
        becomes part of the client bundle. Without the directive, the
        file is a Server Component (or shared module — see below).
      </p>

      <h2>Three kinds of files</h2>

      <p>It helps to think of files in three buckets:</p>

      <ol>
        <li>
          <strong>Server-only.</strong> No directive. Can fetch data,
          read files, use Node APIs. Cannot use hooks or events.
        </li>
        <li>
          <strong>Client-only.</strong> Top-level <code>&quot;use client&quot;</code>.
          Can use hooks, events, browser APIs. Cannot use server-only
          things (databases, secrets, fs).
        </li>
        <li>
          <strong>Shared.</strong> No directive but no server- or
          client-specific code. Just utility functions, types,
          constants. Importable from either side.
        </li>
      </ol>

      <h2>Rule 1: Server can render Client. Client cannot import Server.</h2>

      <p>
        A Server Component can render a Client Component:
      </p>

      <CodeBlock language="tsx">
        {`// app/page.tsx — Server Component
import { Counter } from "./Counter"; // Counter has 'use client'

export default function Page() {
  return (
    <main>
      <h1>My page</h1>
      <Counter />  {/* Server renders, ships Counter's JS to client */}
    </main>
  );
}`}
      </CodeBlock>

      <p>
        But a Client Component <em>cannot</em> import a Server Component
        directly:
      </p>

      <CodeBlock language="tsx">
        {`// Counter.tsx
"use client";
import { ServerOnlyThing } from "./ServerOnlyThing";  // ❌ error

export function Counter() {
  return <ServerOnlyThing />;
}`}
      </CodeBlock>

      <p>
        Why not? Because once you&apos;re in the client, the server
        is gone. The Server Component&apos;s code can&apos;t run there;
        its database queries, its <code>fs</code> imports, all of it.
        The framework refuses the import to protect you.
      </p>

      <Callout type="important" title="The work-around: pass as children">
        You CAN render a Server Component <em>inside</em> a Client
        Component if the Server Component is passed in as{" "}
        <code>children</code> (or any prop) from a Server parent. The
        Server Component is rendered server-side; the result is sent
        to the Client Component as already-rendered JSX. Lesson 3 of
        this module is dedicated to this pattern.
      </Callout>

      <h2>Rule 2: Props crossing the boundary must be serializable</h2>

      <p>
        When a Server Component renders a Client Component, the props
        get serialized — they have to travel from server to browser as
        JSON-ish payload. Allowed:
      </p>

      <ul>
        <li>Strings, numbers, booleans, null, undefined.</li>
        <li>Plain objects and arrays of the above.</li>
        <li><code>Date</code>, <code>Map</code>, <code>Set</code> (handled by RSC&apos;s richer serializer).</li>
        <li>Promises (the client receives the unresolved promise, suspends until it resolves).</li>
        <li>JSX (React Elements — represented as plain objects).</li>
        <li>Server functions (a special case — see below).</li>
      </ul>

      <p>NOT allowed:</p>

      <ul>
        <li>
          <strong>Plain functions.</strong> They can&apos;t be
          serialized. <code>onClick={`{() => save()}`}</code> from a
          Server Component to a Client Component throws.
        </li>
        <li>Class instances with methods.</li>
        <li>
          References to anything that wouldn&apos;t survive
          <code>JSON.stringify</code>.
        </li>
      </ul>

      <p>
        For functions, the answer is <strong>Server Actions</strong> —
        a function the framework treats as a callable RPC. Server
        Actions ARE serializable as far as the boundary is concerned;
        the client receives a reference, calls it, and the call goes
        back to the server. We&apos;ll cover them in the Next.js course.
      </p>

      <h2>Rule 3: Hooks and effects only work in Client Components</h2>

      <CodeBlock language="tsx">
        {`// ❌ Server Component (no directive)
async function CardList() {
  const [cards, setCards] = useState([]);  // ERROR — hooks need client
  // ...
}

// ✅ async work without hooks
async function CardList() {
  const cards = await db.cards.findMany();
  return cards.map(c => <Card key={c.id} card={c} />);
}`}
      </CodeBlock>

      <p>
        If you find yourself wanting <code>useState</code> or{" "}
        <code>useEffect</code> in a Server Component, you have two
        choices: drop the hook (often you can compute or fetch
        directly), or move that part of the tree into a Client
        Component.
      </p>

      <h2>Rule 4: Browser APIs only work in Client Components</h2>

      <p>
        <code>window</code>, <code>document</code>,{" "}
        <code>localStorage</code>, <code>navigator</code> — none of
        these exist on the server. Touching them in a Server Component
        crashes the build. Their use means client.
      </p>

      <h2>Rule 5: <code>&quot;use client&quot;</code> marks a boundary, not just a file</h2>

      <p>
        The directive doesn&apos;t just mark the file it&apos;s in. It
        marks <em>everything that file imports</em>:
      </p>

      <CodeBlock language="text">
        {`page.tsx (server)
   |
   imports
   v
Header.tsx ('use client')
   |
   imports
   v
formatDate.ts (no directive — auto-included as client because Header imports it)`}
      </CodeBlock>

      <p>
        So a shared utility module that doesn&apos;t use any
        client-specific APIs gets included on whichever side imports
        it. If both server and client import it, it&apos;s bundled into
        both. (The framework handles this; you don&apos;t.)
      </p>

      <h2>Common gotchas</h2>

      <h3>1. Forgetting <code>&quot;use client&quot;</code> on a hook-using file</h3>

      <p>
        Symptom: build error like &quot;You&apos;re importing a
        component that needs `useState`. It only works in a Client
        Component but none of its parents are marked with
        &apos;use client&apos;.&quot; Fix: add the directive.
      </p>

      <h3>2. Passing a function as a prop from server to client</h3>

      <p>
        Symptom: error like &quot;Functions cannot be passed directly
        to Client Components.&quot; Fix: either define the handler
        inside the Client Component, or use a Server Action that you
        explicitly mark with <code>&quot;use server&quot;</code>.
      </p>

      <h3>3. Importing a server-only module into a client file</h3>

      <p>
        Symptom: cryptic build error mentioning <code>fs</code>,{" "}
        <code>path</code>, or your DB client. Fix: don&apos;t. Either
        move the logic to a Server Component or expose it via a Server
        Action / API route.
      </p>

      <h3>4. Forgetting that <code>useTheme</code> needs Client</h3>

      <p>
        Context only works in Client Components. If you have a context
        provider, the file with <code>createContext</code> needs{" "}
        <code>&quot;use client&quot;</code>. Consumers calling{" "}
        <code>useContext</code> need to be in Client Components too.
      </p>

      <h2>Marking parts of your flashcard app as Server</h2>

      <p>
        Right now everything is a Client Component (you added{" "}
        <code>&apos;use client&apos;</code> to <code>page.tsx</code> in
        the last lesson). Time to peel off the parts that don&apos;t
        need to be client.
      </p>

      <HandsOn
        title="Move static parts of the app to the Server"
        projectStep="Module 9 · Step 2"
        projectContext="You'll extract the page heading and any non-interactive sections into Server Components, leaving only the interactive parts as Client Components. Notice how much of a real app is actually static."
        steps={[
          "In your `flashcards-next` project, open `src/app/page.tsx`. The whole file currently starts with `'use client';`.",
          "Create a new file `src/app/Flashcards.tsx`. Copy your existing App component's body into it. Add `'use client';` at the top — this is now your client island that holds all the interactive logic.",
          "Replace `src/app/page.tsx` with: ```tsx\nimport { Flashcards } from './Flashcards';\n\nexport default function Page() {\n  return (\n    <main className=\"app\">\n      <header className=\"app-header\">\n        <h1>Flashcards</h1>\n      </header>\n      <Flashcards />\n    </main>\n  );\n}\n```\nThis file has NO `'use client'` directive — so it's a Server Component. The `<h1>` and the surrounding chrome render on the server with zero JS shipped for them.",
          "Update `src/app/Flashcards.tsx` to NOT render its own outer `<main>` and `<h1>` (since page.tsx now handles that). Just render the cards UI: ```tsx\n'use client';\n\nimport { useState, useEffect, ... } from 'react';\n// ... all your existing imports and components ...\n\nexport function Flashcards() {\n  // ... all your existing state and effects ...\n  return (\n    <>\n      {/* <h1> moved to page.tsx */}\n      <Counter total={cards.length} known={knownIds.size} />\n      <ErrorBoundary fallback={...}>...</ErrorBoundary>\n      <input ref={searchRef} ... />\n      <AddCardForm ... />\n      <BulkImportForm ... />\n      <Deck name=\"React Foundations\">...</Deck>\n      {/* etc. */}\n    </>\n  );\n}\n```",
          "Save and refresh `localhost:3000`. The app should look and behave identically. But open DevTools → Network → All → click the page request and look at the response: notice the heading and structural HTML are in the initial HTML. Only the interactive Flashcards island ships its JS bundle.",
          "Bonus: add a server-side data fetch to the page. Edit `page.tsx`: ```tsx\nasync function getInitialDecks() {\n  // pretend this is a database call\n  await new Promise(r => setTimeout(r, 200));\n  return [\n    { name: 'React Foundations', description: 'The basics' },\n    { name: 'Next.js', description: 'Coming soon' },\n  ];\n}\n\nexport default async function Page() {\n  const decks = await getInitialDecks();\n  return (\n    <main className=\"app\">\n      <header className=\"app-header\"><h1>Flashcards</h1></header>\n      <p style={{ color: '#71717a', fontSize: '0.9rem', margin: '0 0 1rem' }}>\n        {decks.length} decks available\n      </p>\n      <Flashcards />\n    </main>\n  );\n}\n```\nThe `await` works directly in the page component — no useEffect, no useState. Server Components are just async functions.",
          "Reflect: most app shell, headings, navigation, footers, and content sections fit naturally as Server Components. Interactivity collapses into small islands. That's the architecture the rest of the Next.js course will use.",
        ]}
      />

      <Quiz
        question="A Client Component (file with `'use client'`) tries to import a Server Component. What happens?"
        options={[
          { label: "It works fine — both compose into the tree" },
          {
            label: "Build error: Client Components can't directly import Server Components. The work-around is to pass the Server Component as children from a server parent.",
            correct: true,
            explanation:
              "Once you've crossed into client land, the server is gone. The framework refuses the direct import to protect you from accidentally sending server-only code (DB clients, secrets) to the browser. The workaround: have a Server Component render the Client Component and pass the Server Component as children — composition across the boundary, lesson 3.",
          },
          { label: "It works at dev time but fails in production builds" },
          { label: "The Server Component re-renders as a Client Component automatically" },
        ]}
      />

      <Quiz
        question="A Server Component renders `<MyClientComponent onSubmit={() => save()} />`. What goes wrong?"
        options={[
          { label: "Nothing — functions are first-class in JavaScript" },
          {
            label: "Error: functions can't be serialized across the server-client boundary. Either define onSubmit inside the client component, or use a Server Action marked with 'use server'.",
            correct: true,
            explanation:
              "Props crossing the boundary go over the wire as a serialized payload. Plain functions don't survive that trip. Server Actions are the structured workaround — the function is registered server-side, and the client gets a reference it can call (which sends an RPC back to the server).",
          },
          { label: "It works, but the function only runs on the server" },
          { label: "It works, but only for arrow functions, not regular functions" },
        ]}
      />

      <ShortAnswer
        question="You have a stateful interactive component that uses useEffect to read from window.localStorage. Where does the `'use client'` directive need to go, and why?"
        rubric={[
          "The file containing the component must start with 'use client' because it uses useState/useEffect (Client-only hooks) and accesses window.localStorage (browser-only API)",
          "Any file imported by that component is automatically pulled into the client bundle, but doesn't itself need the directive",
          "Bonus: notes that if a parent renders this component, the parent can stay a Server Component — only the consumer of client APIs needs the directive",
        ]}
        topic="Where the 'use client' directive belongs"
      />

      <h2>What&apos;s next</h2>

      <p>
        You can now mark files correctly. The last lesson of this
        module is the trick that makes the boundary feel ergonomic
        instead of restrictive: composing Server Components inside
        Client Components by passing them as <code>children</code>.
      </p>
    </>
  );
}
