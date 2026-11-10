import Link from "next/link";
import { ChevronRight, Clock, UserRound } from "lucide-react";
import { CourseLevelBadge } from "@/components/courses/CourseLevelBadge";
import { getCategoryLabel, type Course } from "@/types/course";

/** Breadcrumb, title and the key facts about a course. */
export function CourseHeader({ course }: { course: Course }) {
  return (
    <header>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-base text-ink-muted">
          <li className="flex items-center">
            <Link href="/" className="inline-flex min-h-11 items-center rounded-lg px-1 font-medium underline-offset-4 hover:text-primary hover:underline">
              Home
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <ChevronRight aria-hidden="true" className="size-4" />
            <Link href="/courses" className="inline-flex min-h-11 items-center rounded-lg px-1 font-medium underline-offset-4 hover:text-primary hover:underline">
              Courses
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <ChevronRight aria-hidden="true" className="size-4" />
            <span aria-current="page" className="px-1 font-semibold text-ink">
              {course.title}
            </span>
          </li>
        </ol>
      </nav>

      <p className="mt-6 inline-flex rounded-full bg-secondary px-4 py-1.5 text-base font-semibold text-primary-strong">
        {getCategoryLabel(course.category)}
      </p>
      <h1 className="mt-4 text-4xl leading-tight font-bold tracking-tight text-balance text-ink sm:text-5xl">
        {course.title}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl">
        {course.description}
      </p>

      <dl className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4 text-lg text-ink">
        <div className="flex items-center gap-2.5">
          <dt className="flex items-center gap-2.5 text-ink-muted">
            <UserRound aria-hidden="true" className="size-6 text-primary" />
            Instructor:
          </dt>
          <dd className="font-semibold">{course.instructor.name}</dd>
        </div>
        <div className="flex items-center gap-2.5">
          <dt className="sr-only">Level</dt>
          <dd>
            <CourseLevelBadge level={course.level} />
          </dd>
        </div>
        <div className="flex items-center gap-2.5">
          <dt className="flex items-center gap-2.5 text-ink-muted">
            <Clock aria-hidden="true" className="size-6 text-primary" />
            Duration:
          </dt>
          <dd className="font-semibold">{course.duration}</dd>
        </div>
      </dl>
    </header>
  );
}
