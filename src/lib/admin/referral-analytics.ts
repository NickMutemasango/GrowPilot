// Relative paths for anything imported at runtime: only type imports may use
// the "@/" alias, so this file still runs under `node --test` without a bundler.
import { isWithinRange, type DateRange } from "./affiliate-reports.ts";
import { isSuccessfulReferral } from "./referral-rewards.ts";
import type { ReportPoint } from "@/lib/admin/reports";
import type { AdminReferral, ReferralRewardStatus } from "@/types/admin-referrals";

/*
 * Refer-a-Friend performance for the Reports page (Step 12F.6).
 * Pure functions only, so the same arithmetic runs on the server, in
 * the development preview and in the tests
 * (referral-analytics.test.ts).
 *
 * A REFERRAL IS SUCCESSFUL ONLY AFTER A QUALIFYING PURCHASE. The rule
 * is the programme's own (`isSuccessfulReferral`), so this report and
 * the Referral Rewards screen can never disagree about what counts. A
 * friend who joined and bought nothing has not made a successful
 * referral, and a purchase that was refunded or cancelled never
 * qualified — the money went back.
 *
 * NOTHING HERE AWARDS ANYTHING. These are counts of what the other
 * screens already record.
 */

/** Rewards still to settle: earned or not, none of them finished with. */
const UNSETTLED: ReferralRewardStatus[] = ["pending", "eligible", "approved"];

export type ReferralStatusFilter = "all" | ReferralRewardStatus;

export type ReferralAnalyticsFilters = {
  range: DateRange;
  status: ReferralStatusFilter;
};

export const NO_REFERRAL_ANALYTICS_FILTERS: ReferralAnalyticsFilters = {
  range: { from: "", to: "" },
  status: "all",
};

/**
 * The referrals inside the range and matching the status.
 *
 * The date is when the friend JOINED, which is the date the table
 * shows, so what is filtered is what is listed.
 */
export function filterReferralAnalytics(
  referrals: readonly AdminReferral[],
  filters: ReferralAnalyticsFilters,
): AdminReferral[] {
  return referrals.filter((referral) => {
    if (filters.status !== "all" && referral.rewardStatus !== filters.status) return false;
    if (!filters.range.from && !filters.range.to) return true;
    return isWithinRange(referral.referredAt, filters.range);
  });
}

/** The figures above the referral table. */
export type ReferralAnalyticsTotals = {
  /** Everybody who joined through a referral link. */
  total: number;
  /** Referrals whose friend completed a qualifying purchase. */
  successful: number;
  /** Rewards swapped for a free course. */
  awarded: number;
  /** Rewards not settled yet: waiting on a purchase, earned, or approved and not granted. */
  pending: number;
  /** The three parts of that figure, so the card can say what it is made of. */
  waitingOnPurchase: number;
  eligible: number;
  approved: number;
  /** Rewards that were refused or taken back. Counted in nothing else. */
  refused: number;
};

/** Counts these referrals. Every one falls into exactly one reward status. */
export function summariseReferralAnalytics(referrals: readonly AdminReferral[]): ReferralAnalyticsTotals {
  const count = (status: ReferralRewardStatus) =>
    referrals.filter((referral) => referral.rewardStatus === status).length;

  const waitingOnPurchase = count("pending");
  const eligible = count("eligible");
  const approved = count("approved");

  return {
    total: referrals.length,
    successful: referrals.filter(isSuccessfulReferral).length,
    awarded: count("claimed"),
    pending: waitingOnPurchase + eligible + approved,
    waitingOnPurchase,
    eligible,
    approved,
    refused: count("rejected") + count("revoked"),
  };
}

/**
 * Successful referrals per month, oldest first.
 *
 * Counted in the month of the QUALIFYING PURCHASE, not the month the
 * friend joined: that is the month the referral actually succeeded,
 * and dating it by the sign-up would credit the wrong month entirely.
 */
export function monthlySuccessfulReferrals(
  referrals: readonly AdminReferral[],
  options: { months?: number; now?: Date } = {},
): ReportPoint[] {
  const months = Math.max(1, options.months ?? 12);
  const now = options.now ?? new Date();
  const short = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const long = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const key = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, "0")}`;

  const byMonth = new Map<string, number>();
  for (const referral of referrals) {
    if (!isSuccessfulReferral(referral) || !referral.purchasedAt) continue;
    const when = new Date(referral.purchasedAt);
    if (Number.isNaN(when.getTime())) continue;
    const monthKey = key(when.getUTCFullYear(), when.getUTCMonth());
    byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + 1);
  }

  const series: ReportPoint[] = [];
  for (let back = months - 1; back >= 0; back -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    series.push({
      key: key(year, month),
      label: short[month],
      fullLabel: `${long[month]} ${year}`,
      value: byMonth.get(key(year, month)) ?? 0,
    });
  }
  return series;
}

/** Whether a reward still has somewhere to go. Used only for the wording on the cards. */
export function isUnsettledReward(status: ReferralRewardStatus): boolean {
  return UNSETTLED.includes(status);
}
