import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FileTree } from "@/components/file-tree";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function LoadingAndError() {
  return (
    <div className="prose">
      <h1>Loading, Error, and Not-Found States</h1>

      <p>
        In a React app, you manually wrap components in{" "}
        <code>&lt;Suspense&gt;</code> and <code>&lt;ErrorBoundary&gt;</code> to
        handle async states. Next.js automates this with special files that map
        directly to these React primitives &mdash; giving you streaming,
        progressive rendering, and graceful error recovery with zero
        boilerplate.
      </p>

      <h2>The Mental Model</h2>

      <p>
        Every route segment in Next.js is automatically wrapped in a component
        hierarchy. The special files you create define the boundaries:
      </p>

      <CodeBlock language="tsx" filename="What Next.js generates under the hood">
{`<Layout>
  <ErrorBoundary fallback={<Error />}>
    <Suspense fallback={<Loading />}>
      <Page />
    </Suspense>
  </ErrorBoundary>
</Layout>`}
      </CodeBlock>

      <p>
        This is not a simplification &mdash; this is literally what happens. When
        you create a <code>loading.tsx</code> file, Next.js wraps your page in a{" "}
        <code>&lt;Suspense&gt;</code> boundary with your loading component as the
        fallback. This architectural decision has profound implications for how
        your app loads.
      </p>

      <FlowDiagram
        steps={[
          { label: "layout.tsx", sublabel: "Persists" },
          { label: "error.tsx", sublabel: "Error Boundary", color: "border-red-400 bg-red-50 text-red-800" },
          { label: "loading.tsx", sublabel: "Suspense", color: "border-amber-400 bg-amber-50 text-amber-800" },
          { label: "page.tsx", sublabel: "Content" },
        ]}
      />

      <h2>loading.tsx: Instant Loading States</h2>

      <p>
        When you navigate to a page that has async data fetching (which is most
        pages in a real app), the browser would normally show nothing until all
        data is ready. <code>loading.tsx</code> solves this by showing a fallback
        UI immediately while the page streams in.
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

      <Callout type="important" title="Why this matters for streaming">
        <p>
          Because <code>loading.tsx</code> creates a Suspense boundary, Next.js
          can <strong>stream</strong> the response. The layout and loading
          skeleton are sent to the browser immediately (within milliseconds),
          while the page continues to render on the server. When the page is
          ready, it streams in and replaces the loading skeleton &mdash; no
          full-page reload, no layout shift.
        </p>
      </Callout>

      <h3>How Streaming Works</h3>

      <p>
        Traditional server rendering waits for ALL data before sending ANY HTML.
        Streaming flips this: the server sends what it can immediately and fills
        in the rest as it becomes available.
      </p>

      <Diagram caption="Streaming vs Traditional SSR">
        <div className="w-full max-w-lg space-y-6 text-sm">
          <div>
            <p className="font-semibold mb-2 text-stone-700">Traditional SSR:</p>
            <div className="flex gap-1">
              <div className="flex-1 h-8 bg-stone-300 rounded flex items-center justify-center text-xs">
                Fetch all data...
              </div>
              <div className="w-20 h-8 bg-green-300 rounded flex items-center justify-center text-xs">
                Send HTML
              </div>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-2 text-stone-700">Streaming with Suspense:</p>
            <div className="flex gap-1">
              <div className="w-24 h-8 bg-green-300 rounded flex items-center justify-center text-xs">
                Shell + Loading
              </div>
              <div className="flex-1 h-8 bg-blue-200 rounded flex items-center justify-center text-xs">
                Stream content as ready...
              </div>
            </div>
          </div>
        </div>
      </Diagram>

      <p>
        The user sees a meaningful UI almost instantly (the layout + skeleton),
        and the actual content fills in progressively. This dramatically improves
        perceived performance, especially on slow connections.
      </p>

      <h2>error.tsx: Graceful Error Recovery</h2>

      <p>
        Without error boundaries, one failed API call crashes your entire page.
        <code>error.tsx</code> catches errors in its segment and renders a
        fallback, keeping the rest of the app functional.
      </p>

      <CodeBlock filename="app/dashboard/error.tsx" language="tsx" highlight={[1]}>
{`"use client"; // Error components MUST be Client Components

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600">
        Something went wrong
      </h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="warning" title="error.tsx must be a Client Component">
        <p>
          Error boundaries are a client-side React feature. The{" "}
          <code>&quot;use client&quot;</code> directive is required. The{" "}
          <code>reset</code> function re-renders the segment, attempting to
          recover without a full page reload.
        </p>
      </Callout>

      <h3>Error Boundary Placement</h3>

      <p>
        A critical detail: <code>error.tsx</code> catches errors from its
        sibling <code>page.tsx</code> and all child segments, but it does{" "}
        <strong>not</strong> catch errors in its sibling{" "}
        <code>layout.tsx</code>. Why? Because the error boundary nests inside
        the layout:
      </p>

      <CodeBlock language="tsx" filename="Effective nesting">
{`<Layout>              {/* Errors here are NOT caught */}
  <ErrorBoundary>     {/* error.tsx */}
    <Page />          {/* Errors here ARE caught */}
  </ErrorBoundary>
</Layout>`}
      </CodeBlock>

      <p>
        To catch errors in a layout, place <code>error.tsx</code> in the parent
        segment. For the root layout, use <code>global-error.tsx</code> at the
        app level.
      </p>

      <h2>not-found.tsx: Handling Missing Content</h2>

      <p>
        When a dynamic route receives an ID that does not exist, you want a
        contextual 404 &mdash; not a generic page. <code>not-found.tsx</code>{" "}
        provides this, and you trigger it by calling <code>notFound()</code>:
      </p>

      <CodeBlock filename="app/blog/[slug]/page.tsx" language="tsx" highlight={[8, 9]}>
{`import { notFound } from "next/navigation";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound(); // Renders the nearest not-found.tsx
  }

  return <article>{post.content}</article>;
}`}
      </CodeBlock>

      <CodeBlock filename="app/blog/[slug]/not-found.tsx" language="tsx">
{`import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold">Post Not Found</h2>
      <p className="text-gray-600 mt-2">
        This blog post doesn&apos;t exist or has been removed.
      </p>
      <Link href="/blog" className="text-blue-600 mt-4 inline-block">
        Browse all posts
      </Link>
    </div>
  );
}`}
      </CodeBlock>

      <h2>Nested Error and Loading States</h2>

      <p>
        The real power is that these files are scoped to their segment. You can
        have different loading and error states at every level of your route
        hierarchy:
      </p>

      <FileTree
        title="Granular Loading and Error States"
        items={[
          {
            name: "app",
            type: "folder",
            children: [
              { name: "loading.tsx", type: "file", annotation: "App-level skeleton" },
              { name: "error.tsx", type: "file", annotation: "App-level fallback" },
              {
                name: "dashboard",
                type: "folder",
                children: [
                  { name: "loading.tsx", type: "file", highlight: true, annotation: "Dashboard skeleton" },
                  { name: "error.tsx", type: "file", highlight: true, annotation: "Dashboard error" },
                  { name: "page.tsx", type: "file" },
                  {
                    name: "analytics",
                    type: "folder",
                    children: [
                      { name: "loading.tsx", type: "file", highlight: true, annotation: "Analytics skeleton" },
                      { name: "error.tsx", type: "file", highlight: true, annotation: "Analytics error" },
                      { name: "page.tsx", type: "file" },
                    ],
                  },
                ],
              },
            ],
          },
        ]}
      />

      <p>
        If <code>/dashboard/analytics</code> throws an error, only the analytics
        panel shows the error UI. The dashboard layout and other elements remain
        functional. The user can retry the failed section without losing their
        place.
      </p>

      <Callout type="tip" title="Design principle: contain the blast radius">
        <p>
          Place <code>error.tsx</code> files at the most granular level that
          makes sense. The goal is to keep as much of the page functional as
          possible when one part fails. Think of each segment as an independent
          failure domain.
        </p>
      </Callout>

      <h2>Why This Architecture Matters</h2>

      <p>
        This system gives you three critical capabilities that are hard to build
        manually:
      </p>

      <ul>
        <li>
          <strong>Progressive rendering</strong> &mdash; users see content as soon
          as any part is ready, not after everything is ready
        </li>
        <li>
          <strong>Isolated failures</strong> &mdash; one broken component does not
          take down the entire page
        </li>
        <li>
          <strong>Instant navigation feel</strong> &mdash; loading skeletons show
          immediately while data fetches, making the app feel fast even on slow
          networks
        </li>
      </ul>

      <p>
        And you get all of this by simply creating files with the right names.
        No manual Suspense boundary management, no custom error boundary
        libraries, no loading state plumbing through props or context.
      </p>

      <Quiz
        question="An error.tsx file is placed in app/dashboard/. Which of these errors will it catch?"
        options={[
          { label: "An error thrown inside app/dashboard/layout.tsx" },
          {
            label: "An error thrown inside app/dashboard/page.tsx or app/dashboard/settings/page.tsx",
            correct: true,
            explanation:
              "error.tsx catches errors from its sibling page.tsx and all child segments. It does NOT catch errors from its sibling layout.tsx because the error boundary nests inside the layout. To catch layout errors, place error.tsx in the parent segment.",
          },
          { label: "An error thrown in app/layout.tsx (root layout)" },
          { label: "All errors anywhere in the application" },
        ]}
      />

      <Quiz
        question="Why does creating a loading.tsx enable streaming, rather than just showing a spinner?"
        options={[
          { label: "loading.tsx is a Server Component that fetches data in parallel" },
          { label: "loading.tsx delays hydration until content is ready" },
          {
            label: "loading.tsx creates a Suspense boundary, allowing the server to send the shell immediately and stream page content as it resolves",
            correct: true,
            explanation:
              "A loading.tsx file becomes the fallback of a Suspense boundary wrapping the page. This tells React's streaming renderer to send everything above the boundary immediately, then stream the resolved content later. Without the Suspense boundary, the server would wait for all data before sending anything.",
          },
          { label: "loading.tsx uses a Web Worker to render content off the main thread" },
        ]}
      />

      <HandsOn
        title="Build Progressive Loading States"
        steps={[
          "Create app/dashboard/page.tsx with a simulated slow fetch: await new Promise(r => setTimeout(r, 3000))",
          "Navigate to /dashboard and observe the blank screen while waiting",
          "Create app/dashboard/loading.tsx with a skeleton UI (animated pulse divs)",
          "Navigate again — the skeleton appears instantly while the page loads",
          "Create app/dashboard/error.tsx with a reset button",
          "Make your page throw an error (throw new Error('DB connection failed'))",
          "Observe the error UI appears within the layout, and clicking reset retries the page",
          "Move the error to layout.tsx and see that error.tsx does NOT catch it — then add error.tsx to the parent segment",
        ]}
      />
    </div>
  );
}
