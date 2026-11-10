"use server";

import { getCurrentStudent } from "@/lib/auth/session";
import { getProgressStore } from "@/lib/progress/store";
import type { CourseProgressRecord } from "@/types/progress";

/*
 * Saving lesson progress.
 *
 * Both actions run on the server and take the student from the session, so
 * a student can only ever change their own progress — the browser never
 * says who it is. With no progress store configured they report that
 * saving is not set up yet; nothing is stored anywhere, and the lesson
 * player says so rather than showing a lesson as complete when it is not.
 */

export type ProgressResult =
  | { ok: true; record: CourseProgressRecord }
  | { ok: false; reason: "not-configured" | "signed-out"; message: string };

const NOT_CONFIGURED = {
  ok: false,
  reason: "not-configured",
  message: "Saving your progress isn’t set up yet, so this lesson can’t be marked as complete.",
} as const;

const SIGNED_OUT = {
  ok: false,
  reason: "signed-out",
  message: "Please log in again to save your progress.",
} as const;

export async function markLessonCompleteAction(input: {
  courseSlug: string;
  lessonSlug: string;
}): Promise<ProgressResult> {
  const store = getProgressStore();
  if (!store) return NOT_CONFIGURED;

  const student = await getCurrentStudent();
  if (!student) return SIGNED_OUT;

  const { record } = await store.markComplete({
    studentId: student.id,
    courseSlug: input.courseSlug,
    lessonSlug: input.lessonSlug,
  });
  return { ok: true, record };
}

export async function recordLessonVisitAction(input: {
  courseSlug: string;
  lessonSlug: string;
}): Promise<void> {
  const store = getProgressStore();
  if (!store) return;

  const student = await getCurrentStudent();
  if (!student) return;

  await store.recordVisit({
    studentId: student.id,
    courseSlug: input.courseSlug,
    lessonSlug: input.lessonSlug,
  });
}
