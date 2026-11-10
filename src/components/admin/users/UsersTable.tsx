import { ChevronRight, SearchX } from "lucide-react";
import { formatCertificateDate } from "@/lib/certificates/format";
import { primaryRole } from "@/lib/admin/users";
import type { ManagedUser } from "@/types/admin-users";
import { AdminEmptyState } from "../AdminEmptyState";
import { AccountStatusBadge, RoleBadge } from "./badges";

type UsersTableProps = {
  users: ManagedUser[];
  onView: (user: ManagedUser) => void;
};

/** The list of accounts: a table on wide screens, simple cards on narrow ones. */
export function UsersTable({ users, onView }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <AdminEmptyState icon={SearchX} title="No Users Found">
        Try changing your search or filters.
      </AdminEmptyState>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface xl:block">
        <table className="w-full min-w-[56rem] text-left text-base">
          <thead className="bg-secondary/60 text-ink">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">User Name</th>
              <th scope="col" className="px-5 py-3 font-semibold">Email Address</th>
              <th scope="col" className="px-5 py-3 font-semibold">Role</th>
              <th scope="col" className="px-5 py-3 font-semibold">Status</th>
              <th scope="col" className="px-5 py-3 font-semibold">Joined</th>
              <th scope="col" className="px-5 py-3 font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-canvas">
                <th scope="row" className="px-5 py-3 font-semibold text-ink">{user.fullName}</th>
                <td className="px-5 py-3 break-all text-ink-muted">{user.email}</td>
                <td className="px-5 py-3"><RoleBadge role={primaryRole(user)} /></td>
                <td className="px-5 py-3"><AccountStatusBadge status={user.status} /></td>
                <td className="px-5 py-3 whitespace-nowrap text-ink">{formatCertificateDate(user.joinedAt)}</td>
                <td className="px-5 py-3 text-right">
                  <ViewButton user={user} onView={onView} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 xl:hidden">
        {users.map((user) => (
          <li key={user.id} className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-lg font-bold text-ink">{user.fullName}</p>
            <p className="text-base break-all text-ink-muted">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <RoleBadge role={primaryRole(user)} />
              <AccountStatusBadge status={user.status} />
            </div>
            <p className="mt-2 text-base text-ink-muted">Joined {formatCertificateDate(user.joinedAt)}</p>
            <div className="mt-3">
              <ViewButton user={user} onView={onView} full />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function ViewButton({ user, onView, full }: { user: ManagedUser; onView: (user: ManagedUser) => void; full?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onView(user)}
      className={`inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border-2 border-primary px-4 text-base font-semibold whitespace-nowrap text-primary hover:bg-secondary ${full ? "w-full" : ""}`}
    >
      View Details<span className="sr-only">: {user.fullName}</span>
      <ChevronRight aria-hidden="true" className="size-4" />
    </button>
  );
}
