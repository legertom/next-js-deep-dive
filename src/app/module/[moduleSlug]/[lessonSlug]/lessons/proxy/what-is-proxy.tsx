import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function WhatIsProxy() {
  return (
    <div>
      <h1>What is proxy.ts?</h1>

      <p>
        In Next.js 16, <code>middleware.ts</code> was renamed to{" "}
        <code>proxy.ts</code>. This is not just a cosmetic change — it reflects
        a fundamental shift in how the framework thinks about request
        interception.
      </p>

      <h2>Why the rename?</h2>

      <p>
        The term "middleware" is overloaded in web development. Express has
        middleware. Redux has middleware. Even browsers have service workers that
        act as middleware. When Next.js originally introduced{" "}
        <code>middleware.ts</code>, developers often confused it with
        server-side middleware in the traditional sense — something that runs
        between route handlers in a chain.
      </p>

      <p>
        But that is not what it does. It sits at the <strong>network boundary</strong>,
        intercepting requests <em>before</em> they ever reach your application
        routes. It is, by definition, a <strong>proxy</strong> — a layer that
        inspects, transforms, redirects, or blocks requests on their way to the
        origin.
      </p>

      <Callout type="info">
        The rename to <code>proxy.ts</code> makes the mental model explicit: this
        file acts as a reverse proxy sitting in front of your Next.js application.
        It does not run &quot;in the middle&quot; of your route handling — it runs
        <em> before</em> it.
      </Callout>

      <h2>The architectural position of proxy.ts</h2>

      <FlowDiagram
        steps={[
          { label: "Client Request" },
          { label: "proxy.ts", sublabel: "intercept & transform" },
          { label: "Route Resolution" },
          { label: "Page / API / Action" },
          { label: "Response" },
        ]}
      />

      <p>
        Notice that <code>proxy.ts</code> sits before route resolution. This
        means it can rewrite the URL before Next.js even decides which page to
        render. It can return a response immediately without ever hitting your
        application code.
      </p>

      <h2>Node.js runtime — the other big change</h2>

      <p>
        In previous versions, middleware ran on the Edge Runtime. This was
        intentional for performance at CDN edges, but it came with severe
        limitations: no native Node.js APIs, no file system access, limited
        package compatibility, and a constrained execution environment.
      </p>

      <p>
        In Next.js 16, <code>proxy.ts</code> runs on the <strong>Node.js runtime</strong>.
        This means you now have access to:
      </p>

      <ul>
        <li>The full Node.js standard library (fs, crypto, net, etc.)</li>
        <li>Any npm package without Edge compatibility concerns</li>
        <li>Database drivers and ORMs directly</li>
        <li>Longer execution times without the Edge timeout constraints</li>
      </ul>

      <CodeBlock language="typescript" filename="proxy.ts">
{`import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken"; // Now possible — full Node.js!
import { readFileSync } from "fs";

const publicKey = readFileSync("./keys/public.pem", "utf-8");

export function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Full jsonwebtoken library — no Edge-compatible alternatives needed
    const payload = verify(token, publicKey, { algorithms: ["RS256"] });
    const headers = new Headers(request.headers);
    headers.set("x-user-id", String(payload.sub));
    return NextResponse.next({ headers });
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}`}
      </CodeBlock>

      <Callout type="warning">
        While <code>middleware.ts</code> still works in Next.js 16, it is
        deprecated. You should migrate to <code>proxy.ts</code> with the
        exported <code>proxy</code> function. The old file will be removed in a
        future major version.
      </Callout>

      <h2>The API shape</h2>

      <p>
        The function signature is nearly identical to what you already know. The
        key difference is the export name:
      </p>

      <CodeBlock language="typescript" filename="proxy.ts">
{`import { NextRequest, NextResponse } from "next/server";

// The exported function MUST be named "proxy"
export function proxy(request: NextRequest) {
  // Returning NextResponse.next() passes the request through unchanged
  return NextResponse.next();
}

// The config export still controls route matching
export const config = {
  matcher: [
    // Match all routes except static files and _next
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};`}
      </CodeBlock>

      <h2>Why this matters for your architecture</h2>

      <p>
        The shift from Edge to Node.js runtime changes the deployment story.
        Previously, middleware could run at CDN edge nodes for minimal latency.
        Now, <code>proxy.ts</code> runs on your origin server. This is a
        trade-off: you gain full Node.js capability but lose edge-level latency
        for proxy logic.
      </p>

      <p>
        In practice, most teams were already working around Edge limitations by
        making subrequests back to their origin from middleware. The new model
        eliminates that round-trip and simplifies the architecture.
      </p>

      <Diagram caption="Before vs After: The middleware-to-proxy evolution">
        <div className="text-sm text-center space-y-4">
          <div>
            <div className="font-semibold text-muted mb-1">Before (middleware.ts)</div>
            <div>Client → CDN Edge <span className="text-warning">(limited runtime)</span> → Origin Server</div>
          </div>
          <div className="text-muted">↓</div>
          <div>
            <div className="font-semibold text-accent mb-1">After (proxy.ts)</div>
            <div>Client → Origin Server <span className="text-success">(full Node.js)</span> → Route Handler</div>
          </div>
        </div>
      </Diagram>

      <Quiz
        question="Why was middleware.ts renamed to proxy.ts in Next.js 16?"
        options={[
          { label: "To make the filename shorter" },
          { label: "To clarify that it acts at the network boundary before route resolution, not between route handlers", correct: true, explanation: "The rename makes the mental model explicit. The file acts as a reverse proxy — intercepting requests before they reach your application routes. The term 'middleware' was confusing because it implied running between handlers in a chain, which is not what this file does." },
          { label: "Because the Edge Runtime was removed entirely from Next.js" },
          { label: "To align with Express.js naming conventions" },
        ]}
      />

      <Quiz
        question="What is the practical benefit of proxy.ts running on Node.js instead of the Edge Runtime?"
        options={[
          { label: "It runs faster at CDN edge nodes" },
          { label: "It can use any npm package and Node.js APIs without Edge compatibility restrictions", correct: true, explanation: "Running on Node.js means you have access to the full standard library, any npm package (database drivers, JWT libraries, file system), and no Edge-specific execution constraints. The trade-off is that it runs on your origin server rather than at CDN edges." },
          { label: "It automatically caches all responses" },
          { label: "It eliminates the need for a config matcher" },
        ]}
      />

      <HandsOn
        title="Migrate middleware.ts to proxy.ts"
        steps={[
          "If you have an existing middleware.ts file, rename it to proxy.ts",
          "Rename the exported function from 'middleware' to 'proxy'",
          "Remove any Edge-compatible workarounds — for example, replace 'jose' (Edge JWT library) with the full 'jsonwebtoken' package",
          "Add a Node.js-only operation to verify it works: try reading an environment variable from process.env or using crypto.randomUUID()",
          "Run your app and confirm requests still flow through the proxy correctly",
        ]}
      />
    </div>
  );
}
