import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { RewardsPolicy } from "@/config/rewards";
import type { Order } from "@/types/payments";
import type { RewardsStore } from "./store";
import { createMemoryRewardsStore } from "./memory-store.ts";
import {
  applyForAffiliate,
  attributeOrderToAffiliate,
  calculateCommission,
  getOrCreateReferralCode,
  handlePaidOrder,
  handleRefundedOrder,
  isValidCode,
  recordReferralSignup,
  redeemReward,
  summariseAffiliate,
  summariseReferrals,
} from "./rules.ts";

const policy: RewardsPolicy = {
  commissionRateBasisPoints: 6000,
  commissionBase: "amount-paid",
  commissionHoldDays: 30,
  allowBothProgrammesOnOneSale: false,
  freeCourseRewardSlugs: ["microsoft-excel-made-easy"],
  referralCookieDays: 30,
};

const AFFILIATE_STUDENT = "student-affiliate";
const BUYER = "student-buyer";
let orderCount = 0;

function paidOrder(studentId = BUYER, amountMinor = 2000, status: Order["status"] = "paid"): Order {
  orderCount += 1;
  return {
    reference: `GPA-ORDER${orderCount}`,
    studentId,
    courseId: "c-003",
    courseSlug: "microsoft-excel-made-easy",
    amountMinor,
    currency: "USD",
    status,
    providerReference: "provider-1",
    createdAt: "2026-11-04T00:00:00Z",
    updatedAt: "2026-11-04T00:00:00Z",
  };
}

/** An affiliate that someone at GrowPilot has approved (approval is a later admin step). */
async function approvedAffiliate(store: RewardsStore) {
  const { affiliate } = await applyForAffiliate(store, AFFILIATE_STUDENT, {
    fullName: "Ama Owusu",
    email: "ama@example.com",
    reason: null,
  });
  await store.insertAffiliate({ ...affiliate, id: "AFF-APPROVED", code: "APPRVD22", studentId: "student-approved", status: "approved" });
  return (await store.findAffiliate("AFF-APPROVED"))!;
}

describe("commission calculation", () => {
  it("is 60% of the sale: $20 earns $12 and GrowPilot keeps $8", () => {
    assert.equal(calculateCommission(2000, 6000), 1200);
    assert.equal(2000 - calculateCommission(2000, 6000), 800);
  });

  it("works for real course prices and never pays a fraction of a cent", () => {
    assert.equal(calculateCommission(2900, 6000), 1740);
    assert.equal(calculateCommission(1999, 6000), 1199); // 1199.4 rounds down
    assert.equal(calculateCommission(0, 6000), 0);
  });
});

describe("affiliate applications", () => {
  it("starts as pending, with a unique link code, and is never approved automatically", async () => {
    const store = createMemoryRewardsStore();
    const { kind, affiliate } = await applyForAffiliate(store, "s1", { fullName: " Ama ", email: "a@x.com", reason: "" });
    assert.equal(kind, "created");
    assert.equal(affiliate.status, "pending");
    assert.equal(affiliate.fullName, "Ama");
    assert.equal(affiliate.reason, null);
    assert.ok(isValidCode(affiliate.code));
  });

  it("returns the existing application if the student applies again", async () => {
    const store = createMemoryRewardsStore();
    const first = await applyForAffiliate(store, "s1", { fullName: "Ama", email: "a@x.com", reason: null });
    const second = await applyForAffiliate(store, "s1", { fullName: "Ama", email: "a@x.com", reason: null });
    assert.equal(second.kind, "existing");
    assert.equal(second.affiliate.code, first.affiliate.code);
  });

  it("gives every affiliate and friend link a different code", async () => {
    const store = createMemoryRewardsStore();
    const codes = new Set<string>();
    for (let i = 0; i < 50; i += 1) {
      codes.add((await applyForAffiliate(store, `a${i}`, { fullName: "A", email: "a@x.com", reason: null })).affiliate.code);
      codes.add(await getOrCreateReferralCode(store, `f${i}`));
    }
    assert.equal(codes.size, 100);
  });
});

