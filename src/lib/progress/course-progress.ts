import { EMPTY_PROGRESS, type CourseProgressRecord } from "@/types/progress";
import type { CertificateRecord, CourseStatus } from "@/types/student";
import {
  calculateProgress,
  countCompleted,
  getCourseStatus,
  getResumeLessonSlug,
} from "./calculate";

export type CourseProgress = {
  record: CourseProgressRecord;
  completedCount: number;
  total: number;
  progress: number;
  status: CourseStatus;
  /** Lesson for "Continue Learning"; `null` when the course is finished. */
  resumeSlug: string | null;
  /** Only when every required lesson is complete. */
  certificate: CertificateRecord | null;
};

/**
 * Progress for one course, worked out from a stored record with the shared
 * rules. A plain function, not a hook: the record is loaded on the server
 * (see ./store.ts) and passed in, so the same figures are used whether the
 * page is rendered on the server or updated in the browser.
 */
export function courseProgress(
  record: CourseProgressRecord | undefined,
  lessonSlugs: readonly string[],
): CourseProgress {
  const stored = record ?? EMPTY_PROGRESS;
  const total = lessonSlugs.length;
  const completedCount = countCompleted(stored.completed, lessonSlugs);
  const status = getCourseStatus(completedCount, total);

  return {
    record: stored,
    completedCount,
    total,
    progress: calculateProgress(completedCount, total),
    status,
    resumeSlug: getResumeLessonSlug(lessonSlugs, stored.completed, stored.lastLessonSlug),
    certificate: status === "completed" ? stored.certificate : null,
  };
}
