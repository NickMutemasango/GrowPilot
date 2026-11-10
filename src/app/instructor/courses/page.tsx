import type { Metadata } from "next";
import { InstructorCoursesView } from "@/components/instructor/InstructorCoursesView";
import { getEnrolmentCounts, getOwnedCourses, getPublicSlugs, requireInstructor } from "@/lib/instructor/service";

export const metadata: Metadata = { title: "My Courses" };

export default async function InstructorCoursesPage() {
  const context = await requireInstructor("/instructor/courses");
  const [courses, enrolments, publicSlugs] = await Promise.all([
    getOwnedCourses(context.instructor.id),
    getEnrolmentCounts(context),
    getPublicSlugs(),
  ]);

  return <InstructorCoursesView courses={courses} enrolments={enrolments} publicSlugs={publicSlugs} />;
}
