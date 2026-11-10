import { niceAxisMax, type PopularCourse } from "@/lib/admin/reports";

type PopularCoursesBarChartProps = {
  courses: PopularCourse[];
};

/*
 * The courses with the most enrolments, drawn as horizontal bars.
 *
 * Horizontal, because course titles are long: upright bars would either
 * squeeze the titles into unreadable slivers or turn them on their side.
 * The bars are ordinary elements rather than SVG, so the titles are real
 * text that wraps, selects and scales like the rest of the page.
 *
 * READABLE WITHOUT THE PICTURE. Every bar carries its own number beside
 * it, the list is a real list, and each bar has a `title` that browsers
 * show as a tooltip on hover.
 */
export function PopularCoursesBarChart({ courses }: PopularCoursesBarChartProps) {
  const max = niceAxisMax(Math.max(...courses.map((course) => course.enrolments), 0));

  return (
    <figure className="m-0 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span aria-hidden="true" className="inline-block size-3 rounded-sm bg-primary" />
          Enrolments per course
        </p>
        <p className="text-sm text-ink-muted">Scale runs to {max}</p>
      </div>

      <ol className="flex flex-col gap-4">
        {courses.map((course) => {
          const percent = Math.round((course.enrolments / max) * 100);
          return (
            <li key={course.courseId} className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-base font-semibold text-ink">{course.courseTitle}</p>
                <p className="text-base font-semibold text-ink tabular-nums">
                  {course.enrolments}{" "}
                  <span className="font-normal text-ink-muted">
                    {course.enrolments === 1 ? "enrolment" : "enrolments"}
                  </span>
                </p>
              </div>
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-secondary"
                role="img"
                aria-label={`${course.courseTitle}: ${course.enrolments} of ${max}`}
                title={`${course.courseTitle}: ${course.enrolments} ${course.enrolments === 1 ? "enrolment" : "enrolments"}`}
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
              </div>
            </li>
          );
        })}
      </ol>

      <figcaption className="sr-only">
        Bar chart of the courses with the most enrolments, highest first. Each bar is drawn against a scale of {max}.
      </figcaption>
    </figure>
  );
}
