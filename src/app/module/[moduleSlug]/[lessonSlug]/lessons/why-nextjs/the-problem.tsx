import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FlowDiagram } from "@/components/diagram";

export function TheProblem() {
  return (
    <>
      <h1>The Problem with SPAs</h1>

      <p>
        You know React. You can build complex UIs, manage state, compose
        components. But if you've ever tried to ship a React app to production
        and make it <em>fast</em>, <em>discoverable</em>, and{" "}
        <em>accessible to all users</em>, you've hit walls that React alone
        cannot solve.
      </p>

      <p>
        This lesson explains <strong>why</strong> frameworks like Next.js exist
        on top of React. Not because React is bad — but because React is a{" "}
        <strong>library</strong>, not a <strong>framework</strong>. It solves
        rendering. It does not solve delivery.
      </p>

      <h2>The Blank White Page</h2>

      <p>
        When you build a standard React app with Vite or Create React App, here
        is what the browser receives:
      </p>

      <CodeBlock filename="index.html" language="html">
        {`<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="/assets/bundle-4a8b2c.js"></script>
  </body>
</html>`}
      </CodeBlock>

      <p>
        That's it. An empty <code>&lt;div&gt;</code> and a JavaScript bundle.
        The user sees <strong>nothing</strong> until:
      </p>

      <FlowDiagram
        steps={[
          { label: "Browser requests HTML", sublabel: "~50ms" },
          { label: "Browser parses empty HTML", sublabel: "Instant" },
          {
            label: "Browser downloads JS bundle",
            sublabel: "200ms - 2s+",
            color: "red",
          },
          {
            label: "Browser parses & executes JS",
            sublabel: "100ms - 1s+",
            color: "red",
          },
          {
            label: "React renders to DOM",
            sublabel: "50ms - 500ms",
            color: "red",
          },
          {
            label: "User finally sees content",
            sublabel: "Total: 500ms - 4s+",
            color: "green",
          },
        ]}
      />

      <Callout type="important" title="Why this matters">
        On a fast MacBook with fast WiFi, you might not notice. On a $100 phone
        on a 3G connection in rural India, your users stare at a white screen for
        5-10 seconds. Google measures this — and penalizes you for it.
      </Callout>

      <h2>The SEO Problem</h2>

      <p>
        Search engine crawlers visit your page. What do they see? The same empty{" "}
        <code>&lt;div id="root"&gt;&lt;/div&gt;</code>. While Google's crawler
        can execute JavaScript, it:
      </p>

      <ul>
        <li>
          Deprioritizes JS-rendered content (it's expensive for them to render)
        </li>
        <li>May not wait for all your API calls to resolve</li>
        <li>Has a "crawl budget" — it won't spend infinite time on your site</li>
        <li>
          Social media crawlers (Twitter, Facebook, LinkedIn) do{" "}
          <strong>not</strong> execute JavaScript at all
        </li>
      </ul>

      <p>
        This means your carefully crafted blog post, product page, or landing
        page is invisible to most of the internet's discovery mechanisms.
      </p>

      <CodeBlock filename="What Google sees" language="html">
        {`<!-- Your React SPA -->
<html>
  <body>
    <div id="root"></div>
    <!-- That's it. No content. No metadata. Nothing to index. -->
  </body>
</html>

<!-- vs. A server-rendered page -->
<html>
  <head>
    <title>Best Running Shoes 2026 - Expert Reviews</title>
    <meta name="description" content="We tested 47 running shoes..." />
  </head>
  <body>
    <h1>Best Running Shoes 2026</h1>
    <article>
      <p>After testing 47 pairs over 6 months...</p>
      <!-- Full content immediately available -->
    </article>
  </body>
</html>`}
      </CodeBlock>

      <h2>The Data Fetching Waterfall</h2>

      <p>
        In a client-side React app, data fetching creates <strong>waterfalls</strong>.
        Each component that needs data must wait for its parent to render first,
        discover it needs data, then fetch it:
      </p>

      <CodeBlock filename="app.tsx" language="tsx" highlight={[5, 13, 22]}>
        {`// Component renders -> discovers it needs data -> fetches -> re-renders
function ProductPage({ id }: { id: string }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Fetch #1: Only starts AFTER component mounts
    fetch(\`/api/products/\${id}\`).then(r => r.json()).then(setProduct);
  }, [id]);

  if (!product) return <Spinner />;

  return (
    <div>
      <h1>{product.name}</h1>
      {/* This component won't even START fetching until product loads */}
      <Reviews productId={id} />
      <Recommendations category={product.category} />
    </div>
  );
}

function Reviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    // Fetch #2: Only starts AFTER ProductPage renders with data
    fetch(\`/api/reviews/\${productId}\`).then(r => r.json()).then(setReviews);
  }, [productId]);

  if (!reviews) return <Spinner />;
  return <div>{/* render reviews */}</div>;
}`}
      </CodeBlock>

      <p>The result is a <strong>request waterfall</strong>:</p>

      <FlowDiagram
        steps={[
          { label: "Download JS bundle", sublabel: "400ms" },
          { label: "Render shell, start fetch #1", sublabel: "50ms" },
          { label: "Wait for product data", sublabel: "300ms", color: "red" },
          { label: "Render product, start fetch #2", sublabel: "50ms" },
          { label: "Wait for reviews data", sublabel: "250ms", color: "red" },
          {
            label: "Page fully loaded",
            sublabel: "Total: 1050ms of sequential waits",
          },
        ]}
      />

      <Callout type="tip" title="The key insight">
        On the server, you have direct access to your database or internal APIs.
        You can fetch all the data <em>before</em> sending HTML to the client —
        in parallel, with no network round-trips. The user gets the full page in
        a single response.
      </Callout>

      <h2>The Bundle Size Problem</h2>

      <p>
        A React SPA ships <strong>all</strong> JavaScript to{" "}
        <strong>every</strong> user on <strong>every</strong> page load. Visit
        the homepage? You download the code for the settings page, the admin
        panel, every route. Even with code splitting (which React doesn't do by
        default), you need to manually configure it:
      </p>

      <CodeBlock filename="manual-splitting.tsx" language="tsx">
        {`// Without a framework, YOU must manually set up code splitting:
const AdminPanel = React.lazy(() => import('./AdminPanel'));
const Settings = React.lazy(() => import('./Settings'));
const Dashboard = React.lazy(() => import('./Dashboard'));

// YOU must configure your bundler (webpack/vite) correctly
// YOU must handle loading states for every split point
// YOU must decide WHERE to split (routes? components? both?)
// YOU must avoid over-splitting (too many small chunks = too many requests)

// Next.js does all of this automatically per-route.`}
      </CodeBlock>

      <h2>What React Doesn't Give You</h2>

      <p>
        React is a <strong>rendering library</strong>. Here's what it explicitly
        does <em>not</em> provide:
      </p>

      <ul>
        <li>
          <strong>Routing</strong> — No built-in way to map URLs to components
        </li>
        <li>
          <strong>Server rendering</strong> — React <em>can</em> render on a
          server, but doesn't provide the server
        </li>
        <li>
          <strong>Data fetching strategy</strong> — No opinion on when/where to
          fetch data
        </li>
        <li>
          <strong>Build optimization</strong> — No bundling, no code splitting,
          no tree shaking
        </li>
        <li>
          <strong>Image optimization</strong> — No responsive images, no lazy
          loading strategy
        </li>
        <li>
          <strong>Caching</strong> — No built-in cache layer for data or pages
        </li>
        <li>
          <strong>Deployment strategy</strong> — No opinion on static vs.
          dynamic vs. edge
        </li>
      </ul>

      <Callout type="info" title="Library vs. Framework">
        A <strong>library</strong> is a tool you call. A{" "}
        <strong>framework</strong> is an architecture you build within. React
        gives you <code>createElement</code> and a reconciler. Next.js gives you
        a complete system for building, optimizing, and delivering web
        applications.
      </Callout>

      <h2>The Real Cost: Developer Experience</h2>

      <p>
        Without a framework, building a production React app means assembling
        your own stack:
      </p>

      <CodeBlock filename="package.json (DIY stack)" language="json">
        {`{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0",
    "react-helmet-async": "^2.0.0",
    "@tanstack/react-query": "^5.0.0",
    "express": "^5.0.0",
    "vite": "^6.0.0",
    "vite-plugin-ssr": "^0.5.0"
  },
  "devDependencies": {
    "compression": "^1.7.0",
    "serve-static": "^2.0.0",
    "helmet": "^8.0.0"
  }
}`}
      </CodeBlock>

      <p>
        Each of these must be configured, kept in sync, and tested together.
        Version conflicts, breaking changes, and integration bugs become{" "}
        <em>your</em> problem. A framework solves this by providing a{" "}
        <strong>single, tested, integrated stack</strong>.
      </p>

      <Quiz
        question="Why does a standard React SPA show a blank white page before content appears?"
        options={[
          {
            label: "Because React has a bug in its rendering engine",
            explanation:
              "React works correctly — the issue is architectural, not a bug.",
          },
          {
            label:
              "Because the HTML contains no content — only a script tag that must download, parse, and execute before React can render anything",
            correct: true,
            explanation:
              "Correct! The server sends an empty div. The browser must download and execute the entire JS bundle before any content is visible. This is the fundamental SPA problem.",
          },
          {
            label: "Because CSS takes a long time to load",
            explanation:
              "CSS loading can contribute to delays, but the core issue is that the HTML itself has no content — it's entirely dependent on JavaScript execution.",
          },
          {
            label: "Because the browser is slow at parsing HTML",
            explanation:
              "HTML parsing is extremely fast. The bottleneck is JavaScript download and execution.",
          },
        ]}
      />

      <Quiz
        question="What is a 'request waterfall' in client-side data fetching?"
        options={[
          {
            label: "When too many users make requests at the same time",
            explanation:
              "That's a server scaling issue, not a waterfall. Waterfalls are about sequential dependencies in a single user's page load.",
          },
          {
            label: "When API requests fail and need to be retried",
            explanation:
              "Retries are a different problem. Waterfalls happen even when all requests succeed.",
          },
          {
            label:
              "When nested components can only start fetching data after their parent finishes fetching and rendering, creating sequential delays",
            correct: true,
            explanation:
              "Correct! Each component must render to discover its data needs, then fetch, then render children which repeat the pattern. On the server, all data can be fetched in parallel before any HTML is sent.",
          },
          {
            label: "When the server sends data in multiple chunks",
            explanation:
              "Chunked responses are actually a technique for improving performance (streaming), not a waterfall problem.",
          },
        ]}
      />

      <h2>Hands-On: See the Problem Yourself</h2>

      <HandsOn
        title="Measure a SPA's loading performance"
        steps={[
          "Open Chrome DevTools (F12) on any React SPA (or create one with `npm create vite@latest my-app -- --template react-ts`)",
          "Go to the Network tab and enable 'Slow 3G' throttling in the dropdown",
          "Hard refresh the page (Cmd+Shift+R / Ctrl+Shift+R) and watch the timeline",
          "Notice: the HTML arrives almost instantly but is empty. Then a large .js bundle downloads. Only after it executes do you see content.",
          "Now go to the Performance tab, check 'Screenshots', and record a page load",
          "Look at the 'Frames' row — count how many seconds the page is blank before First Contentful Paint (FCP)",
          "Right-click the page → View Source. Notice there's no meaningful content in the HTML.",
          "Compare this with a Next.js site (e.g., vercel.com): View Source shows full HTML content immediately available without JS.",
        ]}
      />

      <h2>Summary</h2>

      <p>
        React alone gives you a powerful rendering engine, but leaves you to
        solve production concerns yourself. The problems compound:
      </p>

      <ul>
        <li>
          Blank page until JavaScript loads → bad user experience, bad Core Web
          Vitals
        </li>
        <li>No content in HTML → invisible to search engines and social media</li>
        <li>
          Client-side waterfalls → slow time to interactive, wasted bandwidth
        </li>
        <li>
          No automatic code splitting → massive bundles shipped to every user
        </li>
        <li>
          DIY infrastructure → months of integration work instead of building
          features
        </li>
      </ul>

      <p>
        This is <em>why</em> Next.js exists. Not to replace React, but to solve
        everything React intentionally does not.
      </p>
    </>
  );
}
