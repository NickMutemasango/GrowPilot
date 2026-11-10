import type { Metadata } from "next";
import { InstructorOverview } from "@/components/instructor/InstructorOverview";
import { getEnrolmentCounts, getOwnedCourses, getPublicSlugs, requireInstructor } from "@/lib/instructor/service";

export const metadata: Metadata = { title: "Overview" };

export default async function InstructorDashboardPage() {
  const context = await requireInstructor("/instructor/dashboard");
  const [courses, enrolments, publicSlugs] = await Promise.all([
    getOwnedCourses(context.instructor.id),
    getEnrolmentCounts(context),
    getPublicSlugs(),
  ]);

  return (
    <InstructorOverview
      instructorName={context.instructor.name}
      courses={courses}
      enrolments={enrolments}
      publicSlugs={publicSlugs}
    />
  );
}
