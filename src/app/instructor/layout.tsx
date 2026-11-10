import type { Metadata } from "next";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { requireInstructor } from "@/lib/instructor/service";

// Check who is asking on every request; never build these pages ahead of time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Instructor Area", template: "%s | Instructor | GrowPilot Academy" },
  robots: { index: false },
};

/**
 * InstructorLayout: sidebar and content for every instructor page. The
 * access check here covers every page inside; each page checks again for
 * what it shows.
 */
export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { instructor } = await requireInstructor("/instructor/dashboard");

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6 sm:pt-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
        <div>
          <InstructorSidebar instructorName={instructor.name} />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
