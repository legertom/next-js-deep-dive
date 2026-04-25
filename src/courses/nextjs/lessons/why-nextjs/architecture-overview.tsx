import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FileTree } from "@/components/file-tree";
import { FlowDiagram } from "@/components/diagram";

export function ArchitectureOverview() {
  return (
    <>
      <h1>Architecture Overview</h1>

      <p>
        Now that you understand <em>why</em> Next.js exists and <em>what</em> it
        adds, let's look at <em>how</em> all the pieces fit together. This
        lesson maps out the architecture — the compiler, the bundler, the
        router, the renderer, and the server — and shows how a request travels
        through the system from browser to response.
      </p>

      <h2>The Big Picture</h2>

      <p>
        A Next.js application has two major phases:{" "}
        <strong>build time</strong> (when you run <code>next build</code>) and{" "}
        <strong>request time</strong> (when a user visits a page). Different
        parts of the architecture are active at different phases.
      </p>

      <figure className="my-8">
        <div className="rounded-xl border border-card-border bg-card p-6 overflow-hidden">
          <div className="text-xs font-semibold text-muted text-center mb-4 uppercase tracking-wider">
            Next.js Architecture
          </div>
          <div className="flex flex-col items-center gap-0">
            {/* Row 1: Compiler → Bundler */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-lg border-2 border-accent bg-accent-light text-accent-text text-center min-w-[120px]">
                <div className="font-semibold text-sm">Compiler</div>
                <div className="text-xs opacity-75">SWC</div>
              </div>
              <svg className="w-5 h-5 text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="px-4 py-2.5 rounded-lg border-2 border-accent bg-accent-light text-accent-text text-center min-w-[120px]">
                <div className="font-semibold text-sm">Bundler</div>
                <div className="text-xs opacity-75">Turbopack</div>
              </div>
            </div>
            {/* Arrow down */}
            <svg className="w-5 h-8 text-muted" fill="none" viewBox="0 0 24 32" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v20m0 0l-5-5m5 5l5-5" />
            </svg>
            {/* Row 2: Static Output */}
            <div className="px-4 py-2.5 rounded-lg border-2 border-accent bg-accent-light text-accent-text text-center min-w-[120px]">
              <div className="font-semibold text-sm">Static Output</div>
              <div className="text-xs opacity-75">.next directory</div>
            </div>
            {/* Arrow down */}
            <svg className="w-5 h-8 text-muted" fill="none" viewBox="0 0 24 32" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v20m0 0l-5-5m5 5l5-5" />
            </svg>
            {/* Row 3: Middleware → Router */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-lg border-2 border-warning bg-warning-light text-warning-text text-center min-w-[120px]">
                <div className="font-semibold text-sm">Middleware</div>
                <div className="text-xs opacity-75">Edge</div>
              </div>
              <svg className="w-5 h-5 text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="px-4 py-2.5 rounded-lg border-2 border-accent bg-accent-light text-accent-text text-center min-w-[120px]">
                <div className="font-semibold text-sm">Router</div>
                <div className="text-xs opacity-75">App Router</div>
              </div>
            </div>
            {/* Arrow down */}
            <svg className="w-5 h-8 text-muted" fill="none" viewBox="0 0 24 32" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v20m0 0l-5-5m5 5l5-5" />
            </svg>
            {/* Row 4: Renderer */}
            <div className="px-4 py-2.5 rounded-lg border-2 border-accent bg-accent-light text-accent-text text-center min-w-[120px]">
              <div className="font-semibold text-sm">Renderer</div>
              <div className="text-xs opacity-75">RSC + Streaming</div>
            </div>
            {/* Arrow down */}
            <svg className="w-5 h-8 text-muted" fill="none" viewBox="0 0 24 32" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v20m0 0l-5-5m5 5l5-5" />
            </svg>
            {/* Row 5: HTTP Response */}
            <div className="px-4 py-2.5 rounded-lg border-2 border-success bg-success-light text-success-text text-center min-w-[120px]">
              <div className="font-semibold text-sm">HTTP Response</div>
              <div className="text-xs opacity-75">HTML + RSC Payload</div>
            </div>
          </div>
        </div>
      </figure>

      <h2>1. The Compiler (SWC)</h2>

      <h3>Why it exists</h3>

      <p>
        Before your code can run anywhere, it must be transformed. TypeScript
        must become JavaScript. JSX must become function calls. Modern syntax
        must be downleveled for older browsers. Next.js uses{" "}
        <strong>SWC</strong> (Speedy Web Compiler) — a Rust-based compiler that
        is 20-70x faster than Babel.
      </p>

      <p>SWC handles:</p>

      <ul>
        <li>
          <strong>TypeScript stripping</strong> — Removes type annotations
          (doesn't type-check; that's <code>tsc</code>'s job)
        </li>
        <li>
          <strong>JSX transformation</strong> — Converts{" "}
          <code>&lt;Component /&gt;</code> into{" "}
          <code>React.createElement()</code> calls (or the new JSX transform)
        </li>
        <li>
          <strong>Minification</strong> — Shrinks code for production (replaces
          Terser)
        </li>
        <li>
          <strong>React optimizations</strong> — Adds display names, removes
          dead code paths
        </li>
      </ul>

      <CodeBlock filename="What SWC does (simplified)" language="tsx">
        {`// YOUR CODE (TypeScript + JSX)
interface Props { name: string; }

export function Greeting({ name }: Props) {
  return <h1 className="title">Hello, {name}!</h1>;
}

// ──── SWC COMPILES TO ────

// OUTPUT (JavaScript, minified)
export function Greeting({name}){
  return jsx("h1",{className:"title",children:["Hello, ",name,"!"]})
}`}
      </CodeBlock>

      <Callout type="info" title="Why Rust?">
        JavaScript-based compilers (Babel, TypeScript compiler) are inherently
        slow because they run single-threaded in a garbage-collected runtime. SWC
        is written in Rust, which compiles to native machine code, uses
        zero-cost abstractions, and has no garbage collector pauses. This makes
        builds 20-70x faster with zero configuration changes.
      </Callout>

      <h2>2. The Bundler (Turbopack)</h2>

      <h3>Why it exists</h3>

      <p>
        After compilation, the bundler decides how to package your code. It
        resolves imports, splits code into chunks, tree-shakes unused exports,
        and generates optimized output files. Next.js 16 uses{" "}
        <strong>Turbopack</strong> — an incremental bundler also written in Rust.
      </p>

      <p>Turbopack's key architectural decisions:</p>

      <ul>
        <li>
          <strong>Incremental computation</strong> — Only recomputes what
          changed. Change one file? Only that file's chunk is rebuilt.
        </li>
        <li>
          <strong>Function-level caching</strong> — Every function in the build
          pipeline is cached. Results are reused across builds.
        </li>
        <li>
          <strong>Lazy bundling (dev mode)</strong> — Only bundles code for the
          page you're viewing. Navigate to /about? Only then does it bundle
          about's code.
        </li>
      </ul>

      <CodeBlock filename="How code splitting works" language="text">
        {`Your Code:
  app/
    page.tsx         → imports ComponentA, ComponentB
    about/page.tsx   → imports ComponentA, ComponentC
    blog/page.tsx    → imports ComponentD

Turbopack Output:
  chunks/
    main-abc123.js        → React runtime, shared framework code
    page-def456.js        → page.tsx + ComponentB (only used here)
    about-ghi789.js       → about/page.tsx + ComponentC (only used here)
    blog-jkl012.js        → blog/page.tsx + ComponentD
    shared-mno345.js      → ComponentA (used by multiple routes)

Each route only loads: main + shared + its own chunk
NOT the entire application.`}
      </CodeBlock>

      <h2>3. The Router (App Router)</h2>

      <h3>Why it exists</h3>

      <p>
        The App Router is the orchestration layer. It maps URLs to components,
        manages layouts, handles navigation, and coordinates data fetching. In
        Next.js 16, the App Router is the primary routing system built around
        React Server Components.
      </p>

      <h3>Router architecture</h3>

      <p>The router operates at three levels:</p>

      <FlowDiagram
        steps={[
          {
            label: "URL Matching",
            sublabel:
              "Maps /blog/hello-world to app/blog/[slug]/page.tsx",
          },
          {
            label: "Layout Resolution",
            sublabel:
              "Finds all layouts from root to page (nested layout tree)",
          },
          {
            label: "Data Fetching",
            sublabel:
              "Executes Server Components, resolves async data in parallel",
          },
          {
            label: "Rendering",
            sublabel:
              "Produces RSC payload → streams HTML to client",
            color: "green",
          },
        ]}
      />

      <p>
        The key architectural insight of the App Router is{" "}
        <strong>nested layouts</strong>. Each segment of the URL can have its own
        layout, and layouts are preserved across navigations:
      </p>

      <CodeBlock filename="Layout nesting" language="tsx">
        {`// URL: /dashboard/settings/notifications

// Layout tree that renders (each wraps the next):
// 1. app/layout.tsx              → Root layout (html, body, global nav)
// 2. app/dashboard/layout.tsx    → Dashboard layout (sidebar, breadcrumbs)
// 3. app/dashboard/settings/layout.tsx → Settings layout (settings tabs)
// 4. app/dashboard/settings/notifications/page.tsx → The actual page

// When user navigates from /dashboard/settings/notifications
// to /dashboard/settings/profile:
//   - Layouts 1, 2, 3 are PRESERVED (not re-rendered!)
//   - Only the page component (level 4) changes
//   - This is WHY the sidebar doesn't flash on navigation`}
      </CodeBlock>

      <Callout type="important" title="Partial rendering">
        In traditional SPAs, navigating between pages re-renders everything.
        With the App Router's nested layout system, only the{" "}
        <strong>changed segments</strong> re-render. The shared layout shell
        (navigation, sidebars) stays mounted and maintains its state. This is
        architecturally similar to how native mobile apps work.
      </Callout>

      <h2>4. The Renderer (RSC + Streaming)</h2>

      <h3>Why it exists</h3>

      <p>
        The renderer takes your component tree and produces output. In Next.js
        16, rendering happens in two formats simultaneously:
      </p>

      <ul>
        <li>
          <strong>HTML</strong> — For the initial page load (immediate visual
          content)
        </li>
        <li>
          <strong>RSC Payload</strong> — A compact binary format that describes
          the component tree for client-side React to hydrate and update
        </li>
      </ul>

      <CodeBlock filename="What the server produces" language="text">
        {`// For a request to /blog/hello-world, the server produces:

// 1. HTML (streamed progressively):
<html>
  <body>
    <nav>...</nav>
    <main>
      <article>
        <h1>Hello World</h1>
        <p>Blog post content here...</p>
      </article>
      <!--$?--><template id="B:0"></template>
      <!-- Comments section will stream in later -->
      <!--/$-->
    </main>
  </body>
</html>

// 2. RSC Payload (appended as <script> tags):
// This is a serialized component tree that tells client-side React
// how to "adopt" the server-rendered HTML and make it interactive

// 3. Later, when the Comments Server Component finishes:
<script>
  // Replaces the template with actual comment HTML
  $RC("B:0", "<section><h2>Comments</h2>...</section>")
</script>`}
      </CodeBlock>

      <h3>Streaming architecture</h3>

      <p>
        Streaming is fundamental to Next.js 16's rendering model. Instead of
        waiting for ALL data before sending ANY HTML, the server sends content
        progressively:
      </p>

      <FlowDiagram
        steps={[
          {
            label: "Request arrives",
            sublabel: "Server starts rendering the component tree",
          },
          {
            label: "Shell renders instantly",
            sublabel: "Layout + synchronous content → sent immediately",
            color: "green",
          },
          {
            label: "Suspense boundaries stream",
            sublabel: "Each async section sends HTML when its data resolves",
            color: "blue",
          },
          {
            label: "Hydration begins",
            sublabel:
              "Client React starts making static HTML interactive",
            color: "blue",
          },
          {
            label: "Page fully interactive",
            sublabel: "All components hydrated, event handlers attached",
            color: "green",
          },
        ]}
      />

      <h2>5. The Server</h2>

      <h3>Why it exists</h3>

      <p>
        Next.js includes its own HTTP server that handles incoming requests,
        manages caching, and orchestrates the pipeline. It's not just a static
        file server — it's an application server that:
      </p>

      <ul>
        <li>Runs middleware at the edge before requests reach your pages</li>
        <li>Routes requests to the correct page/API handler</li>
        <li>Executes Server Components and streams responses</li>
        <li>Manages the incremental cache (ISR revalidation)</li>
        <li>Serves static assets with correct cache headers</li>
        <li>Handles the RSC protocol for client-side navigations</li>
      </ul>

      <h2>6. The .next Directory (Build Output)</h2>

      <p>
        Understanding the build output helps you understand the architecture.
        When you run <code>next build</code>, everything is compiled into the{" "}
        <code>.next</code> directory:
      </p>

      <FileTree
        title="Build output structure"
        items={[
          {
            name: ".next",
            type: "folder",
            children: [
              {
                name: "server",
                type: "folder",
                annotation: "Server-side code",
                children: [
                  {
                    name: "app",
                    type: "folder",
                    children: [
                      {
                        name: "page.js",
                        type: "file",
                        annotation: "Compiled Server Components",
                      },
                      {
                        name: "page_client-reference-manifest.js",
                        type: "file",
                        annotation: "Maps Client Components to chunks",
                      },
                    ],
                  },
                  {
                    name: "chunks",
                    type: "folder",
                    annotation: "Shared server code",
                  },
                ],
              },
              {
                name: "static",
                type: "folder",
                annotation: "Client-side assets",
                children: [
                  {
                    name: "chunks",
                    type: "folder",
                    annotation: "JS chunks (code-split)",
                    highlight: true,
                  },
                  {
                    name: "css",
                    type: "folder",
                    annotation: "Extracted CSS files",
                  },
                  {
                    name: "media",
                    type: "folder",
                    annotation: "Optimized fonts/images",
                  },
                ],
              },
              {
                name: "cache",
                type: "folder",
                annotation: "Build and data cache",
                children: [
                  {
                    name: "fetch-cache",
                    type: "folder",
                    annotation: "Cached fetch() responses",
                  },
                  {
                    name: "images",
                    type: "folder",
                    annotation: "Optimized image cache",
                  },
                ],
              },
            ],
          },
        ]}
      />

      <h2>The Request Lifecycle</h2>

      <p>
        Let's trace a complete request through the system. A user types{" "}
        <code>https://myapp.com/blog/hello-world</code> and hits Enter:
      </p>

      <h3>Phase 1: Edge (Middleware)</h3>

      <CodeBlock filename="Step 1: Middleware intercepts" language="text">
        {`Request: GET /blog/hello-world
  ↓
Middleware (runs at edge, closest to user):
  - Checks authentication cookies ✓
  - Checks for redirects/rewrites ✓
  - Adds geolocation headers ✓
  - Passes request through → NextResponse.next()
  ↓
Request continues to origin server`}
      </CodeBlock>

      <h3>Phase 2: Router Resolution</h3>

      <CodeBlock filename="Step 2: Router resolves the URL" language="text">
        {`URL: /blog/hello-world
  ↓
Router resolves:
  - Segment 1: "blog" → matches app/blog/ directory
  - Segment 2: "hello-world" → matches [slug] dynamic segment
  - Params: { slug: "hello-world" }
  ↓
Layout tree:
  1. app/layout.tsx
  2. app/blog/layout.tsx
  3. app/blog/[slug]/page.tsx
  ↓
All three are loaded for rendering`}
      </CodeBlock>

      <h3>Phase 3: Server Rendering</h3>

      <CodeBlock filename="Step 3: Server Components execute" language="text">
        {`Rendering begins (top-down, parallel where possible):
  ↓
app/layout.tsx renders:
  - Returns <html><body><nav>...</nav>{children}</body></html>
  ↓
app/blog/layout.tsx renders:
  - Returns <main><aside>...</aside>{children}</main>
  ↓
app/blog/[slug]/page.tsx renders:
  - Fetches: await db.posts.findBySlug("hello-world")  ← 50ms
  - Fetches: await db.author.findById(post.authorId)    ← 30ms (parallel!)
  - Returns <article><h1>...</h1><p>...</p></article>
  ↓
HTML stream begins flowing to the client`}
      </CodeBlock>

      <h3>Phase 4: Client Hydration</h3>

      <CodeBlock filename="Step 4: Browser receives and hydrates" language="text">
        {`Browser receives streamed HTML:
  ↓
1. Renders HTML immediately (user sees content!)
   Time to First Byte: ~100ms
   First Contentful Paint: ~150ms
  ↓
2. Downloads JS chunks in parallel:
   - main.js (React runtime)
   - page-chunk.js (Client Components for this page)
  ↓
3. React hydrates the page:
   - Attaches event handlers to interactive elements
   - "Adopts" server-rendered HTML (no re-render!)
   - Client Components become interactive
  ↓
4. Page is fully interactive
   Time to Interactive: ~400ms`}
      </CodeBlock>

      <Callout type="tip" title="The critical insight about hydration">
        Hydration does NOT re-render the page. React "adopts" the existing HTML
        produced by the server and attaches JavaScript behavior to it. This is
        why the user sees content almost instantly but buttons become clickable
        slightly later. The visual content arrives first; interactivity follows.
      </Callout>

      <h2>Client Navigation (Subsequent Pages)</h2>

      <p>
        After the initial page load, navigating within the app works
        differently. The user clicks a link to <code>/blog/another-post</code>:
      </p>

      <FlowDiagram
        steps={[
          {
            label: "User clicks <Link>",
            sublabel: "No full page reload",
          },
          {
            label: "Client router intercepts",
            sublabel: "Updates URL via History API",
          },
          {
            label: "Fetch RSC payload",
            sublabel: "GET /blog/another-post (Accept: text/x-component)",
            color: "blue",
          },
          {
            label: "Server renders RSC",
            sublabel: "Only the changed segments (not shared layouts!)",
            color: "blue",
          },
          {
            label: "Client applies update",
            sublabel: "React reconciles new RSC payload into existing tree",
            color: "green",
          },
        ]}
      />

      <Callout type="important" title="Two types of navigation">
        <strong>Hard navigation</strong> (first page load, or full refresh):
        Server sends complete HTML + RSC payload. <strong>Soft navigation</strong>{" "}
        (clicking a Link): Only the RSC payload for changed segments is fetched.
        Layouts are preserved. State in shared layouts is maintained. This is why
        Next.js apps feel as fast as native apps after initial load.
      </Callout>

      <h2>Server Components vs. Client Components: Architectural Boundary</h2>

      <p>
        The architecture has a clear boundary between server and client code.
        Understanding this boundary is essential:
      </p>

      <CodeBlock filename="The server/client boundary" language="tsx" highlight={[1, 14]}>
        {`// Server Component (default) — runs on server ONLY
// Can: access DB, read files, use secrets, import heavy libs
// Cannot: use state, effects, browser APIs, event handlers
export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = await db.posts.findBySlug(slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <PostContent content={post.body} />

      {/* This is the boundary ↓ — crossing from server to client */}
      <LikeButton postId={post.id} initialLikes={post.likes} />
    </article>
  );
}

// ─── In a separate file ───

'use client'; // ← This directive marks the boundary

// Client Component — shipped to browser as JavaScript
// Can: use state, effects, event handlers, browser APIs
// Cannot: directly access DB, read server files, use secrets
import { useState } from 'react';

export function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);

  return (
    <button onClick={() => {
      setLikes(l => l + 1);
      fetch(\`/api/like/\${postId}\`, { method: 'POST' });
    }}>
      ❤️ {likes}
    </button>
  );
}`}
      </CodeBlock>

      <figure className="my-8">
        <div className="rounded-xl border border-card-border bg-card p-6 overflow-hidden">
          {/* Server section */}
          <div className="border-2 border-accent rounded-lg p-4 mb-0">
            <div className="text-xs font-semibold text-muted text-center mb-3 uppercase tracking-wider">Server</div>
            <div className="flex items-start justify-center gap-3 flex-wrap">
              <div className="px-4 py-2.5 rounded-lg border-2 border-accent bg-accent-light text-accent-text text-center min-w-[120px]">
                <div className="font-semibold text-sm">BlogPost</div>
                <div className="text-xs opacity-75">async, fetches DB</div>
              </div>
              <div className="px-4 py-2.5 rounded-lg border-2 border-accent bg-accent-light text-accent-text text-center min-w-[120px]">
                <div className="font-semibold text-sm">PostContent</div>
                <div className="text-xs opacity-75">renders markdown</div>
              </div>
              <div className="px-3 py-2.5 text-xs text-muted italic self-center">Server Components</div>
            </div>
          </div>
          {/* Boundary */}
          <div className="flex items-center gap-2 my-0">
            <div className="flex-1 border-t-2 border-dashed border-warning" />
            <div className="flex flex-col items-center">
              <svg className="w-4 h-6 text-muted" fill="none" viewBox="0 0 24 32" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v20m0 0l-5-5m5 5l5-5" />
              </svg>
              <span className="text-xs font-bold text-warning-text bg-warning-light px-2 py-0.5 rounded whitespace-nowrap">&apos;use client&apos; boundary</span>
            </div>
            <div className="flex-1 border-t-2 border-dashed border-warning" />
          </div>
          {/* Client section */}
          <div className="border-2 border-warning rounded-lg p-4 mt-0">
            <div className="flex items-start justify-center gap-3 flex-wrap">
              <div className="px-4 py-2.5 rounded-lg border-2 border-warning bg-warning-light text-warning-text text-center min-w-[120px]">
                <div className="font-semibold text-sm">LikeButton</div>
                <div className="text-xs opacity-75">useState, onClick</div>
              </div>
              <div className="text-xs text-muted self-center space-y-0.5">
                <div>Client Component</div>
                <div className="opacity-75">→ Serialized as reference</div>
                <div className="opacity-75">→ JS shipped to browser</div>
              </div>
            </div>
          </div>
        </div>
      </figure>

      <Quiz
        question="When a user navigates between pages using a <Link> component (soft navigation), what does the server send?"
        options={[
          {
            label: "A full HTML page, just like the initial load",
            explanation:
              "Full HTML is only sent on hard navigation (initial page load or refresh). Soft navigation is more efficient.",
          },
          {
            label:
              "Only the RSC payload for the changed route segments — shared layouts are not re-sent",
            correct: true,
            explanation:
              "Correct! On soft navigation, the client requests only the RSC payload. The server renders only the segments that changed. Shared layouts keep their state and are not re-rendered. This is what makes navigation feel instant.",
          },
          {
            label: "Just a JSON object with the page data",
            explanation:
              "The RSC payload is not plain JSON — it's a streaming format that describes React components, their props, and their children. It's richer than JSON.",
          },
          {
            label: "The client renders everything locally without contacting the server",
            explanation:
              "Client Components can render locally, but Server Components must be rendered on the server. The server is still involved in most navigations.",
          },
        ]}
      />

      <Quiz
        question="Why does Next.js use a Rust-based compiler (SWC) instead of Babel?"
        options={[
          {
            label: "Because Babel doesn't support TypeScript",
            explanation:
              "Babel does support TypeScript (via @babel/preset-typescript). The reason is performance, not capability.",
          },
          {
            label:
              "Because Rust compiles to native machine code with no garbage collector, making it 20-70x faster than JavaScript-based tools",
            correct: true,
            explanation:
              "Correct! JavaScript tools like Babel run in Node.js — a single-threaded, garbage-collected runtime. Rust produces native binaries that run at CPU speed without GC pauses. For large codebases, this means builds in seconds instead of minutes.",
          },
          {
            label: "Because Babel is no longer maintained",
            explanation:
              "Babel is still actively maintained. Next.js switched to SWC purely for performance reasons.",
          },
          {
            label: "Because Rust can access the file system faster",
            explanation:
              "While Rust is efficient at I/O, the main bottleneck in compilation is CPU-bound parsing and transformation, not file system access.",
          },
        ]}
      />

      <HandsOn
        title="Build your blog and explore the output"
        projectStep="Step 3 of 40 — Blog Platform Project"
        projectContext="Your blog should have `app/page.tsx` (home) and `app/about/page.tsx` from the previous lesson."
        steps={[
          "First, add navigation so you can click between pages. Open `app/page.tsx` and add `import Link from 'next/link';` at the top. Then add this inside your return, below the existing content: `<nav><Link href=\"/about\">About</Link></nav>`. Do the same in `app/about/page.tsx` but link back to home: `<nav><Link href=\"/\">Home</Link></nav>`.",
          "Stop the dev server (Ctrl+C) and run: `npm run build` — this creates an optimized version of your site. Look at the terminal output and find the list of routes.",
          "Notice the symbols next to each route: a circle means the page was built as a static HTML file, and a lambda means it is generated on each request. Your home and about pages should both show circles.",
          "Run: `npm run start` — this starts the production server. Open http://localhost:3000 and click between your Home and About pages using the links you added. The navigation should feel instant — no full page reload, just a seamless swap.",
          "Open the `.next` folder in your editor and look around. The `server/app` folder has the compiled page files, and the `static` folder has the JavaScript the browser downloads. You do not need to understand every file — just notice that Next.js splits things up automatically.",
        ]}
      />

      <h2>How It All Connects</h2>

      <p>Here's the full mental model for how Next.js works:</p>

      <ol>
        <li>
          <strong>You write</strong> React components in TypeScript/JSX, using
          the file system to define routes and layouts.
        </li>
        <li>
          <strong>SWC compiles</strong> your code from TypeScript/JSX to
          optimized JavaScript, 20-70x faster than Babel.
        </li>
        <li>
          <strong>Turbopack bundles</strong> your code into optimized chunks,
          automatically splitting by route and shared dependencies.
        </li>
        <li>
          <strong>The App Router</strong> maps URLs to your component tree,
          resolving layouts and params.
        </li>
        <li>
          <strong>Server Components execute</strong> on the server, fetching data
          and producing the RSC payload.
        </li>
        <li>
          <strong>The renderer streams</strong> HTML and RSC data progressively
          to the browser.
        </li>
        <li>
          <strong>React hydrates</strong> the page on the client, making
          interactive elements functional.
        </li>
        <li>
          <strong>Subsequent navigations</strong> only fetch the changed
          segments, keeping shared layouts alive.
        </li>
      </ol>

      <Callout type="tip" title="The architecture serves one goal">
        Every piece of this architecture exists to serve a single goal:{" "}
        <strong>
          get meaningful content to the user as fast as possible, then make it
          interactive as fast as possible
        </strong>
        . The compiler makes builds fast. The bundler makes payloads small. The
        router makes navigations instant. The renderer makes first paint early.
        Everything is in service of user experience.
      </Callout>

      <h2>Summary</h2>

      <ul>
        <li>
          <strong>SWC (Compiler)</strong> — Transforms TypeScript/JSX to
          optimized JS at native speed
        </li>
        <li>
          <strong>Turbopack (Bundler)</strong> — Splits code into optimal chunks
          with incremental rebuilds
        </li>
        <li>
          <strong>App Router</strong> — Maps URLs to nested component trees with
          preserved layouts
        </li>
        <li>
          <strong>RSC Renderer</strong> — Executes Server Components and streams
          HTML + RSC payload
        </li>
        <li>
          <strong>Next.js Server</strong> — Orchestrates middleware, routing,
          rendering, and caching
        </li>
        <li>
          <strong>Client React</strong> — Hydrates the page and handles all
          subsequent interactivity
        </li>
      </ul>

      <p>
        In the next module, we'll dive deep into the App Router — understanding
        how file-system conventions map to the component tree, how layouts nest,
        and how loading/error boundaries work.
      </p>
    </>
  );
}
