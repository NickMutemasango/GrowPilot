import type { StudentCourse } from "@/types/student";
import { StudentCourseCard } from "./StudentCourseCard";

/** "My Courses": every enrolled course, most recently opened first. */
export function MyCoursesGrid({ courses }: { courses: StudentCourse[] }) {
  return (
    <section id="my-courses" aria-labelledby="my-courses-heading" className="scroll-mt-28">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="my-courses-heading" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          My Courses
        </h2>
        <p className="text-lg text-ink-muted">Most recently opened first</p>
      </div>
      <ul className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((item) => (
          <li key={item.course.id}>
            <StudentCourseCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
