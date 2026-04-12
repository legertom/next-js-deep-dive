import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FileTree } from "@/components/file-tree";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function CompositionPatterns() {
  return (
    <div>
      <h1>Composition Patterns: Mixing Server and Client Components</h1>

      <p>
        The real power of RSC isn't just "server components are faster" -- it's
        that you can interleave them with client components in ways that were
        previously impossible. But this interleaving has rules. Violate them and
        you'll get confusing errors. Master them and you'll build apps that are
        both fast and interactive.
      </p>

      <h2>The Fundamental Rule</h2>

      <Callout type="warning" title="The one rule to remember">
        A Client Component cannot import a Server Component. But a Client
        Component CAN receive a Server Component as a prop (children or any other
        prop). This is the foundation of every composition pattern.
      </Callout>

      <p>Why? Because imports create a dependency chain. When you import a module
        into a "use client" file, that module is pulled into the client bundle.
        Server Components can't be in the client bundle -- they use server-only
        APIs. But if a Server Component is passed as a prop, it's already been
        rendered on the server into an RSC payload. The Client Component just
        receives the rendered output, not the source code.
      </p>

      <h2>The "Donut" Pattern</h2>

      <p>
        The most important composition pattern. The name comes from the shape:
        Server Component on the outside, Client Component in the middle (the
        donut), Server Components inside that (the hole, passed as children).
      </p>

      <Diagram caption="The Donut Pattern">
        <div>
          <p>Server Component (outer)</p>
          <p>&nbsp;&nbsp;└── Client Component (interactive wrapper)</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── Server Component (passed as children)</p>
          <p>The client component is the "donut" -- it wraps server-rendered content without pulling it into the client bundle.</p>
        </div>
      </Diagram>

      <CodeBlock language="tsx" filename="app/page.tsx (Server Component)">
        {`import { Sidebar } from '@/components/sidebar';
import { CollapsiblePanel } from '@/components/collapsible-panel';
import { NavigationLinks } from '@/components/navigation-links';

// Server Component -- the outer layer
export default async function Layout({ children }) {
  return (
    <div className="flex">
      {/* CollapsiblePanel is a Client Component (needs state for open/close) */}
      {/* NavigationLinks is a Server Component (fetches from DB) */}
      <CollapsiblePanel>
        <NavigationLinks />  {/* Passed as children -- stays on server! */}
      </CollapsiblePanel>
      <main>{children}</main>
    </div>
  );
}`}
      </CodeBlock>

      <CodeBlock language="tsx" filename="components/collapsible-panel.tsx">
        {`"use client";

import { useState } from 'react';

// This Client Component receives server-rendered content as children
export function CollapsiblePanel({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Collapse' : 'Expand'}
      </button>
      {isOpen && <div>{children}</div>}
    </aside>
  );
}`}
      </CodeBlock>

      <CodeBlock language="tsx" filename="components/navigation-links.tsx">
        {`// Server Component -- no "use client" directive
import { db } from '@/lib/db';

export async function NavigationLinks() {
  // Direct database access -- this code never reaches the browser
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <nav>
      {categories.map(cat => (
        <a key={cat.id} href={cat.path}>
          {cat.icon} {cat.name}
        </a>
      ))}
    </nav>
  );
}`}
      </CodeBlock>

      <Callout type="tip" title="Why this works">
        <code>NavigationLinks</code> is rendered on the server and its output is
        passed as the <code>children</code> prop to <code>CollapsiblePanel</code>.
        The client component never imports the server component -- it just
        receives pre-rendered React nodes. The database query, the server code,
        none of it touches the client bundle.
      </Callout>

      <h2>The Wrong Way: Importing Server Components into Client Components</h2>

      <CodeBlock language="tsx" filename="This will NOT work as expected">
        {`"use client";

// DO NOT DO THIS
import { NavigationLinks } from './navigation-links';

export function CollapsiblePanel() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <NavigationLinks />}  {/* This is now a CLIENT component! */}
    </aside>
  );
}

// What happens:
// - NavigationLinks gets pulled into the client bundle
// - Its 'import { db }' will fail (db uses Node.js APIs)
// - Even if it didn't fail, the async component won't work client-side
// - You've lost all the RSC benefits`}
      </CodeBlock>

      <h2>Pattern: Prop Injection for Any Slot</h2>

      <p>
        The children pattern generalizes to any prop. You can pass server-rendered
        content through any prop that accepts <code>ReactNode</code>.
      </p>

      <CodeBlock language="tsx" filename="Multiple server component slots">
        {`// components/split-view.tsx
"use client";

import { useState } from 'react';

interface SplitViewProps {
  left: React.ReactNode;   // Server-rendered content
  right: React.ReactNode;  // Server-rendered content
  dividerPosition?: number;
}

export function SplitView({ left, right, dividerPosition = 50 }: SplitViewProps) {
  const [position, setPosition] = useState(dividerPosition);

  return (
    <div className="split-view">
      <div style={{ width: \`\${position}%\` }}>{left}</div>
      <div
        className="divider"
        onMouseDown={handleDragStart}  // Client interactivity
      />
      <div style={{ width: \`\${100 - position}%\` }}>{right}</div>
    </div>
  );
}

// app/editor/page.tsx -- Server Component
import { SplitView } from '@/components/split-view';
import { FileExplorer } from '@/components/file-explorer';  // Server Component
import { CodePreview } from '@/components/code-preview';    // Server Component

export default async function EditorPage() {
  return (
    <SplitView
      left={<FileExplorer />}     {/* Server-rendered, zero JS */}
      right={<CodePreview />}     {/* Server-rendered, zero JS */}
    />
  );
}`}
      </CodeBlock>

      <h2>The Serialization Boundary</h2>

      <p>
        When a Server Component passes props to a Client Component, those props
        must be serializable -- they travel over the network as part of the RSC
        payload. This means you can pass:
      </p>

      <ul>
        <li>Strings, numbers, booleans, null, undefined</li>
        <li>Arrays and plain objects (containing serializable values)</li>
        <li>Date objects (serialized as ISO strings)</li>
        <li>React elements (JSX) -- this is how the donut pattern works</li>
        <li>Server Actions (special references)</li>
      </ul>

      <p>You CANNOT pass:</p>

      <ul>
        <li>Functions (except Server Actions)</li>
        <li>Classes / class instances</li>
        <li>Symbols</li>
        <li>DOM nodes</li>
        <li>Event handlers</li>
      </ul>

      <CodeBlock language="tsx" filename="Serialization boundary examples">
        {`// app/page.tsx -- Server Component
import { UserCard } from '@/components/user-card'; // Client Component

export default async function Page() {
  const user = await db.user.findUnique({ where: { id: '1' } });

  return (
    <UserCard
      // These are fine (serializable):
      name={user.name}
      email={user.email}
      joinedAt={user.createdAt}  // Date gets serialized
      tags={user.tags}           // Array of strings

      // This will ERROR:
      // formatName={(name) => name.toUpperCase()}  // Functions can't cross the boundary!

      // This is fine (Server Actions are special):
      updateUser={async (formData) => {
        "use server";
        await db.user.update({ where: { id: '1' }, data: { name: formData.get('name') } });
      }}
    />
  );
}`}
      </CodeBlock>

      <Callout type="info" title="The mental model for serialization">
        Ask yourself: "Could I JSON.stringify this?" If yes, it can cross the
        boundary. (With the special exceptions of React elements and Server
        Actions, which React handles specially.)
      </Callout>

      <h2>Common Mistakes and Fixes</h2>

      <h3>Mistake 1: Making a shared layout a Client Component</h3>

      <CodeBlock language="tsx" filename="Bad: entire layout is client">
        {`// components/app-shell.tsx
"use client"; // Now everything inside is client territory

import { useState } from 'react';
import { Sidebar } from './sidebar';

export function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div>
      <Sidebar isOpen={sidebarOpen} />   {/* Forced into client bundle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>Toggle</button>
      {children}
    </div>
  );
}`}
      </CodeBlock>

      <CodeBlock language="tsx" filename="Good: extract just the toggle logic">
        {`// components/sidebar-toggle.tsx
"use client";

import { useState } from 'react';

export function SidebarToggle({ sidebar, children }: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex">
      {isOpen && <aside>{sidebar}</aside>}
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      <main>{children}</main>
    </div>
  );
}

// app/layout.tsx -- Server Component
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Sidebar } from '@/components/sidebar'; // Server Component

export default function Layout({ children }) {
  return (
    <SidebarToggle sidebar={<Sidebar />}>
      {children}
    </SidebarToggle>
  );
}`}
      </CodeBlock>

      <h3>Mistake 2: Passing non-serializable props</h3>

      <CodeBlock language="tsx" filename="This will fail">
        {`// app/page.tsx
import { UserProfile } from '@/components/user-profile'; // Client

export default async function Page() {
  const user = await db.user.findUnique({
    where: { id: '1' },
    include: { posts: { include: { comments: true } } },
  });

  // Problem: Prisma models can have non-serializable properties
  // (methods, circular references, etc.)
  return <UserProfile user={user} />;

  // Fix: explicitly pick only the serializable data you need
  return (
    <UserProfile
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        postCount: user.posts.length,
      }}
    />
  );
}`}
      </CodeBlock>

      <h3>Mistake 3: Context providers swallowing the tree</h3>

      <CodeBlock language="tsx" filename="Context requires client components -- handle carefully">
        {`// providers/theme-provider.tsx
"use client";

import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext('light');

// This is a Client Component, but children stay server-rendered!
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={theme}>
      {children}  {/* Server Components passed here remain server components */}
    </ThemeContext.Provider>
  );
}

// app/layout.tsx -- Server Component
import { ThemeProvider } from '@/providers/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {/* ThemeProvider is client, but children are server-rendered */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`}
      </CodeBlock>

      <Callout type="tip" title="Providers don't break the pattern">
        A common worry is "if my root layout has a ThemeProvider (Client
        Component), doesn't that make everything a Client Component?" No!
        Because children are passed as props, not imported. The pages and
        components rendered inside the provider remain Server Components.
      </Callout>

      <h2>Decision Flowchart</h2>

      <FlowDiagram
        title="Server or Client Component?"
        steps={[
          "Does it need state, effects, or event handlers? -> YES: Client Component",
          "Does it use browser-only APIs? -> YES: Client Component",
          "Does it use hooks from a third-party library that needs state? -> YES: Client Component",
          "None of the above? -> Server Component (keep the default)",
          "If Client Component: can you extract just the interactive part into a smaller component? -> YES: do that",
        ]}
      />

      <Quiz
        question="A Client Component needs to render a Server Component that fetches data from a database. How do you achieve this?"
        options={[
          { label: "Import the Server Component directly inside the Client Component file" },
          { label: "Pass the Server Component as children (or another prop) from a parent Server Component", correct: true, explanation: "Client Components cannot import Server Components (that would pull server code into the client bundle). Instead, a parent Server Component renders both and passes the Server Component as a prop (like children) to the Client Component. The Server Component is pre-rendered on the server, and the Client Component receives the rendered output." },
          { label: "Use useEffect to fetch the data and pass it to the Server Component" },
          { label: "You cannot mix Server and Client Components this way" },
        ]}
      />

      <Quiz
        question="Which of these CANNOT be passed as a prop from a Server Component to a Client Component?"
        options={[
          { label: "A JSX element (<UserAvatar />)" },
          { label: "A plain object with string/number values" },
          { label: "A callback function like (id) => fetchUser(id)", correct: true, explanation: "Regular functions cannot be serialized across the server-client boundary. They can't be represented in JSON and can't be transmitted in the RSC payload. However, Server Actions (functions marked with 'use server') are special -- React creates a reference that the client can call, which triggers a server-side execution." },
          { label: "A Server Action defined with 'use server'" },
        ]}
      />

      <HandsOn
        title="Build the donut pattern"
        steps={[
          "Create a `Tabs` Client Component that manages which tab is active (useState). It should accept a `tabs: { label: string; content: React.ReactNode }[]` prop.",
          "Create three Server Components that each fetch different data (mock it with delays): `RecentOrders`, `Analytics`, `UserActivity`.",
          "In your page (Server Component), compose them together: pass the server components as the `content` for each tab.",
          "Verify: the tab switching is instant and client-side, but the content was server-rendered with direct data access. Check the Network tab -- no JS bundles for the server components.",
          "Bonus: try importing one of the Server Components directly inside the Tabs Client Component. Observe the error.",
        ]}
      />
    </div>
  );
}
