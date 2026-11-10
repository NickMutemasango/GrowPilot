import { calculateProgress } from "../progress/calculate.ts";
import type { EnrolmentRecord } from "@/types/payments";
import type {
  AdminEnrolment,
  AdminEnrolmentStatus,
  AdminEnrolmentType,
  EnrolmentFilters,
  EnrolmentSummary,
} from "@/types/admin-enrolments";

/*
 * Enrolment rules for the admin area. Pure functions only, so the same
 * rules run on the server, in the development preview and in the tests
 * (enrolments.test.ts).
 *
 * Step 12D.1 is read-only: nothing here changes an enrolment, grants or
 * removes course access, or touches payments.
 */

export const enrolmentTypeLabels: Record<AdminEnrolmentType, string> = {
  free: "Free",
  paid: "Paid",
  referral: "Referral Reward",
  grant: "Administrative Grant",
};

export const enrolmentStatusLabels: Record<AdminEnrolmentStatus, string> = {
  active: "Active",
  completed: "Completed",
  revoked: "Revoked",
};

/**
 * How a stored enrolment becomes the status an administrator sees.
 *
 *  - Revoked, cancelled or refunded access shows as "Revoked".
 *  - Everything else is "Completed" once every lesson is finished, and
 *    "Active" until then.
 *
 * Enrolments still waiting for payment aren't course access at all, so they
 * belong to the Payments section and are left out of this page.
 */
export function enrolmentStatus(
  recordStatus: EnrolmentRecord["status"],
  completedLessons: number,
  totalLessons: number,
): AdminEnrolmentStatus | null {
  if (recordStatus === "revoked" || recordStatus === "cancelled") return "revoked";
  if (recordStatus === "pending_payment") return null;
  return totalLessons > 0 && completedLessons >= totalLessons ? "completed" : "active";
}

/**
 * How an enrolment was obtained. A database row records this directly
 * (`source`); where it doesn't, a paid payment status means "paid" and
 * anything else means "free", because a referral reward or an
 * administrative grant can't be guessed from a payment record.
 */
export function enrolmentType(source: AdminEnrolmentType | null, paymentStatus: EnrolmentRecord["paymentStatus"]): AdminEnrolmentType {
  if (source) return source;
  return paymentStatus === "paid" ? "paid" : "free";
}

/** Course progress from the lesson counts, kept between 0 and 100. */
export function enrolmentProgress(completedLessons: number, totalLessons: number): number {
  return calculateProgress(completedLessons, totalLessons);
}

/** Search by student name, student email or course name, plus the three drop-downs. */
export function filterEnrolments(enrolments: readonly AdminEnrolment[], filters: EnrolmentFilters): AdminEnrolment[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return enrolments.filter((enrolment) => {
    if (
      query &&
      !enrolment.studentName.toLocaleLowerCase().includes(query) &&
      !enrolment.studentEmail.toLocaleLowerCase().includes(query) &&
      !enrolment.courseTitle.toLocaleLowerCase().includes(query)
    ) {
      return false;
    }
    if (filters.course !== "all" && enrolment.courseId !== filters.course) return false;
    if (filters.status !== "all" && enrolment.status !== filters.status) return false;
    if (filters.type !== "all" && enrolment.type !== filters.type) return false;
    return true;
  });
}

/** The figures above the table. Every enrolment is counted in exactly one of the three statuses. */
export function summariseEnrolments(enrolments: readonly AdminEnrolment[]): EnrolmentSummary {
  const count = (status: AdminEnrolmentStatus) => enrolments.filter((enrolment) => enrolment.status === status).length;
  return {
    total: enrolments.length,
    active: count("active"),
    completed: count("completed"),
    revoked: count("revoked"),
  };
}

/** The courses offered in the Course filter: only those students are actually enrolled in. */
export function courseOptions(enrolments: readonly AdminEnrolment[]): { id: string; title: string }[] {
  const byId = new Map<string, string>();
  for (const enrolment of enrolments) byId.set(enrolment.courseId, enrolment.courseTitle);
  return [...byId].map(([id, title]) => ({ id, title })).sort((a, b) => a.title.localeCompare(b.title));
}

/** Newest enrolments first, so the most recent activity is at the top. */
export function byNewest(a: AdminEnrolment, b: AdminEnrolment): number {
  return b.enrolledAt.localeCompare(a.enrolledAt);
}
