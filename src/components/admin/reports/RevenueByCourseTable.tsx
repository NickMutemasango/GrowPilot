import type { CourseRevenue } from "@/lib/admin/reports";
import { formatMoney } from "@/lib/payments/money";

type RevenueByCourseTableProps = {
  courses: CourseRevenue[];
  currency: string;
};

/**
 * Sales per course: a table on wide screens, cards on narrow ones.
 *
 * Every amount is in the one currency named in the heading above it,
 * so nothing on this table is ever added across currencies.
 */
export function RevenueByCourseTable({ courses, currency }: RevenueByCourseTableProps) {
  return (
    <>
      {/*
        Five columns, three of them money, only read well on a genuinely
        wide screen, so the table waits for one (xl). Below that the same
        courses are shown as cards, so nothing is squeezed into a column
        too narrow for it and the page never scrolls sideways.
      */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface xl:block">
        <table className="w-full min-w-[52rem] text-left text-base">
          <caption className="sr-only">
            Simulated sales per course in {currency}: purchases, gross revenue, refunds and net sales, biggest net
            first.
          </caption>
          <thead className="bg-secondary/60 text-ink">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold">Course Name</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Purchases</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Gross Revenue</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Refunds</th>
              <th scope="col" className="px-5 py-4 text-right font-semibold whitespace-nowrap">Net Sales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {courses.map((course) => (
              <tr key={course.courseId} className="align-middle hover:bg-canvas">
                <th scope="row" className="px-5 py-5 font-semibold text-ink">
                  {course.courseTitle}
                </th>
                <td className="px-5 py-5 text-right text-ink tabular-nums">{course.purchases}</td>
                <td className="px-5 py-5 text-right text-ink tabular-nums">
                  {formatMoney(course.grossMinor, currency)}
                </td>
                <td
                  className={`px-5 py-5 text-right tabular-nums ${
                    course.refundedMinor > 0 ? "text-[#9A3412]" : "text-ink-muted"
                  }`}
                >
                  {course.refundedMinor > 0 ? `−${formatMoney(course.refundedMinor, currency)}` : "—"}
                </td>
                <td className="px-5 py-5 text-right font-semibold text-ink tabular-nums">
                  {formatMoney(course.netMinor, currency)}
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
            <p className="mt-0.5 text-base text-ink-muted">
              {course.purchases} {course.purchases === 1 ? "purchase" : "purchases"}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-sm text-ink-muted">Gross revenue</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
                  {formatMoney(course.grossMinor, currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Refunds</p>
                <p
                  className={`text-2xl font-bold tracking-tight tabular-nums ${
                    course.refundedMinor > 0 ? "text-[#9A3412]" : "text-ink-muted"
                  }`}
                >
                  {course.refundedMinor > 0 ? `−${formatMoney(course.refundedMinor, currency)}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Net sales</p>
                <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
                  {formatMoney(course.netMinor, currency)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
