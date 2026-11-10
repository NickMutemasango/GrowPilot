import { BookOpen, BookOpenCheck, Percent, UserCheck } from "lucide-react";
import type { CoursePerformance } from "@/lib/admin/reports";
import { AdminStatsCard } from "../AdminStatsCard";
import { CompletionRatesBarChart } from "./CompletionRatesBarChart";
import { CoursePerformanceTable } from "./CoursePerformanceTable";

type CoursePerformanceSectionProps = {
  publishedCourses: number;
  enrolments: number;
  completedEnrolments: number;
  /** Null where there are no enrolments at all: there is no rate to give. */
  overallCompletionRate: number | null;
  courses: CoursePerformance[];
};

/**
 * "Course Performance Analytics": how many people each course has
 * taken on, and how many of them finished.
 *
 * Every figure is counted from the same enrolments the Enrolments
 * screen lists and the same catalogue the Courses screen shows, so the
 * cards, the chart and the table can never disagree with each other or
 * with those pages.
 *
 * A COURSE WITH NO ENROLMENTS HAS NO COMPLETION RATE. It is kept in the
 * list and says so, rather than being dropped or shown as 0% — "nobody
 * has started this" and "nobody finishes this" are different findings,
 * and the second one would be an accusation the data does not support.
 */
export function CoursePerformanceSection({
  publishedCourses,
  enrolments,
  completedEnrolments,
  overallCompletionRate,
  courses,
}: CoursePerformanceSectionProps) {
  const withoutEnrolments = courses.filter((course) => course.enrolments === 0).length;

  return (
    <section aria-labelledby="course-performance-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="course-performance-heading" className="text-2xl font-bold tracking-tight text-ink">
          Course Performance Analytics
        </h2>
        <p className="mt-1 text-base text-ink-muted">
          How each published course is doing: who enrolled, how far they have got, and how many finished. The
          completion rate is completed enrolments divided by total enrolments.
        </p>
      </div>

      {/* Four cards, so two across and then four: none is ever left alone on a row. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard
          icon={BookOpen}
          title="Total Published Courses"
          description="Courses open to students in the catalogue."
          value={publishedCourses}
          source="catalogue"
        />
        <AdminStatsCard
          icon={UserCheck}
          title="Total Course Enrolments"
          description="Every student on a course, whatever its status."
          value={enrolments}
          source="live"
        />
        <AdminStatsCard
          icon={BookOpenCheck}
          title="Completed Enrolments"
          description="Enrolments with every lesson finished."
          value={completedEnrolments}
          source="live"
        />
        <AdminStatsCard
          icon={Percent}
          title="Overall Course Completion Rate"
          description={
            overallCompletionRate === null
              ? "No enrolments yet, so there is no rate to work out."
              : `${completedEnrolments} of ${enrolments} enrolments finished.`
          }
          value={overallCompletionRate}
          valueLabel={overallCompletionRate === null ? "—" : `${overallCompletionRate}%`}
          source="live"
        />
      </div>

      {withoutEnrolments > 0 && (
        <p className="text-base text-ink-muted">
          {withoutEnrolments} published {withoutEnrolments === 1 ? "course has" : "courses have"} no enrolments yet,
          so {withoutEnrolments === 1 ? "it has" : "they have"} no completion rate. {withoutEnrolments === 1 ? "It is" : "They are"}{" "}
          kept in the list below rather than hidden.
        </p>
      )}

      <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-ink">Course Completion Rates</h3>
          <p className="mt-1 text-base text-ink-muted">
            The share of each course&rsquo;s students who have finished every lesson.
          </p>
        </div>
        <CompletionRatesBarChart courses={courses} />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold tracking-tight text-ink">All Courses</h3>
        <p className="text-base text-ink-muted">
          {courses.length} {courses.length === 1 ? "course" : "courses"}, busiest first
        </p>
      </div>
      <CoursePerformanceTable courses={courses} />
    </section>
  );
}
