import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function Deployment() {
  return (
    <div className="prose">
      <h1>Deploying Next.js 16 Applications</h1>

      <p>
        You&apos;ve built a production-ready app. Now it needs to run somewhere.
        Next.js 16 gives you multiple deployment paths: managed platforms like
        Vercel, self-hosted with <code>next start</code>, Docker containers, and
        the new Build Adapters API for custom infrastructure. Each option makes
        different tradeoffs between convenience and control.
      </p>

      <FlowDiagram
        steps={[
          { label: "Build", sublabel: "next build" },
          { label: "Output", sublabel: ".next/ or standalone/" },
          { label: "Deploy", sublabel: "Vercel / Docker / Node" },
          { label: "Serve", sublabel: "Edge + Origin" },
        ]}
      />

      <h2>Option 1: Vercel (Zero-Config)</h2>

      <p>
        Vercel is the company behind Next.js, and their platform is optimized for
        it. Push to Git and your app deploys automatically with:
      </p>

      <ul>
        <li>Automatic HTTPS and global CDN</li>
        <li>Serverless and Edge Functions for API routes and middleware</li>
        <li>Image Optimization API handled at the edge</li>
        <li>Preview deployments for every pull request</li>
        <li>Analytics and Speed Insights built in</li>
      </ul>

      <CodeBlock filename="terminal" language="bash">
{`# Install Vercel CLI
npm install -g vercel

# Deploy from your project directory
vercel

# Deploy to production
vercel --prod`}
      </CodeBlock>

      <p>
        For most teams, this is the fastest path to production. You trade
        infrastructure control for zero DevOps overhead.
      </p>

      <Callout type="tip" title="Environment variables">
        <p>
          Set environment variables in the Vercel dashboard or via CLI with
          <code>vercel env add</code>. Variables prefixed with <code>NEXT_PUBLIC_</code>
          are inlined at build time and exposed to the browser. Keep secrets
          (database URLs, API keys) without that prefix.
        </p>
      </Callout>

      <h2>Option 2: Self-Hosted with next start</h2>

      <p>
        If you need to run on your own servers (compliance, data residency, cost
        at scale), Next.js includes a production server:
      </p>

      <CodeBlock filename="terminal" language="bash">
{`# Build the production bundle
next build

# Start the production server (default port 3000)
next start -p 3000

# Or with a custom hostname
next start -H 0.0.0.0 -p 8080`}
      </CodeBlock>

      <p>
        This runs a Node.js server that handles SSR, API routes, image optimization,
        and static file serving. You&apos;re responsible for process management,
        scaling, and a reverse proxy (nginx, Caddy) for HTTPS.
      </p>

      <CodeBlock filename="ecosystem.config.js" language="javascript">
{`// PM2 config for process management
module.exports = {
  apps: [
    {
      name: "nextjs-app",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      instances: "max",  // Use all CPU cores
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};`}
      </CodeBlock>

      <h2>Option 3: Docker with Standalone Output</h2>

      <p>
        For containerized environments (Kubernetes, ECS, Cloud Run), the
        <code>standalone</code> output mode produces a minimal deployment folder
        that includes only the files needed to run &mdash; no <code>node_modules</code>
        bloat.
      </p>

      <CodeBlock filename="next.config.ts" language="typescript">
{`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;`}
      </CodeBlock>

      <p>
        This produces a <code>.next/standalone</code> directory with a
        self-contained Node.js server. The resulting Docker image can be under
        100MB.
      </p>

      <CodeBlock filename="Dockerfile" language="dockerfile">
{`FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]`}
      </CodeBlock>

      <Callout type="important" title="Don't forget static assets">
        <p>
          The standalone output does NOT include the <code>public/</code> folder or
          <code>.next/static/</code> by default. You must copy them into the container
          as shown above, or serve them from a CDN.
        </p>
      </Callout>

      <CodeBlock filename="terminal" language="bash">
{`# Build and run the Docker image
docker build -t my-nextjs-app .
docker run -p 3000:3000 my-nextjs-app

# Or with docker compose
docker compose up -d`}
      </CodeBlock>

      <h2>Option 4: Build Adapters API (Alpha)</h2>

      <p>
        New in Next.js 16, the <strong>Build Adapters API</strong> lets hosting
        providers customize the build output for their platform. Instead of every
        provider reverse-engineering the <code>.next</code> directory structure,
        they can register an adapter that transforms the output into their native
        format.
      </p>

      <CodeBlock filename="next.config.ts" language="typescript">
{`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The adapter transforms build output for a specific platform
  buildAdapter: "@acme/next-adapter",
};

export default nextConfig;`}
      </CodeBlock>

      <p>
        This API is currently in alpha. It&apos;s designed for platform authors
        (Cloudflare, Netlify, AWS) rather than application developers. As a user,
        you&apos;ll eventually just install a provider&apos;s adapter package and
        get optimized deployments for that platform.
      </p>

      <Callout type="warning" title="Alpha status">
        <p>
          The Build Adapters API is experimental in Next.js 16. The interface may
          change between releases. For production deployments today, use Vercel,
          standalone Docker, or <code>next start</code> directly.
        </p>
      </Callout>

      <h2>When to Use Each Option</h2>

      <CodeBlock filename="Decision Guide" language="text">
{`Vercel
  ✓ Fastest time to production
  ✓ Automatic scaling, previews, analytics
  ✓ Best for: teams that want zero DevOps
  ✗ Vendor lock-in, costs scale with usage

Self-hosted (next start)
  ✓ Full control over infrastructure
  ✓ Predictable costs at scale
  ✓ Best for: existing server infrastructure
  ✗ You manage scaling, TLS, monitoring

Docker (standalone)
  ✓ Portable across any container platform
  ✓ Consistent environments dev → prod
  ✓ Best for: Kubernetes, cloud-native teams
  ✗ Container orchestration complexity

Build Adapters (alpha)
  ✓ Platform-native optimizations
  ✓ Best for: deploying to specific providers (Cloudflare Workers, etc.)
  ✗ Still experimental, limited adapter availability`}
      </CodeBlock>

      <h2>Production Checklist</h2>

      <p>
        Before deploying, verify these settings:
      </p>

      <CodeBlock filename="next.config.ts" language="typescript">
{`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone for Docker deployments
  output: "standalone",

  // Strict mode catches bugs early
  reactStrictMode: true,

  // Disable x-powered-by header (security)
  poweredByHeader: false,

  // Configure allowed image domains
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.yourapp.com" },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;`}
      </CodeBlock>

      <Quiz
        question="What does the 'standalone' output option produce?"
        options={[
          { label: "A static HTML export with no server" },
          {
            label: "A minimal .next/standalone directory with a self-contained Node.js server and only the required dependencies",
            correct: true,
            explanation:
              "The standalone output traces your application's imports and copies only the necessary node_modules into .next/standalone, along with a minimal server.js. This produces a deployment artifact that can run without installing dependencies separately.",
          },
          { label: "A serverless function bundle for AWS Lambda" },
          { label: "A Wasm binary that runs on the edge" },
        ]}
      />

      <Quiz
        question="What is the Build Adapters API in Next.js 16?"
        options={[
          { label: "A way to adapt your React components for different screen sizes" },
          { label: "A testing adapter for running builds in CI/CD pipelines" },
          {
            label: "An alpha API that lets hosting providers customize the build output for their platform",
            correct: true,
            explanation:
              "The Build Adapters API allows platform providers (like Cloudflare or Netlify) to register an adapter that transforms Next.js build output into their platform's native format, rather than reverse-engineering the .next directory structure.",
          },
          { label: "A replacement for next.config.ts" },
        ]}
      />

      <HandsOn
        title="Deploy Your App Three Ways"
        steps={[
          "Run next build and examine the .next/ directory. Note the server/ and static/ subdirectories and their contents.",
          "Start a production server with next start and verify it works on localhost:3000. Test that API routes and image optimization function correctly.",
          "Add output: 'standalone' to next.config.ts, rebuild, and inspect .next/standalone/. Note the server.js file and the minimal node_modules.",
          "Create the Dockerfile from this lesson. Build the image with docker build -t my-app . and run it with docker run -p 3000:3000 my-app.",
          "Compare the Docker image size with and without the standalone option (check using docker images).",
          "(Optional) Deploy to Vercel by pushing to a GitHub repo and connecting it at vercel.com/new. Compare the deployment experience to self-hosting.",
        ]}
      />
    </div>
  );
}
