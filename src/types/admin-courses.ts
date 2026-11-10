import type { CourseCategoryId, CourseLevel, LessonType } from "./course";

/*
 * Courses as administrators review and manage them. This is the only shape
 * that carries a course's review history (who decided, when, and why), so
 * nothing about a decision is ever invented in the interface.
 *
 * Unpublished course material must never be served to students: only the
 * admin pages read this type, and only on the server.
 */

export const ADMIN_COURSE_STATUSES = ["draft", "pending_review", "published", "rejected", "unpublished"] as const;

export type AdminCourseStatus = (typeof ADMIN_COURSE_STATUSES)[number];

export type ReviewMaterialKind = "video" | "pdf" | "notes" | "other";

/** A file an instructor attached to a lesson. Only its name and kind, never its contents. */
export type ReviewMaterial = {
  name: string;
  kind: ReviewMaterialKind;
  /** Storage URL once uploaded; null while no file storage is configured. */
  url: string | null;
};

export type AdminCourseLesson = {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  minutes: number;
  /** The instructor's written notes for the lesson. */
  notes: string;
  materials: ReviewMaterial[];
};

export type AdminCourseModule = {
  id: string;
  title: string;
  description: string;
  lessons: AdminCourseLesson[];
};

/** Read-only enrolment figures. Detailed enrolment management comes in Step 12D. */
export type CourseEnrolmentStats = {
  enrolled: number;
  inProgress: number;
  completed: number;
  /** Whole percent of enrolled students who finished the course. */
  completionPercent: number;
};

export type AdminCourse = {
  id: string;
  title: string;
  /** Public address, once the course has been published at least once. */
  slug: string | null;
  instructorId: string;
  instructorName: string;
  instructorTitle: string;
  category: CourseCategoryId | "";
  level: CourseLevel | "";
  /** Human-readable length, e.g. "4 weeks". */
  duration: string;
  shortDescription: string;
  description: string;
  thumbnailUrl: string | null;
  thumbnailAlt: string;
  /** Price in the currency below; null means the course is free. */
  priceUsd: number | null;
  currency: "USD";
  status: AdminCourseStatus;
  /** When the instructor last sent it for review. */
  submittedAt: string | null;
  reviewedAt: string | null;
  /** The administrator who made the last decision. */
  reviewedBy: string | null;
  /** Feedback shown to the instructor after a rejection. */
  reviewFeedback: string | null;
  unpublishedAt: string | null;
  unpublishReason: string | null;
  modules: AdminCourseModule[];
  /** null when enrolment records aren't available. */
  enrolment: CourseEnrolmentStats | null;
};

export type CourseStatusFilter = "all" | AdminCourseStatus;
export type CoursePricingFilter = "all" | "free" | "paid";
export type CourseCategoryFilter = "all" | CourseCategoryId;

export type AdminCourseFilters = {
  query: string;
  status: CourseStatusFilter;
  category: CourseCategoryFilter;
  pricing: CoursePricingFilter;
};

export const NO_COURSE_FILTERS: AdminCourseFilters = { query: "", status: "all", category: "all", pricing: "all" };

export type CourseAuditAction =
  | "course-approved"
  | "course-republished"
  | "course-rejected"
  | "course-unpublished"
  | "course-price-changed";

/** One administrative action on a course, as the audit log would store it. */
export type CourseAuditEntry = {
  adminId: string;
  courseId: string;
  action: CourseAuditAction;
  previousValue: string;
  newValue: string;
  at: string;
  reason: string | null;
};
