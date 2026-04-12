import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FileTree } from "@/components/file-tree";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function ServerComponents() {
  return (
    <div>
      <h1>React Server Components: The Default in App Router</h1>

      <p>
        You already know React. You know components, props, state, effects. Now
        forget everything you know about where components run -- because React
        Server Components (RSC) fundamentally change the execution model. In the
        App Router, every component is a Server Component by default. Let's
        understand what that actually means.
      </p>

      <h2>What Are Server Components?</h2>

      <p>
        A Server Component is a React component that executes exclusively on the
        server. It never runs in the browser. Its JavaScript is never sent to the
        client. The browser receives only the rendered output -- think of it as
        HTML with some metadata, not executable code.
      </p>

      <CodeBlock language="tsx" filename="app/users/page.tsx">
        {`// This is a Server Component (the default -- no directive needed)
import { db } from '@/lib/db';

export default async function UsersPage() {
  // Direct database access -- no API route needed!
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} -- {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="tip" title="Zero JavaScript for this component">
        The component above sends ZERO kilobytes of JavaScript to the browser.
        No <code>db</code> library, no component code, no React runtime for this
        component. The client gets only the rendered HTML output and a lightweight
        RSC payload describing the tree structure.
      </Callout>

      <h2>Why Server Components Exist</h2>

      <p>
        Before RSC, if you wanted to fetch data in React, you had two choices:
      </p>

      <ol>
        <li>
          <strong>Client-side fetching</strong> (useEffect + fetch): Causes
          waterfalls, loading spinners, and ships large libraries to the browser.
        </li>
        <li>
          <strong>Server-side data loading</strong> (getServerSideProps): Works
          but is page-level and disconnected from the component tree.
        </li>
      </ol>

      <p>
        Server Components solve this by letting you fetch data inside the
        component that needs it, on the server, with zero client-side cost.
      </p>

      <Diagram caption="Traditional React vs Server Components">
        <div>
          <p><strong>Traditional React:</strong> Browser downloads component JS → Executes → Fetches data → Renders</p>
          <p>Cost: Component code + data fetching library + rendering time</p>
          <p><strong>Server Components:</strong> Server executes component → Sends rendered output to browser</p>
          <p>Cost: Just the rendered output (HTML-like payload)</p>
          <p><strong>What gets eliminated:</strong></p>
          <ul>
            <li>Component source code (not shipped)</li>
            <li>Import dependencies (not shipped)</li>
            <li>Data fetching libraries (not shipped)</li>
            <li>Runtime rendering cost (done on server)</li>
          </ul>
        </div>
      </Diagram>

      <h2>What You CAN Do in Server Components</h2>

      <CodeBlock language="tsx" filename="app/dashboard/page.tsx">
        {`import { db } from '@/lib/db';
import { readFile } from 'fs/promises';
import { headers, cookies } from 'next/headers';

export default async function Dashboard() {
  // Direct database queries
  const stats = await db.analytics.aggregate({
    where: { date: { gte: new Date('2026-01-01') } },
  });

  // File system access
  const changelog = await readFile('./CHANGELOG.md', 'utf-8');

  // Access request headers and cookies
  const headersList = await headers();
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value ?? 'light';

  // Use environment variables (including secrets!)
  const apiKey = process.env.STRIPE_SECRET_KEY;
  const data = await fetch('https://api.stripe.com/v1/charges', {
    headers: { Authorization: \`Bearer \${apiKey}\` },
  });

  return (
    <div data-theme={theme}>
      <h1>Dashboard</h1>
      <StatsDisplay stats={stats} />
      <Changelog content={changelog} />
    </div>
  );
}`}
      </CodeBlock>

      <h2>What You CANNOT Do in Server Components</h2>

      <CodeBlock language="tsx" filename="This will NOT work">
        {`// Server Component -- these are ALL errors:
export default function BrokenComponent() {
  // No useState -- there is no "state" on the server
  const [count, setCount] = useState(0);

  // No useEffect -- there is no lifecycle on the server
  useEffect(() => { /* ... */ }, []);

  // No browser APIs -- there is no window/document
  const width = window.innerWidth;

  // No event handlers -- these need client JS to work
  return <button onClick={() => setCount(c => c + 1)}>Click me</button>;
}`}
      </CodeBlock>

      <Callout type="warning" title="The mental model">
        Think of Server Components like a template engine that happens to use
        React's component model. They run once on the server, produce output, and
        are done. There's no re-rendering, no state, no effects. If it needs
        interactivity, it's a Client Component.
      </Callout>

      <h2>The RSC Payload: What Actually Gets Sent</h2>

      <p>
        When the server renders a Server Component, it doesn't send raw HTML. It
        sends an RSC payload -- a special streaming format that describes the
        component tree. This is what allows React to merge server-rendered content
        with client components without losing state.
      </p>

      <CodeBlock language="text" filename="RSC Payload (simplified representation)">
        {`// What the server sends for a Server Component tree:
0:["$","div",null,{"children":[
  ["$","h1",null,{"children":"Users"}],
  ["$","ul",null,{"children":[
    ["$","li","user-1",{"children":"Alice -- alice@example.com"}],
    ["$","li","user-2",{"children":"Bob -- bob@example.com"}]
  ]}]
]}]

// Client Component references look like this:
1:I["./components/SearchBar.tsx",["SearchBar"],"default"]

// The client component is referenced by module path, not inlined.
// The browser loads its JS separately.`}
      </CodeBlock>

      <p>Key things to notice about the RSC payload:</p>

      <ul>
        <li>
          Server Component output is fully resolved -- it's the rendered tree,
          not the component function.
        </li>
        <li>
          Client Components appear as references (module path + export name) --
          not their source code.
        </li>
        <li>
          Props passed to Client Components are serialized into the payload.
          This is the serialization boundary.
        </li>
      </ul>

      <h2>Why Server Components Are the Default</h2>

      <p>
        The App Router makes Server Components the default because the majority
        of UI in most applications is non-interactive. Think about it:
      </p>

      <ul>
        <li>Navigation headers with links -- no interactivity needed</li>
        <li>Blog post content -- just rendered text</li>
        <li>Product listings -- display data, no state</li>
        <li>Dashboard cards -- show numbers, no client logic</li>
        <li>Footer, breadcrumbs, metadata -- all static output</li>
      </ul>

      <p>
        By defaulting to Server Components, Next.js ensures you only pay the
        JavaScript cost for parts of your app that genuinely need client-side
        interactivity. Everything else is free.
      </p>

      <h2>Async Components: A Server-Only Superpower</h2>

      <p>
        Server Components can be async functions. This is not possible with
        Client Components. It means data fetching is just... a function call.
      </p>

      <CodeBlock language="tsx" filename="app/posts/[slug]/page.tsx">
        {`// Async Server Component -- clean and simple
export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await db.post.findUnique({
    where: { slug: params.slug },
    include: { author: true, tags: true },
  });

  if (!post) notFound();

  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        <p>By {post.author.name}</p>
        <div>{post.tags.map(t => <Tag key={t.id} tag={t} />)}</div>
      </header>
      <div dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
    </article>
  );
}`}
      </CodeBlock>

      <Callout type="info" title="No loading states required at this level">
        If this component is wrapped in a Suspense boundary by a parent layout,
        the loading state is handled automatically. The async component simply
        awaits its data. No useEffect, no isLoading state, no error boundary
        boilerplate at the component level.
      </Callout>

      <Quiz
        question="What happens to a Server Component's JavaScript code after rendering?"
        options={[
          { label: "It's sent to the browser for hydration" },
          { label: "It's cached on the server for subsequent requests" },
          { label: "It's never sent to the browser -- only the rendered output is transmitted", correct: true, explanation: "Server Component code never leaves the server. The browser receives only the RSC payload (rendered tree structure) and, for initial page loads, the corresponding HTML. The component's source code, its imports (like database drivers), and its dependencies are never bundled for the client." },
          { label: "It's compiled to WebAssembly for the client" },
        ]}
      />

      <Quiz
        question="Which of the following CAN you do in a Server Component?"
        options={[
          { label: "Call useState to manage a counter" },
          { label: "Attach an onClick handler to a button" },
          { label: "Directly query a PostgreSQL database", correct: true, explanation: "Server Components run on the server with full access to server-side resources: databases, file system, environment secrets, etc. They cannot use React hooks (useState, useEffect) because those require client-side lifecycle, and they cannot use browser APIs (window, document) because they don't execute in a browser." },
          { label: "Use window.localStorage to persist preferences" },
        ]}
      />

      <HandsOn
        title="Move blog posts into a data file"
        projectStep="Step 9 of 32 — Blog Platform Project"
        projectContext="Open your my-blog project. Right now your posts are hardcoded directly inside app/posts/page.tsx."
        steps={[
          "Create a new file at app/data/posts.ts. Paste in an array of 3 post objects, each with slug, title, and body fields. Export it like this: export const posts = [{ slug: 'first-post', title: 'My First Post', body: 'Hello world!' }, ...]",
          "Open app/posts/page.tsx. At the top, import your data: import { posts } from '../data/posts'. Then replace your hardcoded posts with: {posts.map(post => <li key={post.slug}><a href={'/posts/' + post.slug}>{post.title}</a></li>)}",
          "Refresh http://localhost:3000/posts — you should see your 3 posts listed. The data comes from your file, but the browser never downloads that file. It all happens on the server.",
          "Add console.log(posts) inside your page function. Check your terminal — the data prints there. Check the browser console — nothing. This proves the data stays on the server.",
        ]}
      />
    </div>
  );
}
