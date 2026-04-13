import { Sidebar } from "@/components/sidebar";
import { ReadingProgress } from "@/components/reading-progress";

export default function ModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <ReadingProgress />
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
