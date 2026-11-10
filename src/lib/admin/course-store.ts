import type { AdminCourse, AdminCourseFilters, CourseAuditEntry } from "@/types/admin-courses";

/*
 * Where courses are read and changed for administrators.
 *
 * NO DATABASE IS CONFIGURED YET, so `getAdminCourseStore` returns null and
 * course management can't change anything on the live site. When courses
 * live in a database, implement this against it:
 *
 *  - `listCourses` searches, filters and pages on the server, so the
 *    browser never receives every course.
 *  - `saveCourse` and `appendAudit` run together in one transaction, so a
 *    status or price change is never recorded without its audit entry.
 *  - `loadForAction` re-reads the course at the moment of the action, so a
 *    stale page can't approve a course twice or skip the publishing checks.
 *  - Only published courses are returned by the public catalogue queries in
 *    src/lib/courses.ts; unpublished material is never served to students.
 *  - Unpublishing changes the course's status only. Enrolments, payments,
 *    progress and certificates are left exactly as they are.
 *  - A price change applies to future purchases only. Payment records keep
 *    the price that was paid, and affiliate commissions already earned from
 *    past sales are never recalculated.
 *  - The audit log is readable by administrators only.
 *  - Instructors are told the decision through their own dashboard. Emails
 *    or notifications are sent only once a real notification service exists.
 */
export type AdminCourseStore = {
  listCourses(filters: AdminCourseFilters, page: number, pageSize: number): Promise<{ courses: AdminCourse[]; total: number }>;
  /** Counts for the summary cards, worked out by the database. */
  summary(): Promise<{ total: number; published: number; pending: number; draft: number; rejected: number; unpublished: number }>;
  pendingCourses(): Promise<AdminCourse[]>;
  /** One course, with its curriculum and materials, for the review page. */
  getCourse(courseId: string): Promise<AdminCourse | null>;
  /** The course as it is right now, read inside the same transaction as the write. */
  loadForAction(courseId: string): Promise<AdminCourse | null>;
  saveCourse(course: AdminCourse): Promise<void>;
  appendAudit(entry: CourseAuditEntry): Promise<void>;
};

export function getAdminCourseStore(): AdminCourseStore | null {
  return null;
}
