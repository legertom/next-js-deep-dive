import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FileTree } from "@/components/file-tree";
import { Diagram, FlowDiagram } from "@/components/diagram";
import { ShortAnswer } from "@/components/short-answer";

export function LayoutsAndTemplates() {
  return (
    <div className="prose">
      <h1>Layouts and Templates</h1>

      <p>
        In a traditional React SPA, navigating between pages destroys and
        recreates the entire component tree. Every navigation is a full
        re-mount. But real applications have persistent UI &mdash; sidebars,
        navigation bars, breadcrumbs &mdash; that shouldn&apos;t re-render on
        every page change. This is exactly the problem layouts solve.
      </p>

      <h2>Why Layouts Exist</h2>

      <p>
        Think about what happens when a user navigates from <code>/dashboard</code>{" "}
        to <code>/dashboard/settings</code>. The sidebar, header, and overall
        shell stay the same &mdash; only the main content area changes. Without
        layouts, you&apos;d either:
      </p>

      <ul>
        <li>Duplicate the shell UI in every page component (DRY violation)</li>
        <li>Use a wrapper component manually in each page (error-prone)</li>
        <li>Build a custom layout system with context/portals (reinventing the wheel)</li>
      </ul>

      <p>
        Next.js bakes this directly into the routing system. A <code>layout.tsx</code>{" "}
        wraps its sibling <code>page.tsx</code> and all child routes. It receives
        the child content as a <code>children</code> prop and renders it where
        you choose.
      </p>

      <h2>The Root Layout</h2>

      <p>
        Every Next.js app must have a root layout at <code>app/layout.tsx</code>.
        This is the outermost shell that wraps your entire application. It must
        include the <code>&lt;html&gt;</code> and <code>&lt;body&gt;</code> tags
        because Next.js does not add them automatically.
      </p>

      <CodeBlock filename="app/layout.tsx" language="tsx" highlight={[4, 5, 6, 7, 8, 9, 10, 11, 12]}>
{`import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav>My App Navigation</nav>
        <main>{children}</main>
      </body>
    </html>
  );
}`}
      </CodeBlock>

      <Callout type="important" title="Root layout is required">
        <p>
          The root layout replaces the old <code>_app.tsx</code> and{" "}
          <code>_document.tsx</code> files from the Pages Router. It is the one
          place where you define your HTML document structure.
        </p>
      </Callout>

      <h2>Nested Layouts</h2>

      <p>
        The real power emerges when you nest layouts. Each route segment can
        define its own layout, and they compose automatically:
      </p>

      <FileTree
        title="Nested Layout Structure"
        items={[
          {
            name: "app",
            type: "folder",
            children: [
              { name: "layout.tsx", type: "file", highlight: true, annotation: "Root shell" },
              {
                name: "dashboard",
                type: "folder",
                children: [
                  { name: "layout.tsx", type: "file", highlight: true, annotation: "Dashboard shell" },
                  { name: "page.tsx", type: "file", annotation: "/dashboard" },
                  {
                    name: "settings",
                    type: "folder",
                    children: [
                      { name: "page.tsx", type: "file", annotation: "/dashboard/settings" },
                    ],
                  },
                  {
                    name: "analytics",
                    type: "folder",
                    children: [
                      { name: "page.tsx", type: "file", annotation: "/dashboard/analytics" },
                    ],
                  },
                ],
              },
            ],
          },
        ]}
      />

      <CodeBlock filename="app/dashboard/layout.tsx" language="tsx">
{`export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside className="w-64 border-r p-4">
        <nav>
          <a href="/dashboard">Overview</a>
          <a href="/dashboard/settings">Settings</a>
          <a href="/dashboard/analytics">Analytics</a>
        </nav>
      </aside>
      <section className="flex-1 p-8">
        {children}
      </section>
    </div>
  );
}`}
      </CodeBlock>

      <p>
        When you navigate between <code>/dashboard/settings</code> and{" "}
        <code>/dashboard/analytics</code>, the dashboard layout <strong>does not
        re-render</strong>. Only the <code>children</code> slot updates. This is
        not just a convenience &mdash; it means:
      </p>

      <ul>
        <li>State in the sidebar is preserved (e.g., scroll position, open menus)</li>
        <li>No unnecessary network requests for shared data</li>
        <li>Instant-feeling navigation because less UI needs to change</li>
      </ul>

      <FlowDiagram
        steps={[
          { label: "Root Layout", sublabel: "html, body, nav" },
          { label: "Dashboard Layout", sublabel: "sidebar + content" },
          { label: "Page", sublabel: "Only this changes" },
        ]}
      />

      <h2>How Layout Persistence Works Under the Hood</h2>

      <p>
        When you navigate between sibling pages, Next.js performs a{" "}
        <strong>partial render</strong>. The router identifies which segments of
        the URL changed and only re-renders from that point down. Layouts above
        the changed segment are untouched &mdash; they are not re-mounted, their
        state is not reset, and their effects do not re-run.
      </p>

      <p>
        This works because Next.js uses React Server Components to render the
        layout tree on the server, but caches the layout output for segments that
        haven&apos;t changed. The client-side router then patches only the new
        content into the existing DOM.
      </p>

      <Callout type="info">
        <p>
          This is fundamentally different from client-side routers where
          persistence is opt-in. In Next.js, persistence is the default. You have
          to opt <em>out</em> of it (using templates).
        </p>
      </Callout>

      <h2>Templates: When You Want Re-Mounting</h2>

      <p>
        Sometimes persistence is not what you want. Consider these cases:
      </p>

      <ul>
        <li>Enter/exit animations that should trigger on every navigation</li>
        <li>Resetting a form when navigating between similar pages</li>
        <li>Re-running useEffect on every page change (e.g., logging page views)</li>
      </ul>

      <p>
        This is exactly what <code>template.tsx</code> is for. It has the same
        API as a layout &mdash; it receives <code>children</code> and wraps child
        routes &mdash; but it <strong>creates a new instance on every
        navigation</strong>. Each navigation destroys the old template and mounts
        a fresh one.
      </p>

      <CodeBlock filename="app/dashboard/template.tsx" language="tsx">
{`"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // This runs on EVERY navigation because
    // the template re-mounts each time
    analytics.trackPageView(pathname);
  }, [pathname]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}`}
      </CodeBlock>

      <Callout type="warning" title="Layout vs Template: choose deliberately">
        <p>
          Use <code>layout.tsx</code> by default. Only reach for{" "}
          <code>template.tsx</code> when you specifically need re-mounting
          behavior. If you use both in the same folder, the template nests inside
          the layout: Layout &rarr; Template &rarr; Page.
        </p>
      </Callout>

      <h2>The Rendering Order</h2>

      <p>
        When both exist in the same route segment, here is the nesting order:
      </p>

      <CodeBlock language="tsx" filename="Effective component tree">
{`<RootLayout>
  <DashboardLayout>
    <DashboardTemplate>
      {/* template re-mounts, layout persists */}
      <SettingsPage />
    </DashboardTemplate>
  </DashboardLayout>
</RootLayout>`}
      </CodeBlock>

      <Quiz
        question="A user navigates from /dashboard/settings to /dashboard/analytics. What happens to the DashboardLayout component?"
        options={[
          { label: "It unmounts and remounts with new props" },
          {
            label: "It stays mounted and only its children prop changes",
            correct: true,
            explanation:
              "Layouts persist across navigations within the same segment. The DashboardLayout stays mounted, preserving any internal state (like scroll position or open menus). Only the children slot receives the new page content.",
          },
          { label: "It re-renders from scratch but keeps the same DOM" },
          { label: "The behavior depends on whether it is a Server or Client Component" },
        ]}
      />

      <Quiz
        question="You need an enter animation that plays every time users navigate between pages in a section. Which file should you use?"
        options={[
          { label: "layout.tsx with useEffect" },
          { label: "page.tsx with a wrapper component" },
          {
            label: "template.tsx",
            correct: true,
            explanation:
              "template.tsx re-mounts on every navigation, triggering enter animations, useEffect cleanup/re-run, and state resets. layout.tsx persists and would only animate once when first mounted.",
          },
          { label: "loading.tsx" },
        ]}
      />

      <HandsOn
        title="Add a navigation header to every page"
        projectStep="Step 6 of 40 — Blog Platform Project"
        projectContext="Your blog has `app/page.tsx`, `app/about/page.tsx`, `app/posts/page.tsx`, and `app/posts/[slug]/page.tsx` from previous steps."
        steps={[
          "Open `app/layout.tsx` — this is the root layout that wraps every page. Add a `<nav>` above `{children}` with three links: `<a href='/'>Home</a>`, `<a href='/about'>About</a>`, and `<a href='/posts'>Posts</a>`. Save and check your browser.",
          "Click between Home, About, and Posts. Notice that the navigation bar stays at the top of every page — you only wrote it once, and it automatically wraps all your pages.",
          "Add a `<footer>` below `{children}` in the same layout file with the text 'My Blog 2026'. Now every page in your site has a header and a footer.",
          "Visit any page and right-click -> View Page Source. You will see the nav, footer, and page content all in the HTML. The layout is rendered on the server together with the page.",
        ]}
      />

      <ShortAnswer
        question="When the user navigates between two pages that share a layout, the layout's state survives but a template's state resets. Explain why, and describe a scenario where you'd reach for a template instead of a layout."
        rubric={[
          "Layouts are preserved across navigation: React reuses the same component instance, so any state, scroll position, refs, and effects are kept alive — only the page below it swaps",
          "Templates re-mount on every navigation: a fresh component instance is created, useState resets, useEffect fires, animations replay",
          "Reach for a template when you specifically want re-mount behavior — e.g. enter animations on every page visit, fresh analytics per pageview, or a per-page useEffect that should always run on entry",
        ]}
        topic="Layout vs template: persistent vs re-mounting"
      />
    </div>
  );
}
