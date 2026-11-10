import type { CourseProgressRecord } from "@/types/progress";
import type { CertificateRecord } from "@/types/student";

/*
 * Where a student's lesson progress and certificates are kept.
 *
 * NO DATABASE IS CONFIGURED YET, so `getProgressStore` returns null: every
 * course reads as "not started", and "Mark Lesson as Complete" tells the
 * student that saving progress is not set up yet rather than pretending to
 * have saved it.
 *
 * When progress lives in a database, implement this against it:
 *
 *  - Every method takes the student's ID, and the ID comes from the
 *    session on the server — never from the browser, or anyone could read
 *    or change another student's progress.
 *  - `markComplete` is idempotent: marking the same lesson twice is one
 *    row, not two, and it must refuse a lesson the student is not enrolled
 *    for.
 *  - Issue the certificate on the server inside `markComplete`, in the
 *    same transaction, when the last required lesson is completed. One
 *    certificate per student and course, enforced by a unique constraint,
 *    so a double click cannot produce two.
 *  - Certificate IDs are generated on the server and must be unguessable;
 *    they appear on a shareable page.
 */
export type ProgressStore = {
  /** Progress for one course, or a fresh record if the student has not started it. */
  findCourseProgress(input: { studentId: string; courseSlug: string }): Promise<CourseProgressRecord>;
  /** Progress for several courses at once, keyed by course slug, for the dashboard. */
  findAllProgress(studentId: string): Promise<Record<string, CourseProgressRecord>>;
  /** Records that a lesson was opened. Does not complete it. */
  recordVisit(input: { studentId: string; courseSlug: string; lessonSlug: string }): Promise<void>;
  /** Completes a lesson and, if it was the last one, issues the certificate. */
  markComplete(input: {
    studentId: string;
    courseSlug: string;
    lessonSlug: string;
  }): Promise<{ record: CourseProgressRecord; certificate: CertificateRecord | null }>;
};

export function getProgressStore(): ProgressStore | null {
  return null;
}
