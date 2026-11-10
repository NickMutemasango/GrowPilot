/*
 * Affiliate and Refer-a-Friend records, shaped as a database would store
 * them. The two programmes are separate: an affiliate link can earn a
 * commission, a friend link can earn a free-course reward.
 */

/*
 * An application is "pending" until it is reviewed, then "approved" or
 * "rejected"; an approved affiliate can later be "suspended". A rejected
 * application is kept, never deleted, so the decision stays on record.
 * Only "approved" earns commission (see rules.ts).
 */
export type AffiliateStatus = "pending" | "approved" | "rejected" | "suspended";

export type Affiliate = {
  id: string;
  studentId: string;
  /** Unique code used in links: ?ref=CODE */
  code: string;
  status: AffiliateStatus;
  fullName: string;
  email: string;
  /** Why the application was rejected, where it was. */
  reason: string | null;
  appliedAt: string;
  /** When the application was approved or rejected. */
  reviewedAt: string | null;
};

export type CommissionStatus = "pending" | "approved" | "paid" | "reversed";

/** One per paid order at most (unique on orderReference). */
export type Commission = {
  id: string;
  affiliateId: string;
  orderReference: string;
  courseId: string;
  courseSlug: string;
  /** The amount the commission is worked out from, in minor units. */
  baseAmountMinor: number;
  /** 6000 = 60%. Stored so later rate changes don't alter old commissions. */
  rateBasisPoints: number;
  amountMinor: number;
  currency: string;
  status: CommissionStatus;
  saleAt: string;
  updatedAt: string;
};

/** Each student has one personal friend-referral code. */
export type ReferralProfile = {
  studentId: string;
  code: string;
};

export type ReferralStatus = "joined" | "successful" | "rejected";

/** A friend who signed up with a referral link. One per friend (unique on friendStudentId). */
export type Referral = {
  id: string;
  referrerStudentId: string;
  friendStudentId: string;
  status: ReferralStatus;
  joinedAt: string;
  qualifyingOrderReference: string | null;
  rejectionReason: string | null;
};

export type RewardStatus = "available" | "redeemed" | "cancelled";

/** One per successful referral (unique on referralId and on orderReference). */
export type FreeCourseReward = {
  id: string;
  referrerStudentId: string;
  referralId: string;
  orderReference: string;
  status: RewardStatus;
  earnedAt: string;
  redeemedCourseId: string | null;
  redeemedAt: string | null;
};

/** Which programme a paid order came through. Saved on the server when the order is created. */
export type SaleAttribution = {
  orderReference: string;
  programme: "affiliate" | "referral";
  /** Affiliate ID, or the referrer's student ID. */
  partnerId: string;
  buyerStudentId: string;
  recordedAt: string;
};

/** A row in "My Earnings". No buyer details, ever. */
export type EarningRow = {
  id: string;
  courseTitle: string;
  saleAt: string;
  baseAmountMinor: number;
  amountMinor: number;
  currency: string;
  status: CommissionStatus;
};

export type AffiliateSummary = {
  visits: number;
  successfulSales: number;
  pendingMinor: number;
  approvedMinor: number;
  currency: string;
};

export type ReferralSummary = {
  friendsInvited: number;
  pending: number;
  successful: number;
  rewardsEarned: number;
  rewardsRedeemed: number;
  rewardsAvailable: number;
};
