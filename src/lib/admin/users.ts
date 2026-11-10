import type { Role } from "@/lib/auth/session";
import type { AuditAction, AuditEntry, ManagedUser, UserFilters } from "@/types/admin-users";

/*
 * User-management rules. They run on the server for every action (and in
 * the development preview, on sample data). Covered by users.test.ts.
 *
 *  - Only active administrators can act.
 *  - Instructor access comes only from approving an application.
 *  - Administrator access can't be given from this screen at all, and an
 *    administrator can't suspend or demote themselves.
 *  - The last active administrator can never be suspended or demoted.
 *  - Suspending never deletes anything: purchases, progress and
 *    certificates are kept, and reactivating restores exactly the roles the
 *    account still has.
 */

export type Actor = { id: string };

export type ActionResult =
  | { ok: true; users: ManagedUser[]; audit: AuditEntry; message: string }
  | { ok: false; message: string };

// ── Search and filters ───────────────────────────────────────────────────

export function filterUsers(users: readonly ManagedUser[], filters: UserFilters): ManagedUser[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return users.filter((user) => {
    if (query && !user.fullName.toLocaleLowerCase().includes(query) && !user.email.toLocaleLowerCase().includes(query)) {
      return false;
    }
    if (filters.role !== "all" && primaryRole(user) !== filters.role) return false;
    if (filters.status !== "all" && user.status !== filters.status) return false;
    if (filters.application !== "all" && user.application?.status !== filters.application) return false;
    return true;
  });
}

/** The role shown in the table: the highest one the account has. */
export function primaryRole(user: Pick<ManagedUser, "roles">): Role {
  if (user.roles.includes("admin")) return "admin";
  if (user.roles.includes("instructor")) return "instructor";
  return "student";
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  return { items: items.slice((current - 1) * pageSize, current * pageSize), page: current, pageCount, total: items.length };
}

export function summariseUsers(users: readonly ManagedUser[]) {
  return {
    total: users.length,
    activeStudents: users.filter((user) => user.status === "active" && primaryRole(user) === "student").length,
    activeInstructors: users.filter((user) => user.status === "active" && user.roles.includes("instructor")).length,
    suspended: users.filter((user) => user.status === "suspended").length,
  };
}

export function pendingApplications(users: readonly ManagedUser[]): ManagedUser[] {
  return users
    .filter((user) => user.application?.status === "pending")
    .sort((a, b) => a.application!.appliedAt.localeCompare(b.application!.appliedAt));
}

// ── Actions ──────────────────────────────────────────────────────────────

export function approveApplication(users: readonly ManagedUser[], actor: Actor, userId: string, now = new Date()): ActionResult {
  const check = checkActor(users, actor);
  if (check) return check;
  const user = users.find((item) => item.id === userId);
  if (!user?.application) return fail("We couldn't find that application.");
  if (user.application.status !== "pending") return fail("This application has already been reviewed.");
  if (user.status !== "active") return fail("Please reactivate this account before approving the application.");

  const updated: ManagedUser = {
    ...user,
    roles: addRole(user.roles, "instructor"),
    application: { ...user.application, status: "approved", reviewedAt: now.toISOString(), rejectionReason: null },
  };
  return done(users, updated, audit(actor, user, "instructor-approved", "pending", "approved", now), `${user.fullName} has been approved as an instructor.`);
}

export function rejectApplication(
  users: readonly ManagedUser[],
  actor: Actor,
  userId: string,
  reason: string,
  now = new Date(),
): ActionResult {
  const check = checkActor(users, actor);
  if (check) return check;
  const user = users.find((item) => item.id === userId);
  if (!user?.application) return fail("We couldn't find that application.");
  if (user.application.status !== "pending") return fail("This application has already been reviewed.");

  const cleanReason = reason.trim().slice(0, 500) || null;
  const updated: ManagedUser = {
    ...user,
    application: { ...user.application, status: "rejected", reviewedAt: now.toISOString(), rejectionReason: cleanReason },
  };
  return done(
    users,
    updated,
    { ...audit(actor, user, "instructor-rejected", "pending", "rejected", now), reason: cleanReason },
    `${user.fullName}'s instructor application has been rejected.`,
  );
}

