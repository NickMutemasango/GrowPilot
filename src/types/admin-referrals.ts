/*
 * Refer-a-Friend as administrators see it (Step 12E.9: viewing only).
 *
 * One row per friend who joined through someone's referral link, and
 * what became of the reward that referral could earn. The statuses come
 * from the referral programme built in Step 10 (src/types/rewards.ts),
 * so nothing here can drift from it.
 *
 * VIEWING ONLY, and simulated throughout. Nothing on this screen
 * approves a reward, rejects one, or grants anybody a free course: no
 * reward mechanism is connected to this project.
 *
 * NO CONTACT DETAILS. A row names the two people and the code that
 * joined them, and nothing else: no email address, no phone number and
 * no address exists in this data, so the screen cannot show one. A
 * referred student is somebody else's friend, and an administrator
 * reviewing a reward has no need of their details.
 */

/** What became of the purchase that would make a referral count. */
export const REFERRAL_PURCHASE_STATUSES = ["none", "completed", "refunded"] as const;

export type ReferralPurchaseStatus = (typeof REFERRAL_PURCHASE_STATUSES)[number];

/**
 * Where the reward for a referral has got to.
 *
 *  - "pending"  — the friend has joined but has not made a qualifying
 *                 purchase yet, so nothing is earned.
 *  - "eligible" — the qualifying purchase was made: the reward is earned
 *                 and waiting for an administrator to review it.
 *  - "approved" — an administrator has agreed the reward is owed
 *                 (Step 12E.10). It is NOT claimed and NOT granted: no
 *                 course access comes from this, and the free course is
 *                 still the referrer's to choose.
 *  - "claimed"  — the referrer has already swapped it for a free course.
 *  - "revoked"  — an approved or claimed reward has been withdrawn
 *                 (Step 12E.12), with the reason kept. The reward and
 *                 the course it was swapped for are both still on
 *                 record; nothing is deleted.
 *  - "rejected" — the referral does not qualify, and the reason is kept
 *                 with it. The record is never deleted.
 */
export const REFERRAL_REWARD_STATUSES = [
  "pending",
  "eligible",
  "approved",
  "claimed",
  "revoked",
  "rejected",
] as const;

export type ReferralRewardStatus = (typeof REFERRAL_REWARD_STATUSES)[number];

export type AdminReferral = {
  /** The reference an administrator would quote. */
  id: string;
  referrerId: string;
  /** The referrer's own account, so a granted reward can be enrolled against it. */
  referrerStudentId: string;
  referrerName: string;
  /** The friend who joined. A name only — never an email address or any other contact detail. */
  referredStudentName: string;
  /** The code used in the link: ?friend=CODE */
  referralCode: string;
  /** When the friend joined through the link. Never changed by anything later. */
  referredAt: string;
  purchaseStatus: ReferralPurchaseStatus;
  /** The course the friend bought, where one was bought. */
  purchasedCourseTitle: string | null;
  /** What the friend paid, in the currency's smallest unit, as money is held everywhere else. */
  purchaseAmountMinor: number | null;
  purchasedAt: string | null;
  rewardStatus: ReferralRewardStatus;
  /**
   * When an administrator approved the reward (Step 12E.10), where one
   * has. Approving agrees the reward is owed; it never claims it and
   * never grants a course.
   */
  approvedAt?: string | null;
  /** The free course already taken, where the reward has been claimed. */
  claimedCourseTitle?: string | null;
  claimedCourseSlug?: string | null;
  claimedAt?: string | null;
  /**
   * Where an approved or claimed reward has been withdrawn (Step
   * 12E.12). The reward's own history — approved when, claimed for
   * which course — is kept beside this, never cleared.
   */
  revokedAt?: string | null;
  revocationReason?: string | null;
  /** Why the referral does not qualify, where it does not. Kept with the record. */
  rejectionReason?: string | null;
};

export type ReferralRewardStatusFilter = "all" | ReferralRewardStatus;

export type ReferralFilters = {
  /** Searches the referrer's name, the referred student's name and the referral code. */
  query: string;
  status: ReferralRewardStatusFilter;
};

export const NO_REFERRAL_FILTERS: ReferralFilters = { query: "", status: "all" };

/*
 * Step 12E.10: deciding a free-course referral reward (frontend
 * demonstration only).
 *
 * A decision is recorded against the referral. Approving says the
 * reward is owed; it does NOT claim it, does not choose a course and
 * grants nobody access to anything — no reward mechanism is connected
 * to this project at all.
 */

export type ReferralDecision =
  | { outcome: "approved"; decidedAt: string }
  | { outcome: "rejected"; decidedAt: string; reason: string };

/** Decisions kept against referral ids, so a sample referral can be decided without rewriting it. */
export type ReferralDecisionsById = Record<string, ReferralDecision>;

/*
 * Step 12E.11: granting the free course an approved reward has earned
 * (frontend demonstration only).
 *
 * The administrator picks one of the courses GrowPilot offers as a
 * reward, and the browser records the claim and adds a demonstration
 * enrolment to the list it is already holding. NOBODY IS GIVEN ACCESS
 * TO ANYTHING: there is no server action, no database write and no
 * access control in this project to grant access with.
 */

export type ReferralClaim = {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  claimedAt: string;
  /** The demonstration enrolment created with it, so the two stay tied together. */
  enrolmentId: string;
};

/** Claims kept against referral ids, applied after the approve/reject decisions. */
export type ReferralClaimsById = Record<string, ReferralClaim>;

/**
 * The figures above the referrals table. Counts, because a referral is a
 * thing that happened, not an amount of money.
 */
export type ReferralRewardTotals = {
  /** Everybody who joined through a referral link. */
  total: number;
  /** Referrals where the friend completed a qualifying purchase. */
  successful: number;
  /** Rewards still waiting on a qualifying purchase. */
  pending: number;
  /** Rewards earned and waiting to be reviewed. */
  eligible: number;
  /** Rewards an administrator has agreed are owed, not yet claimed. */
  approved: number;
  /** Rewards already swapped for a free course. */
  claimed: number;
  /** Rewards withdrawn after being approved or claimed, kept on record. */
  revoked: number;
  /** Referrals turned down, kept on record. */
  rejected: number;
};

/*
 * Step 12E.12: revoking a free-course referral reward (frontend
 * demonstration only).
 *
 * Revoking marks the reward and, where the free course was granted
 * here, the one enrolment that grant created. It never deletes a
 * record, never touches the student's progress and never withdraws
 * real course access — there is no access control in this project to
 * withdraw it from.
 */

export type ReferralRevocation = {
  reason: string;
  revokedAt: string;
  /**
   * The demonstration enrolment the grant created, where there is one,
   * so exactly that enrolment is revoked with it and no other.
   */
  enrolmentId: string | null;
};

/** Revocations kept against referral ids, applied after the decisions and the claims. */
export type ReferralRevocationsById = Record<string, ReferralRevocation>;
