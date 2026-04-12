import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function CommonPatterns() {
  return (
    <div>
      <h1>Common proxy.ts Patterns</h1>

      <p>
        Now that you understand what <code>proxy.ts</code> is and where it sits
        architecturally, let us look at the patterns you will use most
        frequently. Each pattern leverages the proxy&apos;s position at the
        network boundary — the perfect place to make decisions before your
        application code runs.
      </p>

      <h2>1. Authentication checks</h2>

      <p>
        The most common use case: protecting routes from unauthenticated users.
        Because the proxy runs before route resolution, unauthorized requests
        never reach your page components or API routes. This is a security
        boundary, not just a UX convenience.
      </p>

      <CodeBlock language="typescript" filename="proxy.ts">
{`import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jsonwebtoken";

const PROTECTED_PATHS = ["/dashboard", "/settings", "/api/private"];
const PUBLIC_PATHS = ["/login", "/signup", "/api/public"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if path needs protection
  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    const token = request.cookies.get("session")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const decoded = jwtVerify(token, process.env.JWT_SECRET!);
      // Pass user info downstream via headers
      const headers = new Headers(request.headers);
      headers.set("x-user-id", String(decoded.sub));
      headers.set("x-user-role", String(decoded.role));
      return NextResponse.next({ headers });
    } catch {
      // Token expired or invalid
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}`}
      </CodeBlock>

      <Callout type="info">
        By passing user information via request headers, your page components and
        API routes can access it without repeating the JWT verification. This is
        the &quot;enrich and forward&quot; pattern — the proxy authenticates once
        and enriches the request for downstream consumers.
      </Callout>

      <h2>2. Redirects</h2>

      <p>
        Redirects in <code>proxy.ts</code> are useful when the logic is dynamic
        — based on cookies, headers, or external state. For static redirects,
        prefer <code>next.config.js</code> redirects which are faster. Use the
        proxy when you need to <em>compute</em> where to send the user.
      </p>

      <CodeBlock language="typescript" filename="proxy.ts">
{`export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Locale-based redirect
  const country = request.headers.get("x-vercel-ip-country")
    || request.geo?.country
    || "US";

  if (pathname === "/" && country === "FR") {
    return NextResponse.redirect(new URL("/fr", request.url));
  }

  // Maintenance mode (controlled by environment variable)
  if (process.env.MAINTENANCE_MODE === "true" && pathname !== "/maintenance") {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // Legacy URL migration
  if (pathname.startsWith("/blog/")) {
    const slug = pathname.replace("/blog/", "");
    return NextResponse.redirect(
      new URL(\`/articles/\${slug}\`, request.url),
      301 // Permanent redirect for SEO
    );
  }

  return NextResponse.next();
}`}
      </CodeBlock>

      <h2>3. Rewrites (URL masking)</h2>

      <p>
        Rewrites differ from redirects: the user&apos;s browser URL stays the
        same, but the server resolves a different route internally. This is
        powerful for multi-tenant apps, A/B testing, and gradual migrations.
      </p>

      <CodeBlock language="typescript" filename="proxy.ts">
{`export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // Multi-tenant: rewrite based on subdomain
  // acme.yourapp.com/dashboard -> /tenants/acme/dashboard
  const subdomain = hostname.split(".")[0];
  if (subdomain !== "www" && subdomain !== "yourapp") {
    const tenantPath = \`/tenants/\${subdomain}\${pathname}\`;
    return NextResponse.rewrite(new URL(tenantPath, request.url));
  }

  // Feature flags: serve different page versions
  const featureFlags = request.cookies.get("features")?.value;
  if (featureFlags?.includes("new-pricing") && pathname === "/pricing") {
    return NextResponse.rewrite(new URL("/pricing-v2", request.url));
  }

  return NextResponse.next();
}`}
      </CodeBlock>

      <Callout type="warning">
        Rewrites are invisible to the client — the browser never knows the URL
        was remapped. This means you cannot use rewrites to &quot;fix&quot; a
        canonical URL for SEO. If the canonical URL matters, use a redirect
        instead.
      </Callout>

      <h2>4. A/B testing</h2>

      <p>
        The proxy is the ideal place for A/B test assignment because it runs
        before any page renders. You can assign a user to a variant and rewrite
        them to the appropriate version — all without client-side flicker.
      </p>

      <CodeBlock language="typescript" filename="proxy.ts">
{`import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/landing") {
    // Check if user already has an assignment
    let variant = request.cookies.get("ab-landing")?.value;

    if (!variant) {
      // Assign deterministically based on a stable identifier
      const visitorId = request.cookies.get("visitor-id")?.value
        || crypto.randomUUID();

      // Hash for consistent assignment
      const hash = crypto
        .createHash("md5")
        .update(visitorId + "landing-experiment")
        .digest("hex");

      // 50/50 split
      variant = parseInt(hash.slice(0, 8), 16) % 2 === 0 ? "control" : "variant";

      const response = NextResponse.rewrite(
        new URL(\`/landing/\${variant}\`, request.url)
      );
      response.cookies.set("ab-landing", variant, { maxAge: 60 * 60 * 24 * 30 });
      response.cookies.set("visitor-id", visitorId, { maxAge: 60 * 60 * 24 * 365 });
      return response;
    }

    return NextResponse.rewrite(new URL(\`/landing/\${variant}\`, request.url));
  }

  return NextResponse.next();
}`}
      </CodeBlock>

      <FlowDiagram
        steps={[
          { label: "Request hits proxy.ts" },
          { label: "Check A/B cookie" },
          { label: "Hash visitor ID", sublabel: "if no cookie" },
          { label: "Rewrite URL", sublabel: "/control or /variant" },
          { label: "Set cookie", sublabel: "for consistency" },
        ]}
      />

      <h2>5. Geolocation</h2>

      <p>
        With Node.js runtime access, you can use full-featured geolocation
        libraries or call external services. This is a major improvement over the
        Edge Runtime, where you were limited to whatever headers your hosting
        provider injected.
      </p>

      <CodeBlock language="typescript" filename="proxy.ts">
{`import { NextRequest, NextResponse } from "next/server";
import { lookup } from "geoip-lite"; // Full Node.js package — works now!

export function proxy(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]
    || "127.0.0.1";

  const geo = lookup(ip);

  if (geo) {
    const headers = new Headers(request.headers);
    headers.set("x-geo-country", geo.country);
    headers.set("x-geo-region", geo.region);
    headers.set("x-geo-city", geo.city || "unknown");
    headers.set("x-geo-timezone", geo.timezone || "UTC");
    return NextResponse.next({ headers });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};`}
      </CodeBlock>

      <p>
        By enriching the request with geo headers, your page components can
        personalize content (currency, language, shipping estimates) without each
        page independently performing IP lookups.
      </p>

      <h2>6. Rate limiting</h2>

      <p>
        Rate limiting at the proxy level is the first line of defense. Because it
        runs before your route handlers, abusive traffic never consumes your
        application resources. With Node.js runtime, you can connect directly to
        Redis or any store.
      </p>

      <CodeBlock language="typescript" filename="proxy.ts">
{`import { NextRequest, NextResponse } from "next/server";
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

const RATE_LIMIT = 100; // requests
const WINDOW_MS = 60_000; // per minute

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const key = \`rate-limit:\${ip}:\${Math.floor(Date.now() / WINDOW_MS)}\`;

  const current = await redis.incr(key);
  if (current === 1) {
    await redis.pexpire(key, WINDOW_MS);
  }

  if (current > RATE_LIMIT) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(WINDOW_MS / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
  response.headers.set("X-RateLimit-Remaining", String(RATE_LIMIT - current));
  return response;
}`}
      </CodeBlock>

      <Callout type="info">
        Notice that <code>proxy</code> can be an <code>async</code> function.
        Since it runs on Node.js, there are no Edge Runtime restrictions on
        execution time — you can await database queries, external APIs, or Redis
        calls directly.
      </Callout>

      <h2>Composing patterns</h2>

      <p>
        In real applications, you will combine multiple patterns in a single
        proxy function. Structure your proxy as a pipeline of checks, returning
        early when a decision is made:
      </p>

      <CodeBlock language="typescript" filename="proxy.ts">
{`export async function proxy(request: NextRequest) {
  // 1. Rate limiting (first — block abusive traffic immediately)
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // 2. Geo enrichment (enrich headers for downstream use)
  enrichGeoHeaders(request);

  // 3. Auth check (redirect unauthenticated users)
  const authResponse = checkAuth(request);
  if (authResponse) return authResponse;

  // 4. A/B testing (rewrite to variant pages)
  const abResponse = handleABTest(request);
  if (abResponse) return abResponse;

  // 5. Pass through
  return NextResponse.next();
}`}
      </CodeBlock>

      <Callout type="warning">
        Order matters. Rate limiting should always come first — you do not want
        to waste cycles verifying JWTs for requests that are already over the
        limit. Auth checks come before A/B testing because unauthenticated users
        should not reach experiment pages.
      </Callout>

      <Quiz
        question="Why is proxy.ts the ideal place for A/B test variant assignment?"
        options={[
          { label: "Because it can access the database directly" },
          { label: "Because it runs before page rendering, eliminating client-side flicker when showing different variants", correct: true, explanation: "The proxy runs before route resolution and page rendering. By assigning a variant and rewriting the URL at the proxy level, the correct page version is served from the start — the user never sees a flash of the wrong variant. This is impossible to achieve with purely client-side A/B testing." },
          { label: "Because it is the only place cookies can be set" },
          { label: "Because it runs on every request including static assets" },
        ]}
      />

      <Quiz
        question="What is the key difference between a redirect and a rewrite in proxy.ts?"
        options={[
          { label: "Redirects are faster than rewrites" },
          { label: "Rewrites change the browser URL, redirects do not" },
          { label: "Redirects change the browser URL (302/301), rewrites serve different content while keeping the URL unchanged", correct: true, explanation: "A redirect sends an HTTP 301/302 response telling the browser to navigate to a new URL — the address bar updates. A rewrite internally maps the request to a different route on the server, but the browser URL remains unchanged. Rewrites are ideal for multi-tenancy and A/B testing where you want URL stability." },
          { label: "Redirects only work for external URLs" },
        ]}
      />

      <HandsOn
        title="Build a multi-pattern proxy"
        steps={[
          "Create a proxy.ts file at the root of your Next.js project",
          "Implement a basic auth check that redirects unauthenticated users from /dashboard to /login, preserving the original URL as a ?redirect= query parameter",
          "Add a rewrite rule: if a cookie named 'beta' is set to 'true', rewrite /pricing to /pricing-beta",
          "Add rate limiting for /api/* routes using an in-memory Map (for development — use Redis in production)",
          "Test each pattern by visiting the routes in your browser and inspecting the Network tab to see redirects vs rewrites",
          "Verify that the order of operations is correct: rate limit -> auth -> rewrite",
        ]}
      />
    </div>
  );
}
