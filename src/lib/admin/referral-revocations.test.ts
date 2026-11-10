import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminEnrolment, StatusChangesById } from "@/types/admin-enrolments";
import type { AdminReferral, ReferralRevocationsById, ReferralRewardStatus } from "@/types/admin-referrals";
// Relative paths: only type imports may use the "@/" alias in these tests.
import { newRevocation, revokedChange, withStatusChanges } from "./enrolment-status.ts";
import { summariseReferrals } from "./referral-rewards.ts";
import {
  MAX_REWARD_REVOCATION_REASON,
  REWARD_REVOCATION_REASON_REQUIRED,
  applyRewardRevocation,
  canRevokeReward,
  cleanRewardRevocationReason,
  pruneRewardRevocations,
  rewardRevocation,
  validateRewardRevocationReason,
  withRewardRevocations,
} from "./referral-revocations.ts";

const REVOKED_AT = "2026-11-09T11:00:00.000Z";

function referral(
  id: string,
  rewardStatus: ReferralRewardStatus = "claimed",
  changes: Partial<AdminReferral> = {},
): AdminReferral {
  return {
    id,
    referrerId: "aff-015",
    referrerStudentId: "u-chipo",
    referrerName: "Chipo Moyo",
    referredStudentName: "Brian Otieno",
    referralCode: "GP-REF-015",
    referredAt: "2026-10-25T09:55:00Z",
    purchaseStatus: "completed",
    purchasedCourseTitle: "Microsoft Excel Made Easy",
    purchaseAmountMinor: 2_900,
    purchasedAt: "2026-11-01T14:30:00Z",
    rewardStatus,
    approvedAt: "2026-11-08T09:00:00.000Z",
    claimedCourseTitle: rewardStatus === "claimed" ? "Communication Skills" : null,
    claimedCourseSlug: rewardStatus === "claimed" ? "communication-skills" : null,
    claimedAt: rewardStatus === "claimed" ? "2026-11-08T10:00:00.000Z" : null,
    revokedAt: null,
    revocationReason: null,
    rejectionReason: null,
    ...changes,
  };
}

function enrolment(id: string, studentId: string, courseId: string, completedLessons = 4): AdminEnrolment {
  return {
    id,
    studentId,
    studentName: "Chipo Moyo",
    studentEmail: "chipo.m@example.com",
    courseId,
    courseSlug: "communication-skills",
    courseTitle: "Communication Skills",
    enrolledAt: "2026-11-08T10:00:00.000Z",
    type: "referral",
    status: "active",
    completedLessons,
    totalLessons: 8,
    progress: Math.round((completedLessons / 8) * 100),
  };
}

describe("canRevokeReward", () => {
  it("offers the action on an approved or claimed reward", () => {
    assert.equal(canRevokeReward(referral("RF-1", "approved")), true);
    assert.equal(canRevokeReward(referral("RF-1", "claimed")), true);
  });

  it("never offers it before approval, or once it is revoked or rejected", () => {
    for (const status of ["pending", "eligible", "revoked", "rejected"] as const) {
      assert.equal(canRevokeReward(referral("RF-1", status)), false, status);
    }
  });
});

describe("validateRewardRevocationReason", () => {
  it("requires a reason", () => {
    assert.equal(validateRewardRevocationReason(""), REWARD_REVOCATION_REASON_REQUIRED);
    assert.equal(validateRewardRevocationReason("  \n "), REWARD_REVOCATION_REASON_REQUIRED);
  });

  it("accepts a written reason", () => {
    assert.equal(validateRewardRevocationReason("The qualifying purchase was refunded."), null);
  });
});

describe("cleanRewardRevocationReason", () => {
  it("trims and caps the reason", () => {
    assert.equal(cleanRewardRevocationReason("  Refunded.  "), "Refunded.");
    assert.equal(cleanRewardRevocationReason("x".repeat(900)).length, MAX_REWARD_REVOCATION_REASON);
  });
});

describe("rewardRevocation", () => {
  it("keeps the reason, the date and the enrolment it covers", () => {
    assert.deepEqual(rewardRevocation("  Refunded.  ", "demo-enr-abc123", new Date(REVOKED_AT)), {
      reason: "Refunded.",
      revokedAt: REVOKED_AT,
      enrolmentId: "demo-enr-abc123",
    });
  });

  it("records no enrolment where the reward was approved but never granted", () => {
    assert.equal(rewardRevocation("Refunded.", null, new Date(REVOKED_AT)).enrolmentId, null);
  });
});

