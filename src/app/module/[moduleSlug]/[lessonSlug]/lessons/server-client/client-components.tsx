import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { FileTree } from "@/components/file-tree";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function ClientComponents() {
  return (
    <div>
      <h1>Client Components: The "use client" Directive</h1>

      <p>
        Here's the most common misconception about RSC: people think "use client"
        means "this component renders only on the client." Wrong. It means "this
        component is included in the client bundle" -- it still gets
        server-rendered for the initial HTML, but its JavaScript is also sent to
        the browser so it can hydrate and become interactive.
      </p>

      <h2>What "use client" Actually Means</h2>

      <p>
        The <code>"use client"</code> directive marks a <strong>boundary</strong>.
        Everything in that file -- and everything it imports -- becomes part of
        the client bundle. It's not a per-component toggle; it's a module-level
        declaration that says "from here down, this is client territory."
      </p>

      <CodeBlock language="tsx" filename="components/counter.tsx">
        {`"use client";

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="warning" title="It's a boundary, not a toggle">
        <code>"use client"</code> does NOT mean the component only renders on the
        client. On the initial page load, Next.js still server-renders Client
        Components to HTML (for SEO and fast first paint). The directive means:
        "send the JS to the browser so this component can hydrate and be
        interactive."
      </Callout>

      <h2>When You NEED Client Components</h2>

      <p>You need <code>"use client"</code> when your component requires:</p>

      <ol>
        <li>
          <strong>State:</strong> <code>useState</code>, <code>useReducer</code>
        </li>
        <li>
          <strong>Effects:</strong> <code>useEffect</code>,{" "}
          <code>useLayoutEffect</code>
        </li>
        <li>
          <strong>Event handlers:</strong> <code>onClick</code>,{" "}
          <code>onChange</code>, <code>onSubmit</code>, etc.
        </li>
        <li>
          <strong>Browser APIs:</strong> <code>window</code>,{" "}
          <code>document</code>, <code>localStorage</code>,{" "}
          <code>IntersectionObserver</code>
        </li>
        <li>
          <strong>Custom hooks that use any of the above:</strong> If your hook
          calls <code>useState</code> internally, the component using it must be
          a Client Component.
        </li>
        <li>
          <strong>React context consumers:</strong> <code>useContext</code>{" "}
          requires client-side React.
        </li>
        <li>
          <strong>Third-party libraries that use state/effects:</strong> Most UI
          libraries (dropdown menus, modals, date pickers) need client-side React.
        </li>
      </ol>

      <h2>The Boundary Effect: What Gets Pulled Into the Client Bundle</h2>

      <p>
        This is where people get tripped up. When you add "use client" to a file,
        every module that file imports also becomes part of the client bundle.
      </p>

      <FileTree
        items={[
          {
            name: "app/page.tsx",
            annotation: "Server Component",
          },
          {
            name: "components/dashboard.tsx",
            annotation: '"use client" -- boundary starts here',
            children: [
              {
                name: "imports chart-library",
                annotation: "Pulled into client bundle",
              },
              {
                name: "imports utils/format.ts",
                annotation: "Pulled into client bundle",
              },
              {
                name: "imports components/tooltip.tsx",
                annotation: "Pulled into client bundle",
              },
            ],
          },
        ]}
      />

      <CodeBlock language="tsx" filename="The boundary effect visualized">
        {`// app/page.tsx -- Server Component (no directive)
import { Dashboard } from '@/components/dashboard'; // Client boundary
import { Header } from '@/components/header';       // Stays on server

export default function Page() {
  return (
    <>
      <Header />      {/* Server Component -- zero JS */}
      <Dashboard />   {/* Client Component -- JS sent to browser */}
    </>
  );
}

// components/dashboard.tsx
"use client";

// EVERYTHING imported here joins the client bundle:
import { Chart } from 'chart-library';         // 50KB gzipped
import { formatCurrency } from '@/utils/format'; // Pulled to client
import { Tooltip } from './tooltip';            // Pulled to client

export function Dashboard() {
  const [period, setPeriod] = useState('week');
  return (
    <div>
      <select onChange={e => setPeriod(e.target.value)}>...</select>
      <Chart data={...} period={period} />
      <Tooltip content="Hover info" />
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="info" title="The import rule">
        The "use client" boundary propagates downward through imports. If{" "}
        <code>dashboard.tsx</code> imports <code>tooltip.tsx</code>, and tooltip
        doesn't have its own "use client" directive, it still becomes a client
        component because it was imported from a client module. The boundary is
        at the file level, not the component level.
      </Callout>

      <h2>What Gets Sent to the Browser</h2>

      <p>When you mark a component with "use client", here's what happens:</p>

      <FlowDiagram
        title="Client Component Lifecycle"
        steps={[
          "Server renders component to HTML (initial page load)",
          "HTML is sent for fast first paint",
          "Browser downloads component's JS bundle",
          "React hydrates: attaches event handlers, initializes state",
          "Component is now fully interactive",
        ]}
      />

      <p>The client bundle includes:</p>
      <ul>
        <li>The component's source code (transpiled)</li>
        <li>All imports from that file (and their imports, recursively)</li>
        <li>React runtime needed for hooks and reconciliation</li>
        <li>Any third-party libraries used</li>
      </ul>

      <h2>Minimizing the Client Boundary</h2>

      <p>
        A common pattern: push "use client" as far down the tree as possible.
        Don't make a whole page a Client Component just because one button needs
        an onClick.
      </p>

      <CodeBlock language="tsx" filename="Bad: entire page is a Client Component">
        {`"use client"; // Don't do this!

import { db } from '@/lib/db'; // This won't even work -- db is server-only

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);

  // Now you need useEffect + fetch instead of direct DB access
  // And ALL of this page's JS is sent to the browser
  return (
    <div>
      <h1>Product Name</h1>
      <p>Long description...</p>
      <p>Price: $99</p>
      {/* Only this tiny part needs client interactivity */}
      <input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)} />
      <button onClick={() => addToCart(quantity)}>Add to Cart</button>
    </div>
  );
}`}
      </CodeBlock>

      <CodeBlock language="tsx" filename="Good: minimal client boundary">
        {`// app/products/[id]/page.tsx -- Server Component
import { db } from '@/lib/db';
import { AddToCartButton } from './add-to-cart-button';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } });

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: {product.formattedPrice}</p>
      {/* Only the interactive part is a Client Component */}
      <AddToCartButton productId={product.id} />
    </div>
  );
}

// app/products/[id]/add-to-cart-button.tsx
"use client";

import { useState } from 'react';

export function AddToCartButton({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div>
      <input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)} />
      <button onClick={() => addToCart(productId, quantity)}>
        Add to Cart
      </button>
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="tip" title="The pattern">
        Keep Server Components as the outer shell that fetches data and renders
        static content. Extract only the interactive pieces into small, focused
        Client Components. This minimizes your JS bundle while preserving full
        interactivity where needed.
      </Callout>

      <h2>Common Gotchas</h2>

      <h3>1. Trying to use server-only code in a Client Component</h3>

      <CodeBlock language="tsx" filename="This will fail at build time">
        {`"use client";
import { db } from '@/lib/db'; // Error! Database driver can't run in browser

export function UserList() {
  // db is server-only -- it uses Node.js APIs
  const users = await db.user.findMany(); // Also: client components can't be async
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}`}
      </CodeBlock>

      <h3>2. Forgetting that "use client" propagates through imports</h3>

      <CodeBlock language="tsx" filename="Accidental bundle bloat">
        {`"use client";

// This imports a 200KB markdown parser that's now in your client bundle
// even though you only use it for a static render
import { parseMarkdown } from '@/lib/markdown';
import { HeavyValidationLibrary } from '@/lib/validation';

export function CommentForm() {
  // Maybe you only needed one small validation function...
  // But the entire library is now client-side
}`}
      </CodeBlock>

      <h3>3. Thinking "use client" means no SSR</h3>

      <CodeBlock language="tsx" filename="Client components ARE server-rendered">
        {`"use client";
import { useState } from 'react';

export function Greeting() {
  const [name, setName] = useState('World');

  // This HTML IS rendered on the server for the initial page load.
  // The server renders it with the initial state ("World").
  // Then the browser hydrates it and it becomes interactive.
  return <h1>Hello, {name}!</h1>;
}`}
      </CodeBlock>

      <Callout type="info" title="SSR vs Client-only rendering">
        Client Components are still server-rendered on initial page load. If you
        truly need to skip server rendering (for example, a component that reads
        window.innerWidth on mount), you'd use dynamic import with{" "}
        <code>{"{ ssr: false }"}</code> or check{" "}
        <code>typeof window !== 'undefined'</code>.
      </Callout>

      <Quiz
        question='What does the "use client" directive actually do?'
        options={[
          { label: "Makes the component render only in the browser, skipping server rendering" },
          { label: "Marks a module boundary -- everything in this file and its imports becomes part of the client JS bundle", correct: true, explanation: `"use client" is a module-level boundary declaration. It tells the bundler: "this file (and everything it imports) should be included in the client JavaScript bundle." The component is still server-rendered for the initial HTML, but its code is also sent to the browser so React can hydrate it and make it interactive.` },
          { label: "Enables React hooks for that specific component only" },
          { label: "Disables server-side rendering for the entire route" },
        ]}
      />

      <Quiz
        question="You have a product page that's 95% static content and 5% interactive (an Add to Cart button). What's the best approach?"
        options={[
          { label: 'Add "use client" to the page component so you can use onClick' },
          { label: "Make the entire page a Client Component and fetch data with useEffect" },
          { label: "Keep the page as a Server Component and extract only the Add to Cart button as a small Client Component", correct: true, explanation: "Push the client boundary as far down as possible. The page should remain a Server Component (zero JS, direct data access), and only the interactive button should be a Client Component. This keeps your bundle small and your data fetching simple." },
          { label: "Use a Server Action to avoid Client Components entirely" },
        ]}
      />

      <HandsOn
        title={'Add a "Like" button to blog posts'}
        projectStep="Step 10 of 40 — Blog Platform Project"
        projectContext="Open your my-blog project. Your posts page displays a list of posts from a data file. Now you will add a button that users can click."
        steps={[
          "Create a new file at app/components/like-button.tsx. On the very first line, type: 'use client' — this tells Next.js this component needs to run in the browser.",
          "Paste this code below the 'use client' line: import { useState } from 'react'; export function LikeButton() { const [likes, setLikes] = useState(0); return <button onClick={() => setLikes(likes + 1)}>Like ({likes})</button>; }",
          "Open app/posts/page.tsx and import your new component at the top: import { LikeButton } from '../components/like-button'. Then add <LikeButton /> next to each post title inside your list.",
          "Refresh http://localhost:3000/posts and click the Like button a few times. The number should go up each time you click. This works because the button runs in the browser where it can track clicks.",
          "Open the browser DevTools Console and add console.log('Like button loaded') inside LikeButton. Refresh the page — this time the message DOES appear in the browser console, because this is a Client Component.",
        ]}
      />
    </div>
  );
}
