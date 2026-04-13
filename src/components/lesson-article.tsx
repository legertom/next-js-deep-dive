"use client";

import { useRef } from "react";
import { LessonChat } from "./lesson-chat";

interface LessonArticleProps {
  moduleTitle: string;
  lessonTitle: string;
  lessonDescription: string;
  lessonKey: string;
  children: React.ReactNode;
}

export function LessonArticle({
  moduleTitle,
  lessonTitle,
  lessonDescription,
  lessonKey,
  children,
}: LessonArticleProps) {
  const articleRef = useRef<HTMLElement>(null);

  return (
    <>
      <article ref={articleRef} className="prose">
        {children}
      </article>

      <LessonChat
        moduleTitle={moduleTitle}
        lessonTitle={lessonTitle}
        lessonDescription={lessonDescription}
        lessonKey={lessonKey}
        articleRef={articleRef}
      />
    </>
  );
}
