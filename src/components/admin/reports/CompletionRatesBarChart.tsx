import type { CoursePerformance } from "@/lib/admin/reports";

type CompletionRatesBarChartProps = {
  courses: CoursePerformance[];
};

/*
 * Completion rate per course, drawn as horizontal bars.
 *
 * Horizontal, because course titles are long: upright bars would either
 * squeeze the titles into unreadable slivers or turn them on their
 * side. The bars are ordinary elements rather than SVG, so the titles
 * are real text that wraps and scales with the rest of the page.
 *
 * The scale is always 0–100%, never stretched to the tallest bar: a
 * chart where 12% fills the width would read as a triumph.
 *
 * A COURSE NOBODY HAS ENROLLED IN HAS NO BAR, and says so. Drawing it
 * as 0% would accuse it of failing when nothing has been attempted.
 */
export function CompletionRatesBarChart({ courses }: CompletionRatesBarChartProps) {
  return (
    <figure className="m-0 flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span aria-hidden="true" className="inline-block size-3 rounded-sm bg-primary" />
          Students who finished
        </p>
        <p className="text-sm text-ink-muted">Each bar is drawn against the full 0–100%</p>
      </div>

      <ol className="flex flex-col gap-4">
        {courses.map((course) => (
          <li key={course.courseId} className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-base font-semibold text-ink">{course.courseTitle}</p>
              {course.completionRate === null ? (
                <p className="text-base text-ink-muted">No enrolments yet</p>
              ) : (
                <p className="text-base font-semibold text-ink tabular-nums">
                  {course.completionRate}%{" "}
                  <span className="font-normal text-ink-muted">
                    ({course.completed} of {course.enrolments})
                  </span>
                </p>
              )}
            </div>
            {course.completionRate === null ? (
              <div aria-hidden="true" className="h-3 w-full rounded-full bg-canvas ring-1 ring-line" />
            ) : (
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-secondary"
                role="img"
                aria-label={`${course.courseTitle}: ${course.completionRate}% completed, ${course.completed} of ${course.enrolments} students`}
                title={`${course.courseTitle}: ${course.completionRate}% — ${course.completed} of ${course.enrolments} students finished`}
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${course.completionRate}%` }} />
              </div>
            )}
          </li>
        ))}
      </ol>

      <figcaption className="sr-only">
        Bar chart of the share of students who have finished each course, drawn against a scale of 0 to 100 per
        cent. Courses nobody has enrolled in have no bar.
      </figcaption>
    </figure>
  );
}
