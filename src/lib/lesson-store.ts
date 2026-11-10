import type { LessonContent } from "@/types/learning";

/*
 * Where lesson content lives, and who is allowed to open it.
 *
 * NO DATABASE, VIDEO HOST OR ENROLMENT CHECK IS CONFIGURED YET, so
 * `getLessonStore` returns null and no lesson can be opened: /learn/...
 * shows "lesson not found". That is deliberate — without a store there is
 * no way to tell whether the person asking has paid for the course.
 *
 * When lessons live in a database, implement this against it:
 *
 *  - `canOpen` is the access check, and it runs on the server for every
 *    lesson request. Return true only for a student the database shows as
 *    enrolled and not revoked, or for a course that is genuinely free to
 *    all. Never decide this in the browser, and never trust a course's
 *    price alone once coupons or revocations exist.
 *  - `findContent` returns the lesson bodies for one course, keyed by
 *    lesson slug (the slug is derived from the title: see lessonSlug in
 *    ./learning.ts, which must keep matching however they are stored).
 *  - `listOpenCourseSlugs` lists the courses whose lessons can be built
 *    ahead of time. Return only courses that are open to everyone; a
 *    course that needs an enrolment must never be pre-rendered, or its
 *    content would be served to people who have not paid.
 *  - Video URLs should be short-lived signed links produced here, not
 *    permanent addresses stored with the lesson.
 */
export type LessonStore = {
  canOpen(input: { courseSlug: string; studentId: string | null }): Promise<boolean>;
  findContent(courseSlug: string): Promise<Record<string, LessonContent> | null>;
  listOpenCourseSlugs(): Promise<string[]>;
};

export function getLessonStore(): LessonStore | null {
  return null;
}
