import { redirect } from "next/navigation";
import { getCurrentStudent, loginHref } from "@/lib/auth/session";
import { getAllCourses, getCourseDetails } from "@/lib/courses";
import type { Instructor } from "@/types/course";
import type { CourseDraft, InstructorStudentRow } from "@/types/instructor";
import { draftFromCourse } from "./course-draft";

/*
 * The instructor area's data and access checks. Server-only.
 *
 * NO SIGN-IN, DATABASE OR FILE STORAGE IS CONFIGURED YET, so every
 * instructor page sends visitors to log in. That is the right behaviour
 * until roles exist: an instructor area that opens without a check is one
 * anybody can publish courses from.
 *
 * To make it real: give accounts a role (student / instructor / admin) on
 * the server, store courses with their owner's ID, and check ownership in
 * every function below and in ./actions, as `requireInstructor` and
 * `getOwnedCourse` already do.
 */

export type InstructorContext = { instructor: Instructor };

/** The signed-in instructor. Sends everyone else away: to log in, or to their student dashboard. */
export async function requireInstructor(next: string): Promise<InstructorContext> {
  const user = await getCurrentStudent();
  if (!user) redirect(loginHref(next));
  if (!user.roles.includes("instructor")) redirect("/dashboard");
  return { instructor: { id: user.id, name: user.fullName, title: "", bio: "" } };
}

/** Courses this instructor owns, as editable drafts. Never anyone else's. */
export async function getOwnedCourses(instructorId: string): Promise<CourseDraft[]> {
  const courses = (await getAllCourses()).filter((course) => course.instructor.id === instructorId);
  return Promise.all(courses.map(async (course) => draftFromCourse(course, await getCourseDetails(course.slug))));
}

/** One course for editing, only if this instructor owns it. */
export async function getOwnedCourse(courseId: string, instructorId: string): Promise<CourseDraft | null> {
  return (await getOwnedCourses(instructorId)).find((course) => course.id === courseId) ?? null;
}

/** Students in this instructor's courses, with only what the instructor needs to see. */
export async function getInstructorStudents(context: InstructorContext): Promise<InstructorStudentRow[]> {
  // Enrolments need the database: see src/lib/payments/store.ts. Until then
  // there is nobody to list, and the page says so.
  void context;
  return [];
}

/** Enrolled students per course ID. */
export async function getEnrolmentCounts(context: InstructorContext): Promise<Record<string, number>> {
  const rows = await getInstructorStudents(context);
  const courses = await getOwnedCourses(context.instructor.id);
  return Object.fromEntries(
    courses.map((course) => [course.id, rows.filter((row) => row.courseTitle === course.title).length]),
  );
}

/** Course ID → public address, for "View Course". Only published courses have one. */
export async function getPublicSlugs(): Promise<Record<string, string>> {
  return Object.fromEntries((await getAllCourses()).map((course) => [course.id, course.slug]));
}
