/*
 * Enrolments as administrators see them (Step 12D.1: viewing only).
 *
 * This shape joins three things a database would keep apart: the enrolment
 * record (src/types/payments.ts), the student account and the course. It
 * carries only what an administrator needs to identify and support a
 * student — never passwords, card details or payment references.
 */

export const ENROLMENT_TYPES = ["free", "paid", "referral", "grant"] as const;

export type AdminEnrolmentType = (typeof ENROLMENT_TYPES)[number];

/**
 * The status an administrator sees. "completed" isn't stored: it's worked
 * out from the student's progress, so the table can never disagree with the
 * learning records.
 */
export const ENROLMENT_STATUSES = ["active", "completed", "revoked"] as const;

export type AdminEnrolmentStatus = (typeof ENROLMENT_STATUSES)[number];

export type AdminEnrolment = {
  /** Stable row id: one enrolment per student and course. */
  id: string;
  studentId: string;
  studentName: string;
  /** Shown so administrators can tell two students with the same name apart. */
  studentEmail: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  enrolledAt: string;
  type: AdminEnrolmentType;
  status: AdminEnrolmentStatus;
  completedLessons: number;
  totalLessons: number;
  /** Whole number from 0 to 100, worked out from the two counts above. */
  progress: number;
  /**
   * The enrolment's history of administrative changes. These are kept
   * after an enrolment is reactivated (Step 12D.4), never cleared, so the
   * record always shows what happened to it.
   */
  revokedAt?: string | null;
  revocationReason?: string | null;
  /** Set when a revoked enrolment has been put back (Step 12D.4). */
  reactivatedAt?: string | null;
};

export type EnrolmentCourseOption = { id: string; title: string };

export type EnrolmentStatusFilter = "all" | AdminEnrolmentStatus;
export type EnrolmentTypeFilter = "all" | AdminEnrolmentType;

export type EnrolmentFilters = {
  query: string;
  /** A course id, or "all". */
  course: string;
  status: EnrolmentStatusFilter;
  type: EnrolmentTypeFilter;
};

export const NO_ENROLMENT_FILTERS: EnrolmentFilters = { query: "", course: "all", status: "all", type: "all" };

export type EnrolmentSummary = {
  total: number;
  active: number;
  completed: number;
  revoked: number;
};

/*
 * Step 12D.2: manual enrolment (frontend demonstration only).
 *
 * An administrator picks an existing student and an existing course and the
 * browser adds a record to the list it is already holding. Nothing is sent
 * anywhere: there is no server action, no database write and no course
 * access granted.
 */

/** A student an administrator can pick in the "Enrol a Student" dialog. */
export type EnrolmentStudentOption = { id: string; fullName: string; email: string };

/** A course an administrator can pick, with the lesson total the record needs. */
export type EnrolmentCourseChoice = { id: string; slug: string; title: string; totalLessons: number };

/** What the dialog collects before anything is validated. */
export type ManualEnrolmentDraft = { studentId: string; courseId: string; reason: string };

export const EMPTY_MANUAL_ENROLMENT: ManualEnrolmentDraft = { studentId: "", courseId: "", reason: "" };

/** One message per field, keyed by the field it belongs under. */
export type ManualEnrolmentErrors = Partial<Record<"studentId" | "courseId", string>>;

/*
 * Step 12D.3: revoking an enrolment (frontend demonstration only).
 *
 * Revoking marks a record; it never deletes one. Progress, certificates
 * and payment records are left exactly as they were, and no real course
 * access is withdrawn — there is no access control to withdraw it from.
 */

/** Why and when an enrolment was revoked. */
export type EnrolmentRevocation = { reason: string; revokedAt: string };

/**
 * What an administrator has done to one enrolment, kept against its id so
 * a sample row can be changed without the sample data being rewritten.
 *
 * The last revocation stays here after a reactivation (Step 12D.4): the
 * history is what makes the current status explicable, so it is never
 * thrown away.
 */
export type EnrolmentStatusChange = {
  revocation: EnrolmentRevocation | null;
  /** When the revocation above was undone, or null while it still stands. */
  reactivatedAt: string | null;
};

export type StatusChangesById = Record<string, EnrolmentStatusChange>;
