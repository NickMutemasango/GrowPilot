import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminEnrolment, EnrolmentCourseChoice, EnrolmentStudentOption } from "@/types/admin-enrolments";
import type { AdminReferral, ReferralClaimsById, ReferralRewardStatus } from "@/types/admin-referrals";
// Relative paths: only type imports may use the "@/" alias in these tests.
import { summariseReferrals } from "./referral-rewards.ts";
import {
  REWARD_COURSE_ALREADY_ENROLLED,
  REWARD_COURSE_REQUIRED,
  applyReferralClaim,
  canGrantFreeCourse,
  createRewardEnrolment,
  isAlreadyEnrolled,
  pruneReferralClaims,
  referralClaim,
  rewardCoursesFor,
  validateRewardCourse,
  withReferralClaims,
} from "./referral-grants.ts";

const CLAIMED_AT = "2026-11-09T10:00:00.000Z";

const course: EnrolmentCourseChoice = {
  id: "c-excel",
  slug: "microsoft-excel-made-easy",
  title: "Microsoft Excel Made Easy",
  totalLessons: 8,
};

const otherCourse: EnrolmentCourseChoice = {
  id: "c-web",
  slug: "introduction-to-web-development",
  title: "Introduction to Web Development",
  totalLessons: 10,
};

const account: EnrolmentStudentOption = { id: "u-mary", fullName: "Mary Chikwanha", email: "mary.c@example.com" };

function referral(
  id: string,
  rewardStatus: ReferralRewardStatus = "approved",
  changes: Partial<AdminReferral> = {},
): AdminReferral {
  return {
    id,
    referrerId: "aff-004",
    referrerStudentId: "u-mary",
    referrerName: "Mary Chikwanha",
    referredStudentName: "Joyce Banda",
    referralCode: "GP-REF-004",
    referredAt: "2026-08-12T11:00:00Z",
    purchaseStatus: "completed",
    purchasedCourseTitle: "Communication Skills",
    purchaseAmountMinor: 1_900,
    purchasedAt: "2026-08-19T15:05:00Z",
    rewardStatus,
    approvedAt: rewardStatus === "approved" ? "2026-11-08T09:00:00.000Z" : null,
    claimedCourseTitle: null,
    claimedCourseSlug: null,
    claimedAt: null,
    rejectionReason: null,
    ...changes,
  };
}

function enrolment(studentId: string, courseId: string, status: AdminEnrolment["status"] = "active"): AdminEnrolment {
  return {
    id: `${studentId}:${courseId}`,
    studentId,
    studentName: "Mary Chikwanha",
    studentEmail: "mary.c@example.com",
    courseId,
    courseSlug: "microsoft-excel-made-easy",
    courseTitle: "Microsoft Excel Made Easy",
    enrolledAt: "2026-07-01T10:00:00Z",
    type: "paid",
    status,
    completedLessons: 0,
    totalLessons: 8,
    progress: 0,
  };
}

describe("canGrantFreeCourse", () => {
  it("offers the action on an approved reward", () => {
    assert.equal(canGrantFreeCourse(referral("RF-1", "approved")), true);
  });

  it("never offers it before approval, or once it is claimed or rejected", () => {
    for (const status of ["pending", "eligible", "claimed", "rejected"] as const) {
      assert.equal(canGrantFreeCourse(referral("RF-1", status)), false, status);
    }
  });
});

describe("isAlreadyEnrolled", () => {
  it("finds an existing record for the same student and course", () => {
    assert.equal(isAlreadyEnrolled("u-mary", "c-excel", [enrolment("u-mary", "c-excel")]), true);
  });

  it("counts a revoked record too: the record exists either way", () => {
    assert.equal(isAlreadyEnrolled("u-mary", "c-excel", [enrolment("u-mary", "c-excel", "revoked")]), true);
  });

  it("does not confuse another student or another course", () => {
    const existing = [enrolment("u-john", "c-excel"), enrolment("u-mary", "c-web")];
    assert.equal(isAlreadyEnrolled("u-mary", "c-excel", existing), false);
  });
});

describe("rewardCoursesFor", () => {
  it("says which reward courses the referrer already has", () => {
    const options = rewardCoursesFor("u-mary", [course, otherCourse], [enrolment("u-mary", "c-excel")]);
    assert.deepEqual(
      options.map((option) => [option.course.id, option.enrolled]),
      [
        ["c-excel", true],
        ["c-web", false],
      ],
    );
  });
});

describe("validateRewardCourse", () => {
  it("requires a course", () => {
    assert.equal(validateRewardCourse("u-mary", "", []), REWARD_COURSE_REQUIRED);
  });

  it("refuses a course the referrer is already enrolled in", () => {
    assert.equal(
      validateRewardCourse("u-mary", "c-excel", [enrolment("u-mary", "c-excel")]),
      REWARD_COURSE_ALREADY_ENROLLED,
    );
  });

  it("accepts a reward course they do not have", () => {
    assert.equal(validateRewardCourse("u-mary", "c-web", [enrolment("u-mary", "c-excel")]), null);
  });
});

