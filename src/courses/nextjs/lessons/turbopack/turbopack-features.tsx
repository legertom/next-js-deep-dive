import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function TurbopackFeatures() {
  return (
    <div className="prose">
      <h1>Turbopack Features and Configuration</h1>

      <p>
        Turbopack isn&apos;t just fast &mdash; it ships with features designed for
        real-world development workflows. In this lesson, we&apos;ll explore file
        system caching, Fast Refresh, production builds, webpack compatibility, and
        how to configure Turbopack in your project.
      </p>

      <h2>File System Caching (Beta)</h2>

      <p>
        By default, Turbopack caches computation results in memory. When you
        restart the dev server, that cache is gone and the first load is a cold
        start. File system caching persists the cache to disk, so subsequent
        dev server starts can skip work that was already done.
      </p>

      <CodeBlock filename="next.config.ts" language="typescript">
{`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;`}
      </CodeBlock>

      <p>
        With this enabled, Turbopack writes its computation cache to{" "}
        <code>.next/cache/turbopack</code>. On subsequent dev server starts,
        it reads from this cache and only recomputes what has changed since the
        last session.
      </p>

      <FlowDiagram
        steps={[
          { label: "First Run", sublabel: "Full computation, writes cache" },
          { label: "Server Restart", sublabel: "Reads cache from disk" },
          { label: "Only Re-computes", sublabel: "Changed files since last run" },
          { label: "Fast Startup", sublabel: "Near-instant for unchanged code" },
        ]}
      />

      <Callout type="important" title="Beta feature">
        <p>
          File system caching is currently in beta. It works well for most
          projects, but you may encounter edge cases where stale caches cause
          issues. If you see unexpected behavior, delete the{" "}
          <code>.next/cache/turbopack</code> directory to reset.
        </p>
      </Callout>

      <h2>Fast Refresh: Up to 10x Faster</h2>

      <p>
        Fast Refresh (HMR) is where Turbopack&apos;s incremental engine shines
        most. When you edit a file, Turbopack:
      </p>

      <ol>
        <li>Detects the changed file via file watcher</li>
        <li>Invalidates only the cached computations that depend on that file</li>
        <li>Re-executes the minimal set of transforms</li>
        <li>Sends a granular HMR update to the browser</li>
      </ol>

      <p>
        The result is Fast Refresh times consistently under 200ms, often under
        50ms for simple component edits. This is up to 10x faster than webpack&apos;s
        HMR, which often re-bundles larger chunks of the dependency graph.
      </p>

      <CodeBlock filename="Terminal output during Fast Refresh" language="text">
{`✓ Fast Refresh applied in 47ms
✓ Fast Refresh applied in 82ms
✓ Fast Refresh applied in 31ms`}
      </CodeBlock>

      <Callout type="tip" title="State preservation">
        <p>
          Like webpack&apos;s Fast Refresh, Turbopack preserves React component
          state during updates. If you have a form with typed input, editing the
          component&apos;s render logic won&apos;t reset that input. Editing hooks
          or changing component signatures will trigger a full re-mount.
        </p>
      </Callout>

      <h2>Production Builds</h2>

      <p>
        In Next.js 16, <code>next build</code> uses Turbopack by default. Production
        builds benefit from the same incremental engine, plus additional
        optimizations:
      </p>

      <ul>
        <li>
          <strong>Parallel processing</strong> &mdash; Turbopack splits work
          across all available CPU cores for transforms, minification, and code
          splitting.
        </li>
        <li>
          <strong>Efficient tree shaking</strong> &mdash; Dead code elimination
          at the module and export level.
        </li>
        <li>
          <strong>Optimized chunking</strong> &mdash; Intelligent code splitting
          that minimizes both the number of requests and duplicate code across
          chunks.
        </li>
        <li>
          <strong>2-5x faster</strong> than webpack production builds for most
          projects.
        </li>
      </ul>

      <CodeBlock filename="Running a production build" language="bash">
{`# Default: uses Turbopack
next build

# Opt out to webpack if needed
next build --webpack`}
      </CodeBlock>

      <h2>Webpack Compatibility</h2>

      <p>
        Turbopack supports a subset of webpack configuration through{" "}
        <code>next.config.ts</code>. Common patterns that work out of the box:
      </p>

      <CodeBlock filename="next.config.ts" language="typescript">
{`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Aliases work the same way
  webpack: (config) => {
    // This webpack config is ONLY used with --webpack flag
    return config;
  },

  // Turbopack-specific configuration
  turbopack: {
    // Module aliases (equivalent to webpack resolve.alias)
    resolveAlias: {
      "@/components": "./src/components",
      "@/lib": "./src/lib",
    },

    // Custom loaders for file types
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;`}
      </CodeBlock>

      <Callout type="important" title="Not all webpack plugins work">
        <p>
          Turbopack does not support arbitrary webpack plugins. Most loaders have
          Turbopack equivalents, but complex plugins that hook into webpack&apos;s
          compilation lifecycle may not have direct replacements. Check the{" "}
          <code>turbopack</code> key in next.config.ts for supported options.
        </p>
      </Callout>

      <h2>Configuring Turbopack</h2>

      <p>
        Here&apos;s a complete example showing the most common configuration
        patterns:
      </p>

      <CodeBlock filename="next.config.ts" language="typescript">
{`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable persistent file system cache for dev (beta)
    turbopackFileSystemCacheForDev: true,
  },

  turbopack: {
    // Resolve aliases for module imports
    resolveAlias: {
      // Map bare specifiers to specific files
      "react-pdf": "react-pdf/dist/esm/entry.js",
    },

    // Define environment variables at build time
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json"],

    // Custom rules for file types
    rules: {
      // Use SVGR for SVG imports
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
      // Use raw-loader for .txt files
      "*.txt": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;`}
      </CodeBlock>

      <h2>When to Opt Out to Webpack</h2>

      <p>
        While Turbopack covers the vast majority of use cases, there are
        scenarios where you might need webpack:
      </p>

      <ul>
        <li>You rely on a webpack plugin with no Turbopack equivalent</li>
        <li>You use a custom webpack loader not yet supported</li>
        <li>You encounter a Turbopack-specific bug blocking your build</li>
      </ul>

      <CodeBlock filename="package.json" language="json">
{`{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:webpack": "next build --webpack",
    "start": "next start"
  }
}`}
      </CodeBlock>

      <Callout type="tip" title="Check compatibility first">
        <p>
          Before opting out, check if there&apos;s a Turbopack-native solution.
          Many webpack loaders (css-loader, postcss-loader, sass-loader) are
          already built into Turbopack. You often don&apos;t need to configure
          them at all.
        </p>
      </Callout>

      <h2>Debugging Turbopack</h2>

      <p>
        When something isn&apos;t working as expected, these tools help:
      </p>

      <CodeBlock filename="Useful environment variables" language="bash">
{`# Show detailed Turbopack tracing output
NEXT_TURBOPACK_TRACING=1 next dev

# Increase memory limit if you hit OOM on very large projects
NODE_OPTIONS="--max-old-space-size=8192" next build

# Clear the file system cache
rm -rf .next/cache/turbopack`}
      </CodeBlock>

      <Quiz
        question="What does the experimental.turbopackFileSystemCacheForDev option do?"
        options={[
          { label: "Caches HTTP responses from API routes" },
          {
            label: "Persists Turbopack's computation cache to disk so it survives dev server restarts",
            correct: true,
            explanation:
              "File system caching writes Turbopack's in-memory computation cache to .next/cache/turbopack. On subsequent dev server starts, it reads this cache and only recomputes what changed, dramatically reducing cold start times.",
          },
          { label: "Enables browser-side caching of static assets" },
          { label: "Caches npm package resolutions" },
        ]}
      />

      <Quiz
        question="You have a custom webpack plugin that modifies the compilation lifecycle. What should you do in Next.js 16?"
        options={[
          { label: "Add it to the turbopack.plugins array in next.config.ts" },
          { label: "Webpack plugins work automatically with Turbopack" },
          {
            label: "Check if there's a Turbopack-native alternative, or use next build --webpack as a fallback",
            correct: true,
            explanation:
              "Turbopack does not support arbitrary webpack plugins. The recommended path is to find a Turbopack-native solution (many common loaders are built-in). If no alternative exists, you can opt out to webpack for the build step using --webpack.",
          },
          { label: "Turbopack plugins are configured in turbopack.config.js" },
        ]}
      />

      <HandsOn
        title="See instant Hot Module Replacement in action"
        projectStep="Step 22 of 40 — Blog Platform Project"
        projectContext="Your blog should be running with `npm run dev`. Open it in your browser at http://localhost:3000."
        steps={[
          "Open `app/page.tsx` in your editor. Change the heading text to something different and save the file. Watch the browser — the change appears almost instantly without a full page reload. That is Hot Module Replacement (HMR).",
          "Now open `app/globals.css` and change a color value (for example, change a background color). Save the file. You should see the style update in the browser right away, without losing your scroll position.",
          "Look at the terminal where `npm run dev` is running. After each save, you should see a message like `compiled in Xms`. The time should be very small, often under 100ms.",
          "Try a bigger change: add a new paragraph with some text to `app/page.tsx`. Save and watch. Even with new content, the update should appear in under 200 milliseconds. This speed is what makes Turbopack great for development.",
        ]}
      />
    </div>
  );
}
