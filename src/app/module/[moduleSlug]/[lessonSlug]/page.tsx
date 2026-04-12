import { notFound } from "next/navigation";
import { getLesson, getAdjacentLessons, modules } from "@/lib/course-data";
import { LessonNav } from "@/components/lesson-nav";
import { LessonChat } from "@/components/lesson-chat";

// Lesson content imports
import { TheProblem } from "./lessons/why-nextjs/the-problem";
import { WhatNextjsAdds } from "./lessons/why-nextjs/what-nextjs-adds";
import { ArchitectureOverview } from "./lessons/why-nextjs/architecture-overview";
import { FileBasedRouting } from "./lessons/routing/file-based-routing";
import { LayoutsAndTemplates } from "./lessons/routing/layouts-and-templates";
import { DynamicRoutes } from "./lessons/routing/dynamic-routes";
import { LoadingAndError } from "./lessons/routing/loading-and-error";
import { RenderingModels } from "./lessons/server-client/rendering-models";
import { ServerComponents } from "./lessons/server-client/server-components";
import { ClientComponents } from "./lessons/server-client/client-components";
import { CompositionPatterns } from "./lessons/server-client/composition-patterns";
import { FetchingInServerComponents } from "./lessons/data-fetching/fetching-in-server-components";
import { StreamingAndSuspense } from "./lessons/data-fetching/streaming-and-suspense";
import { ParallelSequential } from "./lessons/data-fetching/parallel-sequential";
import { CachingMentalModel } from "./lessons/caching/caching-mental-model";
import { UseCache } from "./lessons/caching/use-cache";
import { CacheLifeProfiles } from "./lessons/caching/cache-life-profiles";
import { RevalidationApis } from "./lessons/caching/revalidation-apis";
import { WhatIsProxy } from "./lessons/proxy/what-is-proxy";
import { CommonPatterns } from "./lessons/proxy/common-patterns";
import { WhyTurbopack } from "./lessons/turbopack/why-turbopack";
import { TurbopackFeatures } from "./lessons/turbopack/turbopack-features";
import { ViewTransitions } from "./lessons/react-19/view-transitions";
import { ActivityComponent } from "./lessons/react-19/activity-component";
import { UseEffectEvent } from "./lessons/react-19/use-effect-event";
import { ReactCompiler } from "./lessons/react-19/react-compiler";
import { WhatAreServerActions } from "./lessons/server-actions/what-are-server-actions";
import { FormsAndValidation } from "./lessons/server-actions/forms-and-validation";
import { OptimisticUpdates } from "./lessons/server-actions/optimistic-updates";
import { PerformanceOptimization } from "./lessons/production/performance-optimization";
import { Deployment } from "./lessons/production/deployment";
import { WhatsNext } from "./lessons/production/whats-next";
import { WhatIsAiSdk } from "./lessons/ai-sdk/what-is-ai-sdk";
import { GeneratingText } from "./lessons/ai-sdk/generating-text";
import { ChatUi } from "./lessons/ai-sdk/chat-ui";
import { StructuredOutput } from "./lessons/ai-tools/structured-output";
import { ToolCalling } from "./lessons/ai-tools/tool-calling";
import { BuildingAgents } from "./lessons/ai-tools/building-agents";
import { WhatIsGateway } from "./lessons/ai-gateway/what-is-gateway";
import { ProductionAi } from "./lessons/ai-gateway/production-ai";

const lessonComponents: Record<string, Record<string, React.ComponentType>> = {
  "why-nextjs": {
    "the-problem": TheProblem,
    "what-nextjs-adds": WhatNextjsAdds,
    "architecture-overview": ArchitectureOverview,
  },
  "routing": {
    "file-based-routing": FileBasedRouting,
    "layouts-and-templates": LayoutsAndTemplates,
    "dynamic-routes": DynamicRoutes,
    "loading-and-error": LoadingAndError,
  },
  "server-client": {
    "rendering-models": RenderingModels,
    "server-components": ServerComponents,
    "client-components": ClientComponents,
    "composition-patterns": CompositionPatterns,
  },
  "data-fetching": {
    "fetching-in-server-components": FetchingInServerComponents,
    "streaming-and-suspense": StreamingAndSuspense,
    "parallel-sequential": ParallelSequential,
  },
  "caching": {
    "caching-mental-model": CachingMentalModel,
    "use-cache": UseCache,
    "cache-life-profiles": CacheLifeProfiles,
    "revalidation-apis": RevalidationApis,
  },
  "proxy": {
    "what-is-proxy": WhatIsProxy,
    "common-patterns": CommonPatterns,
  },
  "turbopack": {
    "why-turbopack": WhyTurbopack,
    "turbopack-features": TurbopackFeatures,
  },
  "react-19": {
    "view-transitions": ViewTransitions,
    "activity-component": ActivityComponent,
    "use-effect-event": UseEffectEvent,
    "react-compiler": ReactCompiler,
  },
  "server-actions": {
    "what-are-server-actions": WhatAreServerActions,
    "forms-and-validation": FormsAndValidation,
    "optimistic-updates": OptimisticUpdates,
  },
  "production": {
    "performance-optimization": PerformanceOptimization,
    "deployment": Deployment,
    "whats-next": WhatsNext,
  },
  "ai-sdk": {
    "what-is-ai-sdk": WhatIsAiSdk,
    "generating-text": GeneratingText,
    "chat-ui": ChatUi,
  },
  "ai-tools": {
    "structured-output": StructuredOutput,
    "tool-calling": ToolCalling,
    "building-agents": BuildingAgents,
  },
  "ai-gateway": {
    "what-is-gateway": WhatIsGateway,
    "production-ai": ProductionAi,
  },
};

export function generateStaticParams() {
  const params: { moduleSlug: string; lessonSlug: string }[] = [];
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      params.push({ moduleSlug: mod.slug, lessonSlug: lesson.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ moduleSlug: string; lessonSlug: string }> }) {
  const { moduleSlug, lessonSlug } = await params;
  const data = getLesson(moduleSlug, lessonSlug);
  if (!data) return { title: "Not Found" };
  return {
    title: `${data.lesson.title} — Next.js 16 Deep Dive`,
    description: data.lesson.description,
  };
}

export default async function LessonPage({ params }: { params: Promise<{ moduleSlug: string; lessonSlug: string }> }) {
  const { moduleSlug, lessonSlug } = await params;
  const data = getLesson(moduleSlug, lessonSlug);
  if (!data) notFound();

  const { module: mod, lesson, lessonIndex } = data;
  const adjacent = getAdjacentLessons(moduleSlug, lessonSlug);
  const LessonContent = lessonComponents[moduleSlug]?.[lessonSlug];
  if (!LessonContent) notFound();

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <span>Module {mod.id}</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span>Lesson {lessonIndex + 1} of {mod.lessons.length}</span>
        <span className="ml-auto text-xs">{lesson.estimatedMinutes} min read</span>
      </div>

      {/* Lesson Content */}
      <article className="prose">
        <LessonContent />
      </article>

      {/* Navigation */}
      <LessonNav
        currentKey={`${moduleSlug}/${lessonSlug}`}
        prev={adjacent.prev}
        next={adjacent.next}
      />

      {/* AI Chat */}
      <LessonChat
        moduleTitle={mod.title}
        lessonTitle={lesson.title}
        lessonDescription={lesson.description}
        lessonKey={`${moduleSlug}/${lessonSlug}`}
      />
    </div>
  );
}
