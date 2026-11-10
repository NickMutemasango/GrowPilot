import type { CertificateRecord } from "./student";

/**
 * One student's progress through one course, as a database would store it.
 *
 * Lesson slugs are used rather than numbers so that progress survives a
 * course being reordered or a lesson being inserted.
 */
export type CourseProgressRecord = {
  /** Lesson slugs marked complete. */
  completed: string[];
  /** Lesson slugs opened at least once. */
  started: string[];
  /** The lesson to return to, for "Continue Learning". */
  lastLessonSlug: string | null;
  /** ISO date of the last visit, or `null` if the course was never opened. */
  lastAccessedAt: string | null;
  /** Issued once every required lesson is complete. */
  certificate: CertificateRecord | null;
};

/** A course with no progress yet. */
export const EMPTY_PROGRESS: CourseProgressRecord = {
  completed: [],
  started: [],
  lastLessonSlug: null,
  lastAccessedAt: null,
  certificate: null,
};
