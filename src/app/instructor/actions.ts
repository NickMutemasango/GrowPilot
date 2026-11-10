"use server";

import { canSaveDraft, canSubmitForReview, statusAfterSave } from "@/lib/instructor/course-draft";
import { getOwnedCourse, requireInstructor } from "@/lib/instructor/service";
import { getCourseStore } from "@/lib/instructor/store";
import type { CourseDraft, InstructorProfile } from "@/types/instructor";

/*
 * Saving courses and profiles on the server. Every action checks, on the
 * server, that the person is an instructor and owns the course. The
 * browser's copy is never trusted for who owns the course or its status:
 * instructors can save a draft or submit for review, never publish.
 */

export type SaveResult = { ok: boolean; message: string };

const NOT_AVAILABLE = "Saving isn't available yet, so your changes have not been saved.";

export async function saveCourseAction(draft: CourseDraft, intent: "draft" | "review"): Promise<SaveResult> {
  const { instructor } = await requireInstructor("/instructor/courses");

  const existing = await getOwnedCourse(draft.id, instructor.id);
  // A catalogue course ID that isn't theirs is refused; any other ID is a new course.
  if (!existing && /^c-\d+$/.test(draft.id)) return { ok: false, message: "You can only change your own courses." };

  if (intent === "draft" && !canSaveDraft(draft)) return { ok: false, message: "Please give your course a title first." };
  if (intent === "review" && !canSubmitForReview(draft)) {
    return { ok: false, message: "Some details are missing. Please check each stage before submitting." };
  }

  const store = getCourseStore();
  if (!store) return { ok: false, message: NOT_AVAILABLE };

  await store.saveCourse({
    ...draft,
    instructorId: instructor.id,
    status: statusAfterSave(intent),
    hasLiveVersion: existing?.hasLiveVersion ?? false,
    updatedAt: new Date().toISOString(),
  });
  return {
    ok: true,
    message: intent === "review" ? "Your course has been sent for review." : "Your draft has been saved.",
  };
}

export async function saveProfileAction(profile: InstructorProfile): Promise<SaveResult> {
  const { instructor } = await requireInstructor("/instructor/profile");
  if (!profile.fullName.trim()) return { ok: false, message: "Please enter your full name." };

  const store = getCourseStore();
  if (!store) return { ok: false, message: NOT_AVAILABLE };
  await store.saveProfile(instructor.id, profile);
  return { ok: true, message: "Your profile has been saved." };
}
