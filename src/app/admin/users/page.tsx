import type { Metadata } from "next";
import { DatabaseZap } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { UserManagement } from "@/components/admin/users/UserManagement";
import { requireAdmin } from "@/lib/admin/service";
import { getUserStore } from "@/lib/admin/user-store";
import { getCurrentStudent } from "@/lib/auth/session";
import type { UserFilters } from "@/types/admin-users";

export const metadata: Metadata = { title: "Users" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const PAGE_SIZE = 10;

/** /admin/users: administrators only, checked on the server (and again by the admin layout). */
export default async function AdminUsersPage({ searchParams }: Props) {
  await requireAdmin("/admin/users");

  const store = getUserStore();
  const me = await getCurrentStudent();
  if (!store || !me) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">User Management</h1>
        <AdminEmptyState icon={DatabaseZap} title="User accounts aren't connected yet">
          User management will work once sign-in and the database are set up.
        </AdminEmptyState>
      </div>
    );
  }

  // Search, filters and paging all happen in the database, never in the browser.
  const params = await searchParams;
  const one = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]) ?? "";
  const pick = <T extends string>(value: string, allowed: readonly T[], fallback: T): T => (allowed.includes(value as T) ? (value as T) : fallback);
  const filters: UserFilters = {
    query: one("q").slice(0, 100),
    role: pick(one("role"), ["all", "student", "instructor", "admin"], "all"),
    status: pick(one("status"), ["all", "active", "suspended"], "all"),
    application: pick(one("application"), ["all", "pending", "approved", "rejected"], "all"),
  };
  const page = Math.max(1, Number.parseInt(one("page"), 10) || 1);
  const [{ users, total }, summary, pending] = await Promise.all([
    store.listUsers(filters, page, PAGE_SIZE),
    store.summary(),
    store.pendingApplications(),
  ]);

  return <UserManagement users={users} actorId={me.id} live={{ total, page, filters, summary, pending }} />;
}
