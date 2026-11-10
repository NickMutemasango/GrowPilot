import type { CourseCategoryId, CourseLevel, LessonType } from "./course";

/*
 * Courses as instructors edit them. A course being edited is a "draft"
 * version; the version students see only changes once an administrator
 * approves it (Step 12).
 */

/**
 * The editable version's state. Instructors can only ever set "draft" or
 * "pending_review"; the other three are an administrator's decision
 * (Step 12C) and arrive from the server.
 */
export type CoursePublishStatus = "draft" | "pending_review" | "published" | "rejected" | "unpublished";

/** An administrator's last decision on a course, as the instructor sees it. */
export type CourseReviewDecision = {
  decidedAt: string;
  /** Why it was returned for improvements, or why it was unpublished. */
  feedback: string | null;
};

/** A chosen or uploaded file. Files never live in the app's code or in database records. */
export type DraftFile = {
  name: string;
  sizeBytes: number;
  mimeType: string;
  /** True only after the storage service confirms the upload. */
  uploaded: boolean;
  /** Storage URL once uploaded. A local preview link is never saved here. */
  url: string | null;
};

export type DraftLesson = {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  minutes: number;
  video: DraftFile | null;
  notes: string;
  materials: DraftFile[];
  /** True if students can already see this lesson, so removing it needs extra care. */
  live: boolean;
};

export type DraftModule = {
  id: string;
  title: string;
  description: string;
  lessons: DraftLesson[];
  live: boolean;
};

export type CourseDraft = {
  id: string;
  instructorId: string;
  status: CoursePublishStatus;
  /** True if an approved version is already in the catalogue. */
  hasLiveVersion: boolean;
  title: string;
  shortDescription: string;
  description: string;
  category: CourseCategoryId | "";
  level: CourseLevel | "";
  /** e.g. "4 weeks" */
  duration: string;
  thumbnail: DraftFile | null;
  isFree: boolean;
  /** As typed, e.g. "29" or "29.99"; checked before saving. */
  price: string;
  outcomes: string[];
  modules: DraftModule[];
  /** The last approval decision, so the instructor sees what was asked for. */
  review?: CourseReviewDecision | null;
  updatedAt: string;
};

export type InstructorProfile = {
  fullName: string;
  title: string;
  bio: string;
  expertise: string[];
  photo: DraftFile | null;
};

/** One row in the Students section: only what an instructor needs. */
export type InstructorStudentRow = {
  id: string;
  /** First name and initial only, e.g. "Grace T." */
  displayName: string;
  courseTitle: string;
  enrolledAt: string;
  completedLessons: number;
  totalLessons: number;
};
