import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FileTree } from "@/components/file-tree";
import { Diagram, FlowDiagram } from "@/components/diagram";
import { ShortAnswer } from "@/components/short-answer";

export function RenderingModels() {
  return (
    <div>
      <h1>Rendering Models in Next.js: From SSR to Streaming</h1>

      <p>
        Every web page has to be built somewhere — either ahead of time on a
        server, or right when you ask for it, or somewhere in between. Those
        choices are called <strong>rendering models</strong>, and Next.js
        supports four of them. The names sound scary (SSR, SSG, ISR, streaming)
        but the ideas are simple. Let&apos;s use a restaurant.
      </p>

      <Callout type="tip" title="The whole lesson in one analogy">
        <ul>
          <li>
            <strong>SSG</strong> = a vending machine. Pre-made food, instant,
            but it&apos;s been sitting there a while.
          </li>
          <li>
            <strong>ISR</strong> = a sushi conveyor belt. Pre-made, but a chef
            replaces the plates every few minutes.
          </li>
          <li>
            <strong>SSR</strong> = a single-chef restaurant. Cooked fresh just
            for you — but the whole table is served at once, so you wait for
            the slowest dish.
          </li>
          <li>
            <strong>Streaming</strong> = tapas / dim sum. Each small plate
            arrives the moment it&apos;s ready. You start eating immediately.
          </li>
        </ul>
      </Callout>

      <p>
        Same kitchen, four very different experiences for the diner. The rest
        of this lesson walks through each one, shows what kind of website it
        suits, and ends with the streaming model that powers modern Next.js.
      </p>

      <h2>SSG — Static Site Generation</h2>

      <p>
        <strong>The idea:</strong> Next.js builds your page once, when you
        deploy. From then on, every visitor gets the same pre-made HTML. No
        database is touched at request time — the page just sits on a CDN
        waiting to be served.
      </p>

      <p>
        <strong>The analogy:</strong> A vending machine. The snacks were made
        in a factory weeks ago. You press a button, you get one instantly. The
        vending machine doesn&apos;t cook anything for you.
      </p>

      <p>
        <strong>Real-world examples:</strong>
      </p>
      <ul>
        <li>Marketing landing pages (Vercel.com, Stripe&apos;s product pages)</li>
        <li>Documentation sites (MDN, Tailwind docs, the Next.js docs themselves)</li>
        <li>Personal blogs and portfolios</li>
        <li>Conference and event websites</li>
      </ul>

      <p>
        These all share a trait: <em>the same content is shown to every
        visitor, and it doesn&apos;t change minute-to-minute.</em>
      </p>

      <Callout type="info" title="The catch">
        Because the page is frozen at build time, the data inside it can go
        stale. If you rebuild only once a day and a product price changes, the
        site will show the old price until the next deploy.
      </Callout>

      <h2>ISR — Incremental Static Regeneration</h2>

      <p>
        <strong>The idea:</strong> Same as SSG (pre-built, served from a CDN),
        but Next.js will quietly rebuild the page in the background every X
        seconds, so the data stays reasonably fresh.
      </p>

      <p>
        <strong>The analogy:</strong> A sushi conveyor belt. Plates are
        pre-made and sitting on the belt for instant grabbing — but a chef
        circles around every few minutes replacing old plates with new ones.
      </p>

      <p>
        <strong>Real-world examples:</strong>
      </p>
      <ul>
        <li>E-commerce category pages (an Amazon listing — the products don&apos;t change every second)</li>
        <li>News article pages (BBC, NYT — published once, occasionally edited)</li>
        <li>High-traffic recipe sites and food blogs</li>
        <li>Real-estate listings</li>
      </ul>

      <Callout type="info" title="The tradeoff">
        ISR feels nearly as fast as SSG, with fresher data — but you accept a
        staleness window. If you set a 60-second refresh, a visitor might see
        59-second-old data. That&apos;s usually fine for a product page; not
        fine for a stock ticker.
      </Callout>

      <h2>SSR — Server-Side Rendering (the classic kind)</h2>

      <p>
        <strong>The idea:</strong> When a request comes in, the server fetches
        all the data the page needs, builds the full HTML, and only then sends
        it back. Fresh every time, but the visitor stares at a blank screen
        until the slowest data is ready.
      </p>

      <p>
        <strong>The analogy:</strong> A single-chef restaurant where the chef
        refuses to bring out anything until the entire table&apos;s order is
        plated. If your steak takes 20 minutes, the appetizers sit getting
        cold while everyone waits.
      </p>

      <p>
        <strong>Real-world examples:</strong>
      </p>
      <ul>
        <li>Banking dashboards and admin panels (must be live, must be per-user)</li>
        <li>Account settings pages</li>
        <li>Personalized social feeds in older Next.js apps</li>
        <li>
          Anywhere the page must reflect <em>this exact user</em> at{" "}
          <em>this exact moment</em>
        </li>
      </ul>

      <Callout type="warning" title="Why this hits a wall">
        Imagine a product page that fetches the product (50ms), reviews
        (200ms), and personalized recommendations (3 seconds). With classic
        SSR, the visitor waits the full 3 seconds before seeing <em>any</em>{" "}
        of the page — even though the product info was ready almost
        immediately. The page is one all-or-nothing unit.
      </Callout>

      <p>
        Older Next.js (Pages Router, before v13) used a function called{" "}
        <code>getServerSideProps</code> to do this. You don&apos;t need to
        learn it — modern App Router replaces it with something better.
      </p>

      <h2>Streaming — the modern App Router model</h2>

      <p>
        <strong>The idea:</strong> Stop treating the page as one giant block.
        Send the parts that are ready immediately, and stream in the slower
        parts as they finish. The user starts seeing your site in
        milliseconds.
      </p>

      <p>
        <strong>The analogy:</strong> Tapas, or dim sum. Small plates leave
        the kitchen the moment they&apos;re ready. You don&apos;t wait for
        anything. By the time the slow dish arrives, you&apos;re already
        eating and happy.
      </p>

      <p>
        <strong>Real-world examples:</strong>
      </p>
      <ul>
        <li>
          Twitter/X and LinkedIn timelines — your tweet list shows up
          instantly while &quot;who to follow&quot; suggestions stream in
          afterward
        </li>
        <li>
          Amazon product detail pages — the product info appears first,
          reviews stream in next, personalized recommendations last
        </li>
        <li>
          Email clients like Gmail — your inbox list is there immediately, the
          message body fills in when you click
        </li>
        <li>
          Analytics dashboards — KPIs render right away, slow chart queries
          arrive later
        </li>
      </ul>

      <p>
        Notice the pattern: each of these pages is a <em>mix</em> of fast and
        slow data. Streaming was designed for exactly that situation.
      </p>

      <h2>What the user actually sees</h2>

      <p>
        Forget the technical diagrams for a moment. Here&apos;s what the
        visitor experiences for the same product page rendered two different
        ways:
      </p>

      <Diagram caption="Classic SSR — visitor stares at a blank tab the whole time">
{`Time     What the user sees
-----    -----------------------------
0ms      [blank white screen]
500ms    [blank white screen]
1000ms   [blank white screen]
2000ms   [blank white screen]
3000ms   [FULL PAGE APPEARS at once]`}
      </Diagram>

      <Diagram caption="Streaming — page builds up before the user's eyes">
{`Time     What the user sees
-----    -----------------------------
0ms      [page shell + header]
100ms    + product photo and name
300ms    + reviews section
3000ms   + personalized recommendations`}
      </Diagram>

      <p>
        Both pages contain identical content. The streaming version just
        doesn&apos;t make the visitor wait on the slowest piece.
      </p>

      <h2>A few words you&apos;ll keep hearing</h2>

      <p>Three pieces of jargon are worth knowing in plain English:</p>

      <ul>
        <li>
          <strong>TTFB (Time To First Byte)</strong> — how many milliseconds
          pass before the browser receives the very first chunk of your page.
          With classic SSR, TTFB is bad (you wait for everything). With
          streaming, TTFB is great (the shell is sent immediately).
        </li>
        <li>
          <strong>Hydration</strong> — when the browser receives HTML, that
          HTML is just a static drawing. Hydration is when JavaScript loads
          and &quot;fills in the colors&quot; — making buttons clickable,
          forms submittable, animations alive. Like bringing a coloring book
          page to life.
        </li>
        <li>
          <strong>Suspense boundary</strong> — a <code>&lt;Suspense&gt;</code>{" "}
          tag you wrap around a slow section. It tells React: &quot;this part
          is allowed to load on its own schedule — show this fallback in the
          meantime.&quot; It&apos;s the unit of streaming.
        </li>
      </ul>

      <h2>What streaming code looks like</h2>

      <p>
        Here&apos;s a product page in modern Next.js. The thing to notice is
        that each section fetches its own data, and each one is wrapped in its
        own <code>&lt;Suspense&gt;</code> boundary so it can stream
        independently.
      </p>

      <CodeBlock language="tsx" filename="app/products/[id]/page.tsx">
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
      {/* Renders almost immediately */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails id={params.id} />
      </Suspense>

      {/* Streams in when reviews are ready */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={params.id} />
      </Suspense>

      {/* Streams in last -- and that's fine */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={params.id} />
      </Suspense>
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="tip" title="The key shift in your head">
        In old Next.js, <em>the page</em> was the unit of rendering. In modern
        Next.js, <em>each Suspense boundary</em> is a unit. That one change is
        why streaming feels so much faster.
      </Callout>

      <h2>How streaming actually works under the hood</h2>

      <p>
        You don&apos;t need to memorize this, but a quick peek demystifies the
        magic. When Next.js hits a <code>&lt;Suspense&gt;</code> wrapping a
        slow async component, it:
      </p>

      <ol>
        <li>Sends the fallback HTML immediately, so the page is visible</li>
        <li>Keeps rendering everything else in parallel</li>
        <li>
          When the slow component finishes, sends a tiny{" "}
          <code>&lt;script&gt;</code> tag that swaps the fallback out for the
          real content
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

      <h2>The four models, side by side</h2>

      <figure className="my-8">
        <div className="rounded-xl border border-card-border bg-card p-4 overflow-x-auto">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(110px, 1fr) minmax(160px, 1.2fr) minmax(150px, 1.2fr) minmax(90px, 0.8fr) minmax(120px, 1fr)",
              gap: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 600, paddingBottom: "0.5rem", borderBottom: "1px solid var(--card-border)" }}>Model</div>
            <div style={{ fontWeight: 600, paddingBottom: "0.5rem", borderBottom: "1px solid var(--card-border)" }}>When rendered</div>
            <div style={{ fontWeight: 600, paddingBottom: "0.5rem", borderBottom: "1px solid var(--card-border)" }}>Data freshness</div>
            <div style={{ fontWeight: 600, paddingBottom: "0.5rem", borderBottom: "1px solid var(--card-border)" }}>TTFB</div>
            <div style={{ fontWeight: 600, paddingBottom: "0.5rem", borderBottom: "1px solid var(--card-border)" }}>Granularity</div>

            <div style={{ fontFamily: "var(--font-mono)" }}>SSG</div>
            <div>Build time</div>
            <div>Stale</div>
            <div>Fastest</div>
            <div>Page</div>

            <div style={{ fontFamily: "var(--font-mono)" }}>ISR</div>
            <div>Build + interval</div>
            <div>Slightly stale</div>
            <div>Fast</div>
            <div>Page</div>

            <div style={{ fontFamily: "var(--font-mono)" }}>SSR</div>
            <div>Every request</div>
            <div>Fresh</div>
            <div>Slow</div>
            <div>Page</div>

            <div style={{ fontFamily: "var(--font-mono)" }}>Streaming</div>
            <div>Every request</div>
            <div>Fresh</div>
            <div>Fast*</div>
            <div>Component</div>
          </div>
          <p className="text-xs text-muted mt-3">* Streaming sends initial HTML almost immediately (fast TTFB) then progressively fills in content.</p>
        </div>
        <figcaption className="text-center text-sm text-muted mt-3 italic">
          Rendering Models Comparison
        </figcaption>
      </figure>

      <Callout type="tip" title="TL;DR">
        Old Next.js made the whole page wait for the slowest piece of data.
        Streaming lets each section show up the moment it&apos;s ready. That
        is the single biggest reason the App Router exists.
      </Callout>

      <Quiz
        question="A product page needs three pieces of data: product info (50ms), reviews (200ms), and personalized recommendations (3s). With classic SSR (Pages Router), what does the visitor see for the first 3 seconds?"
        options={[
          { label: "The product info appears first, reviews next, recommendations last" },
          { label: "A blank screen, until everything is ready", correct: true, explanation: "Classic SSR sends nothing until all data has been fetched and the full HTML is built. The visitor stares at a blank tab for 3 seconds — even though the product data was ready in 50ms. Streaming was invented to fix exactly this problem." },
          { label: "Skeleton loaders for each section, replaced as data arrives" },
          { label: "The product info and reviews, with a spinner where recommendations will go" },
        ]}
      />

      <Quiz
        question="Which kind of website is the BEST fit for SSG (static site generation)?"
        options={[
          { label: "A live stock-trading dashboard" },
          { label: "A user's private inbox" },
          { label: "A documentation site like the Tailwind docs", correct: true, explanation: "SSG shines when (a) the same content is shown to every visitor and (b) the content changes infrequently. Documentation, marketing pages, and personal blogs all fit. Live data and per-user pages do not." },
          { label: "A real-time chat application" },
        ]}
      />

      <Quiz
        question="What is the unit of rendering in the App Router's streaming model?"
        options={[
          { label: "The page" },
          { label: "The layout" },
          { label: "The Suspense boundary", correct: true, explanation: "Each <Suspense> is an independent rendering unit. Next.js sends the fallback right away, then streams the real content in when it's ready. This is what frees us from the page-level all-or-nothing rendering of classic SSR." },
          { label: "The route segment" },
        ]}
      />

      <HandsOn
        title="Feel streaming with your own eyes"
        projectStep="Step 8 of 40 — Blog Platform Project"
        projectContext="Open your my-blog project from the previous lessons."
        steps={[
          "Open `app/posts/page.tsx` in your editor.",
          "At the very top of the file, add this import: `import { Suspense } from 'react';`",
          "Below the import, add this slow component (paste it above your page component): `async function SlowSection() { await new Promise(r => setTimeout(r, 3000)); return <p>I took 3 seconds to load!</p>; }`",
          "Inside the JSX your page already returns, add this line somewhere visible: `<Suspense fallback={<p>Loading the slow part...</p>}><SlowSection /></Suspense>`",
          "Save the file and visit `http://localhost:3000/posts` in your browser.",
          "Watch carefully: the rest of the page (the post list) appears INSTANTLY, and the words \"Loading the slow part...\" show where the slow component will go. Three seconds later, that fallback is replaced with \"I took 3 seconds to load!\" — without the rest of the page reloading.",
          "That is streaming. The slow section did not block anything else. Try removing the `<Suspense>` wrapper (leave just `<SlowSection />`) and refresh — now the WHOLE page waits 3 seconds before showing anything. That is the old SSR behaviour.",
        ]}
      />

      <ShortAnswer
        question="ISR and SSR both serve dynamic-feeling content, but they're very different mechanisms. Explain the actual difference, and pick a real-world page that fits each."
        rubric={[
          "ISR serves a cached static page instantly to every visitor; after a configured time window, the next visit triggers a background rebuild (that visitor still gets the cached version) and subsequent visitors see the fresh one — fast for everyone, occasionally fresh",
          "SSR renders the page from scratch on every request — always fresh but always pays the render cost",
          "Good fits: ISR for product pages or blog posts where content changes a few times a day; SSR for personalized feeds, search results, or dashboards where every user/request must be live",
        ]}
        topic="ISR vs SSR — the real difference and when to use each"
      />
    </div>
  );
}
