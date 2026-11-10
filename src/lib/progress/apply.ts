import type { CourseLesson } from "@/types/learning";
import type { StudentCourse } from "@/types/student";
import {
  calculateProgress,
  countCompleted,
  getCourseStatus,
  getResumeLessonSlug,
} from "./calculate";
import type { CourseProgressRecord } from "@/types/progress";

/** Recalculates a dashboard course from lesson-level progress, using the real curriculum. */
export function applyLessonProgress(
  item: StudentCourse,
  lessons: CourseLesson[],
  record: CourseProgressRecord,
): StudentCourse {
  const slugs = lessons.map((lesson) => lesson.slug);
  const completedLessons = countCompleted(record.completed, slugs);
  const status = getCourseStatus(completedLessons, slugs.length);
  const resumeSlug = getResumeLessonSlug(slugs, record.completed, record.lastLessonSlug);
  const resume = lessons.find((lesson) => lesson.slug === resumeSlug);

  return {
    ...item,
    status,
    progress: calculateProgress(completedLessons, slugs.length),
    completedLessons,
    totalLessons: slugs.length,
    nextLesson: resume ? { number: resume.number, title: resume.title, moduleTitle: resume.moduleTitle } : null,
    nextLessonHref: resume?.href ?? null,
    firstLessonHref: lessons[0]?.href ?? null,
    certificate: status === "completed" ? record.certificate : null,
    lastAccessedAt: record.lastAccessedAt,
  };
}
