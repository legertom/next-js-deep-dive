import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { ReadingProgress } from "@/components/reading-progress";
import { getCourse } from "@/lib/course-data";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) notFound();

  return (
    <div className="flex min-h-screen">
      <ReadingProgress />
      <Sidebar courseSlug={courseSlug} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
