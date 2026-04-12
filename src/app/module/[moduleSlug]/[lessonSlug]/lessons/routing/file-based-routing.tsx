import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FileTree } from "@/components/file-tree";
import { FlowDiagram } from "@/components/diagram";

export function FileBasedRouting() {
  return (
    <div className="prose">
      <h1>File-Based Routing in the App Router</h1>

      <p>
        In React, you probably used React Router: you defined routes in a config
        file or as JSX components, manually mapping URL paths to components. Next.js
        takes a fundamentally different approach &mdash; your <strong>file system IS
        your router</strong>.
      </p>

      <h2>Why File-Based Routing?</h2>

      <p>
        Config-based routing creates a disconnect. You have a component file in one
        place and a route definition somewhere else. As apps grow, this leads to:
      </p>

      <ul>
        <li>Stale route configs that reference deleted components</li>
        <li>Difficulty understanding which URL renders which component</li>
        <li>Manual wiring that adds zero business value</li>
      </ul>

      <p>
        File-based routing eliminates this indirection. If you can see the folder,
        you know the URL. If you delete the folder, the route is gone. The file
        system becomes the single source of truth.
      </p>

      <FlowDiagram
        steps={[
          { label: "Folder Path", sublabel: "app/blog/[slug]" },
          { label: "URL Pattern", sublabel: "/blog/:slug" },
          { label: "Rendered Page", sublabel: "page.tsx" },
        ]}
      />

      <h2>The Core Convention: page.tsx</h2>

      <p>
        Not every file in the <code>app</code> directory creates a route. Only
        folders that contain a <code>page.tsx</code> file become publicly
        accessible URLs. This is intentional &mdash; it means you can colocate
        utilities, components, and tests right next to your pages without
        accidentally exposing them as routes.
      </p>

      <CodeBlock filename="app/page.tsx" language="tsx">
{`// This file makes "/" accessible
export default function HomePage() {
  return <h1>Welcome</h1>;
}`}
      </CodeBlock>

      <CodeBlock filename="app/about/page.tsx" language="tsx">
{`// This file makes "/about" accessible
export default function AboutPage() {
  return <h1>About Us</h1>;
}`}
      </CodeBlock>

      <Callout type="important" title="Only page.tsx creates routes">
        <p>
          A folder without a <code>page.tsx</code> is invisible to the router.
          You can have <code>app/blog/utils.ts</code> and it will never be a
          reachable URL. This is colocation by design.
        </p>
      </Callout>

      <h2>A Real App Structure</h2>

      <p>
        Let&apos;s look at a typical e-commerce app and see how folders map to URLs:
      </p>

      <FileTree
        title="E-commerce App Router Structure"
        items={[
          {
            name: "app",
            type: "folder",
            children: [
              { name: "page.tsx", type: "file", highlight: true, annotation: "/" },
              { name: "layout.tsx", type: "file", annotation: "Root layout" },
              {
                name: "products",
                type: "folder",
                children: [
                  { name: "page.tsx", type: "file", highlight: true, annotation: "/products" },
                  {
                    name: "[id]",
                    type: "folder",
                    children: [
                      { name: "page.tsx", type: "file", highlight: true, annotation: "/products/123" },
                    ],
                  },
                ],
              },
              {
                name: "cart",
                type: "folder",
                children: [
                  { name: "page.tsx", type: "file", highlight: true, annotation: "/cart" },
                ],
              },
              {
                name: "checkout",
                type: "folder",
                children: [
                  { name: "page.tsx", type: "file", highlight: true, annotation: "/checkout" },
                  { name: "actions.ts", type: "file", annotation: "Not a route!" },
                ],
              },
            ],
          },
        ]}
      />

      <h2>Special File Conventions</h2>

      <p>
        The App Router recognizes specific filenames that serve architectural
        purposes. Each one maps to a React concept:
      </p>

      <CodeBlock language="text" filename="Special Files">
{`page.tsx      → The UI for a route (makes it publicly accessible)
layout.tsx    → Shared UI that wraps child routes (persists across nav)
loading.tsx   → Loading UI (wraps page in Suspense)
error.tsx     → Error UI (wraps page in Error Boundary)
not-found.tsx → 404 UI for this segment
route.tsx     → API endpoint (cannot coexist with page.tsx)
template.tsx  → Like layout but re-mounts on navigation`}
      </CodeBlock>

      <Callout type="tip" title="Colocation is encouraged">
        <p>
          Unlike the old Pages Router, you can put anything else in these
          folders &mdash; components, hooks, tests, styles. Only the special
          filenames above have routing significance.
        </p>
      </Callout>

      <h2>How Nesting Works</h2>

      <p>
        Each nested folder adds a segment to the URL path. This creates a natural
        hierarchy that mirrors your UI hierarchy:
      </p>

      <CodeBlock language="text">
{`app/                          → /
app/blog/                     → /blog
app/blog/[slug]/              → /blog/my-post
app/blog/[slug]/comments/     → /blog/my-post/comments`}
      </CodeBlock>

      <p>
        This nesting isn&apos;t just about URLs &mdash; it also defines how layouts
        compose. A layout at <code>app/blog/layout.tsx</code> wraps all pages
        inside the <code>blog</code> folder. This is the real power: your URL
        structure, component hierarchy, and layout composition all derive from
        one source.
      </p>

      <h2>page.tsx vs route.tsx</h2>

      <p>
        While <code>page.tsx</code> renders UI, <code>route.tsx</code> defines
        API endpoints. They cannot coexist in the same folder because a URL can
        either be a page or an API &mdash; not both.
      </p>

      <CodeBlock filename="app/api/users/route.ts" language="typescript">
{`// This creates GET /api/users
export async function GET() {
  const users = await db.user.findMany();
  return Response.json(users);
}

// This creates POST /api/users
export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return Response.json(user, { status: 201 });
}`}
      </CodeBlock>

      <Quiz
        question="You have a folder at app/dashboard/settings/page.tsx. What URL does this create?"
        options={[
          { label: "/dashboard-settings" },
          {
            label: "/dashboard/settings",
            correct: true,
            explanation:
              "Each folder adds a segment to the URL path. The folder structure app/dashboard/settings/ maps directly to /dashboard/settings, and the page.tsx file makes that route publicly accessible.",
          },
          { label: "/settings" },
          { label: "It depends on the layout.tsx configuration" },
        ]}
      />

      <Quiz
        question="You create app/blog/helpers.ts with a utility function. Can users access /blog/helpers in their browser?"
        options={[
          { label: "Yes, all files in app/ are accessible as routes" },
          {
            label: "No, only folders containing page.tsx or route.tsx create accessible routes",
            correct: true,
            explanation:
              "The App Router only creates routes for folders that contain the special page.tsx or route.tsx files. All other files are invisible to the router, enabling safe colocation of utilities, components, and tests.",
          },
          { label: "Only if helpers.ts exports a default function" },
        ]}
      />

      <HandsOn
        title="Add a blog posts page"
        projectStep="Step 4 of 40 — Blog Platform Project"
        projectContext="Your blog has `app/page.tsx` (home) and `app/about/page.tsx` from the previous steps."
        steps={[
          "Create a new folder `app/posts/` and add a file `app/posts/page.tsx`. Make it export a default function that returns a list of 3 blog post titles using `<ul>` and `<li>` tags (just hardcoded text like 'My First Post', 'Learning Next.js', 'Why I Love React').",
          "Start the dev server with `npm run dev` and visit http://localhost:3000/posts. You should see your list of three post titles.",
          "Notice the pattern: the folder name `posts` becomes the URL path `/posts`, and the `page.tsx` file inside it is what gets displayed. No router setup needed!",
          "Try creating a file `app/posts/helpers.ts` with `export function hello() { return 'hi'; }` inside it. Now visit http://localhost:3000/posts/helpers — you will get a 404. Only `page.tsx` files create pages, so you can safely put other files next to your pages.",
        ]}
      />
    </div>
  );
}