export function suspendUser(users: readonly ManagedUser[], actor: Actor, userId: string, reason: string, now = new Date()): ActionResult {
  const check = checkActor(users, actor);
  if (check) return check;
  const user = users.find((item) => item.id === userId);
  if (!user) return fail("We couldn't find that account.");
  if (user.id === actor.id) return fail("You can't suspend your own account.");
  if (user.status === "suspended") return fail("This account is already suspended.");
  if (user.roles.includes("admin") && activeAdminCount(users) <= 1) {
    return fail("This is the only active administrator, so the account can't be suspended.");
  }

  const cleanReason = reason.trim().slice(0, 500) || null;
  return done(
    users,
    { ...user, status: "suspended" },
    { ...audit(actor, user, "account-suspended", "active", "suspended", now), reason: cleanReason },
    `${user.fullName}'s account has been suspended.`,
  );
}

export function reactivateUser(users: readonly ManagedUser[], actor: Actor, userId: string, now = new Date()): ActionResult {
  const check = checkActor(users, actor);
  if (check) return check;
  const user = users.find((item) => item.id === userId);
  if (!user) return fail("We couldn't find that account.");
  if (user.status !== "suspended") return fail("This account is already active.");

  // Roles are left exactly as they are: anything removed separately stays removed.
  return done(
    users,
    { ...user, status: "active" },
    audit(actor, user, "account-reactivated", "suspended", "active", now),
    `${user.fullName}'s account has been reactivated.`,
  );
}

/**
 * The only role changes allowed here are removals. Instructor access is
 * given by approving an application; administrator access only through the
 * platform owner's own process, never from this screen.
 */
export function removeRole(
  users: readonly ManagedUser[],
  actor: Actor,
  userId: string,
  role: Exclude<Role, "student">,
  now = new Date(),
): ActionResult {
  const check = checkActor(users, actor);
  if (check) return check;
  const user = users.find((item) => item.id === userId);
  if (!user) return fail("We couldn't find that account.");
  if (!user.roles.includes(role)) return fail("This account doesn't have that role.");
  if (role === "admin") {
    if (user.id === actor.id) return fail("You can't remove your own administrator access.");
    if (user.status === "active" && activeAdminCount(users) <= 1) {
      return fail("This is the only active administrator, so their access can't be removed.");
    }
  }

  const roles = user.roles.filter((item) => item !== role);
  return done(
    users,
    { ...user, roles },
    audit(actor, user, "role-removed", user.roles.join(", "), roles.join(", "), now),
    role === "admin"
      ? `${user.fullName} is no longer an administrator.`
      : `${user.fullName} is no longer an instructor. Their courses and students are kept.`,
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function checkActor(users: readonly ManagedUser[], actor: Actor): ActionResult | null {
  const me = users.find((user) => user.id === actor.id);
  if (!me || me.status !== "active" || !me.roles.includes("admin")) {
    return fail("Only an active administrator can do this.");
  }
  return null;
}

function activeAdminCount(users: readonly ManagedUser[]): number {
  return users.filter((user) => user.status === "active" && user.roles.includes("admin")).length;
}

function addRole(roles: readonly Role[], role: Role): Role[] {
  return roles.includes(role) ? [...roles] : [...roles, role];
}

function fail(message: string): ActionResult {
  return { ok: false, message };
}

function done(users: readonly ManagedUser[], updated: ManagedUser, entry: AuditEntry, message: string): ActionResult {
  return { ok: true, users: users.map((user) => (user.id === updated.id ? updated : user)), audit: entry, message };
}

function audit(actor: Actor, user: ManagedUser, action: AuditAction, previousValue: string, newValue: string, now: Date): AuditEntry {
  return { adminId: actor.id, targetUserId: user.id, action, previousValue, newValue, at: now.toISOString(), reason: null };
}
