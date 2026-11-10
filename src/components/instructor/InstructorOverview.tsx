"use client";

import { BookOpen, CircleCheck, PencilLine, Plus, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { CourseDraft } from "@/types/instructor";
import { EmptyCoursesState } from "./EmptyCoursesState";
import { InstructorCourseCard } from "./InstructorCourseCard";
import { InstructorStatsCard } from "./InstructorStatsCard";

type OverviewProps = {
  instructorName: string;
  courses: CourseDraft[];
  enrolments: Record<string, number>;
  /** Public address for each live course, by course ID. */
  publicSlugs: Record<string, string>;
};

/** "Welcome Back, Instructor!" with four totals and the latest courses. */
export function InstructorOverview({ instructorName, courses, enrolments, publicSlugs }: OverviewProps) {

  const live = courses.filter((course) => course.hasLiveVersion).length;
  const totalStudents = Object.values(enrolments).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Welcome Back, {instructorName}!</h1>
          <p className="mt-2 text-xl text-ink-muted">Manage your courses, support your students and share your knowledge.</p>
        </div>
        <ButtonLink href="/instructor/courses/create" size="lg" className="w-full shrink-0 sm:w-auto">
          <Plus aria-hidden="true" className="size-5" />
          Create New Course
        </ButtonLink>
      </header>

      <section aria-labelledby="totals-heading">
        <h2 id="totals-heading" className="sr-only">
          Your totals
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <InstructorStatsCard icon={BookOpen} title="Total Courses" value={courses.length} note="All your courses." />
          <InstructorStatsCard icon={CircleCheck} title="Published Courses" value={live} note="Live in the catalogue." />
          <InstructorStatsCard
            icon={PencilLine}
            title="Draft Courses"
            value={courses.filter((course) => !course.hasLiveVersion).length}
            note="Not live yet."
          />
          <InstructorStatsCard icon={Users} title="Total Enrolled Students" value={totalStudents} note="Across all your courses." />
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="recent-heading" className="text-2xl font-bold tracking-tight text-ink">
            Your Courses
          </h2>
          {courses.length > 3 && (
            <ButtonLink href="/instructor/courses" variant="secondary">
              See all courses
            </ButtonLink>
          )}
        </div>
        <div className="mt-4">
          {courses.length === 0 ? (
            <EmptyCoursesState />
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-6">
              {courses.slice(0, 3).map((course) => (
                <li key={course.id}>
                  <InstructorCourseCard course={course} publicSlug={publicSlugs[course.id] ?? null} students={enrolments[course.id] ?? 0} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
