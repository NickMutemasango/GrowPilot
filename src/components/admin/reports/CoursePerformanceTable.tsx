import type { CoursePerformance } from "@/lib/admin/reports";

type CoursePerformanceTableProps = {
  courses: CoursePerformance[];
};

/**
 * Every published course and how it is doing: a table on wide screens,
 * cards on narrow ones.
 *
 * A course nobody has enrolled in shows a dash rather than 0%: there is
 * no rate to report, and a zero would read as a verdict on a course
 * nobody has tried yet.
 */
export function CoursePerformanceTable({ courses }: CoursePerformanceTableProps) {
  return (
    <>
      {/*
        Six columns, four of them figures, only read well on a genuinely
        wide screen, so the table waits for one (xl). Below that the same
        courses are shown as cards, so nothing is squeezed into a column
        too narrow for it and the page never scrolls sideways.
      */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface xl:block">
        <table className="w-full min-w-[60rem] text-left text-base">
          <caption className="sr-only">
            Published courses with their enrolments, completions, average progress and completion rate, busiest
            first.
          </caption>
          <thead className="bg-secondary/60 text-ink">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold">Course Title</th>
              <th scope="col" className="px-5 py-4 font-semibold">Instructor</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Total Enrolments</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Completed Students</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Average Progress</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Completion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {courses.map((course) => (
              <tr key={course.courseId} className="align-middle hover:bg-canvas">
                <th scope="row" className="px-5 py-5 font-semibold text-ink">
                  {course.courseTitle}
                </th>
                <td className="px-5 py-5 whitespace-nowrap text-ink">{course.instructorName}</td>
                <td className="px-5 py-5 text-right text-ink tabular-nums">{course.enrolments}</td>
                <td className="px-5 py-5 text-right text-ink tabular-nums">{course.completed}</td>
                <td className="px-5 py-5 text-right text-ink tabular-nums">
                  {course.averageProgress === null ? (
                    <span className="text-ink-muted">—</span>
                  ) : (
                    `${course.averageProgress}%`
                  )}
                </td>
                <td className="px-5 py-5 text-right font-semibold text-ink tabular-nums">
                  {course.completionRate === null ? (
                    <span className="font-normal text-ink-muted">No enrolments yet</span>
                  ) : (
                    `${course.completionRate}%`
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 xl:hidden">
        {courses.map((course) => (
          <li key={course.courseId} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
            <p className="text-lg font-bold text-ink">{course.courseTitle}</p>
            <p className="mt-0.5 text-base text-ink-muted">{course.instructorName}</p>

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-sm text-ink-muted">Enrolments</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">{course.enrolments}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Completed</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">{course.completed}</p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Average progress</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
                  {course.averageProgress === null ? "—" : `${course.averageProgress}%`}
                </p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Completion rate</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
                  {course.completionRate === null ? "—" : `${course.completionRate}%`}
                </p>
              </div>
            </div>

            {course.enrolments === 0 && (
              <p className="mt-4 text-sm text-ink-muted">
                Nobody has enrolled yet, so there is no completion rate to report.
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
