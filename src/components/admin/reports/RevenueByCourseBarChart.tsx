import { niceAxisMax, type CourseRevenue } from "@/lib/admin/reports";
import { formatMoney } from "@/lib/payments/money";

type RevenueByCourseBarChartProps = {
  courses: CourseRevenue[];
  currency: string;
};

/*
 * Net sales per course, drawn as horizontal bars.
 *
 * Horizontal, because course titles are long. The bars are ordinary
 * elements rather than SVG, so the titles are real text that wraps and
 * scales with the rest of the page.
 *
 * A REFUNDED SALE IS SHOWN, NOT HIDDEN. The bar is the net — what was
 * kept — and where money went back the row says so underneath, because
 * a course whose sales were mostly refunded is exactly what a revenue
 * report should surface rather than quietly smooth over.
 */
export function RevenueByCourseBarChart({ courses, currency }: RevenueByCourseBarChartProps) {
  const max = niceAxisMax(Math.max(...courses.map((course) => course.netMinor), 0));

  return (
    <figure className="m-0 flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span aria-hidden="true" className="inline-block size-3 rounded-sm bg-primary" />
          Net sales per course ({currency})
        </p>
        <p className="text-sm text-ink-muted">Scale runs to {formatMoney(max, currency)}</p>
      </div>

      <ol className="flex flex-col gap-4">
        {courses.map((course) => {
          const percent = max > 0 ? Math.round((course.netMinor / max) * 100) : 0;
          return (
            <li key={course.courseId} className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-base font-semibold text-ink">{course.courseTitle}</p>
                <p className="text-base font-semibold text-ink tabular-nums">
                  {formatMoney(course.netMinor, currency)}{" "}
                  <span className="font-normal text-ink-muted">
                    from {course.purchases} {course.purchases === 1 ? "purchase" : "purchases"}
                  </span>
                </p>
              </div>
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-secondary"
                role="img"
                aria-label={`${course.courseTitle}: ${formatMoney(course.netMinor, currency)} net of ${formatMoney(max, currency)}`}
                title={`${course.courseTitle}: ${formatMoney(course.grossMinor, currency)} gross, ${formatMoney(course.refundedMinor, currency)} refunded, ${formatMoney(course.netMinor, currency)} net`}
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
              </div>
              {course.refundedMinor > 0 && (
                <p className="text-sm text-ink-muted">
                  {formatMoney(course.grossMinor, currency)} came in, {formatMoney(course.refundedMinor, currency)}{" "}
                  went back as refunds.
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <figcaption className="sr-only">
        Bar chart of net sales per course in {currency}, biggest first, drawn against a scale of{" "}
        {formatMoney(max, currency)}. Net sales are what came in less what was refunded.
      </figcaption>
    </figure>
  );
}
