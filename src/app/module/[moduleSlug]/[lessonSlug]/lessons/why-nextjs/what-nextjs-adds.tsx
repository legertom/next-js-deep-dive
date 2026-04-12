import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FileTree } from "@/components/file-tree";
import { FlowDiagram } from "@/components/diagram";

export function WhatNextjsAdds() {
  return (
    <>
      <h1>What Next.js Adds to React</h1>

      <p>
        Next.js is a <strong>framework layer</strong> on top of React. It takes
        React's rendering primitives and wraps them in a complete system for
        building and delivering web applications. Every feature it adds exists
        because of a real production problem that React alone doesn't solve.
      </p>

      <p>
        Let's walk through each major addition, understand <em>why</em> it
        exists, and see what it looks like in practice.
      </p>

      <h2>1. File-System Routing</h2>

      <h3>Why it exists</h3>

      <p>
        React has no concept of "pages" or "URLs." In a plain React app, you
        install a router library, manually define route mappings, configure
        layouts, handle nested routes, and manage loading/error states yourself.
        This is boilerplate that every React app needs — so Next.js makes it
        automatic.
      </p>

      <h3>How it works</h3>

      <p>
        Your file structure <em>is</em> your routing configuration. No config
        files. No route definitions. The filesystem is the source of truth:
      </p>

      <FileTree
        title="App Router file structure"
        items={[
          {
            name: "app",
            type: "folder",
            children: [
              {
                name: "page.tsx",
                type: "file",
                annotation: "→ /",
              },
              {
                name: "layout.tsx",
                type: "file",
                annotation: "wraps all pages",
              },
              {
                name: "about",
                type: "folder",
                children: [
                  {
                    name: "page.tsx",
                    type: "file",
                    annotation: "→ /about",
                  },
                ],
              },
              {
                name: "blog",
                type: "folder",
                children: [
                  {
                    name: "page.tsx",
                    type: "file",
                    annotation: "→ /blog",
                  },
                  {
                    name: "[slug]",
                    type: "folder",
                    children: [
                      {
                        name: "page.tsx",
                        type: "file",
                        annotation: "→ /blog/my-post",
                        highlight: true,
                      },
                    ],
                  },
                ],
              },
              {
                name: "dashboard",
                type: "folder",
                children: [
                  {
                    name: "layout.tsx",
                    type: "file",
                    annotation: "nested layout",
                  },
                  {
                    name: "page.tsx",
                    type: "file",
                    annotation: "→ /dashboard",
                  },
                  {
                    name: "settings",
                    type: "folder",
                    children: [
                      {
                        name: "page.tsx",
                        type: "file",
                        annotation: "→ /dashboard/settings",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]}
      />

      <Callout type="tip" title="The deeper insight">
        File-system routing isn't just about convenience. It enables{" "}
        <strong>automatic code splitting</strong>. Because Next.js knows your
        route boundaries at build time, it can split your JavaScript per-route
        without any configuration. Each page only loads the code it needs.
      </Callout>

      <h2>2. Rendering Strategies</h2>

      <h3>Why they exist</h3>

      <p>
        Different content has different needs. A marketing page can be built once
        at deploy time. A social feed must be fresh on every request. A user
        dashboard needs real-time data but can show a cached shell. React gives
        you one strategy: client-side rendering. Next.js gives you{" "}
        <strong>four</strong>:
      </p>

      <CodeBlock filename="Static Generation (SSG)" language="tsx" highlight={[2]}>
        {`// This page is built ONCE at deploy time → served as static HTML
// WHY: Fastest possible. No server needed. CDN-cacheable globally.
// USE FOR: Marketing pages, docs, blog posts

export default function AboutPage() {
  return <h1>About Us</h1>;
}

// No data fetching = automatically static in Next.js 16`}
      </CodeBlock>

      <CodeBlock
        filename="Server-Side Rendering (SSR)"
        language="tsx"
        highlight={[3, 4]}
      >
        {`// This page is rendered on EVERY request
// WHY: Content must be fresh. Personalized. Can't be pre-built.
// USE FOR: Search results, personalized feeds, real-time data

export default async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q } = await searchParams;
  const results = await db.search(q); // Runs on server every request

  return (
    <ul>
      {results.map(r => <li key={r.id}>{r.title}</li>)}
    </ul>
  );
}`}
      </CodeBlock>

      <CodeBlock
        filename="Incremental Static Regeneration (ISR)"
        language="tsx"
        highlight={[3, 4, 5]}
      >
        {`// The best of both worlds: static speed with fresh data
// WHY: Serve cached HTML instantly, then revalidate in the background
// USE FOR: Product pages, news articles — content that changes but not every second

export const revalidate = 60; // Revalidate at most every 60 seconds

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.products.findById(id);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <span>\${product.price}</span>
    </div>
  );
}`}
      </CodeBlock>

      <CodeBlock filename="Streaming with Suspense" language="tsx" highlight={[8, 9, 10]}>
        {`// Send HTML progressively as data becomes available
// WHY: Don't block the entire page on the slowest data source
// USE FOR: Pages where some parts are fast and some are slow

import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* This renders immediately */}
      <UserGreeting />

      {/* This streams in when ready — user sees a skeleton first */}
      <Suspense fallback={<ChartSkeleton />}>
        <AnalyticsChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  );
}`}
      </CodeBlock>

      <h2>3. React Server Components</h2>

      <h3>Why they exist</h3>

      <p>
        This is the biggest paradigm shift. Before Server Components, every
        React component shipped its JavaScript to the browser — even components
        that only format data or query a database. Server Components let you keep
        component code <strong>on the server</strong>, sending only the rendered
        HTML to the client.
      </p>

      <CodeBlock filename="app/posts/page.tsx" language="tsx" highlight={[1, 5, 6]}>
        {`// This is a Server Component by DEFAULT in Next.js 16
// Its code is NEVER sent to the browser
// It can directly access databases, file systems, secrets

import { db } from '@/lib/database';
import { formatDate } from '@/lib/utils'; // This 50KB library stays on the server!

export default async function PostsPage() {
  // Direct database access — no API layer needed
  const posts = await db.posts.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <time>{formatDate(post.createdAt)}</time>
        </li>
      ))}
    </ul>
  );
}

// Zero JavaScript shipped for this component.
// The date formatting library? Not in the bundle.
// The database driver? Not in the bundle.
// Only HTML goes to the client.`}
      </CodeBlock>

      <Callout type="important" title="The bundle size revelation">
        In a traditional React app, if you import a 200KB markdown library to
        render blog posts, that 200KB goes to every user's browser. With Server
        Components, that library runs on the server only. The client receives
        pre-rendered HTML. Your bundle can shrink by 50-80%.
      </Callout>

      <h2>4. Automatic Code Splitting and Bundling</h2>

      <h3>Why it exists</h3>

      <p>
        Users should only download the code they need for the page they're
        viewing. Next.js automatically:
      </p>

      <ul>
        <li>Splits code at route boundaries (each page is a separate chunk)</li>
        <li>
          Splits shared dependencies into common chunks (React itself is shared)
        </li>
        <li>
          Tree-shakes unused code (import one function from lodash? only that
          function ships)
        </li>
        <li>Prefetches linked pages in the background for instant navigation</li>
      </ul>

      <CodeBlock filename="Automatic prefetching" language="tsx">
        {`import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      {/* Next.js automatically prefetches these routes when they're visible */}
      {/* The JS/data for /about starts loading BEFORE the user clicks */}
      <Link href="/about">About</Link>
      <Link href="/blog">Blog</Link>

      {/* Disable prefetch for rarely-visited pages */}
      <Link href="/admin" prefetch={false}>Admin</Link>
    </nav>
  );
}`}
      </CodeBlock>

      <h2>5. API Routes / Route Handlers</h2>

      <h3>Why they exist</h3>

      <p>
        Many applications need backend endpoints — for webhooks, form
        submissions, third-party integrations, or mobile app backends. Instead
        of deploying a separate Express server, Next.js lets you colocate your
        API with your frontend:
      </p>

      <CodeBlock filename="app/api/subscribe/route.ts" language="tsx" highlight={[4]}>
        {`import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

// This runs on the server — never exposed to the client
export async function POST(request: Request) {
  const { email } = await request.json();

  // Validate
  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'Invalid email' },
      { status: 400 }
    );
  }

  // Direct database access
  await db.subscribers.create({ data: { email } });

  return NextResponse.json({ success: true });
}`}
      </CodeBlock>

      <Callout type="info" title="Colocation principle">
        The route handler lives at <code>app/api/subscribe/route.ts</code> which
        maps to <code>POST /api/subscribe</code>. Same file-system routing
        convention as pages. One mental model for everything.
      </Callout>

      <h2>6. Built-in Optimizations</h2>

      <h3>Why they exist</h3>

      <p>
        Performance optimization is tedious but critical. Next.js handles the
        patterns that 90% of apps need:
      </p>

      <CodeBlock filename="Image optimization" language="tsx">
        {`import Image from 'next/image';

// WHY: Images are typically 50%+ of page weight.
// Next.js automatically:
// - Serves WebP/AVIF (modern formats, 30-50% smaller)
// - Generates responsive srcsets (right size for each device)
// - Lazy loads below-the-fold images
// - Prevents Cumulative Layout Shift (reserves space)

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Product hero"
      width={1200}
      height={600}
      priority  // Above-the-fold: load immediately, don't lazy-load
    />
  );
}`}
      </CodeBlock>

      <CodeBlock filename="Font optimization" language="tsx">
        {`import { Inter } from 'next/font/google';

// WHY: Custom fonts cause layout shift (FOUT) and extra network requests.
// Next.js automatically:
// - Self-hosts fonts (no Google Fonts network requests)
// - Generates font-display: swap CSS
// - Preloads font files
// - Subsets to only characters you use

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  );
}`}
      </CodeBlock>

      <h2>7. Middleware</h2>

      <h3>Why it exists</h3>

      <p>
        Sometimes you need to intercept requests <em>before</em> they reach your
        page — for authentication, redirects, A/B testing, or geolocation.
        Middleware runs at the edge (close to the user) before the page renders:
      </p>

      <CodeBlock filename="middleware.ts" language="tsx">
        {`import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Runs BEFORE any page renders — at the edge, globally
export function middleware(request: NextRequest) {
  const token = request.cookies.get('session');

  // Not authenticated? Redirect to login.
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // A/B test: 50% of users see variant B
  if (request.nextUrl.pathname === '/pricing') {
    const bucket = Math.random() > 0.5 ? 'a' : 'b';
    const response = NextResponse.next();
    response.cookies.set('ab-pricing', bucket);
    return response;
  }

  return NextResponse.next();
}`}
      </CodeBlock>

      <h2>Putting It All Together</h2>

      <p>
        Here's a comparison of what you manage yourself vs. what Next.js
        handles:
      </p>

      <FlowDiagram
        steps={[
          { label: "You write React components", color: "blue" },
          {
            label: "Next.js adds routing",
            sublabel: "File-system based, automatic code splitting",
          },
          {
            label: "Next.js adds rendering",
            sublabel: "SSG, SSR, ISR, Streaming — per route",
          },
          {
            label: "Next.js adds optimization",
            sublabel: "Images, fonts, scripts, prefetching",
          },
          {
            label: "Next.js adds infrastructure",
            sublabel: "API routes, middleware, edge runtime",
          },
          {
            label: "Production-ready application",
            sublabel: "Fast, SEO-friendly, scalable",
            color: "green",
          },
        ]}
      />

      <Quiz
        question="Why are Server Components a significant advancement for React applications?"
        options={[
          {
            label: "They make React faster by using a new virtual DOM algorithm",
            explanation:
              "Server Components don't change the virtual DOM. They change WHERE code runs — server vs. client.",
          },
          {
            label:
              "They keep component code and heavy dependencies on the server, sending only rendered HTML to the client — dramatically reducing bundle size",
            correct: true,
            explanation:
              "Correct! Server Components mean libraries for data formatting, database drivers, and rendering logic never ship to the browser. Only the HTML output is sent. This can reduce client bundles by 50-80%.",
          },
          {
            label: "They replace the need for state management libraries",
            explanation:
              "Server Components can't use state (useState) at all. Client Components still handle interactive state. They solve different problems.",
          },
          {
            label: "They allow React to run without JavaScript in the browser",
            explanation:
              "Interactive parts still need JavaScript (Client Components). Server Components reduce how much JS is needed, but don't eliminate it entirely.",
          },
        ]}
      />

      <Quiz
        question="What is the primary benefit of file-system routing beyond convenience?"
        options={[
          {
            label: "It makes the codebase easier to navigate",
            explanation:
              "While true, this is a developer experience benefit, not the primary technical advantage.",
          },
          {
            label: "It allows Next.js to know route boundaries at build time, enabling automatic per-route code splitting",
            correct: true,
            explanation:
              "Correct! Because the framework knows every route at build time from the file structure, it can automatically split each route into its own JavaScript chunk. No manual configuration needed.",
          },
          {
            label: "It prevents routing conflicts",
            explanation:
              "File-system routing can still have conflicts (e.g., catch-all routes vs. specific routes). This isn't the primary benefit.",
          },
          {
            label: "It's faster than programmatic routing at runtime",
            explanation:
              "Runtime routing performance is similar. The advantage is at build time — enabling optimizations that programmatic routers can't easily provide.",
          },
        ]}
      />

      <HandsOn
        title="Add pages to your blog and see server rendering"
        projectStep="Step 2 of 40 — Blog Platform Project"
        projectContext="Open the my-blog project you created in Step 1. Make sure the dev server is running with `npm run dev`."
        steps={[
          "Open `app/page.tsx`. Replace all the default content inside the return statement with: `<div><h1>My Blog</h1><p>Welcome to my blog! Built with Next.js.</p></div>` — save and check the browser.",
          "Create a new folder called `about` inside the `app` folder, then create a file `app/about/page.tsx`. Add a function that returns `<div><h1>About Me</h1><p>Hi, I am learning Next.js!</p></div>`. Don't forget `export default`.",
          "Visit http://localhost:3000/about in your browser. You should see your About page. Right-click the page and choose 'View Page Source' — notice the text is right there in the HTML.",
          "Try visiting http://localhost:3000/fake-page — you will see a 404 page. Next.js only creates pages for folders that have a `page.tsx` file inside them.",
        ]}
      />

      <h2>Summary</h2>

      <p>
        Next.js adds a complete framework layer to React that solves production
        problems:
      </p>

      <ul>
        <li>
          <strong>Routing</strong> → file-system based, enables automatic code
          splitting
        </li>
        <li>
          <strong>Rendering</strong> → four strategies (SSG, SSR, ISR, Streaming)
          chosen per route
        </li>
        <li>
          <strong>Server Components</strong> → keep heavy code on the server,
          ship less JS
        </li>
        <li>
          <strong>Optimization</strong> → images, fonts, scripts, prefetching
          handled automatically
        </li>
        <li>
          <strong>API Routes</strong> → colocate backend logic with frontend
        </li>
        <li>
          <strong>Middleware</strong> → intercept requests at the edge for auth,
          redirects, experiments
        </li>
      </ul>

      <p>
        Each feature exists because real teams hit real walls trying to ship
        React apps without them. Next.js is the solution to years of collective
        pain.
      </p>
    </>
  );
}
