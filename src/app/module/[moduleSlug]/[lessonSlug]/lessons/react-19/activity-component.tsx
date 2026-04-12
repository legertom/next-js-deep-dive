import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function ActivityComponent() {
  return (
    <div>
      <h1>The Activity Component</h1>

      <p>
        React 19.2 introduces the <code>&lt;Activity&gt;</code> component
        (formerly known as "Offscreen" during development). It allows you to
        render components in the background with <code>display: none</code>,
        preserving their full state and DOM — then reveal them instantly when
        needed. Think of it as "hiding" rather than "unmounting."
      </p>

      <h2>The Problem Activity Solves</h2>

      <p>
        Consider a tab panel. Traditionally, when you switch tabs, you either:
      </p>
      <ul>
        <li>
          <strong>Unmount the old tab</strong> — losing all state (form inputs,
          scroll position, fetched data)
        </li>
        <li>
          <strong>Keep everything mounted but hidden with CSS</strong> — paying
          the cost of rendering all tabs, running all effects, and keeping all
          subscriptions active
        </li>
      </ul>

      <p>
        Activity gives you the best of both worlds: hidden content keeps its
        state and DOM, but React pauses its effects and deprioritizes its
        rendering work.
      </p>

      <FlowDiagram
        title="Activity Component Lifecycle"
        steps={[
          "Component renders normally (mode='visible')",
          "Parent sets mode='hidden'",
          "React applies display: none to the subtree",
          "Cleanup functions of effects run",
          "State and DOM are preserved",
          "Parent sets mode='visible' again",
          "Effects re-run, display: none removed",
          "Content appears instantly with full state",
        ]}
      />

      <h2>Basic Usage</h2>

      <CodeBlock
        language="tsx"
        filename="components/tab-panel.tsx">
{`"use client";

import { Activity, useState } from "react";

export function TabPanel({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="tab-bar">
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* All tabs stay mounted — inactive ones are hidden */}
      {tabs.map((tab, i) => (
        <Activity key={i} mode={i === activeTab ? "visible" : "hidden"}>
          <div className="tab-content">
            {tab.content}
          </div>
        </Activity>
      ))}
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="info">
        When <code>mode="hidden"</code>, React applies{" "}
        <code>display: none</code> to the Activity's subtree at the DOM level.
        The component tree remains fully mounted in React's internal fiber tree,
        preserving all state, refs, and DOM nodes.
      </Callout>

      <h2>Effect Cleanup Behavior</h2>

      <p>
        One of Activity's most important features is how it handles effects. When
        content is hidden:
      </p>
      <ul>
        <li>Effect cleanup functions run (like unmounting)</li>
        <li>Effects do NOT re-run until the content becomes visible again</li>
        <li>This means subscriptions are disconnected, timers are cleared</li>
      </ul>

      <CodeBlock
        language="tsx"
        filename="components/live-dashboard.tsx">
{`"use client";

import { useEffect, useState } from "react";

function LivePriceChart({ symbol }: { symbol: string }) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    // This WebSocket connects when visible
    const ws = new WebSocket(\`wss://prices.example.com/\${symbol}\`);
    ws.onmessage = (e) => setPrice(JSON.parse(e.data).price);

    return () => {
      // This cleanup runs when Activity hides this component
      // The WebSocket disconnects — no wasted bandwidth
      ws.close();
    };
  }, [symbol]);

  return <div className="chart">Current price: {price ?? "Loading..."}</div>;
}

// Usage with Activity:
// When the dashboard tab is hidden, the WebSocket disconnects.
// When revealed, it reconnects and state (last known price) is preserved.`}
      </CodeBlock>

      <h2>Offscreen Prerendering</h2>

      <p>
        Activity is not just for hiding content — it can prerender content in
        the background before the user ever sees it. This is useful for
        preparing the next step in a wizard, preloading a route, or rendering
        heavy content ahead of time.
      </p>

      <CodeBlock
        language="tsx"
        filename="components/wizard.tsx">
{`"use client";

import { Activity, useState } from "react";

export function Wizard({ steps }: { steps: React.ReactNode[] }) {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div>
      {steps.map((step, i) => (
        <Activity
          key={i}
          mode={i === currentStep ? "visible" : "hidden"}
        >
          {step}
        </Activity>
      ))}

      <div className="wizard-nav">
        <button
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 0}
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep((s) => s + 1)}
          disabled={currentStep === steps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Each step is pre-rendered in the background.
// Navigating between steps is instant — no loading spinners.
// Form data in previous steps is preserved.`}
      </CodeBlock>

      <Callout type="warning">
        Activity keeps DOM nodes in memory. If you have thousands of list items,
        wrapping each one in Activity could consume significant memory. Use it
        for coarse-grained UI sections (tabs, routes, wizard steps) rather than
        fine-grained items.
      </Callout>

      <h2>Activity vs. Conditional Rendering</h2>

      <Diagram caption="Comparison: Activity vs Unmount vs CSS Hidden">
        <table className="text-sm text-left">
          <thead><tr className="border-b border-card-border">
            <th className="p-2 font-semibold">Approach</th><th className="p-2">State</th><th className="p-2">Effects</th><th className="p-2">DOM</th>
          </tr></thead>
          <tbody>
            <tr className="border-b border-card-border"><td className="p-2">Conditional render</td><td className="p-2 text-error">Lost</td><td className="p-2">Unmounted</td><td className="p-2">Removed</td></tr>
            <tr className="border-b border-card-border"><td className="p-2">CSS display: none</td><td className="p-2 text-success">Kept</td><td className="p-2 text-warning">Still run</td><td className="p-2">Hidden</td></tr>
            <tr><td className="p-2 font-semibold">Activity hidden</td><td className="p-2 text-success">Kept</td><td className="p-2 text-success">Cleaned up</td><td className="p-2">Hidden</td></tr>
          </tbody>
        </table>
      </Diagram>

      <h2>Use with Next.js Parallel Routes</h2>

      <p>
        Next.js 16 can leverage Activity internally for parallel routes and
        intercepting routes, keeping previously visited route segments alive in
        the background. You can also use Activity explicitly in your own
        components.
      </p>

      <CodeBlock
        language="tsx"
        filename="app/dashboard/layout.tsx">
{`import { Activity } from "react";

export default function DashboardLayout({
  children,
  analytics,
  settings,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  settings: React.ReactNode;
}) {
  // Next.js can use Activity to keep parallel route segments alive
  // when navigating between them, preserving scroll and state
  return (
    <div className="dashboard">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}`}
      </CodeBlock>

      <Quiz
        question="What happens to useEffect cleanup functions when an Activity component switches to mode='hidden'?"
        options={[
          { label: "Nothing — effects continue running as normal" },
          { label: "Cleanup functions run, and effects will re-run when mode becomes 'visible' again", correct: true, explanation: "When Activity hides content, effect cleanup functions execute (disconnecting subscriptions, clearing timers, etc.). When the content becomes visible again, the effects re-run, re-establishing connections. This gives you resource efficiency without losing state." },
          { label: "All effects are permanently destroyed and never re-run" },
          { label: "Effects are paused mid-execution and resumed later" },
        ]}
      />

      <Quiz
        question="Which use case is NOT a good fit for the Activity component?"
        options={[
          { label: "Tab panels where you want to preserve form state between tabs" },
          { label: "A wizard where you want instant navigation between steps" },
          { label: "A virtualized list with 10,000 items where each item is wrapped in Activity", correct: true, explanation: "Activity keeps DOM nodes in memory. Wrapping 10,000 list items in Activity would consume enormous memory. It's designed for coarse-grained sections like tabs, routes, or wizard steps — not fine-grained items in a large list." },
          { label: "Prerendering the next page in a multi-step flow" },
        ]}
      />

      <HandsOn
        title="Hide and show content with Activity"
        projectStep="Step 24 of 32 — Blog Platform Project"
        projectContext="Your blog should be running with `npm run dev`. You will create a small tabbed component to try out Activity."
        steps={[
          "Create a new file `app/activity-demo/page.tsx`. Add a client component with two buttons (Tab A and Tab B) and a state variable to track which tab is active. For now, use a simple conditional: `{activeTab === 0 ? <div>Tab A content</div> : <div>Tab B content</div>}`. Add a text input inside Tab A. Save and open /activity-demo in your browser.",
          "Type something in the text input on Tab A. Click Tab B, then click Tab A again. Notice your typed text is gone — the component was unmounted and remounted, so the state was lost.",
          "Now refactor: import `Activity` from `\"react\"`. Replace the conditional rendering with two Activity components: `<Activity mode={activeTab === 0 ? \"visible\" : \"hidden\"}><div>Tab A with input</div></Activity>` and the same for Tab B.",
          "Type something in the text input on Tab A again. Switch to Tab B and back. Your typed text is still there! Activity hides the content with `display: none` instead of unmounting it, so all state is preserved.",
          "Right-click the page and choose Inspect. When Tab B is active, find the Tab A content in the Elements panel — it is still in the DOM but has `display: none` on it.",
        ]}
      />
    </div>
  );
}
