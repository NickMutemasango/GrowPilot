"use server";

import { requireAdmin } from "@/lib/admin/service";
import { getAdminCourseStore } from "@/lib/admin/course-store";
import {
  approveCourse,
  changeCoursePrice,
  rejectCourse,
  unpublishCourse,
  type CourseActionResult,
  type PriceChange,
} from "@/lib/admin/courses";
import { getCurrentStudent } from "@/lib/auth/session";

/*
 * Course-management actions on the server. Each one checks again that the
 * caller is an administrator (never trusting the page), re-reads the course
 * at the moment of the action, applies the rules in src/lib/admin/courses.ts,
 * then saves the change and its audit entry together.
 *
 * Nothing here deletes a course, and unpublishing never touches enrolments,
 * payments, progress or certificates. The rules are shared with the
 * browser, so a decision the screen allows is the one the server allows.
 */

export type CourseActionRequest =
  | { kind: "approve"; courseId: string }
  | { kind: "reject"; courseId: string; reason: string }
  | { kind: "unpublish"; courseId: string; reason: string }
  | { kind: "price"; courseId: string; price: PriceChange };

export async function courseAction(request: CourseActionRequest): Promise<{ ok: boolean; message: string }> {
  await requireAdmin("/admin/courses");
  const me = await getCurrentStudent();
  const store = getAdminCourseStore();
  if (!me || !store) {
    return { ok: false, message: "Course changes aren't available yet, so nothing was changed." };
  }

  // Read the course as it is right now, so a stale page can't approve twice.
  const course = await store.loadForAction(request.courseId);
  if (!course) return { ok: false, message: "We couldn't find that course." };

  const courses = [course];
  const actor = { id: me.id };
  let result: CourseActionResult;
  switch (request.kind) {
    case "approve":
      result = approveCourse(courses, actor, request.courseId);
      break;
    case "reject":
      result = rejectCourse(courses, actor, request.courseId, request.reason);
      break;
    case "unpublish":
      result = unpublishCourse(courses, actor, request.courseId, request.reason);
      break;
    case "price":
      result = changeCoursePrice(courses, actor, request.courseId, request.price);
      break;
    default:
      return { ok: false, message: "That action isn't recognised." };
  }
  if (!result.ok) return result;

  await store.saveCourse(result.course);
  await store.appendAudit(result.audit);
  return { ok: true, message: result.message };
}
