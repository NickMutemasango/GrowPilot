import type {
  AdminReferral,
  ReferralFilters,
  ReferralPurchaseStatus,
  ReferralRewardStatus,
  ReferralRewardTotals,
} from "@/types/admin-referrals";

/*
 * Refer-a-Friend rewards for the admin area (Step 12E.9).
 * Pure functions only, so the same rules run on the server, in the
 * development preview and in the tests (referral-rewards.test.ts).
 * Only type imports, so the file runs under `node --test` without a
 * bundler.
 *
 * VIEWING ONLY. Nothing here approves a reward, rejects one or grants
 * anybody a free course: no reward mechanism is connected to this
 * project, and a reward marked "Claimed" is a label on a sample row,
 * never a course somebody was actually given.
 *
 * The one rule that matters most: a referral is SUCCESSFUL only when the
 * friend completed a qualifying purchase. A friend who has joined and
 * bought nothing has not made the referral successful, and a purchase
 * that was refunded never qualified at all — the money went back.
 */

export const referralRewardStatusLabels: Record<ReferralRewardStatus, string> = {
  pending: "Pending",
  eligible: "Eligible",
  approved: "Approved",
  claimed: "Claimed",
  revoked: "Revoked",
  rejected: "Rejected",
};

export const referralPurchaseStatusLabels: Record<ReferralPurchaseStatus, string> = {
  none: "No purchase yet",
  completed: "Purchase completed",
  refunded: "Refunded",
};

/**
 * Whether this referral counts as successful: the friend completed a
 * qualifying purchase.
 *
 * A refunded purchase is not one, and neither is a friend who has not
 * bought anything. Note that this asks about the PURCHASE, not the
 * reward: a referral can be successful and still have its reward
 * refused for some other reason, and that refusal is kept on record
 * rather than hidden by pretending the purchase never happened.
 */
export function isSuccessfulReferral(referral: AdminReferral): boolean {
  return referral.purchaseStatus === "completed";
}

/**
 * Where the reward stands, worked out rather than stored, so a row can
 * never claim a status its own facts don't support.
 *
 * Refusal comes first: a referral with a reason recorded against it is
 * rejected whatever else happened. Then a reward already claimed, then
 * one earned by a qualifying purchase, and otherwise there is simply
 * nothing yet.
 */
export function deriveRewardStatus(input: {
  purchaseStatus: ReferralPurchaseStatus;
  claimed: boolean;
  rejectionReason: string | null;
}): ReferralRewardStatus {
  if (input.rejectionReason) return "rejected";
  if (input.claimed) return "claimed";
  return input.purchaseStatus === "completed" ? "eligible" : "pending";
}

/**
 * Search by the referrer's name, the referred student's name or the
 * referral code, plus the reward status drop-down. They apply together.
 */
export function filterReferrals(referrals: readonly AdminReferral[], filters: ReferralFilters): AdminReferral[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return referrals.filter((referral) => {
    if (
      query &&
      !referral.referrerName.toLocaleLowerCase().includes(query) &&
      !referral.referredStudentName.toLocaleLowerCase().includes(query) &&
      !referral.referralCode.toLocaleLowerCase().includes(query)
    ) {
      return false;
    }
    if (filters.status !== "all" && referral.rewardStatus !== filters.status) return false;
    return true;
  });
}

/**
 * The figures above the referrals table, worked out from the same rows
 * the table shows, so the two can never disagree. Every referral is
 * counted in exactly one reward status.
 */
export function summariseReferrals(referrals: readonly AdminReferral[]): ReferralRewardTotals {
  const totals: ReferralRewardTotals = {
    total: referrals.length,
    successful: 0,
    pending: 0,
    eligible: 0,
    approved: 0,
    claimed: 0,
    revoked: 0,
    rejected: 0,
  };

  for (const referral of referrals) {
    if (isSuccessfulReferral(referral)) totals.successful += 1;
    switch (referral.rewardStatus) {
      case "pending":
        totals.pending += 1;
        break;
      case "eligible":
        totals.eligible += 1;
        break;
      case "approved":
        totals.approved += 1;
        break;
      case "claimed":
        totals.claimed += 1;
        break;
      case "revoked":
        totals.revoked += 1;
        break;
      case "rejected":
        totals.rejected += 1;
        break;
    }
  }

  return totals;
}

/** Newest referrals first, so the most recent are at the top. */
export function byNewestReferral(a: AdminReferral, b: AdminReferral): number {
  return b.referredAt.localeCompare(a.referredAt);
}
