"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Ban, ChevronLeft, ChevronRight, CircleCheck, GraduationCap, Info, Users } from "lucide-react";
import { userAction, type UserActionRequest } from "@/app/admin/users/actions";
import { Button } from "@/components/ui/Button";
import { pendingApplications, summariseUsers } from "@/lib/admin/users";
import type { ManagedUser, UserFilters } from "@/types/admin-users";
import { AdminStatsCard } from "../AdminStatsCard";
import { ConfirmDialog } from "./ConfirmDialog";
import { InstructorApplications } from "./InstructorApplications";
import { UserDetailsDialog } from "./UserDetailsDialog";
import { UserFiltersBar } from "./UserFiltersBar";
import { UsersTable } from "./UsersTable";

const PAGE_SIZE = 10;
const NO_FILTERS: UserFilters = { query: "", role: "all", status: "all", application: "all" };

type UserManagementProps = {
  users: ManagedUser[];
  actorId: string;
  /** Live mode only: totals and paging worked out on the server. */
  live?: { total: number; page: number; filters: UserFilters; summary: ReturnType<typeof summariseUsers>; pending: ManagedUser[] };
};

type Pending = { request: UserActionRequest; user: ManagedUser };
type Notice = { ok: boolean; text: string } | null;

/** "User Management": find, review and manage student and instructor accounts. */
export function UserManagement({ users: initialUsers, actorId, live }: UserManagementProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [filters, setFilters] = useState<UserFilters>(live?.filters ?? NO_FILTERS);
  const [page, setPage] = useState(live?.page ?? 1);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => setUsers(initialUsers), [initialUsers]);

  // Live mode: search and filters run on the server (the address changes), so only one page of accounts is ever sent.
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.query.trim()) params.set("q", filters.query.trim());
      for (const key of ["role", "status", "application"] as const) if (filters[key] !== "all") params.set(key, filters[key]);
      if (page > 1) params.set("page", String(page));
      router.replace(`/admin/users${params.size ? `?${params}` : ""}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, page, router]);

  const summary = live?.summary ?? summariseUsers(users);
  const applicants = live?.pending ?? pendingApplications(users);
  const shown = {
    items: users,
    page,
    pageCount: Math.max(1, Math.ceil((live?.total ?? 0) / PAGE_SIZE)),
    total: live?.total ?? 0,
  };
  const details = users.find((user) => user.id === detailsId) ?? null;

  const changeFilters = (next: UserFilters) => {
    setFilters(next);
    setPage(1);
  };

  const announce = (next: Notice) => {
    setNotice(next);
    requestAnimationFrame(() => noticeRef.current?.focus());
  };

  const run = async (base: UserActionRequest, reason: string) => {
    // Add the reason typed in the dialog to the actions that take one.
    const request: UserActionRequest = "reason" in base ? { ...base, reason } : base;
    setBusy(true);
    try {
      const result = await userAction(request);
      announce({ ok: result.ok, text: result.message });
      if (result.ok) router.refresh();
    } catch {
      announce({ ok: false, text: "Something went wrong and nothing was changed. Please try again." });
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">User Management</h1>
        <p className="mt-2 text-lg text-ink-muted">View and manage students and instructors across GrowPilot Academy.</p>
      </header>

      <div ref={noticeRef} tabIndex={-1} role="status" className="empty:hidden focus:outline-none">
        {notice && (
          <p className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-base ${notice.ok ? "border-primary bg-secondary text-primary-strong" : "border-[#f3c7c2] bg-[#FDECEA] text-[#9A3412]"}`}>
            {notice.ok ? <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" /> : <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />}
            {notice.text}
          </p>
        )}
      </div>

      <section aria-label="User totals" className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <h2 className="sr-only">User totals</h2>
        <AdminStatsCard icon={Users} title="Total Users" description="Every registered account." value={summary.total} source="live" />
        <AdminStatsCard icon={CircleCheck} title="Active Students" description="Students who can sign in." value={summary.activeStudents} source="live" />
        <AdminStatsCard icon={GraduationCap} title="Active Instructors" description="Approved and able to teach." value={summary.activeInstructors} source="live" />
        <AdminStatsCard icon={Ban} title="Suspended Accounts" description="Can't use protected features." value={summary.suspended} source="live" />
      </section>

      <InstructorApplications
        applicants={applicants}
        onApprove={(user) => setPending({ request: { kind: "approve", userId: user.id }, user })}
        onReject={(user) => setPending({ request: { kind: "reject", userId: user.id, reason: "" }, user })}
      />

      <section aria-labelledby="all-users-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="all-users-heading" className="text-2xl font-bold tracking-tight text-ink">
            All Users
          </h2>
          <p className="text-base text-ink-muted" aria-live="polite">
            {shown.total} {shown.total === 1 ? "user" : "users"} found
          </p>
        </div>
        <UserFiltersBar filters={filters} onChange={changeFilters} />
        <UsersTable users={shown.items} onView={(user) => setDetailsId(user.id)} />
        {shown.pageCount > 1 && (
          <nav aria-label="Pages" className="flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => setPage(shown.page - 1)} disabled={shown.page <= 1}>
              <ChevronLeft aria-hidden="true" className="size-5" />
              Previous
            </Button>
            <p className="text-base text-ink">
              Page {shown.page} of {shown.pageCount}
            </p>
            <Button variant="secondary" onClick={() => setPage(shown.page + 1)} disabled={shown.page >= shown.pageCount}>
              Next
              <ChevronRight aria-hidden="true" className="size-5" />
            </Button>
          </nav>
        )}
      </section>

      <UserDetailsDialog
        user={details}
        actorId={actorId}
        onClose={() => setDetailsId(null)}
        onSuspend={(user) => setPending({ request: { kind: "suspend", userId: user.id, reason: "" }, user })}
        onReactivate={(user) => setPending({ request: { kind: "reactivate", userId: user.id }, user })}
        onRemoveRole={(user, role) => setPending({ request: { kind: "remove-role", userId: user.id, role }, user })}
      />

      {pending && (
        <ConfirmDialog open busy={busy} onCancel={() => setPending(null)} onConfirm={(reason) => run(pending.request, reason)} {...confirmText(pending)} />
      )}
    </div>
  );
}

