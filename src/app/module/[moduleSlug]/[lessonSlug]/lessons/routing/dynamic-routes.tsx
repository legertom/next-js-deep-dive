import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FileTree } from "@/components/file-tree";
import { FlowDiagram } from "@/components/diagram";

export function DynamicRoutes() {
  return (
    <div className="prose">
      <h1>Dynamic Routes and Advanced Patterns</h1>

      <p>
        Static folder names only get you so far. Real applications have URLs with
        variable segments &mdash; product IDs, usernames, blog slugs. Next.js
        handles this with bracket syntax in folder names, and in Next.js 16, the
        params API is fully async.
      </p>

      <h2>Basic Dynamic Segments: [slug]</h2>

      <p>
        Wrapping a folder name in square brackets creates a dynamic segment that
        matches any single URL segment. The matched value is passed to your page
        as a param.
      </p>

      <FileTree
        title="Dynamic Route Example"
        items={[
          {
            name: "app",
            type: "folder",
            children: [
              {
                name: "blog",
                type: "folder",
                children: [
                  { name: "page.tsx", type: "file", annotation: "/blog" },
                  {
                    name: "[slug]",
                    type: "folder",
                    highlight: true,
                    children: [
                      { name: "page.tsx", type: "file", annotation: "/blog/any-value-here" },
                    ],
                  },
                ],
              },
            ],
          },
        ]}
      />

      <CodeBlock filename="app/blog/[slug]/page.tsx" language="tsx" highlight={[3, 4, 5, 6]}>
{`// In Next.js 16, params is a Promise — you must await it
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}`}
      </CodeBlock>

      <Callout type="warning" title="Next.js 16: params are async">
        <p>
          In Next.js 15+, the <code>params</code> prop is a <code>Promise</code>.
          You must <code>await params</code> before accessing the values. This
          enables streaming and progressive rendering &mdash; the page shell can
          render before params are fully resolved. If you see TypeScript errors
          about params, check that you are awaiting it.
        </p>
      </Callout>

      <h2>Catch-All Segments: [...slug]</h2>

      <p>
        Sometimes you need to match multiple URL segments. A documentation site
        might have URLs like <code>/docs/getting-started/installation</code> with
        arbitrary depth. Catch-all segments handle this:
      </p>

      <CodeBlock filename="app/docs/[...slug]/page.tsx" language="tsx">
{`// Matches: /docs/a, /docs/a/b, /docs/a/b/c, etc.
// Does NOT match: /docs (no segments after /docs)
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  // /docs/getting-started/installation
  // → slug = ["getting-started", "installation"]

  const doc = await getDoc(slug.join("/"));
  return <article>{doc.content}</article>;
}`}
      </CodeBlock>

      <h2>Optional Catch-All: [[...slug]]</h2>

      <p>
        Double brackets make the catch-all optional &mdash; it also matches the
        route without any additional segments:
      </p>

      <CodeBlock filename="app/docs/[[...slug]]/page.tsx" language="tsx">
{`// Matches: /docs, /docs/a, /docs/a/b, /docs/a/b/c
// The difference: also matches /docs with slug = undefined
export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  if (!slug) {
    return <DocsIndex />;
  }

  const doc = await getDoc(slug.join("/"));
  return <article>{doc.content}</article>;
}`}
      </CodeBlock>

      <FlowDiagram
        steps={[
          { label: "[slug]", sublabel: "One segment" },
          { label: "[...slug]", sublabel: "One or more" },
          { label: "[[...slug]]", sublabel: "Zero or more" },
        ]}
      />

      <h2>Route Groups: (folder)</h2>

      <p>
        Sometimes you want to organize routes without affecting the URL. Route
        groups use parentheses to create logical groupings:
      </p>

      <FileTree
        title="Route Groups for Organization"
        items={[
          {
            name: "app",
            type: "folder",
            children: [
              {
                name: "(marketing)",
                type: "folder",
                highlight: true,
                children: [
                  { name: "layout.tsx", type: "file", annotation: "Marketing layout" },
                  {
                    name: "about",
                    type: "folder",
                    children: [
                      { name: "page.tsx", type: "file", annotation: "/about (not /marketing/about)" },
                    ],
                  },
                  {
                    name: "pricing",
                    type: "folder",
                    children: [
                      { name: "page.tsx", type: "file", annotation: "/pricing" },
                    ],
                  },
                ],
              },
              {
                name: "(app)",
                type: "folder",
                highlight: true,
                children: [
                  { name: "layout.tsx", type: "file", annotation: "App layout (different!)" },
                  {
                    name: "dashboard",
                    type: "folder",
                    children: [
                      { name: "page.tsx", type: "file", annotation: "/dashboard" },
                    ],
                  },
                ],
              },
            ],
          },
        ]}
      />

      <p>
        Why use route groups? Two main reasons:
      </p>

      <ul>
        <li>
          <strong>Different layouts for different sections</strong> &mdash; your marketing
          pages and your app pages can have completely different shells without
          nesting one inside the other.
        </li>
        <li>
          <strong>Code organization</strong> &mdash; group related routes together
          for team ownership boundaries without adding URL segments.
        </li>
      </ul>

      <h2>Parallel Routes: @folder</h2>

      <p>
        Parallel routes let you render multiple pages in the same layout
        simultaneously. They are defined with the <code>@</code> prefix and
        appear as named slots in the parent layout:
      </p>

      <FileTree
        title="Parallel Routes"
        items={[
          {
            name: "app",
            type: "folder",
            children: [
              {
                name: "dashboard",
                type: "folder",
                children: [
                  { name: "layout.tsx", type: "file", annotation: "Receives @analytics and @team" },
                  { name: "page.tsx", type: "file" },
                  {
                    name: "@analytics",
                    type: "folder",
                    highlight: true,
                    children: [
                      { name: "page.tsx", type: "file" },
                    ],
                  },
                  {
                    name: "@team",
                    type: "folder",
                    highlight: true,
                    children: [
                      { name: "page.tsx", type: "file" },
                    ],
                  },
                ],
              },
            ],
          },
        ]}
      />

      <CodeBlock filename="app/dashboard/layout.tsx" language="tsx" highlight={[3, 4, 5]}>
{`export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div>
      <div>{children}</div>
      <div className="grid grid-cols-2 gap-4">
        <div>{analytics}</div>
        <div>{team}</div>
      </div>
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="info" title="Why parallel routes?">
        <p>
          Parallel routes enable independent loading states, error boundaries,
          and even conditional rendering for each slot. Each slot can have its
          own <code>loading.tsx</code> and <code>error.tsx</code>, so one panel
          failing does not crash the entire page.
        </p>
      </Callout>

      <h2>Intercepting Routes: (.) (..) (...)</h2>

      <p>
        Intercepting routes let you load a route within the context of another
        route. The classic example is a photo feed: clicking a photo shows a
        modal, but navigating directly to the photo URL shows a full page.
      </p>

      <CodeBlock language="text">
{`(.)   → Intercepts from the same level
(..)  → Intercepts from one level up
(..)(..) → Intercepts from two levels up
(...)  → Intercepts from the root app directory`}
      </CodeBlock>

      <FileTree
        title="Instagram-Style Photo Modal"
        items={[
          {
            name: "app",
            type: "folder",
            children: [
              {
                name: "feed",
                type: "folder",
                children: [
                  { name: "page.tsx", type: "file", annotation: "Photo grid" },
                  {
                    name: "(.)photo/[id]",
                    type: "folder",
                    highlight: true,
                    children: [
                      { name: "page.tsx", type: "file", annotation: "Modal overlay (intercepted)" },
                    ],
                  },
                ],
              },
              {
                name: "photo",
                type: "folder",
                children: [
                  {
                    name: "[id]",
                    type: "folder",
                    children: [
                      { name: "page.tsx", type: "file", annotation: "Full page (direct navigation)" },
                    ],
                  },
                ],
              },
            ],
          },
        ]}
      />

      <p>
        When a user clicks a photo link from <code>/feed</code>, the route{" "}
        <code>/photo/123</code> is intercepted and rendered as a modal. But if
        they navigate directly to <code>/photo/123</code> (e.g., paste the URL),
        they get the full page version. This gives you the best of both worlds:
        modal UX with shareable URLs.
      </p>

      <h2>Combining Patterns</h2>

      <p>
        These patterns compose naturally. Here is a real-world example combining
        route groups, dynamic segments, and parallel routes:
      </p>

      <CodeBlock filename="File structure" language="text">
{`app/
  (shop)/
    products/
      [category]/
        [productId]/
          page.tsx         → /products/shoes/nike-air-max
          @reviews/
            page.tsx       → Reviews panel (parallel route)
          @related/
            page.tsx       → Related products (parallel route)`}
      </CodeBlock>

      <Quiz
        question="What is the correct type annotation for params in a [...slug] catch-all route in Next.js 16?"
        options={[
          { label: "params: { slug: string }" },
          { label: "params: { slug: string[] }" },
          {
            label: "params: Promise<{ slug: string[] }>",
            correct: true,
            explanation:
              "In Next.js 16, params is always a Promise that must be awaited. For catch-all segments, the value is a string array containing each matched segment.",
          },
          { label: "params: Promise<{ slug: string }>" },
        ]}
      />

      <Quiz
        question="You want /about and /dashboard to have completely different layouts (not nested). What pattern do you use?"
        options={[
          { label: "Create separate layout.tsx files in each folder" },
          {
            label: "Use route groups: (marketing)/about and (app)/dashboard, each with their own layout.tsx",
            correct: true,
            explanation:
              "Route groups with parentheses create organizational boundaries without adding URL segments. Each group can have its own layout.tsx, giving you independent layout trees at the same URL depth level.",
          },
          { label: "Use template.tsx instead of layout.tsx" },
          { label: "This is not possible in the App Router" },
        ]}
      />

      <HandsOn
        title="Create pages for individual blog posts"
        projectStep="Step 5 of 40 — Blog Platform Project"
        projectContext="Your blog has `app/page.tsx` (home), `app/about/page.tsx`, and `app/posts/page.tsx` (post list) from the previous steps."
        steps={[
          "Create a new folder with square brackets in the name: `app/posts/[slug]/` — then add a file `app/posts/[slug]/page.tsx` inside it. The square brackets tell Next.js this part of the URL can be anything.",
          "In that file, export a default async function. It receives a `params` prop — add `const { slug } = await params;` at the top, then return `<div><h1>{slug}</h1><p>This is the blog post called {slug}.</p></div>`.",
          "Visit http://localhost:3000/posts/my-first-post in your browser. You should see 'my-first-post' as the heading. Now try http://localhost:3000/posts/hello-world — the same page works with any slug!",
          "Go back to `app/posts/page.tsx` and wrap each post title in an `<a>` tag linking to its post page. For example: `<li><a href='/posts/my-first-post'>My First Post</a></li>`. Click the links to make sure they work.",
        ]}
      />
    </div>
  );
}
