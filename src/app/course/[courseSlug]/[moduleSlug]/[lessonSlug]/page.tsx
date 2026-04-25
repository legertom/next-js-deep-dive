import { notFound } from "next/navigation";
import { getLesson, getAdjacentLessons, courses } from "@/lib/course-data";
import { LessonNav } from "@/components/lesson-nav";
import { LessonArticle } from "@/components/lesson-article";

// Next.js course
import { TheProblem } from "@/courses/nextjs/lessons/why-nextjs/the-problem";
import { WhatNextjsAdds } from "@/courses/nextjs/lessons/why-nextjs/what-nextjs-adds";
import { ArchitectureOverview } from "@/courses/nextjs/lessons/why-nextjs/architecture-overview";
import { FileBasedRouting } from "@/courses/nextjs/lessons/routing/file-based-routing";
import { LayoutsAndTemplates } from "@/courses/nextjs/lessons/routing/layouts-and-templates";
import { DynamicRoutes } from "@/courses/nextjs/lessons/routing/dynamic-routes";
import { LoadingAndError } from "@/courses/nextjs/lessons/routing/loading-and-error";
import { RenderingModels } from "@/courses/nextjs/lessons/server-client/rendering-models";
import { ServerComponents } from "@/courses/nextjs/lessons/server-client/server-components";
import { ClientComponents } from "@/courses/nextjs/lessons/server-client/client-components";
import { CompositionPatterns } from "@/courses/nextjs/lessons/server-client/composition-patterns";
import { FetchingInServerComponents } from "@/courses/nextjs/lessons/data-fetching/fetching-in-server-components";
import { StreamingAndSuspense } from "@/courses/nextjs/lessons/data-fetching/streaming-and-suspense";
import { ParallelSequential } from "@/courses/nextjs/lessons/data-fetching/parallel-sequential";
import { CachingMentalModel } from "@/courses/nextjs/lessons/caching/caching-mental-model";
import { UseCache } from "@/courses/nextjs/lessons/caching/use-cache";
import { CacheLifeProfiles } from "@/courses/nextjs/lessons/caching/cache-life-profiles";
import { RevalidationApis } from "@/courses/nextjs/lessons/caching/revalidation-apis";
import { WhatIsProxy } from "@/courses/nextjs/lessons/proxy/what-is-proxy";
import { CommonPatterns } from "@/courses/nextjs/lessons/proxy/common-patterns";
import { WhyTurbopack } from "@/courses/nextjs/lessons/turbopack/why-turbopack";
import { TurbopackFeatures } from "@/courses/nextjs/lessons/turbopack/turbopack-features";
import { ViewTransitions } from "@/courses/nextjs/lessons/react-19/view-transitions";
import { ActivityComponent } from "@/courses/nextjs/lessons/react-19/activity-component";
import { UseEffectEvent } from "@/courses/nextjs/lessons/react-19/use-effect-event";
import { ReactCompiler as NextjsReactCompiler } from "@/courses/nextjs/lessons/react-19/react-compiler";
import { WhatAreServerActions } from "@/courses/nextjs/lessons/server-actions/what-are-server-actions";
import { FormsAndValidation } from "@/courses/nextjs/lessons/server-actions/forms-and-validation";
import { OptimisticUpdates } from "@/courses/nextjs/lessons/server-actions/optimistic-updates";
import { PerformanceOptimization } from "@/courses/nextjs/lessons/production/performance-optimization";
import { Deployment } from "@/courses/nextjs/lessons/production/deployment";
import { WhatsNext } from "@/courses/nextjs/lessons/production/whats-next";
import { WhatIsAiSdk } from "@/courses/nextjs/lessons/ai-sdk/what-is-ai-sdk";
import { GeneratingText } from "@/courses/nextjs/lessons/ai-sdk/generating-text";
import { ChatUi } from "@/courses/nextjs/lessons/ai-sdk/chat-ui";
import { StructuredOutput } from "@/courses/nextjs/lessons/ai-tools/structured-output";
import { ToolCalling } from "@/courses/nextjs/lessons/ai-tools/tool-calling";
import { BuildingAgents } from "@/courses/nextjs/lessons/ai-tools/building-agents";
import { WhatIsGateway } from "@/courses/nextjs/lessons/ai-gateway/what-is-gateway";
import { ProductionAi } from "@/courses/nextjs/lessons/ai-gateway/production-ai";

