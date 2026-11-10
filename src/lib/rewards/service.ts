import { cookies } from "next/headers";
import { rewardsPolicy } from "@/config/rewards";
import { getAllCourses, getCourseBySlug } from "@/lib/courses";
import type { Course } from "@/types/course";
import type { Order } from "@/types/payments";
import type { Affiliate, AffiliateSummary, EarningRow, FreeCourseReward, ReferralSummary } from "@/types/rewards";
import { REFERRAL_COOKIE } from "./cookie";
import {
  attributeOrderToAffiliate,
  getOrCreateReferralCode,
  handlePaidOrder,
  handleRefundedOrder,
  isValidCode,
  summariseAffiliate,
  summariseReferrals,
} from "./rules";
import { getRewardsStore } from "./store";

/*
 * What pages and the payment code ask about the programmes. Server-only.
 * Each function reads only the signed-in student's own records.
 */

/** The ?ref= code remembered on this device, if it looks valid. */
export async function getRememberedCode(): Promise<string | null> {
  const value = (await cookies()).get(REFERRAL_COOKIE)?.value;
  return isValidCode(value) ? value : null;
}

/** Called by checkout when an order is created. */
export async function attributeOrder(order: Order): Promise<void> {
  const store = getRewardsStore();
  if (!store) return;
  await attributeOrderToAffiliate(store, order, await getRememberedCode());
}

/** Called whenever the payment rules confirm or refund an order. Safe to repeat. */
export async function updateRewardsForOrder(order: Order): Promise<void> {
  const store = getRewardsStore();
  if (!store) return;
  if (order.status === "paid") await handlePaidOrder(store, order, rewardsPolicy);
  if (order.status === "refunded") {
    const result = await handleRefundedOrder(store, order.reference);
    if (result.needsReview) console.error(`Refund for order ${order.reference} needs a person to review its reward or paid commission.`);
  }
}

export function isTrackingAvailable(): boolean {
  return getRewardsStore() !== null;
}

export async function getAffiliate(studentId: string): Promise<Affiliate | null> {
  return (await getRewardsStore()?.findAffiliateByStudent(studentId)) ?? null;
}

export async function getAffiliateDashboard(
  affiliate: Affiliate,
): Promise<{ summary: AffiliateSummary; earnings: EarningRow[] }> {
  const store = getRewardsStore();
  if (!store) return { summary: summariseAffiliate([], 0), earnings: [] };
  const [commissions, visits, courses] = await Promise.all([
    store.listCommissions(affiliate.id),
    store.countAffiliateVisits(affiliate.id),
    getAllCourses(),
  ]);
  return {
    summary: summariseAffiliate(commissions, visits),
    earnings: commissions
      .map((item) => ({
        id: item.id,
        courseTitle: courses.find((course) => course.id === item.courseId)?.title ?? item.courseSlug,
        saleAt: item.saleAt,
        baseAmountMinor: item.baseAmountMinor,
        amountMinor: item.amountMinor,
        currency: item.currency,
        status: item.status,
      }))
      .sort((a, b) => b.saleAt.localeCompare(a.saleAt)),
  };
}

export async function getReferralOverview(
  studentId: string,
): Promise<{ code: string; summary: ReferralSummary; availableRewards: FreeCourseReward[] } | null> {
  const store = getRewardsStore();
  if (!store) return null;
  const [code, referrals, rewards] = await Promise.all([
    getOrCreateReferralCode(store, studentId),
    store.listReferrals(studentId),
    store.listRewards(studentId),
  ]);
  return {
    code,
    summary: summariseReferrals(referrals, rewards),
    availableRewards: rewards.filter((reward) => reward.status === "available"),
  };
}

/** Courses GrowPilot offers as a free-course reward (src/config/rewards.ts). */
export async function getRewardCourses(): Promise<Course[]> {
  const courses = await Promise.all(rewardsPolicy.freeCourseRewardSlugs.map((slug) => getCourseBySlug(slug)));
  return courses.filter((course): course is Course => course !== undefined);
}
