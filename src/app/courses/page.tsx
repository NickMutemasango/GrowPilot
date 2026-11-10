import type { Metadata } from "next";
import { CourseCatalogue } from "@/components/courses/CourseCatalogue";
import { getAllCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Explore Courses",
  description:
    "Find the right course for you. Learn something new, develop your skills, and grow at your own pace.",
};

export default async function CoursesPage() {
  const courses = await getAllCourses();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Explore Our Courses
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted sm:text-xl">
          Find the right course for you. Learn something new, develop your skills,
          and grow at your own pace.
        </p>
      </header>

      <div className="mt-10">
        <CourseCatalogue courses={courses} syncUrl />
      </div>
    </div>
  );
}
