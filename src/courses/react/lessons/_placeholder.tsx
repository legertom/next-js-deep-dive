import { Callout } from "@/components/callout";

export function Placeholder({ title }: { title: string }) {
  return (
    <>
      <h1>{title}</h1>
      <Callout type="info" title="Coming soon">
        This lesson is part of the React Foundations course and is being
        written. The course shell, navigation, and pedagogical components are
        already in place — content is rolling out lesson by lesson.
      </Callout>
      <p>
        In the meantime, jump back to the home page and pick a different
        lesson, or use the AI tutor on any lesson page to ask about React
        concepts directly.
      </p>
    </>
  );
}