// React course
import { WhyReact } from "@/courses/react/lessons/mental-model/why-react";
import { ComponentsAndJsx } from "@/courses/react/lessons/mental-model/components-and-jsx";
import { RenderCycle } from "@/courses/react/lessons/mental-model/render-cycle";
import { UseState } from "@/courses/react/lessons/state-events/use-state";
import { EventHandlers } from "@/courses/react/lessons/state-events/event-handlers";
import { LiftingState } from "@/courses/react/lessons/state-events/lifting-state";
import { UseEffect } from "@/courses/react/lessons/effects/use-effect";
import { Cleanup } from "@/courses/react/lessons/effects/cleanup";
import { YouMightNotNeedAnEffect } from "@/courses/react/lessons/effects/you-might-not-need-an-effect";
import { ChildrenProp } from "@/courses/react/lessons/composition/children-prop";
import { CompositionVsPropDrilling } from "@/courses/react/lessons/composition/composition-vs-prop-drilling";
import { ComponentsAsProps } from "@/courses/react/lessons/composition/components-as-props";
import { UseRef } from "@/courses/react/lessons/hooks-toolkit/use-ref";
import { UseContext } from "@/courses/react/lessons/hooks-toolkit/use-context";
import { UseReducer } from "@/courses/react/lessons/hooks-toolkit/use-reducer";
import { CustomHooks } from "@/courses/react/lessons/hooks-toolkit/custom-hooks";
import { KeysAndLists } from "@/courses/react/lessons/lists-reconciliation/keys-and-lists";
import { HowReactUpdatesTheDom } from "@/courses/react/lessons/lists-reconciliation/how-react-updates-the-dom";
import { ControlledVsUncontrolled } from "@/courses/react/lessons/forms/controlled-vs-uncontrolled";
import { FormActions } from "@/courses/react/lessons/forms/form-actions";
import { ActionHooks } from "@/courses/react/lessons/forms/action-hooks";
import { WhatIsSuspending } from "@/courses/react/lessons/suspense-errors/what-is-suspending";
import { SuspenseInPractice } from "@/courses/react/lessons/suspense-errors/suspense-in-practice";
import { ErrorBoundaries } from "@/courses/react/lessons/suspense-errors/error-boundaries";
import { TheMentalShift } from "@/courses/react/lessons/server-client/the-mental-shift";
import { BoundaryRules } from "@/courses/react/lessons/server-client/boundary-rules";
import { CompositionAcrossBoundary } from "@/courses/react/lessons/server-client/composition-across-boundary";
import { UseTransition } from "@/courses/react/lessons/concurrent/use-transition";
import { UseDeferredValue } from "@/courses/react/lessons/concurrent/use-deferred-value";
import { WhyRerendersHappen } from "@/courses/react/lessons/performance/why-rerenders-happen";
import { Profiling } from "@/courses/react/lessons/performance/profiling";
import { ReactCompiler as ReactReactCompiler } from "@/courses/react/lessons/performance/react-compiler";
import { TypingComponents } from "@/courses/react/lessons/typescript-react/typing-components";
import { GenericComponents } from "@/courses/react/lessons/typescript-react/generic-components";