function confirmText({ request, user }: Pending): { title: string; children: React.ReactNode; confirmLabel: string; danger?: boolean; reasonLabel?: string } {
  const name = <strong className="text-ink">{user.fullName}</strong>;
  switch (request.kind) {
    case "approve":
      return { title: "Approve This Instructor?", confirmLabel: "Approve Instructor", children: <>{name} will be able to create courses and send them for review.</> };
    case "reject":
      return {
        title: "Reject This Application?",
        confirmLabel: "Reject Application",
        danger: true,
        reasonLabel: "Reason, to help the applicant",
        children: <>{name} won&apos;t get instructor access. Their student account isn&apos;t affected.</>,
      };
    case "suspend":
      return {
        title: "Suspend This Account?",
        confirmLabel: "Suspend Account",
        danger: true,
        reasonLabel: "Reason, for the record",
        children: (
          <>
            {name} will no longer be able to access protected GrowPilot features until the account is reactivated. Their
            purchases, progress and certificates are kept.
          </>
        ),
      };
    case "reactivate":
      return { title: "Reactivate Account", confirmLabel: "Reactivate Account", children: <>{name} will be able to sign in again, with the access the account still has.</> };
    case "remove-role":
      return request.role === "admin"
        ? { title: "Remove Administrator Access?", confirmLabel: "Remove Access", danger: true, children: <>{name} will no longer be able to open the admin area.</> }
        : {
            title: "Remove Instructor Access?",
            confirmLabel: "Remove Access",
            danger: true,
            children: <>{name} will no longer be able to create or edit courses. Their existing courses and students are kept.</>,
          };
  }
}

