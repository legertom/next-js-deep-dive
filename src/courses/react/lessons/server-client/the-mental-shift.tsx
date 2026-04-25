import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function TheMentalShift() {
  return (
    <>
      <h1>The Mental Shift</h1>

      <p>
        Welcome to the most important module in this course. Server
        Components changed the model of what a React tree <em>is</em>.
        For 8 modules, you&apos;ve treated &quot;the React tree&quot; as
        one thing — a tree of components running in the browser. As of
        React 19, that tree can be split: some components run on the
        server, some run on the client, and they compose freely. The
        rest of this module is the rules of that split. This lesson is
        the &quot;why.&quot;
      </p>

      <h2>The world before Server Components</h2>

      <p>
        Old React: every component is a Client Component. The browser
        downloads a JS bundle containing every component you wrote.
        React renders the whole tree on the client. Data fetching
        happens via <code>useEffect</code> + <code>fetch</code>, which
        means the user sees a loading spinner while their browser
        round-trips to your API.
      </p>

      <p>
        This works, but it has costs that scale with your app size:
      </p>

      <ul>
        <li>
          <strong>Large JS bundles.</strong> Every component, every
          dependency, every helper has to ship to the browser.
        </li>
        <li>
          <strong>Client-only data fetching.</strong> The data your
          first paint depends on can&apos;t start until JS has loaded
          and your effect fires.
        </li>
        <li>
          <strong>Sensitive things on the client.</strong> Database
          credentials, API keys, secret algorithms — none of it can
          live in components without leaking to the user.
        </li>
        <li>
          <strong>Waterfalls.</strong> Component A renders, fetches data,
          renders Component B, which fetches more data. Sequential
          dependencies tank performance.
        </li>
      </ul>

      <h2>The new split</h2>

      <p>
        React 19 introduced two flavors of components:
      </p>

      <ul>
        <li>
          <strong>Server Components</strong> render on the server, once,
          per request. Their output (HTML and serialized React tree)
          gets sent to the browser. Their JavaScript is never
          shipped to the client.
        </li>
        <li>
          <strong>Client Components</strong> are what you&apos;ve been
          writing. They can have state, effects, refs, event handlers.
          Their JS does ship to the client.
        </li>
      </ul>

      <p>
        And here&apos;s the magic: <strong>they compose</strong>. A
        Server Component can render a Client Component. A Client
        Component can have Server Components passed in via{" "}
        <code>children</code>. The framework (Next.js, in your case)
        figures out which parts of the tree belong on which side and
        wires it up.
      </p>

      <Callout type="important" title="The new default">
        In React frameworks like Next.js, components are <strong>Server
        Components by default</strong>. You opt into Client behavior
        with <code>&quot;use client&quot;</code> at the top of a file.
        This is the inverse of pre-RSC React — opt-out is the new
        opt-in.
      </Callout>

      <h2>Why Server Components are a big deal</h2>

      <h3>1. Data fetching is just async/await</h3>

      <p>
        A Server Component can be <code>async</code>. Inside, you{" "}
        <code>await fetch()</code> or query a database directly. No{" "}
        <code>useEffect</code>, no loading state, no race conditions:
      </p>

      <CodeBlock language="tsx">
        {`async function FlashcardPage({ id }: { id: string }) {
  const card = await db.card.findUnique({ where: { id } });
  return (
    <div>
      <h1>{card.question}</h1>
      <p>{card.answer}</p>
    </div>
  );
}`}
      </CodeBlock>

      <p>
        That component doesn&apos;t exist on the client. It runs on the
        server. The server sends down rendered HTML. No effect, no
        spinner. The data was already there at first paint.
      </p>

      <h3>2. Zero JS for content</h3>

      <p>
        A Server Component contributes its <em>output</em> (the
        rendered React tree) to the page, not its <em>code</em>. A
        100KB Markdown rendering library used in a Server Component
        adds nothing to your client bundle. The JS bundle only ever
        contains Client Components.
      </p>

      <h3>3. Direct backend access</h3>

      <p>
        Inside a Server Component you can read environment variables,
        connect to databases, call internal services, read files. The
        component body runs on the server. None of those imports leak
        to the client.
      </p>

      <h3>4. Better waterfall behavior</h3>

      <p>
        Frameworks render Server Components in parallel where they
        can, and stream HTML to the browser as it&apos;s ready. With
        Suspense, fast pieces appear immediately while slow pieces
        show fallbacks — and the user starts seeing content while data
        for slower regions is still being fetched.
      </p>

      <h2>Why Client Components still exist</h2>

      <p>
        Server Components can&apos;t do anything that requires
        runtime interaction:
      </p>

      <ul>
        <li>No <code>useState</code>, <code>useReducer</code>, or any state hook.</li>
        <li>No <code>useEffect</code> — no client lifecycle.</li>
        <li>No event handlers (<code>onClick</code>, <code>onChange</code>, etc.).</li>
        <li>No browser APIs (<code>window</code>, <code>localStorage</code>, <code>document</code>).</li>
      </ul>

      <p>
        Anything interactive — a button that does something, a form
        that updates a counter, a hover state, an animation — has to
        be a Client Component. <em>The vast majority of UI primitives
        in real apps are still Client Components.</em> Server
        Components shine for layout, content, and data-driven pages
        without per-element interactivity.
      </p>

      <h2>The mental flip</h2>

      <p>
        Old React: &quot;everything is client; the server is something
        I send fetch requests to.&quot;
      </p>

      <p>
        New React: &quot;everything is server; the client is opt-in
        for the parts that actually need browser-side behavior.&quot;
      </p>

      <p>
        Once you internalize this, the Next.js course makes much more
        sense. Most pages are Server Components — fetching data, doing
        layout, passing data down. Interactivity gets isolated into
        small Client islands inside that server tree. Your bundle
        stays small. Your data fetching stays simple. Secrets stay on
        the server.
      </p>

      <h2>Migrating your flashcard app to Next.js</h2>

      <p>
        Time for the big migration we promised in Module 1. We&apos;ll
        leave Vite and create a Next.js version of the same flashcard
        app. The functionality stays the same; the file structure
        changes. After this exercise, you&apos;ve made the same journey
        many real teams take.
      </p>

      <HandsOn
        title="Migrate your flashcard playground to Next.js"
        projectStep="Module 9 · Step 1"
        projectContext="You're going to scaffold a fresh Next.js app and copy your existing components in. Most of your code will move over unchanged. The big difference: file-system routing, no Vite-specific config, and the app/page.tsx convention."
        steps={[
          "In your terminal, NAVIGATE OUT of the existing flashcards Vite project (or just go to your code dir): `cd ~/code` (or wherever you keep projects).",
          "Scaffold a Next.js app: `npx create-next-app@latest flashcards-next --typescript --no-tailwind --app --no-eslint --no-turbopack=false --src-dir --no-import-alias=false`. Just hit enter through the prompts; we'll keep defaults.",
          "Move into the new project: `cd flashcards-next` and start the dev server: `npm run dev`. You should see Next.js's default starter at `http://localhost:3000`.",
          "Open the new project in VS Code: `code .`",
          "Replace `src/app/page.tsx` with your old `App` component code. Critical change: add `'use client';` as the very first line of the file — your component uses `useState`, `useEffect`, `useRef`, etc., which means it must be a Client Component.",
          "Copy your `useLocalStorage.ts`, `ThemeContext.tsx`, and `ErrorBoundary.tsx` from the Vite project into `src/` of the Next project.",
          "Move your CSS into `src/app/globals.css`. Replace the existing content with the styles you'd accumulated in App.css. Next.js loads globals.css automatically.",
          "Wrap the `RootLayout` in `src/app/layout.tsx` with the ThemeProvider. Note that the layout is a Server Component by default — but ThemeProvider uses createContext, which only works in Client Components. So either: add `'use client'` to layout.tsx, OR wrap just the children in a client-side ThemeProvider component. Easier for now: add `'use client'` to layout.tsx.",
          "Save and reload `http://localhost:3000`. Your flashcard app should appear, fully functional. If anything's broken, check the terminal for build errors (usually missing imports or 'use client' on the wrong files).",
          "Reflect: you just moved the same UI from Vite to Next.js with one extra directive (`'use client'`). The next two lessons explain why that directive matters and what becomes possible once you start *not* using it on every component.",
        ]}
      />

      <Callout type="info" title="Why this is a big deal">
        Right now your entire app is a Client Component (every file
        starts with <code>&apos;use client&apos;</code>). That&apos;s
        functional but doesn&apos;t use any of the new server-side
        capabilities. The next two lessons teach you which parts can
        move to the server side, what the boundary rules are, and how
        to compose across them. By the end of the module, you&apos;ll
        have small Client islands inside a Server tree.
      </Callout>

      <Quiz
        question="What's the default in a modern React framework like Next.js — Server Components or Client Components?"
        options={[
          { label: "Client Components — that's how React has always worked" },
          {
            label: "Server Components by default; you opt into client behavior with `'use client'` at the top of a file",
            correct: true,
            explanation:
              "This is the big inversion of React 19. Without 'use client', your component is a Server Component: no state hooks, no effects, no event handlers, but it can be async, fetch directly from a database, and ship zero JavaScript to the client. Add 'use client' to a file and that file (plus its imports) become Client Components.",
          },
          { label: "Both — every component is automatically rendered on the server first, then hydrated as a client component" },
          { label: "It depends on whether you import React explicitly" },
        ]}
      />

      <Quiz
        question="Which of these can a Server Component do that a Client Component cannot?"
        options={[
          { label: "Use useState and useEffect" },
          {
            label: "Read directly from a database, use environment variables and secret API keys without leaking them, and ship zero JavaScript to the client",
            correct: true,
            explanation:
              "Server Components run on the server, period. Their JS is never shipped to the browser. That's what unlocks direct backend access (DB, env vars, secrets) and zero-JS rendering for static or data-driven content. The trade-off: no state, no effects, no events.",
          },
          { label: "Render JSX" },
          { label: "Receive props" },
        ]}
      />

      <ShortAnswer
        question="Explain the value proposition of Server Components in your own words. What problems do they solve that pure-client React couldn't, and what limitations do they have?"
        rubric={[
          "Solve: large client bundles (Server Components ship no JS), client-side data fetching waterfalls, client exposure of secrets/env/db credentials, slow first paint from effect-driven fetches",
          "Limitations: no state hooks, no effects, no event handlers, no browser APIs — anything interactive must be a Client Component",
          "Bonus: notes that the new mental model is 'server by default, client where needed' — the inverse of pre-RSC React",
        ]}
        topic="The value proposition and limits of Server Components"
      />

      <h2>What&apos;s next</h2>

      <p>
        Next lesson digs into the rules: what can cross the boundary,
        what can&apos;t, and the specific gotchas (serializability of
        props, the &quot;you can&apos;t pass functions as props from
        server to client&quot; rule). After that, we&apos;ll cover the
        composition tricks that let you mix server and client
        elegantly.
      </p>
    </>
  );
}
