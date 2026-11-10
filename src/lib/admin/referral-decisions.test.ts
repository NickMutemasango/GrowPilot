import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminReferral, ReferralDecisionsById, ReferralRewardStatus } from "@/types/admin-referrals";
// Relative paths: only type imports may use the "@/" alias in these tests.
import { summariseReferrals } from "./referral-rewards.ts";
import {
  MAX_REWARD_REJECTION_REASON,
  REWARD_REJECTION_REASON_REQUIRED,
  applyReferralDecision,
  canDecideReward,
  cleanRewardRejectionReason,
  pruneReferralDecisions,
  rewardApproval,
  rewardRejection,
  validateRewardRejectionReason,
  withReferralDecisions,
} from "./referral-decisions.ts";

function referral(
  id: string,
  rewardStatus: ReferralRewardStatus = "eligible",
  changes: Partial<AdminReferral> = {},
): AdminReferral {
  return {
    id,
    referrerId: "aff-004",
    referrerStudentId: "u-mary",
    referrerName: "Mary Chikwanha",
    referredStudentName: "Joyce Banda",
    referralCode: "GP-REF-004",
    referredAt: "2026-08-12T11:00:00Z",
    purchaseStatus: "completed",
    purchasedCourseTitle: "Communication Skills",
    purchaseAmountMinor: 1_900,
    purchasedAt: "2026-08-19T15:05:00Z",
    rewardStatus,
    approvedAt: null,
    claimedCourseTitle: null,
    claimedAt: null,
    rejectionReason: null,
    ...changes,
  };
}

const DECIDED_AT = "2026-11-08T12:00:00.000Z";

describe("canDecideReward", () => {
  it("offers the actions only while a reward is eligible", () => {
    assert.equal(canDecideReward(referral("RF-1", "eligible")), true);
  });

  it("never offers them on a reward already decided, claimed or not yet earned", () => {
    for (const status of ["pending", "approved", "claimed", "rejected"] as const) {
      assert.equal(canDecideReward(referral("RF-1", status)), false, status);
    }
  });
});

describe("validateRewardRejectionReason", () => {
  it("requires a reason", () => {
    assert.equal(validateRewardRejectionReason(""), REWARD_REJECTION_REASON_REQUIRED);
    assert.equal(validateRewardRejectionReason("   \n  "), REWARD_REJECTION_REASON_REQUIRED);
  });

  it("accepts a written reason", () => {
    assert.equal(validateRewardRejectionReason("The qualifying purchase was refunded."), null);
  });
});

describe("cleanRewardRejectionReason", () => {
  it("trims the reason", () => {
    assert.equal(cleanRewardRejectionReason("  Refunded.  "), "Refunded.");
  });

  it("keeps it to a readable length", () => {
    assert.equal(cleanRewardRejectionReason("x".repeat(900)).length, MAX_REWARD_REJECTION_REASON);
  });
});

describe("rewardApproval", () => {
  it("records an approval, and can never record a claim", () => {
    const decision = rewardApproval(new Date(DECIDED_AT));
    assert.deepEqual(decision, { outcome: "approved", decidedAt: DECIDED_AT });
  });
});

describe("rewardRejection", () => {
  it("keeps the tidied reason with the decision", () => {
    assert.deepEqual(rewardRejection("  Self-referral.  ", new Date(DECIDED_AT)), {
      outcome: "rejected",
      decidedAt: DECIDED_AT,
      reason: "Self-referral.",
    });
  });
});

