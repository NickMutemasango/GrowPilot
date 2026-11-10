import type { Course } from "@/types/course";
import { CourseCard } from "./CourseCard";

/** Responsive grid: one card per row on phones, two on tablets, three on desktop. */
export function CourseGrid({ courses }: { courses: Course[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3">
      {courses.map((course) => (
        <li key={course.id}>
          <CourseCard course={course} />
        </li>
      ))}
    </ul>
  );
}
