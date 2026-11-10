import type { AdminEnrolment, EnrolmentFilters, EnrolmentSummary } from "@/types/admin-enrolments";

/*
 * Where enrolments are read for administrators.
 *
 * NO DATABASE IS CONFIGURED YET, so `getEnrolmentStore` returns null and
 * the Enrolments page says so on the live site. When enrolments live in a
 * database, implement this against it:
 *
 *  - `listEnrolments` searches, filters and pages on the server, so the
 *    browser never receives every enrolment.
 *  - Join the enrolment record (src/types/payments.ts) to the student
 *    account and the course, and work the progress out from the learning
 *    records; never store a progress figure that can drift.
 *  - Record how each enrolment was obtained (`source`: free, paid,
 *    referral reward or administrative grant) on the enrolment row, so the
 *    type shown here is read, not guessed.
 *  - Enrolments waiting for payment belong to the Payments section and are
 *    left out of these queries.
 *  - Return the least student information that does the job: a name, an
 *    email address to tell students apart, the course and the progress.
 *    Never payment references, card details or addresses.
 *  - This store is read-only by design. Changing enrolments is a separate
 *    step with its own rules and audit log.
 */
export type EnrolmentStore = {
  listEnrolments(filters: EnrolmentFilters, page: number, pageSize: number): Promise<{ enrolments: AdminEnrolment[]; total: number }>;
  /** Counts for the summary cards, worked out by the database. */
  summary(): Promise<EnrolmentSummary>;
  /** Courses that have at least one enrolment, for the Course filter. */
  courses(): Promise<{ id: string; title: string }[]>;
};

export function getEnrolmentStore(): EnrolmentStore | null {
  return null;
}
