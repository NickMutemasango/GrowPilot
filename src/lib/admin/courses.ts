import { MAX_PRICE_USD, parsePrice } from "../instructor/course-draft.ts";
import type {
  AdminCourse,
  AdminCourseFilters,
  AdminCourseLesson,
  AdminCourseStatus,
  CourseAuditAction,
  CourseAuditEntry,
} from "@/types/admin-courses";
import { getCategoryLabel } from "../../types/course.ts";

/*
 * Course approval rules. They run on the server for every action (and in
 * the development preview, on sample data). Covered by courses.test.ts.
 *
 *  - Only a course the instructor submitted can be approved or rejected.
 *  - An instructor can never approve their own course.
 *  - A course is published only when every publishing requirement is met.
 *  - A rejection always carries a reason, kept for the instructor.
 *  - Unpublishing needs a reason and never deletes enrolments, payments,
 *    progress or certificates.
 *  - Price changes apply to future purchases only; past payments and the
 *    commissions already earned from them are never recalculated.
 *  - Nothing here ever deletes a course.
 */

export type Actor = { id: string };

export type CourseActionResult =
  | { ok: true; courses: AdminCourse[]; course: AdminCourse; audit: CourseAuditEntry; message: string }
  | { ok: false; message: string };

export const courseStatusLabels: Record<AdminCourseStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  published: "Published",
  rejected: "Rejected",
  unpublished: "Unpublished",
};

// ── Search, filters and summaries ────────────────────────────────────────

export function filterCourses(courses: readonly AdminCourse[], filters: AdminCourseFilters): AdminCourse[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return courses.filter((course) => {
    if (query) {
      const haystack = [course.title, course.instructorName, course.category ? getCategoryLabel(course.category) : ""]
        .join(" ")
        .toLocaleLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.status !== "all" && course.status !== filters.status) return false;
    if (filters.category !== "all" && course.category !== filters.category) return false;
    if (filters.pricing === "free" && course.priceUsd !== null) return false;
    if (filters.pricing === "paid" && course.priceUsd === null) return false;
    return true;
  });
}

export function summariseCourses(courses: readonly AdminCourse[]) {
  const count = (status: AdminCourseStatus) => courses.filter((course) => course.status === status).length;
  return {
    total: courses.length,
    published: count("published"),
    pending: count("pending_review"),
    draft: count("draft"),
    rejected: count("rejected"),
    unpublished: count("unpublished"),
  };
}

/** Courses waiting for a decision, oldest submission first. */
export function pendingCourses(courses: readonly AdminCourse[]): AdminCourse[] {
  return courses
    .filter((course) => course.status === "pending_review")
    .sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""));
}

// ── Publishing requirements ──────────────────────────────────────────────

/** A lesson counts as complete when students would actually have something to learn from. */
export function isLessonComplete(lesson: AdminCourseLesson): boolean {
  const hasContent = lesson.notes.trim().length > 0 || lesson.materials.length > 0;
  return lesson.title.trim().length > 0 && lesson.minutes > 0 && hasContent;
}

/**
 * Everything missing before a course may go live, in plain English. An
 * empty list means the course meets the minimum publishing requirements.
 */
export function publishingProblems(course: AdminCourse): string[] {
  const problems: string[] = [];
  if (!course.title.trim()) problems.push("The course needs a title.");
  if (!course.shortDescription.trim() || !course.description.trim()) {
    problems.push("The course needs a short description and a full description.");
  }
  if (!course.category) problems.push("The course needs a category.");
  if (course.priceUsd !== null && !(course.priceUsd > 0 && course.priceUsd <= MAX_PRICE_USD)) {
    problems.push(`The price must be Free, or between $1 and $${MAX_PRICE_USD}.`);
  }
  if (course.modules.length === 0) problems.push("The course needs at least one module.");

  const lessons = course.modules.flatMap((courseModule) => courseModule.lessons);
  if (lessons.length === 0) problems.push("The course needs at least one lesson.");
  else if (!lessons.some(isLessonComplete)) {
    problems.push("At least one lesson needs a title, a length, and either written notes or uploaded material.");
  }
  course.modules.forEach((courseModule, index) => {
    if (courseModule.lessons.length === 0) {
      problems.push(`Module ${index + 1} ("${courseModule.title || "Untitled"}") has no lessons.`);
    }
  });
  return problems;
}

export function meetsPublishingRequirements(course: AdminCourse): boolean {
  return publishingProblems(course).length === 0;
}

// ── Actions ──────────────────────────────────────────────────────────────

/**
 * Approve a submitted course, or put an unpublished one back in the
 * catalogue. Publishing an already published course is refused, so a
 * second click can never approve twice.
 */
export function approveCourse(
  courses: readonly AdminCourse[],
  actor: Actor,
  courseId: string,
  now = new Date(),
): CourseActionResult {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return fail("We couldn't find that course.");
  const own = checkNotOwnCourse(actor, course);
  if (own) return own;
  if (course.status === "published") return fail("This course is already published.");
  if (course.status !== "pending_review" && course.status !== "unpublished") {
    return fail("Only a course the instructor has submitted for review can be approved.");
  }

  const problems = publishingProblems(course);
  if (problems.length > 0) return fail(`This course can't be published yet. ${problems[0]}`);

  const republished = course.status === "unpublished";
  const updated: AdminCourse = {
    ...course,
    status: "published",
    reviewedAt: now.toISOString(),
    reviewedBy: actor.id,
    reviewFeedback: null,
    unpublishedAt: null,
    unpublishReason: null,
  };
  return done(
    courses,
    updated,
    audit(actor, course, republished ? "course-republished" : "course-approved", course.status, "published", now, null),
    `${course.title} is now published and available to students.`,
  );
}