describe("applyReferralClaim", () => {
  const claim = referralClaim(course, "demo-enr-abc123", new Date(CLAIMED_AT));

  it("marks the reward claimed and keeps the course and date", () => {
    const claimed = applyReferralClaim(referral("RF-2004"), claim);
    assert.equal(claimed.rewardStatus, "claimed");
    assert.equal(claimed.claimedCourseTitle, course.title);
    assert.equal(claimed.claimedCourseSlug, course.slug);
    assert.equal(claimed.claimedAt, CLAIMED_AT);
  });

  it("changes nothing else about the referral", () => {
    const original = referral("RF-2004");
    const claimed = applyReferralClaim(original, claim);
    assert.equal(claimed.id, original.id);
    assert.equal(claimed.referrerName, original.referrerName);
    assert.equal(claimed.referrerStudentId, original.referrerStudentId);
    assert.equal(claimed.referredStudentName, original.referredStudentName);
    assert.equal(claimed.referralCode, original.referralCode);
    assert.equal(claimed.referredAt, original.referredAt);
    assert.equal(claimed.purchaseStatus, original.purchaseStatus);
    assert.equal(claimed.purchasedCourseTitle, original.purchasedCourseTitle);
    // The approval that came before it is kept: granting does not erase it.
    assert.equal(claimed.approvedAt, original.approvedAt);
  });

  it("leaves the referral the page was given untouched", () => {
    const original = referral("RF-2004");
    applyReferralClaim(original, claim);
    assert.equal(original.rewardStatus, "approved");
    assert.equal(original.claimedAt, null);
  });
});

describe("withReferralClaims", () => {
  const claims: ReferralClaimsById = {
    "RF-2004": { ...referralClaim(course, "demo-enr-abc123", new Date(CLAIMED_AT)) },
  };

  it("lays a claim over the matching referral", () => {
    const [claimed] = withReferralClaims([referral("RF-2004")], claims);
    assert.equal(claimed.rewardStatus, "claimed");
    assert.equal(claimed.claimedCourseTitle, course.title);
  });

  it("refuses to claim a reward that was never approved", () => {
    for (const status of ["pending", "eligible", "rejected"] as const) {
      const [row] = withReferralClaims([referral("RF-2004", status)], claims);
      assert.equal(row.rewardStatus, status, status);
      assert.equal(row.claimedAt, null, status);
    }
  });

  it("cannot grant the same reward twice", () => {
    const once = withReferralClaims([referral("RF-2004")], claims);
    const twice = withReferralClaims(once, {
      "RF-2004": referralClaim(otherCourse, "demo-enr-zzz999", new Date("2026-11-10T10:00:00.000Z")),
    });
    assert.equal(twice[0].claimedCourseTitle, course.title);
    assert.equal(twice[0].claimedAt, CLAIMED_AT);
  });
});

describe("pruneReferralClaims", () => {
  it("drops claims whose referral is no longer on the page", () => {
    const claim = referralClaim(course, "demo-enr-abc123", new Date(CLAIMED_AT));
    const claims: ReferralClaimsById = { "RF-2004": claim, "RF-9999": claim };
    assert.deepEqual(pruneReferralClaims(claims, [referral("RF-2004")]), { "RF-2004": claim });
  });
});

describe("createRewardEnrolment", () => {
  it("is an active referral enrolment with no progress yet", () => {
    const created = createRewardEnrolment(account, course, {
      now: new Date(CLAIMED_AT),
      id: "demo-enr-abc123",
    });
    assert.equal(created.type, "referral");
    assert.equal(created.status, "active");
    assert.equal(created.progress, 0);
    assert.equal(created.completedLessons, 0);
    assert.equal(created.totalLessons, course.totalLessons);
    assert.equal(created.enrolledAt, CLAIMED_AT);
  });

  it("is enrolled against the referrer and the chosen course", () => {
    const created = createRewardEnrolment(account, course, { id: "demo-enr-abc123" });
    assert.equal(created.studentId, account.id);
    assert.equal(created.studentName, account.fullName);
    assert.equal(created.studentEmail, account.email);
    assert.equal(created.courseId, course.id);
    assert.equal(created.courseSlug, course.slug);
    assert.equal(created.courseTitle, course.title);
  });

  it("is marked as a demonstration record, so it is never mistaken for a real one", () => {
    assert.ok(createRewardEnrolment(account, course).id.startsWith("demo-enr-"));
  });
});

describe("the figures after a grant", () => {
  it("moves the reward from approved to claimed, leaving the rest alone", () => {
    const referrals = [referral("RF-2004"), referral("RF-2005", "eligible")];
    const before = summariseReferrals(referrals);
    const after = summariseReferrals(
      withReferralClaims(referrals, {
        "RF-2004": referralClaim(course, "demo-enr-abc123", new Date(CLAIMED_AT)),
      }),
    );

    assert.equal(before.approved, 1);
    assert.equal(before.claimed, 0);
    assert.equal(after.approved, 0);
    assert.equal(after.claimed, 1);
    assert.equal(after.eligible, before.eligible);
    assert.equal(after.total, before.total);
    assert.equal(after.successful, before.successful);
  });
});
