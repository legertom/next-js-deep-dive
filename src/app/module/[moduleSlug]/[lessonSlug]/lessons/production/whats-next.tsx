import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function WhatsNext() {
  return (
    <div className="prose">
      <h1>What&apos;s Next: Course Recap and Beyond</h1>

      <p>
        Congratulations. You&apos;ve completed the Next.js 16 Deep Dive. You started
        with the question &ldquo;why does Next.js exist?&rdquo; and now you can build,
        optimize, and deploy full-stack applications with confidence. Let&apos;s recap
        what you&apos;ve learned, celebrate the app you built, and chart the path
        forward.
      </p>

      <h2>What You&apos;ve Mastered</h2>

      <FlowDiagram
        steps={[
          { label: "Foundations", sublabel: "Why Next.js, App Router" },
          { label: "Rendering", sublabel: "Server & Client Components" },
          { label: "Data", sublabel: "Fetching, Caching, Mutations" },
          { label: "Production", sublabel: "Performance & Deployment" },
        ]}
      />

      <p>
        Here is a summary of every major concept from the course, organized by module:
      </p>

      <CodeBlock filename="Course Map" language="text">
{`Module 1: Why Next.js
  - The problems Next.js solves (routing, rendering, data fetching)
  - How it compares to plain React + Vite

Module 2: Routing
  - File-based routing with the App Router
  - Dynamic routes, catch-all segments, route groups
  - Layouts, templates, loading and error states
  - Parallel routes and intercepting routes

Module 3: Server & Client Components
  - React Server Components (RSC) architecture
  - "use client" and "use server" boundaries
  - When to use each rendering model
  - Streaming and Suspense

Module 4: Data Fetching
  - Server-side fetching with async components
  - The fetch API with caching and revalidation
  - Static generation vs dynamic rendering
  - Incremental Static Regeneration (ISR)

Module 5: Server Actions & Mutations
  - Form handling with Server Actions
  - useActionState and useFormStatus
  - Optimistic updates with useOptimistic
  - Revalidation after mutations

Module 6: Styling & UI
  - CSS Modules, Tailwind CSS, CSS-in-JS tradeoffs
  - next/font for zero-CLS typography
  - Component libraries and design systems

Module 7: Authentication & Middleware
  - Middleware for edge-level auth checks
  - Session management patterns
  - Protected routes and role-based access

Module 8: Testing
  - Unit testing components with Vitest
  - Integration testing with React Testing Library
  - E2E testing with Playwright

Module 9: Advanced Patterns
  - Parallel data fetching
  - Composition patterns for complex UIs
  - Error boundaries and recovery strategies

Module 10: Production & Deployment
  - next/image v16 defaults (4hr cache, single quality)
  - Metadata API for SEO
  - Bundle analysis and code splitting
  - Vercel, Docker standalone, Build Adapters API`}
      </CodeBlock>

      <h2>The App You Built</h2>

      <p>
        Throughout this course, you built a complete application that uses every
        concept above. Your app has:
      </p>

      <ul>
        <li>File-based routing with dynamic segments and nested layouts</li>
        <li>Server Components for data-heavy pages with zero client JavaScript</li>
        <li>Client Components for interactive features (forms, filters, real-time updates)</li>
        <li>Server Actions handling mutations with optimistic UI</li>
        <li>Authentication middleware protecting routes at the edge</li>
        <li>Optimized images, fonts, and metadata for excellent Core Web Vitals</li>
        <li>A production deployment configuration ready for Docker or Vercel</li>
      </ul>

      <p>
        This isn&apos;t a tutorial project you&apos;ll throw away. The patterns you
        used are the same ones powering production applications at scale. You can
        extend this app or use it as a reference architecture for your next project.
      </p>

      <Callout type="tip" title="Keep your project as a reference">
        <p>
          Push your completed project to GitHub. When you encounter a pattern question
          in a future project (&ldquo;how did I set up Server Actions with
          revalidation again?&rdquo;), your own code is the best documentation.
        </p>
      </Callout>

      <h2>Where to Go from Here</h2>

      <h3>1. The Next.js Documentation</h3>

      <p>
        The official docs at <code>nextjs.org/docs</code> are comprehensive and
        actively maintained. Now that you understand the mental model, the docs
        become a reference rather than a learning resource. Key sections to
        bookmark:
      </p>

      <ul>
        <li><strong>API Reference</strong> &mdash; Every config option, component prop, and function signature</li>
        <li><strong>Architecture</strong> &mdash; Deep dives into how the framework works internally</li>
        <li><strong>Upgrading</strong> &mdash; Migration guides for when Next.js 17 arrives</li>
      </ul>

      <h3>2. The Community</h3>

      <ul>
        <li><strong>GitHub Discussions</strong> &mdash; Search before asking; most questions have existing answers</li>
        <li><strong>Next.js Discord</strong> &mdash; Real-time help from the community and core team</li>
        <li><strong>Twitter/X</strong> &mdash; Follow @nextjs and core team members for announcements</li>
        <li><strong>Vercel Blog</strong> &mdash; In-depth posts on new features and performance techniques</li>
      </ul>

      <h3>3. DevTools and AI Assistance</h3>

      <p>
        Modern development is accelerated by AI tooling. Two resources worth
        exploring:
      </p>

      <ul>
        <li>
          <strong>Next.js DevTools</strong> &mdash; The built-in development overlay
          shows component boundaries, rendering mode indicators, and performance
          metrics during development.
        </li>
        <li>
          <strong>Claude with MCP (Model Context Protocol)</strong> &mdash; Connect
          Claude to your development environment for contextual assistance. MCP
          servers can read your project files, run commands, and provide answers
          grounded in your actual codebase rather than generic examples.
        </li>
      </ul>

      <CodeBlock filename="Example: Using Claude with Vercel MCP" language="text">
{`With the Vercel MCP server connected, you can ask:

  "Show me the build logs for my latest deployment"
  "What runtime errors occurred in the last hour?"
  "Help me debug this ISR cache miss"

Claude can pull real data from your Vercel project
and provide specific, actionable guidance.`}
      </CodeBlock>

      <h3>4. Next Steps for Your Skills</h3>

      <ul>
        <li><strong>Contribute to open source</strong> &mdash; The Next.js repo welcomes contributions, especially to docs and examples</li>
        <li><strong>Build in public</strong> &mdash; Ship a side project using everything you learned and share your progress</li>
        <li><strong>Go deeper on React</strong> &mdash; Understanding React internals (fiber, reconciliation, concurrent features) makes you a better Next.js developer</li>
        <li><strong>Explore the edge</strong> &mdash; Middleware, Edge Functions, and edge databases (Turso, Neon, PlanetScale) are the frontier</li>
      </ul>

      <Callout type="important" title="The framework evolves; your foundations don't">
        <p>
          Next.js will keep shipping new features. But the fundamentals you&apos;ve
          learned &mdash; the request/response model, component composition, the
          client/server boundary, caching strategies &mdash; are stable concepts
          that will carry you through any version. When Next.js 17 introduces
          something new, you&apos;ll understand it faster because you know why
          the current abstractions exist.
        </p>
      </Callout>

      <h2>A Final Note</h2>

      <p>
        You started this course as someone who knew React and wanted to level up.
        You&apos;re leaving as someone who can architect, build, and deploy
        full-stack applications with one of the most powerful frameworks in the
        ecosystem. That&apos;s a meaningful skill shift.
      </p>

      <p>
        The best way to solidify what you&apos;ve learned is to build something
        real. Not another todo app &mdash; something you actually want to exist
        in the world. Use the patterns from this course. Hit problems. Solve them.
        That&apos;s how knowledge becomes expertise.
      </p>

      <p>
        Ship something great.
      </p>

      <HandsOn
        title="Your Graduation Project"
        steps={[
          "Choose a project idea that excites you: a blog platform, a SaaS dashboard, an e-commerce store, or a tool you wish existed.",
          "Set up the project with create-next-app@latest and immediately configure next.config.ts with your production settings (standalone output, security headers, image domains).",
          "Implement at least 3 dynamic routes, 2 layouts, and 1 parallel route or intercepting route.",
          "Use Server Components for data display and Client Components only where you need interactivity. Verify with React DevTools that your server/client boundary is intentional.",
          "Add Server Actions for at least one mutation (create, update, or delete) with optimistic UI feedback.",
          "Deploy to Vercel or build a Docker image. Share the URL with someone and ask them to use it on mobile. Check your Core Web Vitals.",
        ]}
      />
    </div>
  );
}
