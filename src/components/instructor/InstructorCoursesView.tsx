"use client";

import { Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { CourseDraft } from "@/types/instructor";
import { courseStatuses } from "./CourseStatusBadge";
import { EmptyCoursesState } from "./EmptyCoursesState";
import { InstructorCourseCard } from "./InstructorCourseCard";

type InstructorCoursesViewProps = {
  courses: CourseDraft[];
  enrolments: Record<string, number>;
  publicSlugs: Record<string, string>;
};

/** "My Courses": every course the instructor owns, and nobody else's. */
export function InstructorCoursesView({ courses, enrolments, publicSlugs }: InstructorCoursesViewProps) {

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">My Courses</h1>
          <p className="mt-2 text-xl text-ink-muted">Create, edit and keep track of your courses.</p>
        </div>
        <ButtonLink href="/instructor/courses/create" size="lg" className="w-full shrink-0 sm:w-auto">
          <Plus aria-hidden="true" className="size-5" />
          Create New Course
        </ButtonLink>
      </header>

      {courses.length === 0 ? (
        <EmptyCoursesState />
      ) : (
        <>
          {/* Named for screen readers, so the course cards below do not
              jump straight from the page heading to a card heading. */}
          <h2 className="sr-only">Your courses</h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))] gap-6">
            {courses.map((course) => (
              <li key={course.id}>
                <InstructorCourseCard course={course} publicSlug={publicSlugs[course.id] ?? null} students={enrolments[course.id] ?? 0} />
              </li>
            ))}
          </ul>
        </>
      )}

      <section aria-labelledby="status-help" className="rounded-2xl bg-secondary p-5">
        <h2 id="status-help" className="text-lg font-bold text-ink">
          What the labels mean
        </h2>
        <dl className="mt-2 grid gap-2 text-base sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(courseStatuses).map((status) => (
            <div key={status.label}>
              <dt className="font-semibold text-ink">{status.label}</dt>
              <dd className="text-ink-muted">{status.help}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
