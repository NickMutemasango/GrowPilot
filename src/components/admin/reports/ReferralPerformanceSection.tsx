"use client";

import { useId, useMemo } from "react";
import { CalendarRange, CircleCheck, Clock, Gift, Info, UserPlus, X } from "lucide-react";
import { isBackwardsRange } from "@/lib/admin/affiliate-reports";
import {
  filterReferralAnalytics,
  monthlySuccessfulReferrals,
  NO_REFERRAL_ANALYTICS_FILTERS,
  summariseReferralAnalytics,
  type ReferralAnalyticsFilters,
} from "@/lib/admin/referral-analytics";

import { referralRewardStatusLabels } from "@/lib/admin/referral-rewards";
import { REFERRAL_REWARD_STATUSES, type AdminReferral } from "@/types/admin-referrals";
import { AdminStatsCard } from "../AdminStatsCard";
import { ReferralAnalyticsTable } from "./ReferralAnalyticsTable";
import { useReportFilters } from "./ReportFiltersContext";
import { TrendLineChart } from "./TrendLineChart";

type ReferralPerformanceSectionProps = {
  referrals: AdminReferral[];
  months: number;
};

const statusOptions = [
  { value: "all", label: "All Rewards" },
  ...REFERRAL_REWARD_STATUSES.map((status) => ({ value: status, label: referralRewardStatusLabels[status] })),
];

/**
 * "Referral Performance Analytics": what Refer-a-Friend has brought
 * in, and where the rewards have got to.
 *
 * A REFERRAL COUNTS AS SUCCESSFUL ONLY AFTER A QUALIFYING PURCHASE,
 * by the programme's own rule. A friend who joined and bought nothing
 * has not made one, and a refunded or cancelled purchase never
 * qualified — so neither is counted, however many people joined.
 *
 * Both filters narrow the same list, and every figure on the screen is
 * worked out from what remains, so the cards, the chart and the table
 * always agree with each other and with the filters.
 */
