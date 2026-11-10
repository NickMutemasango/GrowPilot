import type {
  AdminAffiliate,
  AffiliateCounts,
  AffiliateFilters,
} from "@/types/admin-affiliates";
import type { AffiliateStatus } from "@/types/rewards";

/*
 * Affiliate rules for the admin area. Pure functions only, so the same
 * rules run on the server, in the development preview and in the tests
 * (affiliates.test.ts).
 *
 * Step 12E.1 is read-only: nothing here approves, suspends or pays an
 * affiliate, changes a commission rate, or touches the referral reward
 * programme. Those are separate steps with their own rules.
 */

export const affiliateStatusLabels: Record<AffiliateStatus, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
  suspended: "Suspended",
};

/** Search by affiliate name, email address or referral code, plus the status drop-down. */
export function filterAffiliates(affiliates: readonly AdminAffiliate[], filters: AffiliateFilters): AdminAffiliate[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return affiliates.filter((affiliate) => {
    if (
      query &&
      !affiliate.name.toLocaleLowerCase().includes(query) &&
      !affiliate.email.toLocaleLowerCase().includes(query) &&
      !affiliate.referralCode.toLocaleLowerCase().includes(query)
    ) {
      return false;
    }
    if (filters.status !== "all" && affiliate.status !== filters.status) return false;
    return true;
  });
}

/**
 * The four figures above the table, worked out from the affiliates
 * themselves so they can never disagree with the list. Every affiliate
 * is counted in exactly one of the three statuses.
 */
export function summariseAffiliates(affiliates: readonly AdminAffiliate[]): AffiliateCounts {
  const count = (status: AffiliateStatus) => affiliates.filter((affiliate) => affiliate.status === status).length;
  return {
    total: affiliates.length,
    approved: count("approved"),
    pending: count("pending"),
    rejected: count("rejected"),
    suspended: count("suspended"),
  };
}

/**
 * Commission earned, kept separate per currency.
 *
 * Returned as one entry per currency rather than a single number,
 * because adding US dollars to anything else would be meaningless. This
 * is what has been EARNED, not what has been paid: no payout exists in
 * this project, and none is implied by these figures.
 */
export function earningsByCurrency(affiliates: readonly AdminAffiliate[]): { currency: string; amountMinor: number }[] {
  const totals = new Map<string, number>();
  for (const affiliate of affiliates) {
    if (affiliate.commissionEarnedMinor <= 0) continue;
    totals.set(affiliate.currency, (totals.get(affiliate.currency) ?? 0) + affiliate.commissionEarnedMinor);
  }
  return [...totals]
    .map(([currency, amountMinor]) => ({ currency, amountMinor }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

/** Newest affiliates first, so the most recent applications are at the top. */
export function byNewestAffiliate(a: AdminAffiliate, b: AdminAffiliate): number {
  return b.joinedAt.localeCompare(a.joinedAt);
}
