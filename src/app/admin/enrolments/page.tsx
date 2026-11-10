import type { Metadata } from "next";
import { DatabaseZap } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { EnrolmentManagement } from "@/components/admin/enrolments/EnrolmentManagement";
import { getEnrolmentStore } from "@/lib/admin/enrolment-store";
import { requireAdmin } from "@/lib/admin/service";
import { getCurrentStudent } from "@/lib/auth/session";
import { ENROLMENT_STATUSES, ENROLMENT_TYPES, type EnrolmentFilters } from "@/types/admin-enrolments";

export const metadata: Metadata = { title: "Enrolments" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const PAGE_SIZE = 10;

/** /admin/enrolments: administrators only, checked on the server (and again by the admin layout). */
export default async function AdminEnrolmentsPage({ searchParams }: Props) {
  await requireAdmin("/admin/enrolments");

  const store = getEnrolmentStore();
  const me = await getCurrentStudent();
  if (!store || !me) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Enrolment Management</h1>
        <p className="text-lg text-ink-muted">View and track students enrolled in GrowPilot Academy courses.</p>
        <AdminEmptyState icon={DatabaseZap} title="Enrolments aren't connected yet">
          Enrolment records will appear here once sign-in and the database are set up.
        </AdminEmptyState>
      </div>
    );
  }

  // Search, filters and paging all happen in the database, never in the browser.
  const params = await searchParams;
  const one = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]) ?? "";
  const pick = <T extends string>(value: string, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback;
  const filters: EnrolmentFilters = {
    query: one("q").slice(0, 100),
    // Course ids come from the store's own list, so an unknown one simply finds nothing.
    course: one("course").slice(0, 60) || "all",
    status: pick(one("status"), ["all", ...ENROLMENT_STATUSES], "all"),
    type: pick(one("type"), ["all", ...ENROLMENT_TYPES], "all"),
  };
  const page = Math.max(1, Number.parseInt(one("page"), 10) || 1);
  const [{ enrolments, total }, summary, courses] = await Promise.all([
    store.listEnrolments(filters, page, PAGE_SIZE),
    store.summary(),
    store.courses(),
  ]);

  return <EnrolmentManagement enrolments={enrolments} live={{ total, page, filters, summary, courses }} />;
}