export function ReferralPerformanceSection({ referrals, months }: ReferralPerformanceSectionProps) {
  const id = useId();
  // Held in the shared context, not here, so the Export panel can take a copy
  // of exactly what this section is showing.
  const { referralFilters: filters, setReferralFilters: setFilters } = useReportFilters();
  const backwards = isBackwardsRange(filters.range);

  const shown = useMemo(
    () => (backwards ? [] : filterReferralAnalytics(referrals, filters)),
    [referrals, filters, backwards],
  );
  const totals = useMemo(() => summariseReferralAnalytics(shown), [shown]);
  const monthly = useMemo(() => monthlySuccessfulReferrals(shown, { months }), [shown, months]);

  const set = (changes: Partial<ReferralAnalyticsFilters>) => setFilters({ ...filters, ...changes });
  const setRange = (changes: Partial<ReferralAnalyticsFilters["range"]>) =>
    set({ range: { ...filters.range, ...changes } });
  const filtered =
    Boolean(filters.range.from || filters.range.to) || filters.status !== "all";

  return (
    <section aria-labelledby="referral-performance-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="referral-performance-heading" className="text-2xl font-bold tracking-tight text-ink">
          Referral Performance Analytics
        </h2>
        <p className="mt-1 text-base text-ink-muted">
          What Refer-a-Friend has brought in: who was invited, who bought something, and which rewards have been
          given.
        </p>
        {/*
          The icon and the whole sentence are the only two flex items: an
          inline element among loose text would become a flex item of its
          own and break the sentence into pieces.
        */}
        <p className="mt-3 flex items-start gap-2 text-base text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
          <span>
            Simulated referrals. A referral counts as successful{" "}
            <span className="font-semibold">only after a qualifying purchase</span>; a friend who bought nothing
            has not made one, and a refunded or cancelled purchase never qualified. Nothing here awards a reward —
            these are counts of what the Referral Rewards screen already records.
          </span>
        </p>
      </div>

      <div
        role="group"
        aria-label="Filter referrals"
        className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-44 flex-1 sm:max-w-52">
            <label htmlFor={`${id}-from`} className="text-sm font-semibold text-ink">
              From
            </label>
            <input
              id={`${id}-from`}
              type="date"
              value={filters.range.from}
              max={filters.range.to || undefined}
              onChange={(event) => setRange({ from: event.target.value })}
              className="mt-1 h-12 w-full rounded-xl border-2 border-line bg-surface px-3 text-base text-ink focus:border-primary"
            />
          </div>
          <div className="min-w-44 flex-1 sm:max-w-52">
            <label htmlFor={`${id}-to`} className="text-sm font-semibold text-ink">
              To
            </label>
            <input
              id={`${id}-to`}
              type="date"
              value={filters.range.to}
              min={filters.range.from || undefined}
              onChange={(event) => setRange({ to: event.target.value })}
              className="mt-1 h-12 w-full rounded-xl border-2 border-line bg-surface px-3 text-base text-ink focus:border-primary"
            />
          </div>
          <div className="min-w-44 flex-1 sm:max-w-52">
            <label htmlFor={`${id}-status`} className="text-sm font-semibold text-ink">
              Reward status
            </label>
            <select
              id={`${id}-status`}
              value={filters.status}
              onChange={(event) => set({ status: event.target.value as ReferralAnalyticsFilters["status"] })}
              className="mt-1 h-12 w-full rounded-xl border-2 border-line bg-surface px-3 text-base text-ink focus:border-primary"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {filtered && (
            <button
              type="button"
              onClick={() => setFilters(NO_REFERRAL_ANALYTICS_FILTERS)}
              className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border-2 border-line px-4 text-base font-semibold whitespace-nowrap text-ink hover:bg-secondary"
            >
              <X aria-hidden="true" className="size-5" />
              Clear filters
            </button>
          )}
        </div>

        <p className="flex items-start gap-2 text-sm text-ink-muted" aria-live="polite">
          <CalendarRange aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            {backwards
              ? "The From date is after the To date, so nothing can match. Swap them or clear them."
              : `${shown.length} ${shown.length === 1 ? "referral" : "referrals"} ${filtered ? "match these filters" : "in the whole period"}. Dates are the day the friend joined, and both ends are inclusive.`}
          </span>
        </p>
      </div>

      {/* Four cards, so two across and then four: none is ever left alone on a row. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatsCard
          icon={UserPlus}
          title="Total Referrals"
          description="Friends who joined through a referral link."
          value={totals.total}
          source="live"
        />
        <AdminStatsCard
          icon={CircleCheck}
          title="Successful Referrals"
          description="The friend completed a qualifying purchase."
          value={totals.successful}
          source="live"
        />
        <AdminStatsCard
          icon={Gift}
          title="Free Courses Awarded"
          description="Rewards swapped for a course."
          value={totals.awarded}
          source="live"
        />
        <AdminStatsCard
          icon={Clock}
          title="Pending Referral Rewards"
          description={`${totals.waitingOnPurchase} waiting on a purchase, ${totals.eligible} eligible, ${totals.approved} approved and not yet granted.`}
          value={totals.pending}
          source="live"
        />
      </div>

      {totals.refused > 0 && (
        <p className="text-base text-ink-muted">
          {totals.refused} {totals.refused === 1 ? "reward was" : "rewards were"} rejected or revoked. They are kept
          on record and counted in nothing above but the total.
        </p>
      )}

      <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-ink">Successful Referrals by Month</h3>
          <p className="mt-1 text-base text-ink-muted">
            Counted in the month of the qualifying purchase — the month the referral actually succeeded — over the
            last {months} months.
          </p>
        </div>
        <TrendLineChart
          points={monthly}
          legend="Successful referrals per month"
          unit={{ one: "successful referral", many: "successful referrals" }}
          summary={`${totals.successful} in this period`}
          valueHeading="Successful referrals"
          description="Line chart of successful referrals per month."
        />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold tracking-tight text-ink">All Referrals</h3>
        <p className="text-base text-ink-muted" aria-live="polite">
          {shown.length} {shown.length === 1 ? "referral" : "referrals"} shown
        </p>
      </div>
      <ReferralAnalyticsTable referrals={shown} />
    </section>
  );
}