/** Send a submitted course back to its instructor with feedback. Never deletes it. */
export function rejectCourse(
  courses: readonly AdminCourse[],
  actor: Actor,
  courseId: string,
  reason: string,
  now = new Date(),
): CourseActionResult {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return fail("We couldn't find that course.");
  const own = checkNotOwnCourse(actor, course);
  if (own) return own;
  if (course.status !== "pending_review") {
    return fail("Only a course waiting for review can be returned to its instructor.");
  }

  const cleanReason = cleanText(reason);
  if (!cleanReason) return fail("Please explain what needs improving, so the instructor knows what to change.");

  const updated: AdminCourse = {
    ...course,
    status: "rejected",
    reviewedAt: now.toISOString(),
    reviewedBy: actor.id,
    reviewFeedback: cleanReason,
  };
  return done(
    courses,
    updated,
    audit(actor, course, "course-rejected", course.status, "rejected", now, cleanReason),
    `${course.title} has been returned to ${course.instructorName} for improvements.`,
  );
}

/**
 * Take a published course out of the catalogue. Students who already
 * enrolled keep their access, progress and certificates; only new
 * discovery and new purchases stop.
 */
export function unpublishCourse(
  courses: readonly AdminCourse[],
  actor: Actor,
  courseId: string,
  reason: string,
  now = new Date(),
): CourseActionResult {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return fail("We couldn't find that course.");
  if (course.status !== "published") return fail("Only a published course can be unpublished.");

  const cleanReason = cleanText(reason);
  if (!cleanReason) return fail("Please give a reason for unpublishing this course.");

  const updated: AdminCourse = {
    ...course,
    status: "unpublished",
    unpublishedAt: now.toISOString(),
    unpublishReason: cleanReason,
    reviewedAt: now.toISOString(),
    reviewedBy: actor.id,
  };
  return done(
    courses,
    updated,
    audit(actor, course, "course-unpublished", "published", "unpublished", now, cleanReason),
    `${course.title} has been removed from the course catalogue. Enrolled students keep their access.`,
  );
}

export type PriceChange = { free: true } | { free: false; amount: string };

/**
 * Change what a course costs from now on. Past payments keep the price
 * that was paid, and commissions already earned are never recalculated.
 */
export function changeCoursePrice(
  courses: readonly AdminCourse[],
  actor: Actor,
  courseId: string,
  change: PriceChange,
  now = new Date(),
): CourseActionResult {
  const course = courses.find((item) => item.id === courseId);
  if (!course) return fail("We couldn't find that course.");

  let priceUsd: number | null;
  if (change.free) {
    priceUsd = null;
  } else {
    const parsed = parsePrice(change.amount);
    if (parsed === null) {
      return fail(
        `Please enter a price between $1 and $${MAX_PRICE_USD}, for example 29 or 29.99. Negative amounts aren't allowed.`,
      );
    }
    priceUsd = parsed;
  }
  if (priceUsd === course.priceUsd) return fail("That is already this course's price, so nothing was changed.");

  const previous = formatCoursePrice(course.priceUsd, course.currency);
  const next = formatCoursePrice(priceUsd, course.currency);
  return done(
    courses,
    { ...course, priceUsd },
    audit(actor, course, "course-price-changed", previous, next, now, null),
    `${course.title} now costs ${next}. Students who already paid keep the price they paid.`,
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

/** 29 → "$29", null → "Free". */
export function formatCoursePrice(priceUsd: number | null, currency: "USD" = "USD"): string {
  if (priceUsd === null) return "Free";
  const amount = Number.isInteger(priceUsd) ? String(priceUsd) : priceUsd.toFixed(2);
  return currency === "USD" ? `$${amount}` : `${amount} ${currency}`;
}

function checkNotOwnCourse(actor: Actor, course: AdminCourse): CourseActionResult | null {
  return actor.id === course.instructorId
    ? fail("You can't review your own course. Please ask another administrator.")
    : null;
}

function cleanText(value: string): string {
  return value.trim().slice(0, 500);
}

function fail(message: string): CourseActionResult {
  return { ok: false, message };
}

function done(
  courses: readonly AdminCourse[],
  updated: AdminCourse,
  entry: CourseAuditEntry,
  message: string,
): CourseActionResult {
  return {
    ok: true,
    courses: courses.map((course) => (course.id === updated.id ? updated : course)),
    course: updated,
    audit: entry,
    message,
  };
}

function audit(
  actor: Actor,
  course: AdminCourse,
  action: CourseAuditAction,
  previousValue: string,
  newValue: string,
  now: Date,
  reason: string | null,
): CourseAuditEntry {
  return { adminId: actor.id, courseId: course.id, action, previousValue, newValue, at: now.toISOString(), reason };
}