const lessonComponents: Record<string, Record<string, Record<string, React.ComponentType>>> = {
  nextjs: {
    "why-nextjs": {
      "the-problem": TheProblem,
      "what-nextjs-adds": WhatNextjsAdds,
      "architecture-overview": ArchitectureOverview,
    },
    routing: {
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
    caching: {
      "caching-mental-model": CachingMentalModel,
      "use-cache": UseCache,
      "cache-life-profiles": CacheLifeProfiles,
      "revalidation-apis": RevalidationApis,
    },
    proxy: {
      "what-is-proxy": WhatIsProxy,
      "common-patterns": CommonPatterns,
    },
    turbopack: {
      "why-turbopack": WhyTurbopack,
      "turbopack-features": TurbopackFeatures,
    },
    "react-19": {
      "view-transitions": ViewTransitions,
      "activity-component": ActivityComponent,
      "use-effect-event": UseEffectEvent,
      "react-compiler": NextjsReactCompiler,
    },
    "server-actions": {
      "what-are-server-actions": WhatAreServerActions,
      "forms-and-validation": FormsAndValidation,
      "optimistic-updates": OptimisticUpdates,
    },
    production: {
      "performance-optimization": PerformanceOptimization,
      deployment: Deployment,
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
  },
  react: {
    "mental-model": {
      "why-react": WhyReact,
      "components-and-jsx": ComponentsAndJsx,
      "render-cycle": RenderCycle,
    },
    "state-events": {
      "use-state": UseState,
      "event-handlers": EventHandlers,
      "lifting-state": LiftingState,
    },
    effects: {
      "use-effect": UseEffect,
      cleanup: Cleanup,
      "you-might-not-need-an-effect": YouMightNotNeedAnEffect,
    },
    composition: {
      "children-prop": ChildrenProp,
      "composition-vs-prop-drilling": CompositionVsPropDrilling,
      "components-as-props": ComponentsAsProps,
    },
    "hooks-toolkit": {
      "use-ref": UseRef,
      "use-context": UseContext,
      "use-reducer": UseReducer,
      "custom-hooks": CustomHooks,
    },
    "lists-reconciliation": {
      "keys-and-lists": KeysAndLists,
      "how-react-updates-the-dom": HowReactUpdatesTheDom,
    },
    forms: {
      "controlled-vs-uncontrolled": ControlledVsUncontrolled,
      "form-actions": FormActions,
      "action-hooks": ActionHooks,
    },
    "suspense-errors": {
      "what-is-suspending": WhatIsSuspending,
      "suspense-in-practice": SuspenseInPractice,
      "error-boundaries": ErrorBoundaries,
    },
    "server-client": {
      "the-mental-shift": TheMentalShift,
      "boundary-rules": BoundaryRules,
      "composition-across-boundary": CompositionAcrossBoundary,
    },
    concurrent: {
      "use-transition": UseTransition,
      "use-deferred-value": UseDeferredValue,
    },
    performance: {
      "why-rerenders-happen": WhyRerendersHappen,
      profiling: Profiling,
      "react-compiler": ReactReactCompiler,
    },
    "typescript-react": {
      "typing-components": TypingComponents,
      "generic-components": GenericComponents,
    },
  },
};

export function generateStaticParams() {
  const params: { courseSlug: string; moduleSlug: string; lessonSlug: string }[] = [];
  for (const course of courses) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        params.push({
          courseSlug: course.slug,
          moduleSlug: mod.slug,
          lessonSlug: lesson.slug,
        });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, moduleSlug, lessonSlug } = await params;
  const data = getLesson(courseSlug, moduleSlug, lessonSlug);
  if (!data) return { title: "Not Found" };
  return {
    title: `${data.lesson.title} — ${data.course.title}`,
    description: data.lesson.description,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, moduleSlug, lessonSlug } = await params;
  const data = getLesson(courseSlug, moduleSlug, lessonSlug);
  if (!data) notFound();

  const { course, module: mod, lesson, lessonIndex } = data;
  const adjacent = getAdjacentLessons(courseSlug, moduleSlug, lessonSlug);
  const LessonContent = lessonComponents[courseSlug]?.[moduleSlug]?.[lessonSlug];
  if (!LessonContent) notFound();

  const lessonKey = `${courseSlug}/${moduleSlug}/${lessonSlug}`;

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <span>{course.shortTitle}</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span>Module {mod.id}</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span>
          Lesson {lessonIndex + 1} of {mod.lessons.length}
        </span>
        <span className="ml-auto text-xs">{lesson.estimatedMinutes} min read</span>
      </div>

      {/* Lesson Content + AI Chat */}
      <LessonArticle
        moduleTitle={mod.title}
        lessonTitle={lesson.title}
        lessonDescription={lesson.description}
        lessonKey={lessonKey}
      >
        <LessonContent />
      </LessonArticle>

      {/* Navigation */}
      <LessonNav currentKey={lessonKey} prev={adjacent.prev} next={adjacent.next} />
    </div>
  );
}
