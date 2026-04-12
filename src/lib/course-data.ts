export interface Lesson {
  slug: string;
  title: string;
  description: string;
  estimatedMinutes: number;
}

export interface Module {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  lessons: Lesson[];
}

export const modules: Module[] = [
  {
    id: 1,
    slug: "why-nextjs",
    title: "Why Next.js Exists",
    subtitle: "The problems it solves and the mental model",
    icon: "💡",
    lessons: [
      { slug: "the-problem", title: "The Problem with SPAs", description: "Why React alone isn't enough for production apps", estimatedMinutes: 8 },
      { slug: "what-nextjs-adds", title: "What Next.js Adds to React", description: "The framework layer explained", estimatedMinutes: 10 },
      { slug: "architecture-overview", title: "Architecture Overview", description: "How all the pieces fit together", estimatedMinutes: 12 },
    ],
  },
  {
    id: 2,
    slug: "routing",
    title: "Routing Deep Dive",
    subtitle: "File-based routing, layouts, and the App Router",
    icon: "🗂️",
    lessons: [
      { slug: "file-based-routing", title: "File-Based Routing", description: "How folders become URLs", estimatedMinutes: 10 },
      { slug: "layouts-and-templates", title: "Layouts & Templates", description: "Nested layouts, shared UI, and when to use templates", estimatedMinutes: 12 },
      { slug: "dynamic-routes", title: "Dynamic Routes", description: "Params, catch-all routes, and parallel routes", estimatedMinutes: 15 },
      { slug: "loading-and-error", title: "Loading & Error States", description: "Streaming, Suspense boundaries, and error handling", estimatedMinutes: 10 },
    ],
  },
  {
    id: 3,
    slug: "server-client",
    title: "Server vs Client",
    subtitle: "The core mental model of React Server Components",
    icon: "⚡",
    lessons: [
      { slug: "rendering-models", title: "Rendering Models Explained", description: "SSR, SSG, ISR, and the new streaming model", estimatedMinutes: 12 },
      { slug: "server-components", title: "Server Components", description: "What they are, why they exist, and how they work", estimatedMinutes: 15 },
      { slug: "client-components", title: "Client Components", description: "When and how to use 'use client'", estimatedMinutes: 10 },
      { slug: "composition-patterns", title: "Composition Patterns", description: "Mixing server and client components effectively", estimatedMinutes: 12 },
    ],
  },
  {
    id: 4,
    slug: "data-fetching",
    title: "Data Fetching",
    subtitle: "Async components, server-side data, and streaming",
    icon: "📡",
    lessons: [
      { slug: "fetching-in-server-components", title: "Fetching in Server Components", description: "Direct database access and async/await", estimatedMinutes: 12 },
      { slug: "streaming-and-suspense", title: "Streaming & Suspense", description: "Progressive rendering and loading states", estimatedMinutes: 10 },
      { slug: "parallel-sequential", title: "Parallel vs Sequential Fetching", description: "Optimizing data fetching patterns", estimatedMinutes: 10 },
    ],
  },
  {
    id: 5,
    slug: "caching",
    title: "Cache Components",
    subtitle: "The new 'use cache' directive and PPR",
    icon: "🗄️",
    lessons: [
      { slug: "caching-mental-model", title: "The Caching Mental Model", description: "How Next.js 16 completely rethinks caching", estimatedMinutes: 12 },
      { slug: "use-cache", title: "The 'use cache' Directive", description: "Caching pages, components, and functions", estimatedMinutes: 15 },
      { slug: "cache-life-profiles", title: "Cache Life Profiles", description: "Controlling cache duration and revalidation", estimatedMinutes: 10 },
      { slug: "revalidation-apis", title: "revalidateTag, updateTag & refresh", description: "The three new cache invalidation APIs", estimatedMinutes: 12 },
    ],
  },
  {
    id: 6,
    slug: "proxy",
    title: "proxy.ts",
    subtitle: "Request interception at the network boundary",
    icon: "🔀",
    lessons: [
      { slug: "what-is-proxy", title: "What is proxy.ts?", description: "Why middleware became proxy and what changed", estimatedMinutes: 8 },
      { slug: "common-patterns", title: "Common Proxy Patterns", description: "Auth, redirects, rewrites, and geolocation", estimatedMinutes: 12 },
    ],
  },
  {
    id: 7,
    slug: "turbopack",
    title: "Turbopack",
    subtitle: "The new default bundler and why it matters",
    icon: "⚡",
    lessons: [
      { slug: "why-turbopack", title: "Why Turbopack?", description: "From webpack to Turbopack: the performance story", estimatedMinutes: 8 },
      { slug: "turbopack-features", title: "Turbopack Features", description: "File system caching, Fast Refresh, and production builds", estimatedMinutes: 10 },
    ],
  },
  {
    id: 8,
    slug: "react-19",
    title: "React 19.2 Features",
    subtitle: "View Transitions, Activity, and useEffectEvent",
    icon: "⚛️",
    lessons: [
      { slug: "view-transitions", title: "View Transitions", description: "Animating between routes and state changes", estimatedMinutes: 12 },
      { slug: "activity-component", title: "The Activity Component", description: "Background rendering with preserved state", estimatedMinutes: 10 },
      { slug: "use-effect-event", title: "useEffectEvent", description: "Separating reactive and non-reactive Effect logic", estimatedMinutes: 10 },
      { slug: "react-compiler", title: "React Compiler", description: "Automatic memoization — no more useMemo/useCallback", estimatedMinutes: 10 },
    ],
  },
  {
    id: 9,
    slug: "server-actions",
    title: "Server Actions & Forms",
    subtitle: "Mutations, optimistic updates, and form handling",
    icon: "📝",
    lessons: [
      { slug: "what-are-server-actions", title: "What Are Server Actions?", description: "RPC-style mutations from the client", estimatedMinutes: 12 },
      { slug: "forms-and-validation", title: "Forms & Validation", description: "Progressive enhancement and useActionState", estimatedMinutes: 15 },
      { slug: "optimistic-updates", title: "Optimistic Updates", description: "useOptimistic for instant UI feedback", estimatedMinutes: 10 },
    ],
  },
  {
    id: 10,
    slug: "production",
    title: "Production & Deployment",
    subtitle: "Optimization, testing, and going live",
    icon: "🚀",
    lessons: [
      { slug: "performance-optimization", title: "Performance Optimization", description: "Images, fonts, metadata, and Core Web Vitals", estimatedMinutes: 12 },
      { slug: "deployment", title: "Deployment", description: "Vercel, self-hosted, Docker, and build adapters", estimatedMinutes: 10 },
      { slug: "whats-next", title: "What's Next?", description: "Recap and where to go from here", estimatedMinutes: 5 },
    ],
  },
  {
    id: 11,
    slug: "ai-sdk",
    title: "AI SDK Basics",
    subtitle: "Add AI features to your Next.js app",
    icon: "🤖",
    lessons: [
      { slug: "what-is-ai-sdk", title: "What is the AI SDK?", description: "Why use a SDK for AI instead of raw API calls", estimatedMinutes: 8 },
      { slug: "generating-text", title: "Generating Text", description: "generateText and streamText for server-side AI", estimatedMinutes: 12 },
      { slug: "chat-ui", title: "Chat UI with useChat", description: "Build a streaming chat interface with React hooks", estimatedMinutes: 15 },
    ],
  },
  {
    id: 12,
    slug: "ai-tools",
    title: "Structured Output & Tools",
    subtitle: "Get typed data from AI and let it call your functions",
    icon: "🔧",
    lessons: [
      { slug: "structured-output", title: "Structured Output", description: "Get typed objects from AI with Zod schemas", estimatedMinutes: 12 },
      { slug: "tool-calling", title: "Tool Calling", description: "Let AI call your functions to get information", estimatedMinutes: 12 },
      { slug: "building-agents", title: "Building Agents", description: "Create AI agents that reason and act in loops", estimatedMinutes: 15 },
    ],
  },
  {
    id: 13,
    slug: "ai-gateway",
    title: "AI Gateway",
    subtitle: "One API for every AI provider",
    icon: "🌐",
    lessons: [
      { slug: "what-is-gateway", title: "What is AI Gateway?", description: "Unified API for Anthropic, OpenAI, Google, and more", estimatedMinutes: 10 },
      { slug: "production-ai", title: "Production AI", description: "Fallbacks, error handling, and observability", estimatedMinutes: 10 },
    ],
  },
];

export function getModule(slug: string): Module | undefined {
  return modules.find((m) => m.slug === slug);
}

export function getLesson(moduleSlug: string, lessonSlug: string): { module: Module; lesson: Lesson; lessonIndex: number } | undefined {
  const mod = getModule(moduleSlug);
  if (!mod) return undefined;
  const lessonIndex = mod.lessons.findIndex((l) => l.slug === lessonSlug);
  if (lessonIndex === -1) return undefined;
  return { module: mod, lesson: mod.lessons[lessonIndex], lessonIndex };
}

export function getAdjacentLessons(moduleSlug: string, lessonSlug: string) {
  const allLessons: { moduleSlug: string; lessonSlug: string; title: string; moduleTitle: string }[] = [];
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      allLessons.push({ moduleSlug: mod.slug, lessonSlug: lesson.slug, title: lesson.title, moduleTitle: mod.title });
    }
  }
  const currentIndex = allLessons.findIndex((l) => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug);
  return {
    prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
    next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
  };
}

export function getTotalLessons(): number {
  return modules.reduce((acc, m) => acc + m.lessons.length, 0);
}