describe("applyRewardRevocation", () => {
  const revocation = rewardRevocation("Refunded.", "demo-enr-abc123", new Date(REVOKED_AT));

  it("marks the reward revoked with its reason and date", () => {
    const revoked = applyRewardRevocation(referral("RF-2007"), revocation);
    assert.equal(revoked.rewardStatus, "revoked");
    assert.equal(revoked.revokedAt, REVOKED_AT);
    assert.equal(revoked.revocationReason, "Refunded.");
  });

  it("keeps the whole history, including the course the reward was swapped for", () => {
    const original = referral("RF-2007");
    const revoked = applyRewardRevocation(original, revocation);
    assert.equal(revoked.id, original.id);
    assert.equal(revoked.referrerName, original.referrerName);
    assert.equal(revoked.referredStudentName, original.referredStudentName);
    assert.equal(revoked.referralCode, original.referralCode);
    assert.equal(revoked.referredAt, original.referredAt);
    assert.equal(revoked.purchaseStatus, original.purchaseStatus);
    assert.equal(revoked.approvedAt, original.approvedAt);
    assert.equal(revoked.claimedCourseTitle, original.claimedCourseTitle);
    assert.equal(revoked.claimedAt, original.claimedAt);
  });

  it("leaves the referral the page was given untouched", () => {
    const original = referral("RF-2007");
    applyRewardRevocation(original, revocation);
    assert.equal(original.rewardStatus, "claimed");
    assert.equal(original.revokedAt, null);
  });
});

describe("withRewardRevocations", () => {
  const revocations: ReferralRevocationsById = {
    "RF-2007": rewardRevocation("Refunded.", "demo-enr-abc123", new Date(REVOKED_AT)),
  };

  it("lays a revocation over an approved or claimed reward", () => {
    for (const status of ["approved", "claimed"] as const) {
      const [row] = withRewardRevocations([referral("RF-2007", status)], revocations);
      assert.equal(row.rewardStatus, "revoked", status);
    }
  });

  it("refuses to revoke a reward that was never approved or granted", () => {
    for (const status of ["pending", "eligible", "rejected"] as const) {
      const [row] = withRewardRevocations([referral("RF-2007", status)], revocations);
      assert.equal(row.rewardStatus, status, status);
      assert.equal(row.revokedAt, null, status);
    }
  });

  it("cannot revoke the same reward twice", () => {
    const once = withRewardRevocations([referral("RF-2007")], revocations);
    const twice = withRewardRevocations(once, {
      "RF-2007": rewardRevocation("A different reason.", null, new Date("2026-11-10T11:00:00.000Z")),
    });
    assert.equal(twice[0].revocationReason, "Refunded.");
    assert.equal(twice[0].revokedAt, REVOKED_AT);
  });

  it("leaves referrals with no revocation alone", () => {
    const [other] = withRewardRevocations([referral("RF-2005", "claimed")], revocations);
    assert.equal(other.rewardStatus, "claimed");
  });
});

describe("pruneRewardRevocations", () => {
  it("drops revocations whose referral is no longer on the page", () => {
    const revocation = rewardRevocation("Refunded.", null, new Date(REVOKED_AT));
    const revocations: ReferralRevocationsById = { "RF-2007": revocation, "RF-9999": revocation };
    assert.deepEqual(pruneRewardRevocations(revocations, [referral("RF-2007")]), { "RF-2007": revocation });
  });
});

describe("the enrolment revoked with the reward", () => {
  const granted = enrolment("demo-enr-abc123", "u-chipo", "c-comms");
  const paid = enrolment("u-chipo:c-excel", "u-chipo", "c-excel", 6);
  const someoneElse = enrolment("demo-enr-zzz999", "u-mary", "c-comms", 2);

  const changes: StatusChangesById = {
    "demo-enr-abc123": revokedChange(newRevocation("Refunded.", new Date(REVOKED_AT))),
  };

  it("revokes exactly the enrolment the grant created", () => {
    const [row] = withStatusChanges([granted], changes);
    assert.equal(row.status, "revoked");
    assert.equal(row.revocationReason, "Refunded.");
    assert.equal(row.revokedAt, REVOKED_AT);
  });

  it("keeps the student's progress exactly as it was", () => {
    const [row] = withStatusChanges([granted], changes);
    assert.equal(row.completedLessons, granted.completedLessons);
    assert.equal(row.totalLessons, granted.totalLessons);
    assert.equal(row.progress, granted.progress);
    assert.equal(row.enrolledAt, granted.enrolledAt);
    assert.equal(row.courseId, granted.courseId);
  });

  it("does not touch their other enrolments, or anybody else's", () => {
    const rows = withStatusChanges([granted, paid, someoneElse], changes);
    assert.equal(rows[1].status, "active");
    assert.equal(rows[1].progress, paid.progress);
    assert.equal(rows[2].status, "active");
  });
});

describe("the figures after a revocation", () => {
  it("moves the reward out of claimed and into revoked", () => {
    const referrals = [referral("RF-2007", "claimed"), referral("RF-2006", "approved")];
    const before = summariseReferrals(referrals);
    const after = summariseReferrals(
      withRewardRevocations(referrals, {
        "RF-2007": rewardRevocation("Refunded.", "demo-enr-abc123", new Date(REVOKED_AT)),
      }),
    );

    assert.equal(before.claimed, 1);
    assert.equal(before.revoked, 0);
    assert.equal(after.claimed, 0);
    assert.equal(after.revoked, 1);
    assert.equal(after.approved, before.approved);
    assert.equal(after.total, before.total);
    // The purchase still happened: taking a reward back does not unmake it.
    assert.equal(after.successful, before.successful);
  });
});
