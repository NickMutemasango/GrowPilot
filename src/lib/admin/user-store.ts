import type { AuditEntry, ManagedUser, UserFilters } from "@/types/admin-users";

/*
 * Where accounts are read and changed for administrators.
 *
 * NO DATABASE OR SIGN-IN PROVIDER IS CONFIGURED YET, so `getUserStore`
 * returns null and user management can't change anything on the live
 * site. When accounts exist, implement this against the same database:
 *
 *  - `listUsers` filters, searches and pages on the server, so the browser
 *    never receives every account.
 *  - `saveUser` and `appendAudit` run together in one transaction.
 *  - Suspended accounts are refused on every protected request (check the
 *    status in getCurrentStudent), and their sessions are ended.
 *  - The audit log is readable by administrators only.
 *  - Notifications (approved, rejected, suspended, reactivated) are sent
 *    only once a real email or notification service exists.
 */
export type UserStore = {
  listUsers(filters: UserFilters, page: number, pageSize: number): Promise<{ users: ManagedUser[]; total: number }>;
  /** Counts for the summary cards, worked out by the database. */
  summary(): Promise<{ total: number; activeStudents: number; activeInstructors: number; suspended: number }>;
  pendingApplications(): Promise<ManagedUser[]>;
  /** Everything the rules need to check an action (for example, how many active administrators there are). */
  loadForAction(userIds: string[]): Promise<ManagedUser[]>;
  saveUser(user: ManagedUser): Promise<void>;
  appendAudit(entry: AuditEntry): Promise<void>;
};

export function getUserStore(): UserStore | null {
  return null;
}
