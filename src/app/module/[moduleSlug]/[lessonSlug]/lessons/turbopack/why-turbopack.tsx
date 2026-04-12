import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function WhyTurbopack() {
  return (
    <div className="prose">
      <h1>Why Turbopack?</h1>

      <p>
        If you&apos;ve worked on a large Next.js application, you know the pain:
        cold starts that take 30+ seconds, Fast Refresh that lags behind your
        typing, and production builds that grind through minutes of work. Webpack
        served the ecosystem well for a decade, but it hit a ceiling. Turbopack
        is the answer &mdash; a bundler written in Rust that is now the{" "}
        <strong>default bundler in Next.js 16</strong>.
      </p>

      <h2>The Webpack Bottleneck</h2>

      <p>
        Webpack is written in JavaScript. That&apos;s both its greatest strength
        (ecosystem, plugins, accessibility) and its fatal flaw for performance.
        JavaScript is single-threaded, garbage-collected, and interpreted. When
        your project has thousands of modules, webpack spends most of its time in:
      </p>

      <ul>
        <li>Parsing and transforming modules one-by-one on a single thread</li>
        <li>Serializing and deserializing large dependency graphs</li>
        <li>Garbage collection pauses as memory usage spikes</li>
        <li>Re-bundling entire subgraphs when a single file changes</li>
      </ul>

      <p>
        These costs compound. A 10,000-module app doesn&apos;t just take 10x
        longer than a 1,000-module app &mdash; it often takes 50x longer because
        the GC and cache invalidation costs grow non-linearly.
      </p>

      <FlowDiagram
        steps={[
          { label: "File Change", sublabel: "src/Button.tsx" },
          { label: "Webpack Rebuilds", sublabel: "Traverses full graph" },
          { label: "JS Single Thread", sublabel: "Transform + bundle" },
          { label: "HMR Update", sublabel: "500ms - 3s delay" },
        ]}
      />

      <h2>Why Rust?</h2>

      <p>
        Turbopack is written in Rust, and that choice is deliberate. Rust gives
        the bundler three fundamental advantages over JavaScript:
      </p>

      <ul>
        <li>
          <strong>No garbage collector</strong> &mdash; Memory is managed at
          compile time through ownership. No GC pauses, predictable performance.
        </li>
        <li>
          <strong>True parallelism</strong> &mdash; Rust&apos;s thread safety
          guarantees allow Turbopack to parallelize work across all CPU cores
          without data races.
        </li>
        <li>
          <strong>Native speed</strong> &mdash; Compiled to machine code, not
          interpreted. Parsing a module in Rust is orders of magnitude faster
          than in JavaScript.
        </li>
      </ul>

      <Callout type="important" title="Not just &quot;rewrite it in Rust&quot;">
        <p>
          Turbopack is not a port of webpack to Rust. It&apos;s a from-scratch
          architecture designed around an incremental computation engine. The
          language choice enables the architecture, but the architecture is what
          delivers the real gains.
        </p>
      </Callout>

      <h2>The Incremental Computation Engine</h2>

      <p>
        The key innovation in Turbopack is its incremental computation engine,
        called <strong>Turbo Engine</strong>. Think of it like a reactive
        spreadsheet for your build: every function call is tracked, and when an
        input changes, only the functions that depend on that input are re-executed.
      </p>

      <Diagram caption="Turbo Engine: Incremental Computation">
        <div className="text-sm space-y-3 text-center">
          <div>
            <div className="font-semibold text-muted mb-1">Traditional bundler</div>
            <div>File changes → Rebuild entire module graph → Output</div>
          </div>
          <div className="text-muted">vs</div>
          <div>
            <div className="font-semibold text-accent mb-1">Turbo Engine</div>
            <div>File changes → Identify affected functions → Re-execute only those → Output</div>
          </div>
          <div className="text-xs text-muted mt-2">The engine caches every function result. Changes invalidate only the minimal set of cached results.</div>
        </div>
      </Diagram>

      <p>
        In practice this means: if you change a CSS file, Turbopack doesn&apos;t
        re-parse your JavaScript. If you edit a component deep in the tree, it
        doesn&apos;t re-bundle unrelated parts of the app. The work done is
        proportional to the change, not proportional to the project size.
      </p>

      <CodeBlock language="text" filename="Performance comparison (approximate)">
{`Operation                    | Webpack    | Turbopack
-----------------------------|------------|------------
Dev server cold start (10k)  | 25-40s     | 3-8s
Fast Refresh                 | 500ms-3s   | 50-200ms
Production build (10k)       | 3-8 min    | 1-3 min
Incremental rebuild          | 1-5s       | <100ms`}
      </CodeBlock>

      <h2>Why This Matters for Developer Experience</h2>

      <p>
        Speed isn&apos;t just a nice-to-have &mdash; it fundamentally changes how
        you work:
      </p>

      <ul>
        <li>
          <strong>Fast Refresh under 200ms</strong> means your UI updates feel
          instant. You stay in flow instead of waiting and context-switching.
        </li>
        <li>
          <strong>Fast cold starts</strong> mean you can restart the dev server
          without losing your train of thought.
        </li>
        <li>
          <strong>Fast production builds</strong> mean shorter CI pipelines,
          faster deployments, and quicker feedback on PRs.
        </li>
      </ul>

      <p>
        Studies show that latency above 300ms breaks the feeling of direct
        manipulation. Turbopack keeps Fast Refresh well under that threshold,
        making development feel like direct editing rather than a
        compile-wait-check cycle.
      </p>

      <Callout type="tip" title="Turbopack is now the default">
        <p>
          In Next.js 16, you don&apos;t need to opt in. Running{" "}
          <code>next dev</code> and <code>next build</code> both use Turbopack
          automatically. If you need webpack for compatibility, you can opt out
          with <code>next build --webpack</code>.
        </p>
      </Callout>

      <h2>The Transition from Webpack</h2>

      <p>
        Turbopack didn&apos;t arrive overnight. Here&apos;s how the transition
        happened across Next.js versions:
      </p>

      <CodeBlock language="text" filename="Turbopack timeline">
{`Next.js 13  → Turbopack announced (alpha, dev only)
Next.js 14  → Turbopack stabilized for dev (opt-in)
Next.js 15  → Turbopack stable for dev, beta for build
Next.js 16  → Turbopack is the DEFAULT for both dev and build`}
      </CodeBlock>

      <p>
        This gradual rollout gave the team time to reach parity with webpack&apos;s
        feature set. Most webpack configurations now have Turbopack equivalents,
        and common loaders have been reimplemented in Rust for maximum speed.
      </p>

      <Quiz
        question="What is the primary architectural innovation that makes Turbopack faster than webpack for incremental updates?"
        options={[
          { label: "It uses multiple threads to parse JavaScript" },
          { label: "It skips type checking during builds" },
          {
            label: "An incremental computation engine that re-executes only the functions affected by a change",
            correct: true,
            explanation:
              "Turbo Engine tracks every function call and its inputs. When a file changes, it invalidates only the cached results that depend on that file, making rebuild work proportional to the size of the change rather than the size of the project.",
          },
          { label: "It pre-bundles all node_modules at install time" },
        ]}
      />

      <Quiz
        question="In Next.js 16, which statement about Turbopack is correct?"
        options={[
          { label: "You must add --turbopack flag to use it" },
          { label: "It only works for development, not production builds" },
          {
            label: "It is the default bundler for both dev and build, with webpack available as an opt-out",
            correct: true,
            explanation:
              "Next.js 16 made Turbopack the default bundler. Both next dev and next build use Turbopack automatically. You can opt out with next build --webpack if you have incompatible configurations.",
          },
          { label: "It replaces both Babel and ESLint" },
        ]}
      />

      <HandsOn
        title="Measure the Speed Difference"
        steps={[
          "Create a new Next.js 16 app: npx create-next-app@latest turbo-test",
          "Generate 50+ components by creating files in a loop (or use a script): each component should import from a shared module",
          "Run next dev and note the cold start time in the terminal output",
          "Edit a deeply nested component and observe how quickly Fast Refresh updates the browser (check the terminal for timing)",
          "Run next build and note the total build time",
          "Now run next build --webpack and compare the build time with Turbopack's",
          "Observe the difference: Turbopack should be noticeably faster, especially on incremental rebuilds during dev",
        ]}
      />
    </div>
  );
}
