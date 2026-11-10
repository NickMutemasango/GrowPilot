import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminReferral, ReferralPurchaseStatus, ReferralRewardStatus } from "@/types/admin-referrals";
// Relative paths: only type imports may use the "@/" alias in these tests.
import {
  byNewestReferral,
  deriveRewardStatus,
  filterReferrals,
  isSuccessfulReferral,
  summariseReferrals,
} from "./referral-rewards.ts";

function referral(
  id: string,
  rewardStatus: ReferralRewardStatus = "pending",
  purchaseStatus: ReferralPurchaseStatus = "none",
  changes: Partial<AdminReferral> = {},
): AdminReferral {
  return {
    id,
    referrerId: "aff-001",
    referrerStudentId: "u-john-moyo",
    referrerName: "John Moyo",
    referredStudentName: "Tendai Mukoko",
    referralCode: "GP-REF-001",
    referredAt: "2026-10-06T16:40:00Z",
    purchaseStatus,
    purchasedCourseTitle: purchaseStatus === "none" ? null : "Microsoft Excel Made Easy",
    purchaseAmountMinor: purchaseStatus === "none" ? null : 2_900,
    purchasedAt: purchaseStatus === "none" ? null : "2026-10-13T10:50:00Z",
    rewardStatus,
    claimedCourseTitle: null,
    claimedAt: null,
    rejectionReason: null,
    ...changes,
  };
}

describe("isSuccessfulReferral", () => {
  it("counts a referral whose friend completed a qualifying purchase", () => {
    assert.equal(isSuccessfulReferral(referral("RF-1", "eligible", "completed")), true);
  });

  it("does not count a friend who has bought nothing", () => {
    assert.equal(isSuccessfulReferral(referral("RF-1", "pending", "none")), false);
  });

  it("does not count a refunded purchase: the money went back", () => {
    assert.equal(isSuccessfulReferral(referral("RF-1", "rejected", "refunded")), false);
  });
});

describe("deriveRewardStatus", () => {
  it("is pending until the friend buys something", () => {
    assert.equal(deriveRewardStatus({ purchaseStatus: "none", claimed: false, rejectionReason: null }), "pending");
  });

  it("becomes eligible on a qualifying purchase, and is never granted here", () => {
    assert.equal(
      deriveRewardStatus({ purchaseStatus: "completed", claimed: false, rejectionReason: null }),
      "eligible",
    );
  });

  it("is claimed once the reward has been swapped for a course", () => {
    assert.equal(deriveRewardStatus({ purchaseStatus: "completed", claimed: true, rejectionReason: null }), "claimed");
  });

  it("is rejected whenever a reason is on record, whatever else happened", () => {
    for (const purchaseStatus of ["none", "completed", "refunded"] as const) {
      assert.equal(
        deriveRewardStatus({ purchaseStatus, claimed: true, rejectionReason: "Self-referral." }),
        "rejected",
        purchaseStatus,
      );
    }
  });

  it("leaves a refunded purchase with nothing earned", () => {
    assert.equal(deriveRewardStatus({ purchaseStatus: "refunded", claimed: false, rejectionReason: null }), "pending");
  });
});

describe("filterReferrals", () => {
  const referrals = [
    referral("RF-1", "eligible", "completed"),
    referral("RF-2", "claimed", "completed", {
      referrerName: "Grace Okafor",
      referredStudentName: "Anna Phiri",
      referralCode: "GP-REF-002",
      claimedCourseTitle: "Communication Skills",
    }),
    referral("RF-3", "rejected", "refunded", {
      referrerName: "Mary Chikwanha",
      referredStudentName: "Thabo Molefe",
      referralCode: "GP-REF-004",
      rejectionReason: "The purchase was refunded.",
    }),
  ];

  const ids = (filters: Parameters<typeof filterReferrals>[1]) =>
    filterReferrals(referrals, filters).map((row) => row.id);

  it("searches the referrer's name", () => {
    assert.deepEqual(ids({ query: "grace", status: "all" }), ["RF-2"]);
  });

  it("searches the referred student's name", () => {
    assert.deepEqual(ids({ query: "thabo", status: "all" }), ["RF-3"]);
  });

  it("searches the referral code, ignoring case and spacing", () => {
    assert.deepEqual(ids({ query: "  gp-ref-002 ", status: "all" }), ["RF-2"]);
  });

  it("filters by reward status", () => {
    assert.deepEqual(ids({ query: "", status: "rejected" }), ["RF-3"]);
  });

  it("applies the search and the filter together", () => {
    assert.deepEqual(ids({ query: "anna", status: "eligible" }), []);
    assert.deepEqual(ids({ query: "anna", status: "claimed" }), ["RF-2"]);
  });

  it("returns everything when nothing is searched or filtered", () => {
    assert.deepEqual(ids({ query: "", status: "all" }), ["RF-1", "RF-2", "RF-3"]);
  });
});

describe("summariseReferrals", () => {
  const referrals = [
    referral("RF-1", "pending", "none"),
    referral("RF-2", "pending", "none"),
    referral("RF-3", "eligible", "completed"),
    referral("RF-4", "claimed", "completed", { claimedCourseTitle: "Communication Skills" }),
    referral("RF-5", "rejected", "refunded", { rejectionReason: "Refunded." }),
    // Successful purchase, reward refused for another reason: both facts are kept.
    referral("RF-6", "rejected", "completed", { rejectionReason: "The referrer's account is suspended." }),
  ];

  it("counts every referral once per reward status", () => {
    const totals = summariseReferrals(referrals);
    assert.equal(totals.total, 6);
    assert.equal(totals.pending, 2);
    assert.equal(totals.eligible, 1);
    assert.equal(totals.claimed, 1);
    assert.equal(totals.rejected, 2);
    assert.equal(totals.pending + totals.eligible + totals.claimed + totals.rejected, totals.total);
  });

  it("counts a referral as successful on the purchase, not the reward", () => {
    // RF-3, RF-4 and RF-6 completed a purchase; the refunded one did not.
    assert.equal(summariseReferrals(referrals).successful, 3);
  });

  it("counts approved rewards in their own status", () => {
    const totals = summariseReferrals([
      ...referrals,
      referral("RF-7", "approved", "completed", { approvedAt: "2026-11-08T10:00:00.000Z" }),
    ]);
    assert.equal(totals.approved, 1);
    assert.equal(totals.claimed, 1);
    assert.equal(
      totals.pending + totals.eligible + totals.approved + totals.claimed + totals.rejected,
      totals.total,
    );
  });

  it("comes back empty for no referrals at all", () => {
    assert.deepEqual(summariseReferrals([]), {
      total: 0,
      successful: 0,
      pending: 0,
      eligible: 0,
      approved: 0,
      claimed: 0,
      revoked: 0,
      rejected: 0,
    });
  });
});

describe("byNewestReferral", () => {
  it("puts the most recent referral first", () => {
    const older = referral("RF-1", "pending", "none", { referredAt: "2026-09-01T10:00:00Z" });
    const newer = referral("RF-2", "pending", "none", { referredAt: "2026-11-06T12:05:00Z" });
    assert.deepEqual([older, newer].sort(byNewestReferral).map((row) => row.id), ["RF-2", "RF-1"]);
  });
});
