import { BookOpenCheck, GraduationCap, TrendingUp, Users } from "lucide-react";
import type { CourseEnrolmentStats } from "@/types/admin-courses";

type CourseEnrollmentOverviewProps = {
  stats: CourseEnrolmentStats | null;
  /** True when the figures are sample data for the development preview. */
  sample: boolean;
};

/**
 * Read-only enrolment figures for one course, from the enrolment and
 * progress records. Managing enrolments comes in Step 12D.
 */
export function CourseEnrollmentOverview({ stats, sample }: CourseEnrollmentOverviewProps) {
  return (
    <section aria-labelledby="enrolment-overview" className="rounded-2xl border border-line bg-surface p-5 shadow-header">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="enrolment-overview" className="text-xl font-bold text-ink">
          Enrolment Overview
        </h2>
        {stats && sample && (
          <span className="rounded-full bg-accent/35 px-2.5 py-0.5 text-sm font-semibold text-[#6b4e00]">Sample</span>
        )}
      </div>

      {stats === null ? (
        <p className="mt-3 text-base text-ink-muted">
          Enrolment figures need the database, so there is nothing to show yet.
        </p>
      ) : (
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Figure icon={Users} label="Total enrolled students" value={stats.enrolled.toLocaleString("en-US")} />
          <Figure icon={BookOpenCheck} label="Students in progress" value={stats.inProgress.toLocaleString("en-US")} />
          <Figure icon={GraduationCap} label="Students who completed" value={stats.completed.toLocaleString("en-US")} />
          <Figure icon={TrendingUp} label="Course completion" value={`${stats.completionPercent}%`} />
        </dl>
      )}
      <p className="mt-4 text-sm text-ink-muted">
        This section is read-only. Managing individual enrolments comes in a later step.
      </p>
    </section>
  );
}

function Figure({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-canvas p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div>
        <dt className="text-base text-ink-muted">{label}</dt>
        <dd className="text-2xl font-bold text-ink">{value}</dd>
      </div>
    </div>
  );
}
