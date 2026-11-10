import { CalendarPlus, History, TrendingDown, TrendingUp, Users } from "lucide-react";
import type { StudentGrowth } from "@/lib/admin/reports";
import { AdminStatsCard } from "../AdminStatsCard";
import { TrendLineChart } from "./TrendLineChart";

type StudentGrowthSectionProps = {
  growth: StudentGrowth;
  /** How many months the two charts cover. */
  months: number;
};

/**
 * "Student Growth Analytics": how many people have registered, and when.
 *
 * Every figure is counted from the sample accounts' own joining dates,
 * so changing a sample account changes the cards and both charts
 * together — there is no second copy of these numbers to fall out of
 * step.
 *
 * THE GROWTH FIGURE IS ALLOWED TO SAY NOTHING. A month that follows a
 * month with no registrations has no percentage: dividing by zero is
 * not "100% growth", and printing one would be a made-up number. In
 * that case the card says what actually happened instead.
 */
export function StudentGrowthSection({ growth, months }: StudentGrowthSectionProps) {
  const { thisMonth, lastMonth, growthPercent } = growth;
  const rising = growthPercent !== null && growthPercent > 0;
  const falling = growthPercent !== null && growthPercent < 0;

  const growthLabel =
    growthPercent === null ? "—" : `${growthPercent > 0 ? "+" : ""}${growthPercent.toFixed(1)}%`;

  // Said plainly, because a percentage on its own never explains itself.
  const growthDescription =
    growthPercent === null
      ? lastMonth === 0 && thisMonth === 0
        ? "Nobody registered in either month, so there is nothing to compare."
        : "Nobody registered last month, so there is no percentage to work out."
      : `${thisMonth} this month against ${lastMonth} last month.`;

  return (
    <section aria-labelledby="student-growth-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="student-growth-heading" className="text-2xl font-bold tracking-tight text-ink">
          Student Growth Analytics
        </h2>
        <p className="mt-1 text-base text-ink-muted">
          How many people have registered as students, and when they joined. Counted from the sample accounts
          themselves, over the last {months} months.
        </p>
      </div>

      {/* Four cards, so two across and then four: none is ever left alone on a row. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard
          icon={Users}
          title="Total Registered Students"
          description="Everybody registered, whenever they joined."
          value={growth.total}
          source="live"
        />
        <AdminStatsCard
          icon={CalendarPlus}
          title="New Students This Month"
          description="Registered since the first of the month."
          value={thisMonth}
          source="live"
        />
        <AdminStatsCard
          icon={History}
          title="New Students Last Month"
          description="The month before, for comparison."
          value={lastMonth}
          source="live"
        />
        <AdminStatsCard
          icon={rising ? TrendingUp : falling ? TrendingDown : History}
          title="Monthly Growth"
          description={growthDescription}
          value={growthPercent}
          valueLabel={growthLabel}
          source="live"
        />
      </div>

      <div className="grid gap-6 2xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-ink">Student Registration Trends</h3>
            <p className="mt-1 text-base text-ink-muted">
              New registrations in each of the last {months} months, including the months nobody joined.
            </p>
          </div>
          <TrendLineChart
            points={growth.registrations}
            legend="New students per month"
            unit={{ one: "new student", many: "new students" }}
            summary={`${growth.registrations.reduce((sum, point) => sum + point.value, 0)} registered in this period`}
            valueHeading="New students"
            description="Line chart of new student registrations per month."
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-ink">Cumulative Student Growth</h3>
            <p className="mt-1 text-base text-ink-muted">
              How many registered students there were at the end of each month, counting everyone who had already
              joined before this period.
            </p>
          </div>
          <TrendLineChart
            points={growth.cumulative}
            legend="Registered students in all"
            unit={{ one: "student", many: "students" }}
            summary={`${growth.total} students today`}
            valueHeading="Students in all"
            description="Line chart of the total number of registered students at the end of each month."
            shaded={false}
          />
        </div>
      </div>
    </section>
  );
}
