import type { AdminReferral, ReferralDecision, ReferralDecisionsById } from "@/types/admin-referrals";

/*
 * Deciding a free-course referral reward (Step 12E.10).
 * FRONTEND DEMONSTRATION ONLY.
 *
 * Pure functions, so the same rules run in the dialogs and in the tests
 * (referral-decisions.test.ts). Only type imports, so the file runs
 * under `node --test` without a bundler.
 *
 * What a decision does here: it records the outcome against the
 * referral. What it deliberately does NOT do:
 *
 *  - APPROVING NEVER GRANTS A COURSE. An approved reward is one
 *    GrowPilot agrees is owed; nobody has been enrolled in anything, no
 *    course has been chosen and no access has been given. There is no
 *    reward mechanism in this project to give it with.
 *  - APPROVING NEVER CLAIMS. The status goes to "approved" and stops
 *    there; nothing in this file can set "claimed", because claiming is
 *    the referrer's own act on their Rewards page, not an
 *    administrator's.
 *  - It never deletes a referral. A rejected one stays in the list with
 *    its reason, so the decision is always on record.
 *  - It never changes who referred whom, the referral code, the date
 *    they joined or the qualifying purchase. Only the status and the
 *    decision fields change.
 *  - It never notifies anybody. No email or message is sent from this
 *    project.
 *
 * When this is real, the same checks must run again on the server, each
 * decision needs an audit entry naming the administrator, and approving
 * must be checked against the purchase still standing (not refunded).
 */

/** The longest reason we keep. Long enough to explain, short enough to read. */
export const MAX_REWARD_REJECTION_REASON = 500;

/** A reason is required: somebody refused a reward they earned must always be able to be told why. */
export const REWARD_REJECTION_REASON_REQUIRED = "Please say why this referral reward is being rejected.";

/**
 * Whether this reward is still waiting for a decision.
 *
 * Only an eligible one can be decided, so a reward that has already
 * been approved, rejected or claimed can never be decided again, and a
 * reward whose referral has not qualified yet cannot be approved early.
 */
export function canDecideReward(referral: AdminReferral): boolean {
  return referral.rewardStatus === "eligible";
}

/** Checks the reason typed into the reject dialog. Returns a message, or null when it will do. */
export function validateRewardRejectionReason(reason: string): string | null {
  return reason.trim().length === 0 ? REWARD_REJECTION_REASON_REQUIRED : null;
}

/** Tidies a typed reason into the form that gets stored. */
export function cleanRewardRejectionReason(reason: string): string {
  return reason.trim().slice(0, MAX_REWARD_REJECTION_REASON);
}

/**
 * The decision recorded when a reward is approved now.
 *
 * The outcome is "approved" and can never be "claimed": see the note at
 * the top of this file.
 */
export function rewardApproval(now: Date = new Date()): ReferralDecision {
  return { outcome: "approved", decidedAt: now.toISOString() };
}

/** The decision recorded when a reward is rejected now. */
export function rewardRejection(reason: string, now: Date = new Date()): ReferralDecision {
  return { outcome: "rejected", decidedAt: now.toISOString(), reason: cleanRewardRejectionReason(reason) };
}

/**
 * Records one decision against a referral, keeping everything else as
 * it was: the same id, referrer, referred student, referral code,
 * referral date and qualifying purchase.
 */
export function applyReferralDecision(referral: AdminReferral, decision: ReferralDecision): AdminReferral {
  return {
    ...referral,
    rewardStatus: decision.outcome,
    approvedAt: decision.outcome === "approved" ? decision.decidedAt : null,
    rejectionReason: decision.outcome === "rejected" ? decision.reason : null,
  };
}

/**
 * Lays the decisions made in this browser over the referrals the page
 * was given, so a sample referral can be decided without the sample
 * data being rewritten. Referrals with no decision come back untouched.
 */
export function withReferralDecisions(
  referrals: readonly AdminReferral[],
  decisions: ReferralDecisionsById,
): AdminReferral[] {
  return referrals.map((referral) => {
    const decision = decisions[referral.id];
    // The rule is checked here too, not only in the dialogs: stored data must
    // never be able to re-decide a reward that was already settled, nor decide
    // one that has not qualified.
    return decision && canDecideReward(referral) ? applyReferralDecision(referral, decision) : referral;
  });
}

/** Drops decisions whose referral is no longer on the page, so the stored set can't grow stale. */
export function pruneReferralDecisions(
  decisions: ReferralDecisionsById,
  referrals: readonly AdminReferral[],
): ReferralDecisionsById {
  const ids = new Set(referrals.map((referral) => referral.id));
  const kept: ReferralDecisionsById = {};
  for (const [id, decision] of Object.entries(decisions)) if (ids.has(id)) kept[id] = decision;
  return kept;
}
