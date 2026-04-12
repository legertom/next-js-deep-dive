import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FileTree } from "@/components/file-tree";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function RenderingModels() {
  return (
    <div>
      <h1>Rendering Models in Next.js: From SSR to Streaming</h1>

      <p>
        If you've used Next.js before version 13, you're familiar with{" "}
        <code>getServerSideProps</code>, <code>getStaticProps</code>, and maybe{" "}
        <code>revalidate</code>. These were the building blocks of rendering in
        the Pages Router. But they all shared a fundamental limitation: the page
        was the unit of rendering. You couldn't stream parts of a page
        independently. Let's trace the evolution and understand why streaming
        changes the game.
      </p>

      <h2>The Classic Models</h2>

      <h3>SSR (Server-Side Rendering)</h3>

      <p>
        With SSR, the server renders the full HTML for every request. The browser
        gets a complete page, then hydrates it with JavaScript to make it
        interactive.
      </p>

      <CodeBlock
        language="tsx"
        filename="pages/products/[id].tsx (Pages Router)"
      >
        {`// Pages Router - SSR
export async function getServerSideProps({ params }) {
  // This runs on EVERY request
  const product = await db.product.findUnique({ where: { id: params.id } });
  const reviews = await db.review.findMany({ where: { productId: params.id } });
  const recommendations = await getRecommendations(params.id);

  return {
    props: { product, reviews, recommendations }
  };
}

export default function ProductPage({ product, reviews, recommendations }) {
  return (
    <Layout>
      <ProductDetails product={product} />
      <Reviews reviews={reviews} />
      <Recommendations items={recommendations} />
    </Layout>
  );
}`}
      </CodeBlock>

      <Callout type="warning" title="The SSR bottleneck">
        Notice how ALL three data fetches must complete before the user sees
        ANYTHING. If <code>getRecommendations</code> takes 3 seconds, the entire
        page is blocked for 3 seconds. The page is an all-or-nothing unit.
      </Callout>

      <h3>SSG (Static Site Generation)</h3>

      <p>
        SSG renders pages at build time. Lightning fast for the user, but the
        data is frozen at the moment of build.
      </p>

      <CodeBlock language="tsx" filename="pages/blog/[slug].tsx (Pages Router)">
        {`// Pages Router - SSG
export async function getStaticPaths() {
  const posts = await db.post.findMany({ select: { slug: true } });
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const post = await db.post.findUnique({ where: { slug: params.slug } });
  return { props: { post } };
}

export default function BlogPost({ post }) {
  return <Article post={post} />;
}`}
      </CodeBlock>

      <h3>ISR (Incremental Static Regeneration)</h3>

      <p>
        ISR was Next.js's clever middle ground: serve static pages, but
        regenerate them in the background after a time interval.
      </p>

      <CodeBlock language="tsx" filename="pages/products/[id].tsx (Pages Router)">
        {`export async function getStaticProps({ params }) {
  const product = await db.product.findUnique({ where: { id: params.id } });
  return {
    props: { product },
    revalidate: 60 // Regenerate at most once every 60 seconds
  };
}`}
      </CodeBlock>

      <Callout type="info" title="ISR's tradeoff">
        ISR gives you static-like performance with fresher data, but the
        staleness window is fixed. A user might see 59-second-old data. And
        again, the entire page is the unit of caching -- you can't revalidate
        just one section.
      </Callout>

      <h2>Why These Models Hit a Wall</h2>

      <FlowDiagram
        title="Traditional SSR: Sequential Waterfall"
        steps={[
          "Request arrives",
          "Fetch ALL data (slowest fetch wins)",
          "Render FULL HTML",
          "Send complete response",
          "Browser downloads JS bundle",
          "Hydrate ENTIRE page",
          "Page becomes interactive",
        ]}
      />

      <p>The limitations boil down to three core problems:</p>

      <ol>
        <li>
          <strong>All-or-nothing data fetching:</strong> The page waits for the
          slowest query. You can't show what's ready while waiting for what's
          slow.
        </li>
        <li>
          <strong>All-or-nothing hydration:</strong> React must hydrate the
          entire page before any part becomes interactive. A heavy component
          blocks interactivity for everything.
        </li>
        <li>
          <strong>Page-level granularity:</strong> Caching, rendering strategy,
          and data freshness are all decided at the page level. You can't have a
          static header with a dynamic feed on the same page without client-side
          fetching hacks.
        </li>
      </ol>

      <h2>Enter Streaming: The New Model</h2>

      <p>
        React 18 introduced streaming SSR with Suspense. Next.js App Router
        builds entirely on this. Instead of waiting for everything, the server
        streams HTML as it becomes ready.
      </p>

      <FlowDiagram
        title="Streaming: Progressive Rendering"
        steps={[
          "Request arrives",
          "Immediately send shell HTML + fast data",
          "Stream in slower sections as they resolve",
          "Each section hydrates independently",
          "Progressive interactivity",
        ]}
      />

      <CodeBlock language="tsx" filename="app/products/[id]/page.tsx (App Router)">
        {`import { Suspense } from 'react';

// Each component fetches its OWN data
async function ProductDetails({ id }: { id: string }) {
  const product = await db.product.findUnique({ where: { id } });
  return <div>{/* render product */}</div>;
}

async function Reviews({ productId }: { productId: string }) {
  const reviews = await db.review.findMany({ where: { productId } });
  return <div>{/* render reviews */}</div>;
}

async function Recommendations({ productId }: { productId: string }) {
  // This is slow -- 3 seconds! But it won't block anything else.
  const recs = await getRecommendations(productId);
  return <div>{/* render recommendations */}</div>;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      {/* This renders immediately */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails id={params.id} />
      </Suspense>

      {/* This streams in when ready */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={params.id} />
      </Suspense>

      {/* This streams in last -- and that's fine */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={params.id} />
      </Suspense>
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="tip" title="The key insight">
        With streaming, each Suspense boundary is an independent unit. Fast data
        shows immediately. Slow data streams in later. The user never stares at a
        blank page waiting for your slowest API call.
      </Callout>

      <h2>How Streaming Actually Works Under the Hood</h2>

      <p>
        When a request comes in, Next.js starts rendering your component tree.
        When it hits a Suspense boundary wrapping an async component that hasn't
        resolved yet, it:
      </p>

      <ol>
        <li>Renders the fallback HTML and sends it immediately</li>
        <li>Continues rendering other parts of the tree</li>
        <li>
          When the async component resolves, it sends a{" "}
          <code>&lt;script&gt;</code> tag that swaps the fallback with the real
          content
        </li>
      </ol>

      <CodeBlock language="html" filename="What the browser receives (simplified)">
        {`<!-- Sent immediately -->
<div id="product-shell">
  <div data-suspense-id="reviews">
    <div class="skeleton">Loading reviews...</div>
  </div>
</div>

<!-- Streamed in 200ms later -->
<script>
  // React replaces the skeleton with real content
  $RC("reviews", "<div class='reviews'>...</div>")
</script>

<!-- Streamed in 3s later -->
<script>
  $RC("recommendations", "<div class='recs'>...</div>")
</script>`}
      </CodeBlock>

      <h2>Comparing All Four Models</h2>

      <Diagram caption="Rendering Models Comparison">
        <table>
          <thead>
            <tr><th>Model</th><th>When rendered</th><th>Data freshness</th><th>TTFB</th><th>Granularity</th></tr>
          </thead>
          <tbody>
            <tr><td>SSG</td><td>Build time</td><td>Stale</td><td>Fastest</td><td>Page</td></tr>
            <tr><td>ISR</td><td>Build + interval</td><td>Slightly stale</td><td>Fast</td><td>Page</td></tr>
            <tr><td>SSR</td><td>Every request</td><td>Fresh</td><td>Slow</td><td>Page</td></tr>
            <tr><td>Streaming</td><td>Every request</td><td>Fresh</td><td>Fast*</td><td>Component</td></tr>
          </tbody>
        </table>
        <p>* Streaming sends initial HTML almost immediately (fast TTFB) then progressively fills in content.</p>
      </Diagram>

      <Quiz
        question="In the traditional SSR model (Pages Router), what happens if one of three data fetches in getServerSideProps takes 5 seconds?"
        options={[
          { label: "The two fast sections render immediately, the slow one shows a loading state" },
          { label: "The entire page is delayed by 5 seconds -- nothing is sent until all fetches complete", correct: true, explanation: "In the Pages Router SSR model, getServerSideProps must fully resolve before ANY HTML is sent to the browser. All fetches run in sequence by default (unless you Promise.all them), and even then the page still waits for all data before sending the response. Streaming solves this by allowing independent sections to arrive as they become ready." },
          { label: "Next.js automatically parallelizes fetches so it only takes as long as the slowest one" },
          { label: "The page renders without data and fetches client-side" },
        ]}
      />

      <Quiz
        question="What is the fundamental unit of rendering in the App Router's streaming model?"
        options={[
          { label: "The page" },
          { label: "The layout" },
          { label: "The Suspense boundary", correct: true, explanation: "In the streaming model, each Suspense boundary is an independent rendering unit. The server can send the fallback immediately and stream in the resolved content later. This is what breaks us free from page-level all-or-nothing rendering." },
          { label: "The route segment" },
        ]}
      />

      <HandsOn
        title="See streaming in action"
        steps={[
          "Create a new App Router page with three async components, each with a different artificial delay (use `await new Promise(r => setTimeout(r, ms))`).",
          "Wrap each in its own Suspense boundary with a visible skeleton.",
          "Open the Network tab in DevTools and watch the HTML response. You'll see the document stay open as chunks arrive over time.",
          "Now remove the Suspense boundaries. Notice how the page now waits for the slowest component before showing anything.",
        ]}
      />
    </div>
  );
}
