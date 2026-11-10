import type { RewardsPolicy } from "@/config/rewards";
import type { Order } from "@/types/payments";
import type {
  Affiliate,
  AffiliateSummary,
  Commission,
  FreeCourseReward,
  Referral,
  ReferralSummary,
} from "@/types/rewards";
import type { RewardsStore } from "./store";

/*
 * Affiliate and Refer-a-Friend rules. Server-only, covered by
 * rules.test.ts. Commissions and rewards come only from orders the payment
 * rules have confirmed as paid (src/lib/payments/enrolment.ts), never from
 * a link or anything else the browser sends.
 *
 *  - Affiliate link (?ref=AFFILIATE CODE): remembered on the visitor's
 *    device, saved on the order on the server when checkout starts, and
 *    turned into a pending 60% commission once the payment is confirmed.
 *  - Friend link (?ref=FRIEND CODE): saved on the friend's new account when
 *    they register. Their first confirmed paid purchase earns the referrer
 *    one free-course reward.
 *  - One purchase earns one or the other, not both (unless the policy allows it).
 */

/** 2000 at 6000 basis points (60%) → 1200. Rounds down, so it never pays out a fraction of a cent. */
export function calculateCommission(baseAmountMinor: number, rateBasisPoints: number): number {
  if (baseAmountMinor <= 0 || rateBasisPoints <= 0) return 0;
  return Math.floor((baseAmountMinor * rateBasisPoints) / 10_000);
}

/** The amount the commission is worked out from, per the configured policy. */
export function commissionBase(order: Order, policy: RewardsPolicy): number {
  switch (policy.commissionBase) {
    case "amount-paid":
      return order.amountMinor;
  }
}

// ── Affiliate applications ────────────────────────────────────────────────

/** Applications stay "pending" until someone at GrowPilot approves them. Applying twice changes nothing. */
export async function applyForAffiliate(
  store: RewardsStore,
  studentId: string,
  input: { fullName: string; email: string; reason: string | null },
  now = new Date(),
): Promise<{ kind: "created" | "existing"; affiliate: Affiliate }> {
  const existing = await store.findAffiliateByStudent(studentId);
  if (existing) return { kind: "existing", affiliate: existing };

  const affiliate: Affiliate = {
    id: createId("AFF"),
    studentId,
    code: await createUniqueCode(store),
    status: "pending",
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    reason: input.reason?.trim() || null,
    appliedAt: now.toISOString(),
    reviewedAt: null,
  };
  await store.insertAffiliate(affiliate);
  return { kind: "created", affiliate };
}

// ── Friend referrals ──────────────────────────────────────────────────────

/** Every student's personal friend-referral code, created the first time it's needed. */
export async function getOrCreateReferralCode(store: RewardsStore, studentId: string): Promise<string> {
  const existing = await store.findReferralProfile(studentId);
  if (existing) return existing.code;
  const code = await createUniqueCode(store);
  await store.insertReferralProfile({ studentId, code });
  return code;
}

/**
 * Call when a new account is created with a friend's link. Registering is
 * not a successful referral; it only links the two accounts.
 */
export async function recordReferralSignup(
  store: RewardsStore,
  code: string | null,
  friendStudentId: string,
  now = new Date(),
): Promise<{ kind: "no-code" | "unknown-code" | "self-referral" | "already-referred" | "recorded" }> {
  if (!code) return { kind: "no-code" };
  const profile = await store.findReferralProfileByCode(code);
  if (!profile) return { kind: "unknown-code" };
  if (profile.studentId === friendStudentId) return { kind: "self-referral" };
  if (await store.findReferralByFriend(friendStudentId)) return { kind: "already-referred" };

  await store.saveReferral({
    id: createId("REF"),
    referrerStudentId: profile.studentId,
    friendStudentId,
    status: "joined",
    joinedAt: now.toISOString(),
    qualifyingOrderReference: null,
    rejectionReason: null,
  });
  return { kind: "recorded" };
}

// ── Orders ────────────────────────────────────────────────────────────────

/**
 * Call when checkout creates an order, with the affiliate code remembered on
 * the buyer's device. Only approved affiliates count, never the buyer's own code.
 */
export async function attributeOrderToAffiliate(
  store: RewardsStore,
  order: Order,
  code: string | null,
  now = new Date(),
): Promise<{ kind: "none" | "not-approved" | "self-referral" | "already-attributed" | "recorded" }> {
  if (!code) return { kind: "none" };
  if (await store.findAttribution(order.reference)) return { kind: "already-attributed" };
  const affiliate = await store.findAffiliateByCode(code);
  if (!affiliate) return { kind: "none" };
  if (affiliate.status !== "approved") return { kind: "not-approved" };
  if (affiliate.studentId === order.studentId) return { kind: "self-referral" };

  await store.saveAttribution({
    orderReference: order.reference,
    programme: "affiliate",
    partnerId: affiliate.id,
    buyerStudentId: order.studentId,
    recordedAt: now.toISOString(),
  });
  return { kind: "recorded" };
}

/**
 * Call after an order is confirmed as paid. Safe to call any number of
 * times for the same order: it never creates a second commission or reward.
 */
