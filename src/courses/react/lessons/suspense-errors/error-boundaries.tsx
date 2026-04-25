import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { ShortAnswer } from "@/components/short-answer";

export function ErrorBoundaries() {
  return (
    <>
      <h1>Error Boundaries</h1>

      <p>
        An <strong>Error Boundary</strong> is to errors what Suspense is
        to loading. A subtree throws (a render error, a hook error, an
        unhandled promise rejection in a render path), and the boundary
        catches it and renders a fallback. The rest of the app keeps
        working.
      </p>

      <p>
        Without error boundaries, a single render error in any
        component crashes the whole React tree — the browser shows a
        white page. With them, you contain failures to small regions
        and show the user something useful.
      </p>

      <h2>The catch</h2>

      <p>
        As of React 19, error boundaries are still implemented as{" "}
        <strong>class components</strong>. There&apos;s no{" "}
        <code>useErrorBoundary</code> hook. This is the only thing in
        modern React you need a class for; ignore the dust.
      </p>

      <CodeBlock language="tsx">
        {`import { Component, type ReactNode } from "react";

type State = { error: Error | null };

class ErrorBoundary extends Component<{ children: ReactNode; fallback: (error: Error) => ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Send to your error reporting service.
    console.error("Caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}`}
      </CodeBlock>

      <p>
        You write this once and import it everywhere. Most apps have
        their own <code>ErrorBoundary</code> component, or use the{" "}
        <code>react-error-boundary</code> npm package which gives you a
        nicer hook-friendly API.
      </p>

      <h2>What error boundaries DO catch</h2>

      <ul>
        <li>Errors thrown during render.</li>
        <li>Errors thrown during reconciliation.</li>
        <li>Errors thrown in lifecycle methods of class components.</li>
        <li>Errors that bubble up from rejected promises consumed by <code>use()</code>.</li>
      </ul>

      <h2>What error boundaries DON&apos;T catch</h2>

      <ul>
        <li>Errors in event handlers (use try/catch in the handler).</li>
        <li>Errors in async code outside the render path (the boundary only sees what React surfaces).</li>
        <li>Errors thrown inside the error boundary itself (the next-higher boundary catches those).</li>
      </ul>

      <p>
        For event handlers and out-of-render async, you handle errors
        the normal JS way: try/catch and put the result in state.
      </p>

      <h2>Boundary placement</h2>

      <p>
        Like Suspense, the granularity is a UX choice:
      </p>

      <CodeBlock language="tsx">
        {`// Coarse: a single global boundary
<ErrorBoundary fallback={(e) => <FullPageError error={e} />}>
  <App />
</ErrorBoundary>

// Fine: each major region has its own
<ErrorBoundary fallback={(e) => <SidebarError error={e} />}>
  <Sidebar />
</ErrorBoundary>
<ErrorBoundary fallback={(e) => <ContentError error={e} />}>
  <Content />
</ErrorBoundary>`}
      </CodeBlock>

      <p>
        A coarse boundary at the root saves you from white-page
        crashes. Fine-grained boundaries around features mean a
        dashboard widget can fail without taking out the rest of the
        page. Most production apps have one global boundary plus
        boundaries around independent regions.
      </p>

      <h2>Combining with Suspense</h2>

      <p>
        Errors and loading both live on the same async data. The
        idiomatic pattern is to nest them — error boundary outside,
        suspense inside:
      </p>

      <CodeBlock language="tsx">
        {`<ErrorBoundary fallback={(e) => <ErrorState error={e} />}>
  <Suspense fallback={<Skeleton />}>
    <DataDrivenComponent />
  </Suspense>
</ErrorBoundary>`}
      </CodeBlock>

      <p>
        While loading: skeleton shows. On success: real UI. On error:
        error boundary catches and shows the error state. All
        declarative, all locally scoped.
      </p>

      <h2>Recovering: the &quot;Try again&quot; pattern</h2>

      <p>
        After an error, the user usually wants to retry. Error
        boundaries themselves don&apos;t recover — once they&apos;re
        showing the fallback, they stay there until React tells them to
        try again. Two ways to retry:
      </p>

      <h3>Reset by changing key</h3>

      <CodeBlock language="tsx">
        {`function App() {
  const [resetKey, setResetKey] = useState(0);
  return (
    <ErrorBoundary
      key={resetKey}
      fallback={(e) => (
        <div>
          <p>Something went wrong: {e.message}</p>
          <button onClick={() => setResetKey(k => k + 1)}>Try again</button>
        </div>
      )}
    >
      <App />
    </ErrorBoundary>
  );
}`}
      </CodeBlock>

      <p>
        Changing the boundary&apos;s <code>key</code> forces React to
        unmount and remount it — fresh state, no error, the children
        try to render again.
      </p>

      <h3>Use react-error-boundary</h3>

      <p>
        The <code>react-error-boundary</code> package gives you a nicer
        API including <code>resetErrorBoundary</code> built in. For
        production apps, just use it.
      </p>

      <h2>What about logging?</h2>

      <p>
        <code>componentDidCatch</code> is your hook for sending errors
        to a monitoring service:
      </p>

      <CodeBlock language="tsx">
        {`componentDidCatch(error: Error, info: React.ErrorInfo) {
  Sentry.captureException(error, { contexts: { react: info } });
  // info.componentStack tells you which component tree threw
}`}
      </CodeBlock>

      <p>
        Always log. The user&apos;s &quot;something went wrong&quot;
        message is fine; you also need a record of what actually
        happened so you can fix it.
      </p>

      <h2>Adding an error boundary to your app</h2>

      <HandsOn
        title="Wrap your stats panel in an Error Boundary"
        projectStep="Module 8 · Step 2"
        projectContext="You'll create a small ErrorBoundary class component, simulate a render error, and watch the boundary catch it gracefully. Combined with Suspense, you'll have full async-UI coverage."
        steps={[
          "Create `src/ErrorBoundary.tsx` with a generic boundary: ```tsx\nimport { Component, type ReactNode, type ErrorInfo } from 'react';\n\ntype Props = { children: ReactNode; fallback: (error: Error, retry: () => void) => ReactNode };\ntype State = { error: Error | null };\n\nexport class ErrorBoundary extends Component<Props, State> {\n  state: State = { error: null };\n\n  static getDerivedStateFromError(error: Error): State {\n    return { error };\n  }\n\n  componentDidCatch(error: Error, info: ErrorInfo) {\n    console.error('ErrorBoundary caught:', error, info);\n  }\n\n  retry = () => this.setState({ error: null });\n\n  render() {\n    if (this.state.error) return this.props.fallback(this.state.error, this.retry);\n    return this.props.children;\n  }\n}\n```",
          "In `src/App.tsx`, import it: ```tsx\nimport { ErrorBoundary } from './ErrorBoundary';\n```",
          "Wrap your existing Suspense around Stats with an ErrorBoundary: ```tsx\n<ErrorBoundary fallback={(error, retry) => (\n  <Card>\n    <div style={{ padding: '1rem 1.25rem', color: '#dc2626', fontSize: '0.9rem' }}>\n      <p style={{ margin: 0 }}>Stats failed to load: {error.message}</p>\n      <button onClick={retry} style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>\n        Try again\n      </button>\n    </div>\n  </Card>\n)}>\n  <Suspense fallback={<StatsSkeleton />}>\n    <Stats promise={statsPromise} />\n  </Suspense>\n</ErrorBoundary>\n```",
          "Force an error to test the boundary. Temporarily modify your `fetchStats` to fail occasionally: ```tsx\nfunction fetchStats(cards: Card[], knownIds: Set<number>): Promise<{ total: number; known: number; oldest: string }> {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (Math.random() < 0.5) {\n        reject(new Error('Stats service unavailable'));\n        return;\n      }\n      const sorted = [...cards].sort((a, b) => a.id - b.id);\n      resolve({\n        total: cards.length,\n        known: knownIds.size,\n        oldest: sorted[0]?.question ?? 'no cards yet',\n      });\n    }, 700);\n  });\n}\n```",
          "Save and refresh a few times. About half the time you'll see the error UI with a 'Try again' button. Click it. The boundary resets, the request retries (might fail again — keep clicking), and eventually you see the real stats.",
          "Restore `fetchStats` to always succeed (remove the `Math.random() < 0.5` branch).",
          "Reflect: the rest of the app — your cards, the form, the search — kept working through every error. That's the value of small, focused error boundaries.",
        ]}
      />

      <Callout type="info" title="Production patterns">
        Real apps usually wrap (a) the whole app at the root for the
        catch-all white-page case, and (b) each major page or feature
        independently so a buggy widget doesn&apos;t crash the entire
        app. Logging belongs at the boundary; user-facing messages
        should be friendly (&quot;Something went wrong, our team has
        been notified&quot;) and offer a retry.
      </Callout>

      <Quiz
        question="What does an Error Boundary catch?"
        options={[
          { label: "Any JavaScript error anywhere in the app, including event handlers and async callbacks" },
          {
            label: "Errors thrown during render, reconciliation, lifecycle methods, and rejections from promises consumed via use() — but NOT errors in event handlers or out-of-render async",
            correct: true,
            explanation:
              "The boundary sees what React's render machinery surfaces. Event handlers run outside that path (they're regular DOM events), so try/catch handles their errors. Async work that doesn't go through use() or Suspense is also outside the boundary's reach.",
          },
          { label: "Only errors thrown by class components" },
          { label: "All errors automatically — you don't need to write a boundary" },
        ]}
      />

      <Quiz
        question="An Error Boundary is showing its fallback. The user clicks 'Try again'. What's the simplest way to retry?"
        options={[
          { label: "Call window.location.reload()" },
          {
            label: "Reset the boundary's state (set error back to null), or change its key — both cause it to render its children again",
            correct: true,
            explanation:
              "Boundaries don't auto-recover. You expose a retry by either resetting the boundary's internal state (calling setState({ error: null })) or remounting it via a key change. Either way, the children get a fresh render attempt with no error.",
          },
          { label: "Throw the error again" },
          { label: "Wrap the boundary in another boundary" },
        ]}
      />

      <ShortAnswer
        question="A user is on a dashboard with a sidebar, a chart, and a feed. The feed has a render bug. How does Error Boundary placement affect what the user sees, and what would the ideal placement be?"
        rubric={[
          "With one global boundary at the root, a feed bug crashes the entire dashboard — the user loses sidebar and chart too",
          "Wrapping each region (sidebar, chart, feed) in its own boundary means the feed shows its error fallback while the sidebar and chart keep working",
          "Bonus: notes the value of a global catch-all boundary as a safety net while still using fine-grained boundaries inside it for graceful per-region failure",
        ]}
        topic="Error boundary granularity for partial-failure resilience"
      />

      <h2>Module 8 wrap-up</h2>

      <p>
        Two declarative boundaries. <code>Suspense</code> for loading,{" "}
        <code>ErrorBoundary</code> for failure. Together they let you
        write components that read async data as if it were sync, and
        let you handle the loading/error states <em>where the layout
        lives</em> instead of branching on every component.
      </p>

      <p>
        That&apos;s the end of the &quot;pure React&quot; modules. You
        now have everything modern React offers: components, JSX,
        state, effects, refs, context, reducers, custom hooks, lists,
        reconciliation, forms, and async UI. Module 9 connects this to
        the framework world by introducing <strong>Server
        Components</strong> — the boundary that splits a React tree
        between server and browser. After Module 9, the Next.js course
        is a smooth continuation rather than a wall.
      </p>
    </>
  );
}
