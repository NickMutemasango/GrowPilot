import type { Role } from "@/lib/auth/session";

/*
 * Accounts as administrators see them. Never includes passwords, sign-in
 * tokens or payment details. Account status (can they sign in?) is kept
 * separate from an instructor application's status.
 */

export type AccountStatus = "active" | "suspended";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type InstructorApplication = {
  status: ApplicationStatus;
  title: string;
  bio: string;
  expertise: string[];
  appliedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
};

export type ManagedUser = {
  id: string;
  fullName: string;
  email: string;
  /** Every account has "student"; "instructor" and "admin" are added. */
  roles: Role[];
  status: AccountStatus;
  joinedAt: string;
  enrolledCourses: number;
  completedCourses: number;
  application: InstructorApplication | null;
  createdCourses: number;
  publishedCourses: number;
};

export type AuditAction =
  | "instructor-approved"
  | "instructor-rejected"
  | "account-suspended"
  | "account-reactivated"
  | "role-removed";

/** One administrative action, as the audit log would store it. */
export type AuditEntry = {
  adminId: string;
  targetUserId: string;
  action: AuditAction;
  previousValue: string;
  newValue: string;
  at: string;
  reason: string | null;
};

export type RoleFilter = "all" | Role;
export type StatusFilter = "all" | AccountStatus;
export type ApplicationFilter = "all" | ApplicationStatus;

export type UserFilters = {
  query: string;
  role: RoleFilter;
  status: StatusFilter;
  application: ApplicationFilter;
};
