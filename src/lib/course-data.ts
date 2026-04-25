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

export interface Course {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  accent: "blue" | "cyan";
  modules: Module[];
}

export const courses: Course[] = [
  {
    slug: "nextjs",
    title: "Next.js 16 Deep Dive",
    shortTitle: "Next.js Deep Dive",
    subtitle: "Go beyond tutorials. Understand how and why every feature works.",
    description:
      "Build a production app from scratch while mastering Cache Components, Turbopack, Server Actions, proxy.ts, and React 19.2.",
    icon: "▲",
    badge: "Next.js 16.2 · React 19.2",
    accent: "blue",
    modules: [
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
    ],
  },
  {
    slug: "react",
    title: "React Foundations to Fluency",
    shortTitle: "React Foundations",
    subtitle: "From rusty to fluent in modern React.",
    description:
      "A comprehensive course for developers who know JavaScript and want deep understanding of React 19 — from the render cycle to Server Components. Build a flashcard app across the course.",
    icon: "⚛︎",
    badge: "React 19.2 · TypeScript",
    accent: "cyan",
    modules: [
      {
        id: 1,
        slug: "mental-model",
        title: "The React Mental Model",
        subtitle: "Why React exists and how it actually works",
        icon: "🧠",
        lessons: [
          { slug: "why-react", title: "Why React Exists", description: "The problems React solves and the ones it doesn't", estimatedMinutes: 10 },
          { slug: "components-and-jsx", title: "Components & JSX", description: "Functions that return UI", estimatedMinutes: 12 },
          { slug: "render-cycle", title: "The Render Cycle", description: "What 'render' actually means", estimatedMinutes: 12 },
        ],
      },
      {
        id: 2,
        slug: "state-events",
        title: "State & Events",
        subtitle: "Making components interactive",
        icon: "⚡",
        lessons: [
          { slug: "use-state", title: "useState", description: "Adding state to a component", estimatedMinutes: 12 },
          { slug: "event-handlers", title: "Event Handlers & Controlled Inputs", description: "Reacting to user input", estimatedMinutes: 12 },
          { slug: "lifting-state", title: "Lifting State Up", description: "Sharing state between siblings", estimatedMinutes: 10 },
        ],
      },
      {
        id: 3,
        slug: "effects",
        title: "Effects & the Outside World",
        subtitle: "When and how to escape React",
        icon: "🌐",
        lessons: [
          { slug: "use-effect", title: "useEffect", description: "Synchronizing with external systems", estimatedMinutes: 15 },
          { slug: "cleanup", title: "Cleanup Functions", description: "Why effects need to undo themselves", estimatedMinutes: 10 },
          { slug: "you-might-not-need-an-effect", title: "You Might Not Need an Effect", description: "The most-overused hook in React", estimatedMinutes: 12 },
        ],
      },
      {
        id: 4,
        slug: "composition",
        title: "Composition Patterns",
        subtitle: "How to build flexible components",
        icon: "🧩",
        lessons: [
          { slug: "children-prop", title: "The children Prop", description: "The most powerful prop in React", estimatedMinutes: 10 },
          { slug: "composition-vs-prop-drilling", title: "Composition vs Prop Drilling", description: "Solving deep prop chains without context", estimatedMinutes: 12 },
          { slug: "components-as-props", title: "Components as Props", description: "Render props, slots, and headless components", estimatedMinutes: 12 },
        ],
      },
      {
        id: 5,
        slug: "hooks-toolkit",
        title: "The Hooks Toolkit",
        subtitle: "Beyond useState and useEffect",
        icon: "🔧",
        lessons: [
          { slug: "use-ref", title: "useRef", description: "DOM access and mutable values", estimatedMinutes: 10 },
          { slug: "use-context", title: "useContext", description: "Sharing values without prop drilling", estimatedMinutes: 12 },
          { slug: "use-reducer", title: "useReducer", description: "When state logic outgrows useState", estimatedMinutes: 12 },
          { slug: "custom-hooks", title: "Custom Hooks", description: "Reusable stateful logic", estimatedMinutes: 12 },
        ],
      },
      {
        id: 6,
        slug: "lists-reconciliation",
        title: "Lists & Reconciliation",
        subtitle: "How React decides what to update",
        icon: "📋",
        lessons: [
          { slug: "keys-and-lists", title: "Keys & List Rendering", description: "Why keys matter and what happens without them", estimatedMinutes: 10 },
          { slug: "how-react-updates-the-dom", title: "How React Updates the DOM", description: "Reconciliation, fibers, and the virtual DOM", estimatedMinutes: 12 },
        ],
      },
      {
        id: 7,
        slug: "forms",
        title: "Forms in Modern React",
        subtitle: "From controlled inputs to React 19 actions",
        icon: "📝",
        lessons: [
          { slug: "controlled-vs-uncontrolled", title: "Controlled vs Uncontrolled", description: "Two ways to handle form state", estimatedMinutes: 12 },
          { slug: "form-actions", title: "Form Actions", description: "The action prop and progressive enhancement", estimatedMinutes: 12 },
          { slug: "action-hooks", title: "useActionState, useFormStatus, useOptimistic", description: "The new React 19 form hooks", estimatedMinutes: 15 },
        ],
      },
      {
        id: 8,
        slug: "suspense-errors",
        title: "Suspense & Error Boundaries",
        subtitle: "Declarative loading and error states",
        icon: "⏳",
        lessons: [
          { slug: "what-is-suspending", title: "What 'Suspending' Means", description: "Throwing promises and the Suspense boundary", estimatedMinutes: 12 },
          { slug: "suspense-in-practice", title: "Suspense in Practice", description: "Async components, fallbacks, and streaming", estimatedMinutes: 12 },
          { slug: "error-boundaries", title: "Error Boundaries", description: "Catching render errors before they crash everything", estimatedMinutes: 10 },
        ],
      },
      {
        id: 9,
        slug: "server-client",
        title: "Server vs Client Components",
        subtitle: "The mental shift that changes React",
        icon: "🌓",
        lessons: [
          { slug: "the-mental-shift", title: "The Mental Shift", description: "Why React 19 split the component tree", estimatedMinutes: 12 },
          { slug: "boundary-rules", title: "Boundary Rules", description: "What can cross the boundary, what can't, and why", estimatedMinutes: 12 },
          { slug: "composition-across-boundary", title: "Composition Across the Boundary", description: "Server components as children of client components", estimatedMinutes: 12 },
        ],
      },
      {
        id: 10,
        slug: "concurrent",
        title: "Concurrent Rendering",
        subtitle: "Keeping the UI responsive under load",
        icon: "🚦",
        lessons: [
          { slug: "use-transition", title: "useTransition", description: "Marking updates as low-priority", estimatedMinutes: 12 },
          { slug: "use-deferred-value", title: "useDeferredValue", description: "Stale-while-fresh rendering", estimatedMinutes: 10 },
        ],
      },
      {
        id: 11,
        slug: "performance",
        title: "Performance & the React Compiler",
        subtitle: "Why re-renders happen and what to do",
        icon: "⚡",
        lessons: [
          { slug: "why-rerenders-happen", title: "Why Re-renders Happen", description: "The mental model that makes performance debuggable", estimatedMinutes: 12 },
          { slug: "profiling", title: "Profiling with React DevTools", description: "Find slow components without guessing", estimatedMinutes: 10 },
          { slug: "react-compiler", title: "The React Compiler", description: "Auto-memoization and the death of useMemo", estimatedMinutes: 12 },
        ],
      },
      {
        id: 12,
        slug: "typescript-react",
        title: "TypeScript with React",
        subtitle: "Typing components, hooks, and props",
        icon: "🎯",
        lessons: [
          { slug: "typing-components", title: "Typing Components & Hooks", description: "Props, children, and event handlers", estimatedMinutes: 12 },
          { slug: "generic-components", title: "Generic Components", description: "Building components that work with any type", estimatedMinutes: 12 },
        ],
      },
    ],
  },
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getModule(courseSlug: string, moduleSlug: string): Module | undefined {
  return getCourse(courseSlug)?.modules.find((m) => m.slug === moduleSlug);
}

export function getLesson(
  courseSlug: string,
  moduleSlug: string,
  lessonSlug: string,
): { course: Course; module: Module; lesson: Lesson; lessonIndex: number } | undefined {
  const course = getCourse(courseSlug);
  if (!course) return undefined;
  const mod = course.modules.find((m) => m.slug === moduleSlug);
  if (!mod) return undefined;
  const lessonIndex = mod.lessons.findIndex((l) => l.slug === lessonSlug);
  if (lessonIndex === -1) return undefined;
  return { course, module: mod, lesson: mod.lessons[lessonIndex], lessonIndex };
}

export function getAdjacentLessons(courseSlug: string, moduleSlug: string, lessonSlug: string) {
  const course = getCourse(courseSlug);
  if (!course) return { prev: null, next: null };
  const allLessons: {
    courseSlug: string;
    moduleSlug: string;
    lessonSlug: string;
    title: string;
    moduleTitle: string;
  }[] = [];
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      allLessons.push({
        courseSlug,
        moduleSlug: mod.slug,
        lessonSlug: lesson.slug,
        title: lesson.title,
        moduleTitle: mod.title,
      });
    }
  }
  const idx = allLessons.findIndex((l) => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug);
  return {
    prev: idx > 0 ? allLessons[idx - 1] : null,
    next: idx < allLessons.length - 1 ? allLessons[idx + 1] : null,
  };
}

export function getTotalLessons(courseSlug?: string): number {
  if (courseSlug) {
    return getCourse(courseSlug)?.modules.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0;
  }
  return courses.reduce(
    (acc, c) => acc + c.modules.reduce((a, m) => a + m.lessons.length, 0),
    0,
  );
}

export function getCourseDuration(courseSlug: string): number {
  const course = getCourse(courseSlug);
  if (!course) return 0;
  return course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((a, l) => a + l.estimatedMinutes, 0),
    0,
  );
}
