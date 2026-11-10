import type { AdminReferral, ReferralRevocation, ReferralRevocationsById } from "@/types/admin-referrals";

/*
 * Revoking a free-course referral reward (Step 12E.12).
 * FRONTEND DEMONSTRATION ONLY.
 *
 * Pure functions, so the same rules run in the dialog and in the tests
 * (referral-revocations.test.ts). Only type imports, so the file runs
 * under `node --test` without a bundler.
 *
 * Revoking withdraws a reward that was approved, or one whose free
 * course was already granted. What it deliberately does NOT do:
 *
 *  - It never withdraws real course access. There is no access control
 *    in this project; revoking changes what the admin tables say and
 *    nothing else.
 *  - It never touches the student's learning. Lessons completed,
 *    progress and certificates are left exactly as they were, so a
 *    reward taken back never erases work somebody did.
 *  - It never deletes a record, and never erases the history. The
 *    referral, the qualifying purchase, the approval and the course the
 *    reward was swapped for all stay on the row; the status and the two
 *    revocation fields are the only things that change.
 *  - It never touches anybody else's enrolments. Only the one enrolment
 *    the grant itself created is revoked with the reward — a paid or
 *    free enrolment in the same course is somebody's own and is left
 *    alone.
 *  - It never happens twice. A revoked reward has no action left.
 *
 * When this is real, the same checks must run again on the server, the
 * reward and its enrolment must be revoked in one transaction, and each
 * revocation needs an audit entry naming the administrator.
 */

/** The longest reason we keep. Long enough to explain, short enough to read. */
export const MAX_REWARD_REVOCATION_REASON = 500;

/** A reason is required: revoking without one leaves nobody able to explain it later. */
export const REWARD_REVOCATION_REASON_REQUIRED = "Please say why this referral reward is being revoked.";

/**
 * Whether this reward can be revoked.
 *
 * Only one that was granted or agreed to: approved (owed but not yet
 * taken) or claimed (already swapped for a course). A pending or
 * eligible reward has not been agreed to yet, and a rejected or
 * already revoked one has nothing left to take back.
 */
export function canRevokeReward(referral: AdminReferral): boolean {
  return referral.rewardStatus === "approved" || referral.rewardStatus === "claimed";
}

/** Checks the reason typed into the revoke dialog. Returns a message, or null when it will do. */
export function validateRewardRevocationReason(reason: string): string | null {
  return reason.trim().length === 0 ? REWARD_REVOCATION_REASON_REQUIRED : null;
}

/** Tidies a typed reason into the form that gets stored. */
export function cleanRewardRevocationReason(reason: string): string {
  return reason.trim().slice(0, MAX_REWARD_REVOCATION_REASON);
}

/**
 * The record kept when a reward is revoked now.
 *
 * `enrolmentId` is the demonstration enrolment the grant created, where
 * there is one, so exactly that enrolment is revoked with the reward
 * and no other.
 */
export function rewardRevocation(
  reason: string,
  enrolmentId: string | null,
  now: Date = new Date(),
): ReferralRevocation {
  return { reason: cleanRewardRevocationReason(reason), revokedAt: now.toISOString(), enrolmentId };
}

/**
 * Marks the reward as revoked, keeping everything else as it was: the
 * referrer, the referred student, the referral code, the referral date,
 * the qualifying purchase, the approval date and the course the reward
 * was swapped for.
 */
export function applyRewardRevocation(referral: AdminReferral, revocation: ReferralRevocation): AdminReferral {
  return {
    ...referral,
    rewardStatus: "revoked",
    revokedAt: revocation.revokedAt,
    revocationReason: revocation.reason,
  };
}

/**
 * Lays the revocations made in this browser over the referrals the page
 * was given. Applied LAST — after the decisions and the claims — so a
 * reward approved or granted on this screen can then be taken back on
 * it.
 */
export function withRewardRevocations(
  referrals: readonly AdminReferral[],
  revocations: ReferralRevocationsById,
): AdminReferral[] {
  return referrals.map((referral) => {
    const revocation = revocations[referral.id];
    // The rule is checked here too, not only in the dialog: stored data must
    // never be able to revoke a reward that was never approved or granted.
    return revocation && canRevokeReward(referral) ? applyRewardRevocation(referral, revocation) : referral;
  });
}

/** Drops revocations whose referral is no longer on the page, so the stored set can't grow stale. */
export function pruneRewardRevocations(
  revocations: ReferralRevocationsById,
  referrals: readonly AdminReferral[],
): ReferralRevocationsById {
  const ids = new Set(referrals.map((referral) => referral.id));
  const kept: ReferralRevocationsById = {};
  for (const [id, revocation] of Object.entries(revocations)) if (ids.has(id)) kept[id] = revocation;
  return kept;
}