export async function handlePaidOrder(
  store: RewardsStore,
  order: Order,
  policy: RewardsPolicy,
  now = new Date(),
): Promise<{ commission: Commission | null; reward: FreeCourseReward | null }> {
  if (order.status !== "paid") return { commission: null, reward: null };

  let commission = await store.findCommissionByOrder(order.reference);
  const attribution = await store.findAttribution(order.reference);
  if (!commission && attribution?.programme === "affiliate") {
    const affiliate = await store.findAffiliate(attribution.partnerId);
    if (affiliate && affiliate.status === "approved" && affiliate.studentId !== order.studentId) {
      const base = commissionBase(order, policy);
      commission = {
        id: createId("COM"),
        affiliateId: affiliate.id,
        orderReference: order.reference,
        courseId: order.courseId,
        courseSlug: order.courseSlug,
        baseAmountMinor: base,
        rateBasisPoints: policy.commissionRateBasisPoints,
        amountMinor: calculateCommission(base, policy.commissionRateBasisPoints),
        currency: order.currency,
        status: "pending",
        saleAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      await store.saveCommission(commission);
    }
  }

  let reward = await store.findRewardByOrder(order.reference);
  if (!reward && (!commission || policy.allowBothProgrammesOnOneSale)) {
    reward = await qualifyReferral(store, order, now);
  }
  return { commission, reward };
}

async function qualifyReferral(store: RewardsStore, order: Order, now: Date): Promise<FreeCourseReward | null> {
  const referral = await store.findReferralByFriend(order.studentId);
  if (!referral || referral.status !== "joined") return null;
  if (referral.referrerStudentId === order.studentId) return null;
  if (await store.findRewardByReferral(referral.id)) return null;

  await store.saveReferral({ ...referral, status: "successful", qualifyingOrderReference: order.reference });
  const reward: FreeCourseReward = {
    id: createId("RWD"),
    referrerStudentId: referral.referrerStudentId,
    referralId: referral.id,
    orderReference: order.reference,
    status: "available",
    earnedAt: now.toISOString(),
    redeemedCourseId: null,
    redeemedAt: null,
  };
  await store.saveReward(reward);
  return reward;
}

/**
 * Call when a paid order is refunded or charged back: its commission is
 * reversed and an unused reward is cancelled. A reward already swapped for
 * a course is reported for a person to review.
 */
export async function handleRefundedOrder(
  store: RewardsStore,
  orderReference: string,
  now = new Date(),
): Promise<{ commissionReversed: boolean; rewardCancelled: boolean; needsReview: boolean }> {
  let commissionReversed = false;
  const commission = await store.findCommissionByOrder(orderReference);
  if (commission && commission.status !== "reversed") {
    await store.saveCommission({ ...commission, status: "reversed", updatedAt: now.toISOString() });
    commissionReversed = true;
  }

  let rewardCancelled = false;
  let needsReview = commission?.status === "paid";
  const reward = await store.findRewardByOrder(orderReference);
  if (reward?.status === "available") {
    await store.saveReward({ ...reward, status: "cancelled" });
    rewardCancelled = true;
  } else if (reward?.status === "redeemed") {
    needsReview = true;
  }
  return { commissionReversed, rewardCancelled, needsReview };
}

// ── Rewards ───────────────────────────────────────────────────────────────

/**
 * Swaps an available reward for one of the courses GrowPilot allows. Each
 * reward works once. The caller then enrols the student in the course.
 */
export async function redeemReward(
  store: RewardsStore,
  rewardId: string,
  studentId: string,
  course: { id: string; slug: string },
  policy: RewardsPolicy,
  now = new Date(),
): Promise<{ kind: "not-found" | "not-available" | "not-eligible" | "redeemed" }> {
  const reward = await store.findReward(rewardId);
  // Someone else's reward is reported as "not found", so IDs reveal nothing.
  if (!reward || reward.referrerStudentId !== studentId) return { kind: "not-found" };
  if (reward.status !== "available") return { kind: "not-available" };
  if (!policy.freeCourseRewardSlugs.includes(course.slug)) return { kind: "not-eligible" };

  await store.saveReward({ ...reward, status: "redeemed", redeemedCourseId: course.id, redeemedAt: now.toISOString() });
  return { kind: "redeemed" };
}

// ── Summaries ─────────────────────────────────────────────────────────────

export function summariseAffiliate(commissions: Commission[], visits: number, currency = "USD"): AffiliateSummary {
  const total = (status: Commission["status"]) =>
    commissions.filter((item) => item.status === status).reduce((sum, item) => sum + item.amountMinor, 0);
  return {
    visits,
    successfulSales: commissions.filter((item) => item.status !== "reversed").length,
    pendingMinor: total("pending"),
    approvedMinor: total("approved") + total("paid"),
    currency,
  };
}

export function summariseReferrals(referrals: Referral[], rewards: FreeCourseReward[]): ReferralSummary {
  const count = (status: FreeCourseReward["status"]) => rewards.filter((item) => item.status === status).length;
  return {
    friendsInvited: referrals.length,
    pending: referrals.filter((item) => item.status === "joined").length,
    successful: referrals.filter((item) => item.status === "successful").length,
    rewardsEarned: rewards.filter((item) => item.status !== "cancelled").length,
    rewardsRedeemed: count("redeemed"),
    rewardsAvailable: count("available"),
  };
}

// ── Codes ─────────────────────────────────────────────────────────────────

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No 0/O or 1/I.

function randomString(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

/** An 8-character code not used by any affiliate or friend link. */
async function createUniqueCode(store: RewardsStore): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = randomString(8);
    if (!(await store.findAffiliateByCode(code)) && !(await store.findReferralProfileByCode(code))) return code;
  }
  throw new Error("Could not create a unique code");
}

function createId(prefix: string): string {
  return `${prefix}-${randomString(12)}`;
}

/** Codes look like "K7M2Q9TX". Anything else in a link is ignored. */
export function isValidCode(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[A-HJ-NP-Z2-9]{8}$/.test(value);
}