describe("affiliate sales", () => {
  it("creates one pending 60% commission for a confirmed sale", async () => {
    const store = createMemoryRewardsStore();
    const affiliate = await approvedAffiliate(store);
    const order = paidOrder();
    assert.equal((await attributeOrderToAffiliate(store, order, affiliate.code)).kind, "recorded");

    const { commission } = await handlePaidOrder(store, order, policy);
    assert.equal(commission?.affiliateId, affiliate.id);
    assert.equal(commission?.orderReference, order.reference);
    assert.equal(commission?.amountMinor, 1200);
    assert.equal(commission?.status, "pending");
  });

  it("creates nothing for payments that are pending or failed", async () => {
    const store = createMemoryRewardsStore();
    const affiliate = await approvedAffiliate(store);
    for (const status of ["pending", "failed", "cancelled"] as const) {
      const order = paidOrder(BUYER, 2000, status);
      await attributeOrderToAffiliate(store, order, affiliate.code);
      assert.equal((await handlePaidOrder(store, order, policy)).commission, null);
    }
    assert.equal((await store.listCommissions(affiliate.id)).length, 0);
  });

  it("creates only one commission when the payment notice arrives twice", async () => {
    const store = createMemoryRewardsStore();
    const affiliate = await approvedAffiliate(store);
    const order = paidOrder();
    await attributeOrderToAffiliate(store, order, affiliate.code);
    await handlePaidOrder(store, order, policy);
    await handlePaidOrder(store, order, policy);
    assert.equal((await store.listCommissions(affiliate.id)).length, 1);
  });

  it("reverses the commission when the payment is refunded", async () => {
    const store = createMemoryRewardsStore();
    const affiliate = await approvedAffiliate(store);
    const order = paidOrder();
    await attributeOrderToAffiliate(store, order, affiliate.code);
    await handlePaidOrder(store, order, policy);
    const result = await handleRefundedOrder(store, order.reference);
    assert.equal(result.commissionReversed, true);
    assert.equal((await store.findCommissionByOrder(order.reference))?.status, "reversed");
    // A second refund notice changes nothing.
    assert.equal((await handleRefundedOrder(store, order.reference)).commissionReversed, false);
  });

  it("ignores links from affiliates who are pending or suspended", async () => {
    const store = createMemoryRewardsStore();
    const { affiliate } = await applyForAffiliate(store, "s1", { fullName: "A", email: "a@x.com", reason: null });
    const order = paidOrder();
    assert.equal((await attributeOrderToAffiliate(store, order, affiliate.code)).kind, "not-approved");
    assert.equal((await handlePaidOrder(store, order, policy)).commission, null);
  });

  it("does not pay affiliates for buying through their own link", async () => {
    const store = createMemoryRewardsStore();
    const affiliate = await approvedAffiliate(store);
    const order = paidOrder(affiliate.studentId);
    assert.equal((await attributeOrderToAffiliate(store, order, affiliate.code)).kind, "self-referral");
    assert.equal((await handlePaidOrder(store, order, policy)).commission, null);
  });

  it("ignores unknown or badly formed codes", async () => {
    const store = createMemoryRewardsStore();
    assert.equal((await attributeOrderToAffiliate(store, paidOrder(), "NOPE2345")).kind, "none");
    assert.equal(isValidCode("abc"), false);
    assert.equal(isValidCode("<script>"), false);
  });
});

