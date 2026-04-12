import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function CacheLifeProfiles() {
  return (
    <div>
      <h1>Cache Life Profiles</h1>
      <p className="lead">
        Caching without expiration control is dangerous -- you either serve stale data forever or never benefit from caching at all. Next.js 16 introduces <strong>cacheLife profiles</strong> to give you precise control over how long cached data stays fresh.
      </p>

      <h2>Built-in Profiles</h2>
      <p>
        Next.js ships with three built-in profiles that cover the most common use cases:
      </p>

      <Diagram caption="Built-in cacheLife profiles and their durations">
        <div className="w-full max-w-lg space-y-3 text-sm">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <code className="font-mono font-bold text-blue-800 w-20">&apos;hours&apos;</code>
            <div className="flex-1">
              <div className="text-blue-800 font-medium">Short-lived cache</div>
              <div className="text-blue-600 text-xs">Good for: frequently updated content, news feeds</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-purple-50 border border-purple-200">
            <code className="font-mono font-bold text-purple-800 w-20">&apos;days&apos;</code>
            <div className="flex-1">
              <div className="text-purple-800 font-medium">Medium-lived cache</div>
              <div className="text-purple-600 text-xs">Good for: blog posts, product pages, documentation</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-green-50 border border-green-200">
            <code className="font-mono font-bold text-green-800 w-20">&apos;max&apos;</code>
            <div className="flex-1">
              <div className="text-green-800 font-medium">Long-lived cache</div>
              <div className="text-green-600 text-xs">Good for: static content, rarely changing data</div>
            </div>
          </div>
        </div>
      </Diagram>

      <h3>Using Built-in Profiles</h3>
      <p>
        Import <code>cacheLife</code> from <code>next/cache</code> and call it inside any component or function that has <code>&quot;use cache&quot;</code>:
      </p>

      <CodeBlock filename="app/blog/[slug]/page.tsx" language="tsx" highlight={[4]}>
{`"use cache"

import { cacheLife } from 'next/cache'
import { getPost } from '@/lib/blog'

export default async function BlogPost({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  cacheLife('days')

  const { slug } = await params
  const post = await getPost(slug)

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  )
}`}
      </CodeBlock>

      <CodeBlock filename="lib/products.ts" language="typescript" highlight={[5]}>
{`import { cacheLife } from 'next/cache'

export async function getProductCatalog() {
  "use cache"
  cacheLife('hours')

  const res = await fetch('https://api.store.com/products')
  return res.json()
}

export async function getStaticContent() {
  "use cache"
  cacheLife('max')

  const res = await fetch('https://cms.example.com/footer')
  return res.json()
}`}
      </CodeBlock>

      <Callout type="info">
        <p>If you use <code>&quot;use cache&quot;</code> without calling <code>cacheLife()</code>, Next.js applies a sensible default duration. However, being explicit about your cache lifetime is strongly recommended -- it makes your caching strategy visible and intentional.</p>
      </Callout>

      <h2>Custom Profiles</h2>
      <p>
        The built-in profiles will not cover every scenario. You can define custom profiles in your <code>next.config.ts</code> with precise expiration times:
      </p>

      <CodeBlock filename="next.config.ts" language="typescript">
{`import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    // Custom profile: cache for 5 minutes
    'short': {
      expire: 300, // seconds
    },
    // Custom profile: cache for 1 week
    'weekly': {
      expire: 604800,
    },
    // Custom profile: cache for 30 seconds (near-real-time)
    'realtime': {
      expire: 30,
    },
  },
}

export default nextConfig`}
      </CodeBlock>

      <p>Then use your custom profiles exactly like the built-in ones:</p>

      <CodeBlock filename="app/stock-price/page.tsx" language="tsx">
{`"use cache"

import { cacheLife } from 'next/cache'

export default async function StockPrice() {
  cacheLife('realtime') // Your custom 30-second profile

  const price = await fetchStockPrice('AAPL')
  return <div>AAPL: \${price}</div>
}`}
      </CodeBlock>

      <h2>Inline Cache Duration</h2>
      <p>
        For one-off cases where defining a named profile feels like overkill, you can pass an inline object directly to <code>cacheLife</code>:
      </p>

      <CodeBlock filename="components/weather.tsx" language="tsx" highlight={[5]}>
{`"use cache"

import { cacheLife } from 'next/cache'

export async function WeatherWidget({ city }: { city: string }) {
  cacheLife({ expire: 120 }) // Cache for 2 minutes

  const weather = await fetchWeather(city)

  return (
    <div>
      <span>{weather.temp}°F</span>
      <span>{weather.condition}</span>
    </div>
  )
}`}
      </CodeBlock>

      <Callout type="tip" title="When to use inline vs named profiles">
        <p>Use named profiles when the same duration appears in multiple places -- it keeps your caching strategy consistent and easy to adjust globally. Use inline objects for truly unique one-off durations that only apply to a single component.</p>
      </Callout>

      <h2>SWR Behavior: Stale-While-Revalidate</h2>
      <p>
        Cache Components use a <strong>stale-while-revalidate</strong> (SWR) pattern under the hood. Here is how it works:
      </p>

      <FlowDiagram
        steps={[
          { label: "Fresh", sublabel: "Serve cached", color: "border-green-300 bg-green-50 text-green-800" },
          { label: "Stale", sublabel: "Serve cached + revalidate", color: "border-amber-300 bg-amber-50 text-amber-800" },
          { label: "Expired", sublabel: "Recompute fresh", color: "border-red-300 bg-red-50 text-red-800" },
        ]}
      />

      <p>
        When cached content is within its <code>expire</code> time, it is served directly. Once past the fresh period but not yet expired, the stale version is served immediately to the user while a background revalidation regenerates the content. After full expiration, the next request triggers a fresh computation.
      </p>
      <p>
        This means users almost never wait for content to be generated -- they either get the fresh cached version or the stale version while the new one is being prepared.
      </p>

      <CodeBlock language="typescript">
{`// Example: understanding the timeline
cacheLife({ expire: 3600 }) // 1 hour

// t=0:    Content generated and cached
// t=30m:  Request → served from cache (fresh)
// t=59m:  Request → served from cache (fresh)
// t=61m:  Request → served stale + background revalidation starts
// t=61m+: Next request gets the fresh version`}
      </CodeBlock>

      <Callout type="important" title="SWR means fast responses">
        <p>The SWR pattern guarantees that users get a fast response even when the cache is being refreshed. The &quot;worst case&quot; is serving slightly stale data for one request -- which is almost always preferable to making the user wait for a full recomputation.</p>
      </Callout>

      <Quiz
        question="You have a product page that updates a few times per day. Which cacheLife profile is the best fit?"
        options={[
          { label: "'max' -- cache as long as possible", explanation: "'max' is for content that rarely changes. Product pages that update multiple times daily would serve stale data too long." },
          { label: "'hours' -- cache for a few hours", correct: true, explanation: "Correct! 'hours' is ideal for content that updates several times per day. It provides good caching benefits while ensuring updates appear within a reasonable window." },
          { label: "'days' -- cache for several days", explanation: "'days' would be too long for content that updates multiple times daily -- users would see outdated information." },
          { label: "No cacheLife -- let it be dynamic", explanation: "Going fully dynamic wastes server resources for content that only changes a few times per day. Caching with 'hours' gives a much better performance-to-freshness tradeoff." },
        ]}
      />

      <Quiz
        question="What happens when a request arrives for content that has passed its expire time?"
        options={[
          { label: "An error is thrown and the user sees a 500 page" },
          { label: "The stale content is served while the cache revalidates in the background", correct: true, explanation: "Correct! Next.js uses SWR (stale-while-revalidate) semantics. The stale version is served immediately so the user doesn't wait, while fresh content is generated in the background for subsequent requests." },
          { label: "The user waits for fresh content to be generated" },
          { label: "The cached entry is deleted and the page returns a 404" },
        ]}
      />

      <HandsOn
        title="Control how long your blog page stays cached"
        projectStep="Step 17 of 32 — Blog Platform Project"
        projectContext={'Your posts page is cached with "use cache". Now you will control how long that cache lasts.'}
        steps={[
          "Open app/posts/page.tsx. Below the \"use cache\" line, add: import { cacheLife } from 'next/cache' at the top of the file, then call cacheLife('hours') inside the component (before any JSX).",
          "Refresh the page a few times. The timestamp still stays the same, but now the cache will automatically expire after a few hours instead of lasting forever.",
          "Try changing 'hours' to 'days' or 'max' and restarting the dev server each time. Notice that 'max' keeps the cache the longest, 'hours' the shortest.",
          "Change it back to cacheLife('hours') for the posts page — this is a good fit since new blog posts could be added throughout the day.",
        ]}
      />
    </div>
  );
}
