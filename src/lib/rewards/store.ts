import type {
  Affiliate,
  Commission,
  FreeCourseReward,
  Referral,
  ReferralProfile,
  SaleAttribution,
} from "@/types/rewards";

/*
 * Where affiliate and referral records are kept.
 *
 * NO DATABASE IS CONFIGURED YET, so `getRewardsStore` returns null and the
 * programme pages explain that tracking isn't switched on. Implement this
 * with the same database as the payment store (src/lib/payments/store.ts),
 * with unique keys on: affiliates.code, affiliates.studentId,
 * referralProfiles.code, referrals.friendStudentId,
 * commissions.orderReference, rewards.referralId, rewards.orderReference
 * and attributions.orderReference. Students must never write these tables
 * directly; only the server functions in ./rules.ts change them.
 */
export type RewardsStore = {
  findAffiliate(id: string): Promise<Affiliate | null>;
  findAffiliateByStudent(studentId: string): Promise<Affiliate | null>;
  findAffiliateByCode(code: string): Promise<Affiliate | null>;
  insertAffiliate(affiliate: Affiliate): Promise<void>;

  findReferralProfile(studentId: string): Promise<ReferralProfile | null>;
  findReferralProfileByCode(code: string): Promise<ReferralProfile | null>;
  insertReferralProfile(profile: ReferralProfile): Promise<void>;

  findReferralByFriend(friendStudentId: string): Promise<Referral | null>;
  listReferrals(referrerStudentId: string): Promise<Referral[]>;
  saveReferral(referral: Referral): Promise<void>;

  findAttribution(orderReference: string): Promise<SaleAttribution | null>;
  saveAttribution(attribution: SaleAttribution): Promise<void>;

  findCommissionByOrder(orderReference: string): Promise<Commission | null>;
  listCommissions(affiliateId: string): Promise<Commission[]>;
  saveCommission(commission: Commission): Promise<void>;

  findReward(id: string): Promise<FreeCourseReward | null>;
  findRewardByOrder(orderReference: string): Promise<FreeCourseReward | null>;
  findRewardByReferral(referralId: string): Promise<FreeCourseReward | null>;
  listRewards(referrerStudentId: string): Promise<FreeCourseReward[]>;
  saveReward(reward: FreeCourseReward): Promise<void>;

  /** Visits from an affiliate link (counted when someone arrives with ?ref=). */
  countAffiliateVisits(affiliateId: string): Promise<number>;
};

export function getRewardsStore(): RewardsStore | null {
  return null;
}