describe("refer a friend", () => {
  it("does not reward a friend who only registers", async () => {
    const store = createMemoryRewardsStore();
    const code = await getOrCreateReferralCode(store, "referrer");
    assert.equal((await recordReferralSignup(store, code, "friend")).kind, "recorded");
    const summary = summariseReferrals(await store.listReferrals("referrer"), await store.listRewards("referrer"));
    assert.deepEqual([summary.friendsInvited, summary.pending, summary.successful, summary.rewardsEarned], [1, 1, 0, 0]);
  });

  it("earns one free-course reward when the friend's payment is confirmed", async () => {
    const store = createMemoryRewardsStore();
    const code = await getOrCreateReferralCode(store, "referrer");
    await recordReferralSignup(store, code, "friend");
    const { reward } = await handlePaidOrder(store, paidOrder("friend"), policy);
    assert.equal(reward?.referrerStudentId, "referrer");
    assert.equal(reward?.status, "available");
    assert.equal((await store.findReferralByFriend("friend"))?.status, "successful");
  });

  it("never rewards the same friend twice, or the same payment twice", async () => {
    const store = createMemoryRewardsStore();
    const code = await getOrCreateReferralCode(store, "referrer");
    await recordReferralSignup(store, code, "friend");
    const first = paidOrder("friend");
    await handlePaidOrder(store, first, policy);
    await handlePaidOrder(store, first, policy); // duplicate notice
    await handlePaidOrder(store, paidOrder("friend"), policy); // second purchase
    assert.equal((await store.listRewards("referrer")).length, 1);
  });

  it("does not count self-referrals or a second referrer", async () => {
    const store = createMemoryRewardsStore();
    const mine = await getOrCreateReferralCode(store, "me");
    const other = await getOrCreateReferralCode(store, "other");
    assert.equal((await recordReferralSignup(store, mine, "me")).kind, "self-referral");
    await recordReferralSignup(store, other, "friend");
    assert.equal((await recordReferralSignup(store, mine, "friend")).kind, "already-referred");
    assert.equal((await recordReferralSignup(store, "ZZZZZZZZ", "friend2")).kind, "unknown-code");
  });

  it("gives no reward for a payment that isn't confirmed", async () => {
    const store = createMemoryRewardsStore();
    await recordReferralSignup(store, await getOrCreateReferralCode(store, "referrer"), "friend");
    assert.equal((await handlePaidOrder(store, paidOrder("friend", 2000, "failed"), policy)).reward, null);
    assert.equal((await store.findReferralByFriend("friend"))?.status, "joined");
  });

  it("cancels an unused reward if the friend's payment is refunded", async () => {
    const store = createMemoryRewardsStore();
    await recordReferralSignup(store, await getOrCreateReferralCode(store, "referrer"), "friend");
    const order = paidOrder("friend");
    const { reward } = await handlePaidOrder(store, order, policy);
    assert.equal((await handleRefundedOrder(store, order.reference)).rewardCancelled, true);
    assert.equal((await store.findReward(reward!.id))?.status, "cancelled");
  });

  it("awards a commission or a reward for one purchase, not both", async () => {
    const store = createMemoryRewardsStore();
    const affiliate = await approvedAffiliate(store);
    await recordReferralSignup(store, await getOrCreateReferralCode(store, "referrer"), "friend");
    const order = paidOrder("friend");
    await attributeOrderToAffiliate(store, order, affiliate.code);
    const result = await handlePaidOrder(store, order, policy);
    assert.ok(result.commission);
    assert.equal(result.reward, null);
    // The friend referral can still qualify on a later purchase without an affiliate link.
    assert.ok((await handlePaidOrder(store, paidOrder("friend"), policy)).reward);
  });
});

describe("free-course rewards", () => {
  async function earnedReward() {
    const store = createMemoryRewardsStore();
    await recordReferralSignup(store, await getOrCreateReferralCode(store, "referrer"), "friend");
    const { reward } = await handlePaidOrder(store, paidOrder("friend"), policy);
    return { store, reward: reward! };
  }
  const excel = { id: "c-003", slug: "microsoft-excel-made-easy" };
  const notOffered = { id: "c-005", slug: "introduction-to-web-development" };

  it("can be swapped only for a course GrowPilot offers as a reward", async () => {
    const { store, reward } = await earnedReward();
    assert.equal((await redeemReward(store, reward.id, "referrer", notOffered, policy)).kind, "not-eligible");
    assert.equal((await redeemReward(store, reward.id, "referrer", excel, policy)).kind, "redeemed");
  });

  it("can be used only once, and only by its owner", async () => {
    const { store, reward } = await earnedReward();
    assert.equal((await redeemReward(store, reward.id, "someone-else", excel, policy)).kind, "not-found");
    await redeemReward(store, reward.id, "referrer", excel, policy);
    assert.equal((await redeemReward(store, reward.id, "referrer", excel, policy)).kind, "not-available");
  });
});

describe("dashboard summaries", () => {
  it("adds up pending and approved earnings, leaving out reversed ones", async () => {
    const base = { affiliateId: "a", courseId: "c", courseSlug: "c", baseAmountMinor: 2000, rateBasisPoints: 6000, currency: "USD", saleAt: "", updatedAt: "" };
    const summary = summariseAffiliate(
      [
        { ...base, id: "1", orderReference: "1", amountMinor: 1200, status: "pending" },
        { ...base, id: "2", orderReference: "2", amountMinor: 1200, status: "approved" },
        { ...base, id: "3", orderReference: "3", amountMinor: 1200, status: "paid" },
        { ...base, id: "4", orderReference: "4", amountMinor: 1200, status: "reversed" },
      ],
      40,
    );
    assert.deepEqual(summary, { visits: 40, successfulSales: 3, pendingMinor: 1200, approvedMinor: 2400, currency: "USD" });
  });
});
