/*
 * Affiliate and Refer-a-Friend rules that GrowPilot decides. Change them
 * here; the server uses these values for every calculation.
 *
 * BEFORE REAL PAYOUTS: GrowPilot must confirm what the 60% is worked out
 * from (the price paid? after tax, discounts or payment fees?), how long a
 * commission stays pending (the refund window), and which courses can be
 * chosen as a free-course reward.
 */
export const rewardsPolicy = {
  /** 6000 basis points = 60%. */
  commissionRateBasisPoints: 6000,

  /**
   * What the commission is worked out from. "amount-paid" is the total the
   * student paid for the course. NOT YET CONFIRMED by GrowPilot.
   */
  commissionBase: "amount-paid",

  /** Days a commission stays "pending" before it can be approved (refund window). NOT YET CONFIRMED. */
  commissionHoldDays: 30,

  /** If false, one purchase can earn a commission or a referral reward, never both. */
  allowBothProgrammesOnOneSale: false,

  /** Courses a referral reward can be swapped for. Empty until GrowPilot chooses them. */
  freeCourseRewardSlugs: [] as string[],

  /** Days a referral link is remembered on the visitor's device. */
  referralCookieDays: 30,
} as const;

export type RewardsPolicy = typeof rewardsPolicy;
