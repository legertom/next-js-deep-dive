import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function ViewTransitions() {
  return (
    <div>
      <h1>View Transitions in React 19.2</h1>

      <p>
        React 19.2 introduces the <code>&lt;ViewTransition&gt;</code> component,
        bringing the browser's CSS View Transitions API directly into the React
        rendering model. This means you can animate between routes, between state
        changes, and between entirely different component trees — all without
        reaching for external animation libraries.
      </p>

      <h2>What Are View Transitions?</h2>

      <p>
        The CSS View Transitions API allows the browser to snapshot the current
        state of the DOM, apply a change, then animate between the old and new
        snapshots. React 19.2 wraps this API in a declarative component that
        integrates with React's rendering lifecycle.
      </p>

      <FlowDiagram
        title="How View Transitions Work"
        steps={[
          "React captures old DOM snapshot",
          "State update triggers re-render",
          "React captures new DOM snapshot",
          "Browser animates between snapshots",
        ]}
      />

      <h2>The ViewTransition Component</h2>

      <p>
        The <code>&lt;ViewTransition&gt;</code> component wraps content that
        should participate in animated transitions. When the content inside
        changes (due to state updates, route changes, or conditional rendering),
        React automatically coordinates with the View Transitions API.
      </p>

      <CodeBlock
        language="tsx"
        filename="app/layout.tsx">
{`import { ViewTransition } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
        </nav>
        <ViewTransition>
          {children}
        </ViewTransition>
      </body>
    </html>
  );
}`}
      </CodeBlock>

      <Callout type="info">
        The <code>&lt;ViewTransition&gt;</code> component requires no JavaScript
        animation logic. It leverages the browser's native View Transitions API,
        which means animations run on the compositor thread for smooth 60fps
        performance.
      </Callout>

      <h2>Customizing Transitions with CSS</h2>

      <p>
        By default, view transitions use a cross-fade animation. You can
        customize this with CSS using the <code>::view-transition</code>{" "}
        pseudo-elements. React lets you assign a{" "}
        <code>viewTransitionName</code> to give elements a unique identity across
        transitions.
      </p>

      <CodeBlock
        language="tsx"
        filename="components/product-card.tsx">
{`import { ViewTransition } from "react";

export function ProductCard({ product }: { product: Product }) {
  return (
    <ViewTransition name={\`product-\${product.id}\`}>
      <div className="product-card">
        <img src={product.image} alt={product.name} />
        <h3>{product.name}</h3>
      </div>
    </ViewTransition>
  );
}`}
      </CodeBlock>

      <CodeBlock
        language="css"
        filename="app/globals.css">
{`/* Default cross-fade for all view transitions */
::view-transition-old(root) {
  animation: fade-out 200ms ease-in;
}

::view-transition-new(root) {
  animation: fade-in 200ms ease-out;
}

/* Shared element transition for product images */
::view-transition-old(product-*) {
  animation: none;
}

::view-transition-new(product-*) {
  animation: none;
}

/* The browser automatically morphs between positions */`}
      </CodeBlock>

      <h2>View Transitions with Next.js Routing</h2>

      <p>
        Next.js 16 automatically integrates view transitions with its router.
        When you wrap your layout's children in{" "}
        <code>&lt;ViewTransition&gt;</code>, every route navigation triggers an
        animated transition. This works with both App Router navigations and
        parallel routes.
      </p>

      <CodeBlock
        language="tsx"
        filename="app/products/[id]/page.tsx">
{`import { ViewTransition } from "react";

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  return (
    <div className="product-detail">
      {/* This element will animate from the card's position */}
      <ViewTransition name={\`product-\${product.id}\`}>
        <img
          src={product.image}
          alt={product.name}
          className="product-hero"
        />
      </ViewTransition>

      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="warning">
        View Transitions require browser support for the View Transitions API.
        As of 2026, Chrome, Edge, and Safari support it. Firefox support is in
        progress. React gracefully degrades — if the API is unavailable, the
        content updates instantly without animation.
      </Callout>

      <h2>Animating State Changes</h2>

      <p>
        View transitions are not limited to route changes. You can use them for
        any state change that alters the UI significantly — toggling between
        views, expanding cards, or switching tabs.
      </p>

      <CodeBlock
        language="tsx"
        filename="components/tabs.tsx">
{`"use client";

import { useState } from "react";
import { ViewTransition } from "react";

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="tab-bar">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={i === activeTab ? "active" : ""}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ViewTransition>
        <div key={activeTab} className="tab-content">
          {tabs[activeTab].content}
        </div>
      </ViewTransition>
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="tip">
        The <code>key</code> prop on the content div is important. Changing the
        key tells React this is a different element, triggering the view
        transition between the old and new content.
      </Callout>

      <Quiz
        question="What happens when the browser does not support the View Transitions API?"
        options={[
          { label: "React throws an error and the component fails to render" },
          { label: "The content updates instantly without animation (graceful degradation)", correct: true, explanation: "React's ViewTransition component gracefully degrades. If the browser doesn't support the View Transitions API, the DOM updates happen instantly without any animation — no errors, no broken layouts." },
          { label: "React falls back to CSS transitions automatically" },
          { label: "The ViewTransition component renders nothing" },
        ]}
      />

      <Quiz
        question="How do you create a shared element transition between two routes (e.g., a product thumbnail morphing into a hero image)?"
        options={[
          { label: "Use the same CSS class name on both elements" },
          { label: "Pass the same 'name' prop to ViewTransition wrapping both elements", correct: true, explanation: "By giving the same 'name' prop to the ViewTransition component wrapping elements on different routes, the browser identifies them as the same logical element and animates the position/size change between them." },
          { label: "Use React.memo to preserve the element across routes" },
          { label: "Add a 'transition' CSS property to both elements" },
        ]}
      />

      <HandsOn
        title="Add a fade transition between pages"
        projectStep="Step 23 of 32 — Blog Platform Project"
        projectContext="Your blog should be running with `npm run dev`. Open `app/layout.tsx` in your editor."
        steps={[
          "At the top of `app/layout.tsx`, add this import: `import { ViewTransition } from \"react\";`. Then find where `{children}` is rendered and wrap it like this: `<ViewTransition>{children}</ViewTransition>`. Save the file.",
          "Open your blog in the browser and click between the home page and a blog post. You should see a gentle cross-fade animation as the page content changes. That is the default view transition.",
          "Open `app/globals.css` and add these styles at the bottom: `::view-transition-old(root) { animation: fade-out 200ms ease-in; }` and `::view-transition-new(root) { animation: fade-in 200ms ease-out; }`. Save and try navigating again — the fade should feel smoother.",
          "Click the back button in your browser. The fade transition works for back navigation too. If your browser does not support View Transitions (older Firefox), the pages will still update normally — just without animation.",
        ]}
      />
    </div>
  );
}
