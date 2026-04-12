import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function FetchingInServerComponents() {
  return (
    <>
      <h1>Fetching Data in Server Components</h1>
      <p className="lead">
        Server Components fundamentally change how you think about data fetching.
        Instead of fetching data <em>after</em> the component mounts in the browser,
        you fetch it <em>during</em> rendering on the server. No useEffect. No loading
        spinners on first load. No client-side waterfalls.
      </p>

      <h2>The Old Way: Client-Side Fetching</h2>
      <p>
        In a traditional React app, data fetching follows a predictable but wasteful
        pattern: render empty shell, mount, trigger useEffect, show spinner, fetch data,
        re-render with data.
      </p>

      <CodeBlock filename="Traditional React (Client-Side)" language="tsx">
{`"use client";
import { useState, useEffect } from "react";

export function ProductPage({ id }: { id: string }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(\`/api/products/\${id}\`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Spinner />;
  return <ProductDetails product={product} />;
}`}
      </CodeBlock>

      <p>
        This pattern has three fundamental problems: the user sees a loading spinner
        before any content, the browser must download JavaScript before fetching begins,
        and the API endpoint is publicly exposed.
      </p>

      <FlowDiagram
        steps={[
          { label: "Download JS", sublabel: "~200ms" },
          { label: "Hydrate", sublabel: "~100ms" },
          { label: "useEffect fires", sublabel: "~0ms" },
          { label: "Fetch API", sublabel: "~300ms" },
          { label: "Re-render", sublabel: "User sees data" },
        ]}
      />

      <h2>The New Way: Async Server Components</h2>
      <p>
        In Next.js with Server Components, your component is an async function that
        directly awaits data. The server resolves the data before sending HTML to the
        client. The user sees content immediately.
      </p>

      <CodeBlock filename="app/products/[id]/page.tsx" language="tsx" highlight={[3, 4, 5]}>
{`export default async function ProductPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetch(\`https://api.store.com/products/\${id}\`);
  const data = await product.json();

  return <ProductDetails product={data} />;
}`}
      </CodeBlock>

      <Callout type="important" title="This is revolutionary">
        <p>
          There is no loading state to manage. No useEffect. No useState. The component
          simply awaits its data and renders. The HTML sent to the browser already
          contains the product information.
        </p>
      </Callout>

      <FlowDiagram
        steps={[
          { label: "Server fetches", sublabel: "~50ms (co-located)" },
          { label: "Render HTML", sublabel: "~10ms" },
          { label: "Send to browser", sublabel: "User sees data", color: "border-green-500 bg-green-50 text-green-800" },
        ]}
      />

      <h2>Direct Database Access</h2>
      <p>
        Because Server Components run exclusively on the server, you can query your
        database directly. No API layer needed. No REST endpoints. No GraphQL resolvers.
        Just a function call.
      </p>

      <CodeBlock filename="app/dashboard/page.tsx" language="tsx" highlight={[1, 6, 7]}>
{`import { db } from "@/lib/database";

export default async function Dashboard() {
  const user = await getAuthenticatedUser();

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div>
      <h1>Welcome back, {user.name}</h1>
      <OrderList orders={orders} />
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="tip" title="No API route required">
        <p>
          This database query never leaves the server. The client receives only the
          rendered HTML. Your database credentials, query logic, and raw data are
          completely hidden from the browser.
        </p>
      </Callout>

      <h2>The fetch() API with Caching</h2>
      <p>
        Next.js extends the native fetch() API to provide automatic request deduplication.
        If multiple components fetch the same URL during a single render pass, the request
        is made only once.
      </p>

      <CodeBlock filename="Request Deduplication" language="tsx">
{`// Both of these components are in the same render tree
async function Header() {
  // This fetch is automatically deduplicated
  const user = await fetch("https://api.example.com/user");
  return <nav>{/* ... */}</nav>;
}

async function Sidebar() {
  // Same URL = same request, no duplicate network call
  const user = await fetch("https://api.example.com/user");
  return <aside>{/* ... */}</aside>;
}`}
      </CodeBlock>

      <Callout type="info" title="Deduplication scope">
        <p>
          Request deduplication works within a single server render pass. If you fetch
          the same URL in two components that render together, only one network request
          is made. This means you can fetch data where you need it without worrying
          about redundant calls.
        </p>
      </Callout>

      <h2>When to Use Server vs Client Fetching</h2>

      <Diagram caption="Decision guide: where should this fetch happen?">
        <div className="text-sm space-y-3 w-full max-w-md">
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <strong className="text-green-800">Server Component fetch:</strong>
            <ul className="mt-1 text-green-700 list-disc list-inside">
              <li>Initial page data</li>
              <li>SEO-critical content</li>
              <li>Database queries</li>
              <li>Data that needs secrets/API keys</li>
            </ul>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <strong className="text-blue-800">Client Component fetch:</strong>
            <ul className="mt-1 text-blue-700 list-disc list-inside">
              <li>User interactions (infinite scroll, search-as-you-type)</li>
              <li>Real-time data (WebSockets, polling)</li>
              <li>Data that changes without navigation</li>
            </ul>
          </div>
        </div>
      </Diagram>

      <Quiz
        question="Why don't Server Components need useEffect for data fetching?"
        options={[
          {
            label: "useEffect is deprecated in React 19",
            explanation: "useEffect is not deprecated. It still works in Client Components for side effects.",
          },
          {
            label: "Server Components are async functions that resolve data before sending HTML to the client",
            correct: true,
            explanation: "Correct! Server Components run on the server and can directly await data. The result is already-rendered HTML sent to the browser, so there's no mount/effect cycle.",
          },
          {
            label: "Next.js automatically converts useEffect calls to server fetches",
            explanation: "There is no automatic conversion. Server Components simply don't support hooks at all because they never run in the browser.",
          },
          {
            label: "The data is injected via props from the layout",
            explanation: "While layouts can pass data, the key insight is that each Server Component can independently await its own data.",
          },
        ]}
      />

      <h2>Error Handling</h2>
      <p>
        When a fetch fails in a Server Component, you can handle it with standard
        try/catch or let it bubble up to the nearest error boundary.
      </p>

      <CodeBlock filename="app/products/[id]/page.tsx" language="tsx">
{`import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(\`https://api.store.com/products/\${id}\`);

  if (!res.ok) {
    if (res.status === 404) notFound(); // renders not-found.tsx
    throw new Error("Failed to fetch product"); // renders error.tsx
  }

  const product = await res.json();
  return <ProductDetails product={product} />;
}`}
      </CodeBlock>

      <Quiz
        question="What happens when two Server Components in the same render tree fetch the same URL?"
        options={[
          {
            label: "Both requests are sent, doubling the load on the API",
            explanation: "Next.js deduplicates fetch requests with the same URL and options within a render pass.",
          },
          {
            label: "The second component receives stale data from cache",
            explanation: "It's not stale data — it's the same fresh request, just deduplicated.",
          },
          {
            label: "Only one network request is made, and both components receive the same response",
            correct: true,
            explanation: "Correct! Next.js automatically deduplicates fetch() calls with identical URLs within a single server render. You can freely fetch data where you need it.",
          },
          {
            label: "A build-time error is thrown for duplicate fetches",
            explanation: "Duplicate fetches are not errors — they're expected and handled automatically.",
          },
        ]}
      />

      <HandsOn
        title="Fetch posts from a real API"
        projectStep="Step 12 of 32 — Blog Platform Project"
        projectContext="Open your my-blog project. Your posts page currently imports data from a local file. Now you will fetch posts from a free public API instead."
        steps={[
          "Open app/posts/page.tsx. Remove the import of your local posts data. Make the function async by adding the async keyword: export default async function PostsPage()",
          "Inside the function, fetch posts from a public API: const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5'); const posts = await res.json(); — no useState or useEffect needed, just a normal await.",
          "Update your JSX to display the fetched posts: {posts.map((post: any) => <li key={post.id}>{post.title}</li>)}. Refresh http://localhost:3000/posts — you should see 5 post titles from the API.",
          "Right-click the page and choose View Page Source. You should see the post titles right there in the HTML. The server fetched the data and sent finished HTML to the browser — the browser never had to call the API itself.",
        ]}
      />

      <Callout type="warning" title="Common mistake">
        <p>
          Do not mark a component as &quot;use client&quot; just because it fetches data.
          Client Components should only be used when you need interactivity (event
          handlers, useState, useEffect for subscriptions). If a component only needs
          data to render, keep it as a Server Component.
        </p>
      </Callout>
    </>
  );
}
