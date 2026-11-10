import type {
  Affiliate,
  Commission,
  FreeCourseReward,
  Referral,
  ReferralProfile,
  SaleAttribution,
} from "@/types/rewards";
import type { RewardsStore } from "./store";

/** In-memory RewardsStore for automated tests only. Never use it in the app. */
export function createMemoryRewardsStore(): RewardsStore {
  const affiliates: Affiliate[] = [];
  const profiles: ReferralProfile[] = [];
  const referrals = new Map<string, Referral>();
  const attributions = new Map<string, SaleAttribution>();
  const commissions = new Map<string, Commission>();
  const rewards = new Map<string, FreeCourseReward>();

  return {
    async findAffiliate(id) {
      return affiliates.find((item) => item.id === id) ?? null;
    },
    async findAffiliateByStudent(studentId) {
      return affiliates.find((item) => item.studentId === studentId) ?? null;
    },
    async findAffiliateByCode(code) {
      return affiliates.find((item) => item.code === code) ?? null;
    },
    async insertAffiliate(affiliate) {
      if (affiliates.some((item) => item.code === affiliate.code || item.studentId === affiliate.studentId)) {
        throw new Error("Duplicate affiliate");
      }
      affiliates.push(affiliate);
    },
    async findReferralProfile(studentId) {
      return profiles.find((item) => item.studentId === studentId) ?? null;
    },
    async findReferralProfileByCode(code) {
      return profiles.find((item) => item.code === code) ?? null;
    },
    async insertReferralProfile(profile) {
      if (profiles.some((item) => item.code === profile.code || item.studentId === profile.studentId)) {
        throw new Error("Duplicate referral profile");
      }
      profiles.push(profile);
    },
    async findReferralByFriend(friendStudentId) {
      return [...referrals.values()].find((item) => item.friendStudentId === friendStudentId) ?? null;
    },
    async listReferrals(referrerStudentId) {
      return [...referrals.values()].filter((item) => item.referrerStudentId === referrerStudentId);
    },
    async saveReferral(referral) {
      referrals.set(referral.id, referral);
    },
    async findAttribution(orderReference) {
      return attributions.get(orderReference) ?? null;
    },
    async saveAttribution(attribution) {
      attributions.set(attribution.orderReference, attribution);
    },
    async findCommissionByOrder(orderReference) {
      return [...commissions.values()].find((item) => item.orderReference === orderReference) ?? null;
    },
    async listCommissions(affiliateId) {
      return [...commissions.values()].filter((item) => item.affiliateId === affiliateId);
    },
    async saveCommission(commission) {
      commissions.set(commission.id, commission);
    },
    async findReward(id) {
      return rewards.get(id) ?? null;
    },
    async findRewardByOrder(orderReference) {
      return [...rewards.values()].find((item) => item.orderReference === orderReference) ?? null;
    },
    async findRewardByReferral(referralId) {
      return [...rewards.values()].find((item) => item.referralId === referralId) ?? null;
    },
    async listRewards(referrerStudentId) {
      return [...rewards.values()].filter((item) => item.referrerStudentId === referrerStudentId);
    },
    async saveReward(reward) {
      rewards.set(reward.id, reward);
    },
    async countAffiliateVisits() {
      return 0;
    },
  };
}
