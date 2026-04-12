import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function UseCache() {
  return (
    <div>
      <h1>The &quot;use cache&quot; Directive</h1>
      <p className="lead">
        The <code>&quot;use cache&quot;</code> directive is the heart of Next.js 16&apos;s caching system. Just like <code>&quot;use client&quot;</code> marks a boundary between server and client code, <code>&quot;use cache&quot;</code> marks a boundary between dynamic and cached code.
      </p>

      <h2>Where You Can Use It</h2>
      <p>
        The <code>&quot;use cache&quot;</code> directive can be placed at three levels, giving you fine-grained control over what gets cached:
      </p>

      <FlowDiagram
        steps={[
          { label: "Page Level", sublabel: "Cache entire page", color: "border-green-300 bg-green-50 text-green-800" },
          { label: "Component Level", sublabel: "Cache a subtree", color: "border-blue-300 bg-blue-50 text-blue-800" },
          { label: "Function Level", sublabel: "Cache a data call", color: "border-purple-300 bg-purple-50 text-purple-800" },
        ]}
      />

      <h3>1. Cache an Entire Page</h3>
      <p>
        Place <code>&quot;use cache&quot;</code> at the top of a page file to cache the entire page output. This is the equivalent of static rendering in previous Next.js versions -- but now it is explicit.
      </p>

      <CodeBlock filename="app/blog/page.tsx" language="tsx" highlight={[1]}>
{`"use cache"

import { getBlogPosts } from '@/lib/blog'

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div>
      <h1>Blog</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}`}
      </CodeBlock>

      <Callout type="info">
        <p>When you cache an entire page, the full HTML output is stored. Subsequent requests serve the cached version without re-executing any of the page&apos;s code -- including fetches, database queries, and component rendering.</p>
      </Callout>

      <h3>2. Cache a Component</h3>
      <p>
        This is where Cache Components really shine. You can cache individual components within an otherwise dynamic page. This is how PPR works in practice -- cached components form the static shell.
      </p>

      <CodeBlock filename="app/dashboard/sidebar.tsx" language="tsx" highlight={[1]}>
{`"use cache"

import { getNavItems } from '@/lib/navigation'

export async function Sidebar() {
  const navItems = await getNavItems()

  return (
    <nav className="w-64 border-r p-4">
      {navItems.map(item => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  )
}`}
      </CodeBlock>

      <CodeBlock filename="app/dashboard/page.tsx" language="tsx">
{`// This page is dynamic (no "use cache"), but includes a cached component
import { Sidebar } from './sidebar'
import { UserActivity } from './user-activity'

export default async function DashboardPage() {
  return (
    <div className="flex">
      {/* Cached - serves instantly */}
      <Sidebar />

      {/* Dynamic - renders fresh each request */}
      <main>
        <UserActivity />
      </main>
    </div>
  )
}`}
      </CodeBlock>

      <h3>3. Cache a Function</h3>
      <p>
        You can also cache individual async functions. This is useful for expensive computations or data fetches that you want to reuse across multiple components.
      </p>

      <CodeBlock filename="lib/data.ts" language="typescript" highlight={[3]}>
{`import { cacheLife } from 'next/cache'

export async function getProductCatalog() {
  "use cache"
  cacheLife('hours')

  const res = await fetch('https://api.store.com/products')
  return res.json()
}`}
      </CodeBlock>

      <Callout type="tip" title="Function-level caching is composable">
        <p>Multiple components can call the same cached function. The result is computed once and shared. This replaces the old pattern of relying on fetch deduplication.</p>
      </Callout>

      <h2>How Cache Keys Are Generated</h2>
      <p>
        You might wonder: how does Next.js know when to serve a cached version vs. computing a fresh one? The answer is <strong>automatic cache key generation</strong>.
      </p>
      <p>
        Next.js creates a unique cache key based on:
      </p>
      <ul>
        <li><strong>The file path</strong> of the cached component or function</li>
        <li><strong>The props</strong> passed to the component (serialized)</li>
        <li><strong>Any closed-over variables</strong> referenced from the parent scope</li>
      </ul>

      <CodeBlock filename="app/products/[id]/page.tsx" language="tsx">
{`"use cache"

// The cache key for this page automatically includes the 'id' param.
// /products/1 and /products/2 get separate cache entries.
export default async function ProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  return <ProductDetails product={product} />
}`}
      </CodeBlock>

      <Diagram caption="Cache key generation is automatic based on inputs">
        <div className="space-y-3 text-sm w-full max-w-md">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <code className="font-mono text-blue-800">/products/1</code>
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-blue-800">Cache Key: <code>page-products-id:1</code></span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
            <code className="font-mono text-purple-800">/products/2</code>
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-purple-800">Cache Key: <code>page-products-id:2</code></span>
          </div>
        </div>
      </Diagram>

      <Callout type="warning" title="Props must be serializable">
        <p>Since props become part of the cache key, they must be serializable (strings, numbers, plain objects). You cannot pass functions, classes, or other non-serializable values as props to a cached component.</p>
      </Callout>

      <h2>Enabling Cache Components</h2>
      <p>
        Remember, you need to enable this feature in your config:
      </p>

      <CodeBlock filename="next.config.ts" language="typescript" highlight={[4]}>
{`import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig`}
      </CodeBlock>

      <p>
        Without this flag, the <code>&quot;use cache&quot;</code> directive will be ignored and your components will render dynamically.
      </p>

      <Quiz
        question={'Where can you place the "use cache" directive?'}
        options={[
          { label: "Only at the top of page files" },
          { label: "At the top of page files, component files, or inside async functions", correct: true, explanation: 'Correct! "use cache" works at three levels: entire pages, individual components, and async functions. This gives you fine-grained control over your caching strategy.' },
          { label: "Only inside Server Components, not in functions" },
          { label: "Anywhere, including Client Components" },
        ]}
      />

      <h2>What Cannot Be Cached</h2>
      <p>There are a few things to keep in mind about what cannot cross the cache boundary:</p>
      <ul>
        <li><strong>Non-serializable props</strong> -- functions, class instances, Symbols</li>
        <li><strong>Request-specific data</strong> -- cookies and headers are not available inside cached components (they would break the cache key)</li>
        <li><strong>Client Components</strong> -- <code>&quot;use cache&quot;</code> is a server-side concept; Client Components cannot use it</li>
      </ul>

      <CodeBlock filename="This will NOT work" language="tsx">
{`"use cache"

import { cookies } from 'next/headers'

export async function UserGreeting() {
  // ERROR: cookies() cannot be called inside a cached component
  // because cookies are per-request and would invalidate the cache
  const token = cookies().get('session')
  // ...
}`}
      </CodeBlock>

      <Callout type="tip">
        <p>If you need request-specific data alongside cached content, keep the cached and dynamic parts in separate components. The dynamic component reads cookies/headers; the cached component handles the expensive data fetching.</p>
      </Callout>

      <Quiz
        question="How does Next.js generate cache keys for a cached component?"
        options={[
          { label: "You must manually specify a cache key string" },
          { label: "It uses the component's file path, props, and closed-over variables automatically", correct: true, explanation: "Correct! Next.js automatically generates cache keys from the file path, serialized props, and any variables captured from the parent scope. You never need to manage cache keys manually." },
          { label: "It uses a hash of the component's source code" },
          { label: "It uses the URL path only" },
        ]}
      />

      <HandsOn
        title={'Add "use cache" to your blog posts page'}
        projectStep="Step 16 of 40 — Blog Platform Project"
        projectContext={'Your posts page shows a timestamp that changes on every refresh. Now you will cache it.'}
        steps={[
          "Open next.config.ts and add cacheComponents: true inside the nextConfig object. Save the file.",
          'Now open app/posts/page.tsx and add "use cache" as the very first line of the file (above all imports).',
          "Refresh the page a few times. The timestamp should now stay the same — the page is being served from cache instead of re-rendering.",
          "Try changing the heading text in app/posts/page.tsx. Even after saving, the old cached version may still show. Stop and restart the dev server to clear the cache and see your change.",
        ]}
      />
    </div>
  );
}
