import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminReferral, ReferralRewardStatus } from "@/types/admin-referrals";
// Relative paths: only type imports may use the "@/" alias in these tests.
import {
  filterReferralAnalytics,
  isUnsettledReward,
  monthlySuccessfulReferrals,
  summariseReferralAnalytics,
} from "./referral-analytics.ts";

const NOW = new Date("2026-11-09T12:00:00Z");

function referral(
  id: string,
  rewardStatus: ReferralRewardStatus,
  options: {
    purchase?: "none" | "completed" | "refunded";
    referredAt?: string;
    purchasedAt?: string | null;
    referrer?: string;
  } = {},
): AdminReferral {
  const purchase = options.purchase ?? (rewardStatus === "pending" ? "none" : "completed");
  return {
    id,
    referrerId: "aff-001",
    referrerStudentId: "u-john-moyo",
    referrerName: options.referrer ?? "John Moyo",
    referredStudentName: "Tendai Mukoko",
    referralCode: "GP-REF-001",
    referredAt: options.referredAt ?? "2026-09-01T10:00:00Z",
    purchaseStatus: purchase,
    purchasedCourseTitle: purchase === "none" ? null : "Microsoft Excel Made Easy",
    purchaseAmountMinor: purchase === "none" ? null : 2_900,
    purchasedAt: options.purchasedAt === undefined ? (purchase === "none" ? null : "2026-10-05T10:00:00Z") : options.purchasedAt,
    rewardStatus,
    approvedAt: null,
    claimedCourseTitle: rewardStatus === "claimed" ? "Communication Skills" : null,
    claimedCourseSlug: null,
    claimedAt: null,
    revokedAt: null,
    revocationReason: null,
    rejectionReason: null,
  };
}

const referrals = [
  referral("RF-1", "pending"),
  referral("RF-2", "pending"),
  referral("RF-3", "eligible"),
  referral("RF-4", "approved"),
  referral("RF-5", "claimed"),
  referral("RF-6", "rejected", { purchase: "refunded" }),
  referral("RF-7", "revoked"),
];

describe("summariseReferralAnalytics", () => {
  const totals = summariseReferralAnalytics(referrals);

  it("counts everybody who joined", () => {
    assert.equal(totals.total, 7);
  });

  it("counts a referral as successful only after a qualifying purchase", () => {
    // RF-3, RF-4, RF-5 and RF-7 bought something; the two pending ones did not,
    // and RF-6 was refunded, so it never qualified.
    assert.equal(totals.successful, 4);
  });

  it("counts free courses awarded from the claimed rewards", () => {
    assert.equal(totals.awarded, 1);
  });

  it("counts the rewards still to settle, and says what they are made of", () => {
    assert.equal(totals.pending, 4);
    assert.equal(totals.waitingOnPurchase, 2);
    assert.equal(totals.eligible, 1);
    assert.equal(totals.approved, 1);
  });

  it("keeps refused rewards out of everything but the total", () => {
    assert.equal(totals.refused, 2);
    assert.equal(totals.pending + totals.awarded + totals.refused, totals.total);
  });

  it("comes back at zero for nothing at all", () => {
    const empty = summariseReferralAnalytics([]);
    assert.equal(empty.total, 0);
    assert.equal(empty.successful, 0);
    assert.equal(empty.pending, 0);
  });

  it("follows the data: change a reward status and the figures move with it", () => {
    const before = summariseReferralAnalytics(referrals);
    const after = summariseReferralAnalytics([
      ...referrals.filter((one) => one.id !== "RF-4"),
      referral("RF-4", "claimed"),
    ]);
    assert.equal(after.awarded, before.awarded + 1);
    assert.equal(after.approved, before.approved - 1);
    assert.equal(after.pending, before.pending - 1);
    // The purchase is unchanged, so the success count is too.
    assert.equal(after.successful, before.successful);
  });
});

describe("filterReferralAnalytics", () => {
  const dated = [
    referral("RF-1", "claimed", { referredAt: "2026-08-10T10:00:00Z" }),
    referral("RF-2", "eligible", { referredAt: "2026-09-15T10:00:00Z" }),
    referral("RF-3", "pending", { referredAt: "2026-10-20T10:00:00Z" }),
  ];

  const ids = (filters: Parameters<typeof filterReferralAnalytics>[1]) =>
    filterReferralAnalytics(dated, filters).map((one) => one.id);

  it("returns everything with no filters", () => {
    assert.deepEqual(ids({ range: { from: "", to: "" }, status: "all" }), ["RF-1", "RF-2", "RF-3"]);
  });

  it("filters by reward status", () => {
    assert.deepEqual(ids({ range: { from: "", to: "" }, status: "eligible" }), ["RF-2"]);
  });

  it("filters by the date the friend joined, both ends inclusive", () => {
    assert.deepEqual(ids({ range: { from: "2026-09-01", to: "2026-09-30" }, status: "all" }), ["RF-2"]);
    assert.deepEqual(ids({ range: { from: "2026-10-20", to: "2026-10-20" }, status: "all" }), ["RF-3"]);
  });

  it("applies the dates and the status together", () => {
    assert.deepEqual(ids({ range: { from: "2026-09-01", to: "2026-10-31" }, status: "claimed" }), []);
    assert.deepEqual(ids({ range: { from: "2026-08-01", to: "2026-08-31" }, status: "claimed" }), ["RF-1"]);
  });
});

describe("monthlySuccessfulReferrals", () => {
  const series = monthlySuccessfulReferrals(
    [
      referral("RF-1", "claimed", { purchasedAt: "2026-10-05T10:00:00Z" }),
      referral("RF-2", "eligible", { purchasedAt: "2026-10-28T10:00:00Z" }),
      referral("RF-3", "approved", { purchasedAt: "2026-11-02T10:00:00Z" }),
      referral("RF-4", "pending"),
      referral("RF-5", "rejected", { purchase: "refunded", purchasedAt: "2026-10-12T10:00:00Z" }),
    ],
    { months: 12, now: NOW },
  );
  const byKey = Object.fromEntries(series.map((point) => [point.key, point.value]));

  it("returns one point per month, ending with this month", () => {
    assert.equal(series.length, 12);
    assert.equal(series[11].key, "2026-11");
  });

  it("counts a referral in the month of the qualifying purchase", () => {
    assert.equal(byKey["2026-10"], 2);
    assert.equal(byKey["2026-11"], 1);
  });

  it("never counts a friend who bought nothing, or a refunded purchase", () => {
    assert.equal(
      series.reduce((sum, point) => sum + point.value, 0),
      3,
    );
  });

  it("keeps the quiet months", () => {
    assert.equal(byKey["2026-09"], 0);
  });

  it("leaves out a successful referral with no purchase date rather than guessing one", () => {
    const undated = monthlySuccessfulReferrals([referral("RF-9", "eligible", { purchasedAt: null })], {
      months: 12,
      now: NOW,
    });
    assert.equal(
      undated.reduce((sum, point) => sum + point.value, 0),
      0,
    );
  });
});

describe("isUnsettledReward", () => {
  it("is true while a reward still has somewhere to go", () => {
    for (const status of ["pending", "eligible", "approved"] as const) {
      assert.equal(isUnsettledReward(status), true, status);
    }
  });

  it("is false once it is finished with", () => {
    for (const status of ["claimed", "rejected", "revoked"] as const) {
      assert.equal(isUnsettledReward(status), false, status);
    }
  });
});
