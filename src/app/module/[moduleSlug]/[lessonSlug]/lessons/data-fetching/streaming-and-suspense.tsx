import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function StreamingAndSuspense() {
  return (
    <>
      <h1>Streaming and Suspense</h1>
      <p className="lead">
        Traditional server rendering is all-or-nothing: the server must finish fetching
        all data before sending any HTML. Streaming breaks this constraint by sending
        HTML in chunks as each piece becomes ready, dramatically improving Time to First
        Byte (TTFB) and perceived performance.
      </p>

      <h2>The Problem with Blocking Renders</h2>
      <p>
        Imagine a dashboard with three sections: a user profile (fast, 50ms), a list of
        orders (medium, 300ms), and analytics charts (slow, 2000ms). Without streaming,
        the user stares at a blank page for 2+ seconds while the server waits for the
        slowest query.
      </p>

      <FlowDiagram
        steps={[
          { label: "Request", sublabel: "Browser" },
          { label: "Wait 2000ms", sublabel: "Server blocked", color: "border-red-400 bg-red-50 text-red-800" },
          { label: "Send full HTML", sublabel: "All at once" },
          { label: "User sees page", sublabel: "After 2s+" },
        ]}
      />

      <h2>How Streaming Works</h2>
      <p>
        With streaming, the HTTP response is not a single payload. It is a continuous
        stream. The server sends the page shell immediately, then flushes additional
        HTML chunks as each async component resolves. The browser progressively renders
        content as it arrives.
      </p>

      <FlowDiagram
        steps={[
          { label: "Request", sublabel: "Browser" },
          { label: "Shell + Profile", sublabel: "50ms", color: "border-green-500 bg-green-50 text-green-800" },
          { label: "Orders chunk", sublabel: "+300ms", color: "border-green-500 bg-green-50 text-green-800" },
          { label: "Analytics chunk", sublabel: "+2000ms", color: "border-green-500 bg-green-50 text-green-800" },
        ]}
      />

      <Callout type="important" title="The HTTP response is a stream">
        <p>
          The response uses <code>Transfer-Encoding: chunked</code>. The browser does
          not wait for the connection to close before rendering. Each chunk contains
          HTML that React knows how to swap into the correct Suspense boundary location.
        </p>
      </Callout>

      <h2>React Suspense: The Streaming Primitive</h2>
      <p>
        React Suspense is the mechanism that makes streaming possible. When a Server
        Component awaits data, React &quot;suspends&quot; that subtree and renders the
        fallback UI instead. Once the data resolves, the server streams a replacement
        chunk that swaps the fallback for the real content.
      </p>

      <CodeBlock filename="app/dashboard/page.tsx" language="tsx" highlight={[8, 9, 10, 11, 12]}>
{`import { Suspense } from "react";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <UserProfile /> {/* Fast — renders immediately */}

      <Suspense fallback={<OrdersSkeleton />}>
        <Orders /> {/* Medium — streams when ready */}
      </Suspense>

      <Suspense fallback={<AnalyticsSkeleton />}>
        <Analytics /> {/* Slow — streams last */}
      </Suspense>
    </div>
  );
}`}
      </CodeBlock>

      <CodeBlock filename="app/dashboard/components.tsx" language="tsx">
{`async function UserProfile() {
  const user = await getUser(); // 50ms
  return <div className="profile">{user.name}</div>;
}

async function Orders() {
  const orders = await getOrders(); // 300ms
  return <OrderList orders={orders} />;
}

async function Analytics() {
  const data = await getAnalytics(); // 2000ms
  return <Charts data={data} />;
}`}
      </CodeBlock>

      <Diagram caption="Timeline: What the user sees as chunks arrive">
        <div className="w-full max-w-lg space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="w-16 text-right font-mono text-muted">50ms</span>
            <div className="flex-1 p-2 rounded bg-green-100 border border-green-300 text-green-800">
              Shell + UserProfile rendered. Orders and Analytics show skeletons.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-right font-mono text-muted">300ms</span>
            <div className="flex-1 p-2 rounded bg-blue-100 border border-blue-300 text-blue-800">
              Orders chunk arrives. Skeleton replaced with real order list.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-right font-mono text-muted">2000ms</span>
            <div className="flex-1 p-2 rounded bg-purple-100 border border-purple-300 text-purple-800">
              Analytics chunk arrives. Skeleton replaced with charts.
            </div>
          </div>
        </div>
      </Diagram>

      <h2>loading.tsx: Automatic Suspense Boundaries</h2>
      <p>
        Next.js provides a file convention that creates Suspense boundaries automatically.
        When you add a <code>loading.tsx</code> file to a route segment, Next.js wraps
        that segment&apos;s page in a Suspense boundary with your loading component as
        the fallback.
      </p>

      <CodeBlock filename="app/dashboard/loading.tsx" language="tsx">
{`export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-64 bg-gray-200 rounded" />
      <div className="h-32 bg-gray-200 rounded" />
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="info" title="What Next.js does behind the scenes">
        <p>
          A <code>loading.tsx</code> file is syntactic sugar. Next.js transforms it into:
        </p>
        <pre className="mt-2 text-xs">
{`<Layout>
  <Suspense fallback={<Loading />}>
    <Page />
  </Suspense>
</Layout>`}
        </pre>
        <p className="mt-2">
          The layout renders instantly, and the page content streams in when ready.
        </p>
      </Callout>

      <h2>Why TTFB Improves</h2>
      <p>
        Time to First Byte (TTFB) measures how quickly the server sends the first byte
        of the response. Without streaming, TTFB equals the time of your slowest data
        fetch. With streaming, TTFB equals the time to render the shell — often under
        50ms regardless of how slow your data sources are.
      </p>

      <Diagram caption="TTFB comparison: blocking vs streaming">
        <div className="w-full max-w-md space-y-4 text-sm">
          <div className="space-y-1">
            <div className="font-semibold text-red-700">Without streaming</div>
            <div className="flex h-8 rounded overflow-hidden">
              <div className="bg-red-200 flex items-center justify-center flex-1 border-r border-red-300">
                <span className="text-xs text-red-800">Server blocked (2000ms)</span>
              </div>
              <div className="bg-red-400 w-12 flex items-center justify-center">
                <span className="text-xs text-white">Send</span>
              </div>
            </div>
            <div className="text-xs text-muted">TTFB: ~2000ms</div>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-green-700">With streaming</div>
            <div className="flex h-8 rounded overflow-hidden">
              <div className="bg-green-400 w-16 flex items-center justify-center border-r border-green-500">
                <span className="text-xs text-white">Shell</span>
              </div>
              <div className="bg-green-200 flex-1 flex items-center justify-center">
                <span className="text-xs text-green-800">Chunks arrive progressively...</span>
              </div>
            </div>
            <div className="text-xs text-muted">TTFB: ~50ms</div>
          </div>
        </div>
      </Diagram>

      <h2>Nested Suspense Boundaries</h2>
      <p>
        You can nest Suspense boundaries for granular loading states. The outer boundary
        resolves first, revealing inner boundaries that are still loading.
      </p>

      <CodeBlock filename="Nested Suspense" language="tsx">
{`<Suspense fallback={<PageSkeleton />}>
  <Header /> {/* resolves first, reveals below */}

  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar /> {/* independent stream */}
  </Suspense>

  <Suspense fallback={<ContentSkeleton />}>
    <MainContent /> {/* independent stream */}
  </Suspense>
</Suspense>`}
      </CodeBlock>

      <Callout type="tip" title="Granularity trade-off">
        <p>
          More Suspense boundaries mean more granular loading states, but also more
          layout shift as pieces pop in. Find the right balance: group related content
          in one boundary so it appears together, and separate independent sections
          that have very different fetch times.
        </p>
      </Callout>

      <Quiz
        question="What does a loading.tsx file create in Next.js?"
        options={[
          {
            label: "A client-side loading spinner that shows during navigation",
            explanation: "It works during navigation, but the mechanism is a Suspense boundary — not just a spinner.",
          },
          {
            label: "A Suspense boundary that wraps the page, allowing the layout to render immediately while the page streams in",
            correct: true,
            explanation: "Correct! loading.tsx becomes the fallback of a Suspense boundary that Next.js wraps around the page component. The layout and loading state render instantly while the page data resolves.",
          },
          {
            label: "A static HTML file served while JavaScript loads",
            explanation: "It's not a static file. It's a React component used as a Suspense fallback during server-side streaming.",
          },
          {
            label: "An error boundary fallback for failed fetches",
            explanation: "Error boundaries use error.tsx, not loading.tsx. loading.tsx is specifically for Suspense fallbacks.",
          },
        ]}
      />

      <h2>How the Browser Handles Streamed Chunks</h2>
      <p>
        When a suspended component resolves, the server sends a small script tag
        containing the HTML and instructions to swap it into the correct location.
        React&apos;s streaming runtime on the client handles this swap without a full
        page re-render.
      </p>

      <CodeBlock filename="What the streamed chunk looks like (simplified)" language="html">
{`<!-- Initial response: fallback is shown -->
<div id="S:1">
  <div class="animate-pulse">Loading orders...</div>
</div>

<!-- Later chunk arrives: -->
<script>
  // React replaces the fallback with real content
  $RC("S:1", "<div class='orders'><ul>...</ul></div>")
</script>`}
      </CodeBlock>

      <Quiz
        question="Why does streaming improve TTFB compared to traditional server rendering?"
        options={[
          {
            label: "The server compresses the response more efficiently",
            explanation: "Compression is unrelated to streaming. Both approaches can use gzip/brotli.",
          },
          {
            label: "The server sends the shell and fast components immediately without waiting for slow data fetches",
            correct: true,
            explanation: "Correct! The server starts sending HTML as soon as the shell is ready. Slow async components resolve later and stream in as additional chunks. TTFB reflects when the first bytes are sent, not when the entire page is complete.",
          },
          {
            label: "The server uses HTTP/2 push to preload resources",
            explanation: "HTTP/2 push is a different mechanism. Streaming uses chunked transfer encoding within a single HTTP response.",
          },
          {
            label: "The server caches the page and returns it instantly on subsequent requests",
            explanation: "Caching is a separate optimization. Streaming benefits even the first uncached request.",
          },
        ]}
      />

      <HandsOn
        title="Show a loading state while data loads"
        projectStep="Step 14 of 32 — Blog Platform Project"
        projectContext="Open your my-blog project. Your posts page fetches data from an API, but the user sees nothing until all the data arrives. Now you will show a loading message while the data loads."
        steps={[
          "Open app/posts/page.tsx. Move your fetch logic into a new async function component called PostList in the same file. Have your main page component render <PostList /> instead of doing the fetch directly.",
          "At the top of app/posts/page.tsx, add: import { Suspense } from 'react'. Then wrap your PostList in a Suspense boundary: <Suspense fallback={<p>Loading posts...</p>}><PostList /></Suspense>",
          "To see the loading state clearly, add a fake delay inside PostList before the fetch: await new Promise(resolve => setTimeout(resolve, 2000)); — this makes it wait 2 seconds.",
          "Refresh http://localhost:3000/posts. You should see 'Loading posts...' for about 2 seconds, then the real posts appear. The page heading shows up right away while the slow part loads in the background.",
          "Remove the fake delay when you are done. The Suspense boundary will still work — it just shows the loading state for however long the real fetch takes.",
        ]}
      />

      <Callout type="warning" title="Streaming requires a runtime">
        <p>
          Streaming only works with the Node.js or Edge runtime. Statically exported
          pages (output: &apos;export&apos;) cannot stream because the HTML is generated
          at build time. If your page uses dynamic data and you want streaming, ensure
          the route is dynamically rendered.
        </p>
      </Callout>
    </>
  );
}
