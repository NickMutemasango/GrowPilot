import { enrolmentProgress } from "./enrolments.ts";
import { demoEnrolmentId } from "./manual-enrolment.ts";
import type { AdminEnrolment, EnrolmentCourseChoice, EnrolmentStudentOption } from "@/types/admin-enrolments";
import type { AdminReferral, ReferralClaim, ReferralClaimsById } from "@/types/admin-referrals";

/*
 * Granting the free course an approved referral reward has earned
 * (Step 12E.11). FRONTEND DEMONSTRATION ONLY.
 *
 * Pure functions, so the same rules run in the dialog and in the tests
 * (referral-grants.test.ts).
 *
 * NOBODY IS GIVEN ACCESS TO ANYTHING. There is no access control in
 * this project, no server action and no database write: granting
 * records the claim against the referral and adds one demonstration
 * enrolment to the list the browser is already showing, exactly as the
 * manual enrolment in Step 12D.2 does.
 *
 * What it deliberately does NOT do:
 *
 *  - It never skips the review. Only an APPROVED reward can be granted,
 *    so a pending or eligible one cannot be claimed early and a
 *    rejected one cannot be claimed at all.
 *  - It never happens twice. A claimed reward has no action left, and
 *    the same referrer is never enrolled twice in the same course.
 *  - It never changes who referred whom, the referral code, the date
 *    they joined, the qualifying purchase or the approval that came
 *    before it. Only the reward status and the claim fields are added.
 *  - It never charges anybody and never touches a payment: the course
 *    is free precisely because the reward was earned.
 *
 * When this is real, the same checks must run again on the server, the
 * enrolment must be created in one transaction with the claim so the
 * two can never disagree, and each grant needs an audit entry naming
 * the administrator.
 */

/** A reward can be granted once it has been approved, and at no other time. */
export function canGrantFreeCourse(referral: AdminReferral): boolean {
  return referral.rewardStatus === "approved";
}

/**
 * True when this student already has a record for this course, whatever
 * its status, so the same course is never granted to them twice.
 */
export function isAlreadyEnrolled(
  studentId: string,
  courseId: string,
  enrolments: readonly AdminEnrolment[],
): boolean {
  return enrolments.some((enrolment) => enrolment.studentId === studentId && enrolment.courseId === courseId);
}

/**
 * The reward courses offered to this referrer, each saying whether they
 * are already enrolled, so the dialog can show why one cannot be
 * chosen rather than quietly leaving it out.
 */
export function rewardCoursesFor(
  studentId: string,
  courses: readonly EnrolmentCourseChoice[],
  enrolments: readonly AdminEnrolment[],
): { course: EnrolmentCourseChoice; enrolled: boolean }[] {
  return courses.map((course) => ({ course, enrolled: isAlreadyEnrolled(studentId, course.id, enrolments) }));
}

/** Shown under the drop-down when nothing can be chosen. */
export const REWARD_COURSE_REQUIRED = "Please choose a free course.";
export const REWARD_COURSE_ALREADY_ENROLLED = "This referrer is already enrolled in the selected course.";

/** Checks the chosen course against the enrolments already on the page. */
export function validateRewardCourse(
  studentId: string,
  courseId: string,
  enrolments: readonly AdminEnrolment[],
): string | null {
  if (!courseId) return REWARD_COURSE_REQUIRED;
  if (isAlreadyEnrolled(studentId, courseId, enrolments)) return REWARD_COURSE_ALREADY_ENROLLED;
  return null;
}

/** The claim recorded when a reward is granted now. */
export function referralClaim(
  course: EnrolmentCourseChoice,
  enrolmentId: string,
  now: Date = new Date(),
): ReferralClaim {
  return {
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    claimedAt: now.toISOString(),
    enrolmentId,
  };
}

/**
 * Records the claim against the referral, keeping everything else as it
 * was: the same id, referrer, referred student, referral code, referral
 * date, qualifying purchase and approval date.
 */
export function applyReferralClaim(referral: AdminReferral, claim: ReferralClaim): AdminReferral {
  return {
    ...referral,
    rewardStatus: "claimed",
    claimedCourseTitle: claim.courseTitle,
    claimedCourseSlug: claim.courseSlug,
    claimedAt: claim.claimedAt,
  };
}

/**
 * Lays the claims made in this browser over the referrals the page was
 * given. Applied AFTER the approve/reject decisions, so a reward
 * approved on this screen can then be granted on it.
 */
export function withReferralClaims(
  referrals: readonly AdminReferral[],
  claims: ReferralClaimsById,
): AdminReferral[] {
  return referrals.map((referral) => {
    const claim = claims[referral.id];
    // The rule is checked here too, not only in the dialog: stored data must
    // never be able to claim a reward that was never approved.
    return claim && canGrantFreeCourse(referral) ? applyReferralClaim(referral, claim) : referral;
  });
}

/** Drops claims whose referral is no longer on the page, so the stored set can't grow stale. */
export function pruneReferralClaims(
  claims: ReferralClaimsById,
  referrals: readonly AdminReferral[],
): ReferralClaimsById {
  const ids = new Set(referrals.map((referral) => referral.id));
  const kept: ReferralClaimsById = {};
  for (const [id, claim] of Object.entries(claims)) if (ids.has(id)) kept[id] = claim;
  return kept;
}

/**
 * Builds the demonstration enrolment a granted reward creates: active,
 * no progress yet, enrolled now, and recorded as a REFERRAL enrolment
 * so the enrolments table says how it was come by.
 */
export function createRewardEnrolment(
  account: EnrolmentStudentOption,
  course: EnrolmentCourseChoice,
  options: { now?: Date; id?: string } = {},
): AdminEnrolment {
  const now = options.now ?? new Date();
  return {
    id: options.id ?? demoEnrolmentId(),
    studentId: account.id,
    studentName: account.fullName,
    studentEmail: account.email,
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    enrolledAt: now.toISOString(),
    type: "referral",
    status: "active",
    completedLessons: 0,
    totalLessons: course.totalLessons,
    progress: enrolmentProgress(0, course.totalLessons),
  };
}