describe("applyReferralDecision", () => {
  it("approves without claiming or granting anything", () => {
    const approved = applyReferralDecision(referral("RF-2004"), rewardApproval(new Date(DECIDED_AT)));
    assert.equal(approved.rewardStatus, "approved");
    assert.equal(approved.approvedAt, DECIDED_AT);
    assert.equal(approved.claimedCourseTitle, null);
    assert.equal(approved.claimedAt, null);
    assert.equal(approved.rejectionReason, null);
  });

  it("rejects with the reason on record", () => {
    const rejected = applyReferralDecision(referral("RF-2004"), rewardRejection("Refunded.", new Date(DECIDED_AT)));
    assert.equal(rejected.rewardStatus, "rejected");
    assert.equal(rejected.rejectionReason, "Refunded.");
    assert.equal(rejected.approvedAt, null);
  });

  it("changes nothing else about the referral", () => {
    const original = referral("RF-2004");
    const decided = applyReferralDecision(original, rewardApproval(new Date(DECIDED_AT)));
    assert.equal(decided.id, original.id);
    assert.equal(decided.referrerId, original.referrerId);
    assert.equal(decided.referrerName, original.referrerName);
    assert.equal(decided.referredStudentName, original.referredStudentName);
    assert.equal(decided.referralCode, original.referralCode);
    assert.equal(decided.referredAt, original.referredAt);
    assert.equal(decided.purchaseStatus, original.purchaseStatus);
    assert.equal(decided.purchasedCourseTitle, original.purchasedCourseTitle);
    assert.equal(decided.purchaseAmountMinor, original.purchaseAmountMinor);
    assert.equal(decided.purchasedAt, original.purchasedAt);
  });

  it("leaves the referral the page was given untouched", () => {
    const original = referral("RF-2004");
    applyReferralDecision(original, rewardApproval(new Date(DECIDED_AT)));
    assert.equal(original.rewardStatus, "eligible");
    assert.equal(original.approvedAt, null);
  });
});

describe("withReferralDecisions", () => {
  const decisions: ReferralDecisionsById = { "RF-2004": { outcome: "approved", decidedAt: DECIDED_AT } };

  it("lays a decision over the matching referral", () => {
    const [decided] = withReferralDecisions([referral("RF-2004")], decisions);
    assert.equal(decided.rewardStatus, "approved");
    assert.equal(decided.approvedAt, DECIDED_AT);
  });

  it("leaves referrals with no decision alone", () => {
    const [other] = withReferralDecisions([referral("RF-2005")], decisions);
    assert.equal(other.rewardStatus, "eligible");
  });

  it("refuses to decide a reward that is not eligible", () => {
    for (const status of ["pending", "approved", "claimed", "rejected"] as const) {
      const [row] = withReferralDecisions([referral("RF-2004", status)], decisions);
      assert.equal(row.rewardStatus, status, status);
    }
  });

  it("cannot decide the same reward twice", () => {
    const once = withReferralDecisions([referral("RF-2004")], decisions);
    const twice = withReferralDecisions(once, {
      "RF-2004": { outcome: "rejected", decidedAt: "2026-11-09T12:00:00.000Z", reason: "Changed my mind." },
    });
    assert.equal(twice[0].rewardStatus, "approved");
    assert.equal(twice[0].rejectionReason, null);
  });
});

describe("pruneReferralDecisions", () => {
  it("drops decisions whose referral is no longer on the page", () => {
    const decisions: ReferralDecisionsById = {
      "RF-2004": { outcome: "approved", decidedAt: DECIDED_AT },
      "RF-9999": { outcome: "approved", decidedAt: DECIDED_AT },
    };
    assert.deepEqual(pruneReferralDecisions(decisions, [referral("RF-2004")]), {
      "RF-2004": { outcome: "approved", decidedAt: DECIDED_AT },
    });
  });
});

describe("the figures after a decision", () => {
  it("moves the reward from eligible to approved, leaving claimed alone", () => {
    const referrals = [referral("RF-2004"), referral("RF-2005", "claimed", { claimedCourseTitle: "Excel" })];
    const before = summariseReferrals(referrals);
    const after = summariseReferrals(
      withReferralDecisions(referrals, { "RF-2004": { outcome: "approved", decidedAt: DECIDED_AT } }),
    );

    assert.equal(before.eligible, 1);
    assert.equal(before.approved, 0);
    assert.equal(after.eligible, 0);
    assert.equal(after.approved, 1);
    assert.equal(after.claimed, before.claimed);
    assert.equal(after.total, before.total);
    // The purchase still counts: approving a reward does not change what happened.
    assert.equal(after.successful, before.successful);
  });
});
