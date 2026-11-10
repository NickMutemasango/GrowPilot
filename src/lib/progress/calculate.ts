import type { CourseStatus, LessonStatus, StudentCourse } from "@/types/student";

/*
 * Progress rules, shared by the server (sample dashboard data) and the
 * browser (the progress preview). No storage or framework code here, so the
 * same rules can run on a real backend later.
 *
 *   Course progress = completed required lessons ÷ total required lessons × 100
 *
 * Every lesson in the curriculum is required.
 */

/** Keeps progress between 0 and 100, whatever the stored numbers say. */
export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Counts each required lesson once, however many times it was marked
 * complete, and ignores lessons that are no longer in the course.
 */
export function countCompleted(completedSlugs: readonly string[], lessonSlugs: readonly string[]): number {
  const completed = new Set(completedSlugs);
  return new Set(lessonSlugs.filter((slug) => completed.has(slug))).size;
}

export function calculateProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return clampProgress((Math.min(completed, total) / total) * 100);
}

/** A course with no required lessons is never "completed". */
export function getCourseStatus(completed: number, total: number): CourseStatus {
  if (total <= 0 || completed <= 0) return "not-started";
  return completed >= total ? "completed" : "in-progress";
}

export function isCourseComplete(completedSlugs: readonly string[], lessonSlugs: readonly string[]): boolean {
  return getCourseStatus(countCompleted(completedSlugs, lessonSlugs), lessonSlugs.length) === "completed";
}

export function getLessonStatus(
  slug: string,
  completedSlugs: readonly string[],
  startedSlugs: readonly string[],
): LessonStatus {
  if (completedSlugs.includes(slug)) return "completed";
  return startedSlugs.includes(slug) ? "in-progress" : "not-started";
}

/**
 * Where "Continue Learning" goes: the last lesson opened if it isn't finished,
 * otherwise the first unfinished lesson. `null` when every lesson is done.
 */
export function getResumeLessonSlug(
  lessonSlugs: readonly string[],
  completedSlugs: readonly string[],
  lastLessonSlug: string | null,
): string | null {
  const completed = new Set(completedSlugs);
  if (lastLessonSlug && lessonSlugs.includes(lastLessonSlug) && !completed.has(lastLessonSlug)) {
    return lastLessonSlug;
  }
  return lessonSlugs.find((slug) => !completed.has(slug)) ?? null;
}

/** The course to resume: the most recent unfinished one, if any. */
export function getCourseToContinue(courses: StudentCourse[]): StudentCourse | null {
  return (
    courses.find((course) => course.status === "in-progress") ??
    courses.find((course) => course.status === "not-started") ??
    null
  );
}
