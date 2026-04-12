import { CodeBlock } from "@/components/code-block";
import { Quiz } from "@/components/quiz";
import { Callout } from "@/components/callout";
import { HandsOn } from "@/components/hands-on";
import { Diagram, FlowDiagram } from "@/components/diagram";

export function PerformanceOptimization() {
  return (
    <div className="prose">
      <h1>Performance Optimization in Next.js 16</h1>

      <p>
        Performance isn&apos;t an afterthought &mdash; it&apos;s a feature. Next.js 16
        ships with built-in primitives for images, fonts, and metadata that directly
        improve Core Web Vitals. In this lesson, you&apos;ll learn how to measure
        performance, understand the new defaults, and apply targeted optimizations.
      </p>

      <FlowDiagram
        steps={[
          { label: "Measure", sublabel: "Lighthouse / Web Vitals" },
          { label: "Identify", sublabel: "LCP, CLS, INP bottlenecks" },
          { label: "Optimize", sublabel: "Images, fonts, bundles" },
          { label: "Verify", sublabel: "Re-measure after changes" },
        ]}
      />

      <h2>Core Web Vitals: The Metrics That Matter</h2>

      <p>
        Google uses three metrics to evaluate user experience: <strong>LCP</strong> (Largest
        Contentful Paint &mdash; how fast main content loads), <strong>CLS</strong> (Cumulative
        Layout Shift &mdash; visual stability), and <strong>INP</strong> (Interaction to Next
        Paint &mdash; responsiveness). Every optimization in this lesson targets at least
        one of these.
      </p>

      <h2>next/image: New Defaults in v16</h2>

      <p>
        The <code>next/image</code> component handles responsive sizing, lazy loading,
        and format conversion automatically. Next.js 16 changes three important
        defaults to improve caching and security:
      </p>

      <ul>
        <li>
          <strong>4-hour cache TTL</strong> &mdash; Previously images were cached for 60
          seconds by default. The new 4-hour <code>minimumCacheTTL</code> reduces
          origin requests dramatically.
        </li>
        <li>
          <strong>Single quality value</strong> &mdash; Instead of separate quality
          settings for different formats, v16 uses a single <code>quality</code> value
          (default 75) across all output formats.
        </li>
        <li>
          <strong>No local IP by default</strong> &mdash; The image optimization
          server no longer binds to localhost by default, improving security in
          containerized environments.
        </li>
      </ul>

      <CodeBlock filename="app/products/[id]/page.tsx" language="tsx">
{`import Image from "next/image";

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Image
        src={\`/products/\${params.id}.jpg\`}
        alt="Product photo"
        width={800}
        height={600}
        priority  // Skip lazy loading for above-the-fold images (improves LCP)
        quality={80}  // Override the default 75 if needed
      />
    </div>
  );
}`}
      </CodeBlock>

      <Callout type="important" title="Use priority for hero images">
        <p>
          The <code>priority</code> prop disables lazy loading and adds a preload
          hint. Use it for your largest above-the-fold image &mdash; this is usually
          what determines your LCP score. Only one or two images per page should
          have this prop.
        </p>
      </Callout>

      <p>
        To configure the new image defaults globally:
      </p>

      <CodeBlock filename="next.config.ts" language="typescript">
{`import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 14400, // 4 hours (new default in v16)
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.example.com",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;`}
      </CodeBlock>

      <h2>next/font: Zero Layout Shift Typography</h2>

      <p>
        Web fonts cause CLS when they load and swap with fallback fonts. The
        <code>next/font</code> module eliminates this by inlining font CSS at build
        time and using the <code>size-adjust</code> CSS property to match fallback
        metrics exactly.
      </p>

      <CodeBlock filename="app/layout.tsx" language="tsx">
{`import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={\`\${inter.variable} \${mono.variable}\`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}`}
      </CodeBlock>

      <Callout type="tip" title="Local fonts for maximum control">
        <p>
          For custom brand fonts, use <code>next/font/local</code>. This avoids
          any external network request and gives you full control over font file
          versions and subsetting.
        </p>
      </Callout>

      <CodeBlock filename="app/fonts.ts" language="typescript">
{`import localFont from "next/font/local";

export const brandFont = localFont({
  src: [
    { path: "./fonts/Brand-Regular.woff2", weight: "400" },
    { path: "./fonts/Brand-Bold.woff2", weight: "700" },
  ],
  variable: "--font-brand",
});`}
      </CodeBlock>

      <h2>Metadata API: SEO and Social Sharing</h2>

      <p>
        The Metadata API lets you define <code>&lt;head&gt;</code> content
        declaratively from any page or layout. It merges metadata from nested
        layouts, so you can set global defaults and override per-page.
      </p>

      <CodeBlock filename="app/layout.tsx" language="typescript">
{`import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://myapp.com"),
  title: {
    template: "%s | MyApp",
    default: "MyApp",
  },
  description: "A modern web application built with Next.js 16",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MyApp",
  },
};`}
      </CodeBlock>

      <CodeBlock filename="app/blog/[slug]/page.tsx" language="typescript">
{`import type { Metadata } from "next";

// Dynamic metadata based on the page content
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title, // Becomes "My Post Title | MyApp" via template
    description: post.excerpt,
    openGraph: {
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
    },
  };
}`}
      </CodeBlock>

      <h2>Code Splitting and Bundle Analysis</h2>

      <p>
        Next.js automatically code-splits at the route level &mdash; each page only
        loads the JavaScript it needs. But you can go further with dynamic imports
        for heavy components:
      </p>

      <CodeBlock filename="app/dashboard/page.tsx" language="tsx">
{`import dynamic from "next/dynamic";

// This chart library won't be included in the initial bundle
const Chart = dynamic(() => import("@/components/chart"), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 rounded" />,
  ssr: false, // Skip server rendering for browser-only libraries
});

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Chart data={salesData} />
    </div>
  );
}`}
      </CodeBlock>

      <p>
        To understand what&apos;s in your bundles, use the bundle analyzer:
      </p>

      <CodeBlock filename="terminal" language="bash">
{`# Install the analyzer
npm install @next/bundle-analyzer

# Add to next.config.ts
# Then run:
ANALYZE=true npm run build`}
      </CodeBlock>

      <CodeBlock filename="next.config.ts" language="typescript">
{`import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // your config
};

export default process.env.ANALYZE === "true"
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig;`}
      </CodeBlock>

      <Callout type="tip" title="Look for low-hanging fruit">
        <p>
          Common bundle bloat sources: moment.js (replace with date-fns or dayjs),
          lodash (import specific functions like <code>lodash/debounce</code>),
          and icon libraries (import individual icons, not the whole set).
        </p>
      </Callout>

      <h2>Measuring Performance</h2>

      <p>
        Next.js provides built-in reporting for Web Vitals. Hook into it to send
        metrics to your analytics:
      </p>

      <CodeBlock filename="app/components/web-vitals.tsx" language="tsx">
{`"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to your analytics endpoint
    console.log(metric.name, metric.value);

    // Example: send to custom endpoint
    fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating, // "good" | "needs-improvement" | "poor"
      }),
    });
  });

  return null;
}`}
      </CodeBlock>

      <Quiz
        question="What is the new default minimumCacheTTL for next/image in Next.js 16?"
        options={[
          { label: "60 seconds (same as before)" },
          { label: "30 minutes" },
          {
            label: "4 hours",
            correct: true,
            explanation:
              "Next.js 16 increased the default minimumCacheTTL to 4 hours (14400 seconds), significantly reducing origin image requests compared to the previous 60-second default.",
          },
          { label: "24 hours" },
        ]}
      />

      <Quiz
        question="Which technique eliminates Cumulative Layout Shift (CLS) caused by web fonts?"
        options={[
          { label: "Using font-display: block to hide text until fonts load" },
          {
            label: "Using next/font which inlines CSS and applies size-adjust to match fallback metrics",
            correct: true,
            explanation:
              "next/font calculates the exact size-adjust, ascent-override, and descent-override values so the fallback font occupies the same space as the web font. When the web font loads, no layout shift occurs.",
          },
          { label: "Preloading all font files in the document head" },
          { label: "Using system fonts only" },
        ]}
      />

      <HandsOn
        title="Add next/image and next/font to your blog"
        projectStep="Step 30 of 32 — Blog Platform Project"
        projectContext="Your blog is feature-complete. Now make it faster with two quick optimizations."
        steps={[
          "Find any <img> tag in your blog (or add one to your home page). Replace it with the Next.js Image component: import Image from 'next/image' at the top, then use <Image src='/your-image.jpg' alt='Blog hero' width={800} height={400} />. You should see the image load in a modern format like WebP automatically.",
          "Add the priority prop to that Image: <Image ... priority />. This tells Next.js to load it right away instead of lazy-loading. This is important for the first image users see on the page.",
          "Open app/layout.tsx and add a Google Font. Import it at the top: import { Inter } from 'next/font/google'. Then create it: const inter = Inter({ subsets: ['latin'] }). Add className={inter.className} to your <body> tag.",
          "Save and check your blog in the browser. The font should change to Inter. Open DevTools and look at the Network tab — notice there is no extra request for the font file. Next.js inlines it at build time!",
        ]}
      />
    </div>
  );
}
