import { enrolmentProgress } from "./enrolments.ts";
import type {
  AdminEnrolment,
  EnrolmentCourseChoice,
  EnrolmentStudentOption,
  ManualEnrolmentDraft,
  ManualEnrolmentErrors,
} from "@/types/admin-enrolments";

/*
 * Manual enrolment rules (Step 12D.2) — FRONTEND DEMONSTRATION ONLY.
 *
 * Pure functions, so the same rules run in the dialog and in the tests
 * (manual-enrolment.test.ts). Nothing here talks to a server, grants real
 * course access or touches payments: it produces one record that the
 * browser adds to the list it is already showing.
 *
 * When this becomes real, the same checks must run again on the server —
 * a browser check keeps the form honest, it does not keep data correct.
 */

/** Marks every record this feature creates, so a demonstration row is never mistaken for a real one. */
export const DEMO_ENROLMENT_PREFIX = "demo-enr";

/** Manual enrolments are always recorded as an administrative grant. */
export const MANUAL_ENROLMENT_TYPE = "grant" as const;

/** The longest reason the dialog will keep. The reason is a note for the demonstration only. */
export const MAX_REASON_LENGTH = 300;

/**
 * Checks a draft against the enrolments already on the page. One message
 * per field, so each message can sit under the control it belongs to.
 */
export function validateManualEnrolment(
  draft: ManualEnrolmentDraft,
  existing: readonly AdminEnrolment[],
): ManualEnrolmentErrors {
  const errors: ManualEnrolmentErrors = {};
  if (!draft.studentId) errors.studentId = "Please choose a student.";
  if (!draft.courseId) errors.courseId = "Please choose a course.";
  if (draft.studentId && draft.courseId && isAlreadyEnrolled(draft.studentId, draft.courseId, existing)) {
    errors.courseId = "This student is already enrolled in the selected course.";
  }
  return errors;
}

/** True when this student already has a record for this course, whatever its status. */
export function isAlreadyEnrolled(studentId: string, courseId: string, existing: readonly AdminEnrolment[]): boolean {
  return existing.some((enrolment) => enrolment.studentId === studentId && enrolment.courseId === courseId);
}

/** The courses this student is not yet on, so the dialog can say why one is missing. */
export function coursesFor(
  studentId: string,
  courses: readonly EnrolmentCourseChoice[],
  existing: readonly AdminEnrolment[],
): { course: EnrolmentCourseChoice; enrolled: boolean }[] {
  return courses.map((course) => ({ course, enrolled: isAlreadyEnrolled(studentId, course.id, existing) }));
}

/** A unique id for a demonstration record. Random, so two grants in the same second never collide. */
export function demoEnrolmentId(random: () => number = Math.random): string {
  return `${DEMO_ENROLMENT_PREFIX}-${random().toString(36).slice(2, 10)}${random().toString(36).slice(2, 6)}`;
}

/**
 * Builds the record a manual enrolment adds: active, no progress yet,
 * enrolled now, recorded as an administrative grant.
 */
export function createManualEnrolment(
  student: EnrolmentStudentOption,
  course: EnrolmentCourseChoice,
  options: { now?: Date; id?: string } = {},
): AdminEnrolment {
  const now = options.now ?? new Date();
  return {
    id: options.id ?? demoEnrolmentId(),
    studentId: student.id,
    studentName: student.fullName,
    studentEmail: student.email,
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    enrolledAt: now.toISOString(),
    type: MANUAL_ENROLMENT_TYPE,
    status: "active",
    completedLessons: 0,
    totalLessons: course.totalLessons,
    progress: enrolmentProgress(0, course.totalLessons),
  };
}

/** True for a record this feature created, so the table can label it as a demonstration row. */
export function isDemoEnrolment(enrolment: AdminEnrolment): boolean {
  return enrolment.id.startsWith(`${DEMO_ENROLMENT_PREFIX}-`);
}

/** Case-insensitive "contains" used by both searchable drop-downs. */
export function matchesSearch(haystack: readonly string[], query: string): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  return haystack.some((value) => value.toLocaleLowerCase().includes(needle));
}
