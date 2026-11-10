"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CircleDot, GraduationCap, ShieldOff, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { byNewest, courseOptions, summariseEnrolments } from "@/lib/admin/enrolments";
import { createManualEnrolment } from "@/lib/admin/manual-enrolment";
import {
  newRevocation,
  pruneStatusChanges,
  reactivatedChange,
  revokedChange,
  withStatusChanges,
} from "@/lib/admin/enrolment-status";
import {
  NO_ENROLMENT_FILTERS,
  type AdminEnrolment,
  type EnrolmentCourseChoice,
  type EnrolmentCourseOption,
  type EnrolmentFilters,
  type EnrolmentStudentOption,
  type EnrolmentSummary,
  type ManualEnrolmentDraft,
  type StatusChangesById,
} from "@/types/admin-enrolments";
import { AdminStatsCard } from "../AdminStatsCard";
import { DemoToast } from "../DemoToast";
import { EnrolStudentDialog } from "./EnrolStudentDialog";
import { ReactivateEnrolmentDialog } from "./ReactivateEnrolmentDialog";
import { RevokeEnrolmentDialog } from "./RevokeEnrolmentDialog";
import { EnrolmentDetailsDialog } from "./EnrolmentDetailsDialog";
import { EnrolmentFiltersBar } from "./EnrolmentFiltersBar";
import { EnrolmentsTable } from "./EnrolmentsTable";

const PAGE_SIZE = 10;

type EnrolmentManagementProps = {
  enrolments: AdminEnrolment[];
  /** Live mode only: totals, paging and the course list worked out on the server. */
  live?: { total: number; page: number; filters: EnrolmentFilters; summary: EnrolmentSummary; courses: EnrolmentCourseOption[] };
  /**
   * Preview only: the lists the "Enrol a Student" dialog chooses from.
   * Without them the manual enrolment button is not offered at all, because
   * a browser-only record can't be mixed into server-paged live data.
   */
  manual?: { students: EnrolmentStudentOption[]; courses: EnrolmentCourseChoice[] };
};

/**
 * "Enrolment Management": view and track students enrolled in courses,
 * grant a demonstration enrolment by hand, revoke one, and put a revoked
 * one back.
 *
 * Every action is a demonstration held in the browser. None of them ever
 * deletes a record or resets progress: revoking marks an enrolment,
 * reactivating puts the same one back with its history intact, and
 * certificates and payments are left exactly as they were.
 */
export function EnrolmentManagement({ enrolments, live, manual }: EnrolmentManagementProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<EnrolmentFilters>(live?.filters ?? NO_ENROLMENT_FILTERS);
  const [page, setPage] = useState(live?.page ?? 1);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [reactivateId, setReactivateId] = useState<string | null>(null);
  // Records created by hand on this screen; not yet sent to a server.
  const [demo, setDemo] = useState<AdminEnrolment[]>([]);
  const [enrolOpen, setEnrolOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // Status changes made on this screen, kept against enrolment ids so a sample row
  // can be changed without the sample data being rewritten.
  const [changes, setChanges] = useState<StatusChangesById>({});
  const canEnrol = Boolean(manual);
  // Revoking and reactivating change records on this screen only until the
  // enrolment store can be written to.
  const canChangeStatus = true;

  // Live mode: search and filters run on the server (the address changes), so only one page is ever sent.
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.query.trim()) params.set("q", filters.query.trim());
      for (const key of ["course", "status", "type"] as const) if (filters[key] !== "all") params.set(key, filters[key]);
      if (page > 1) params.set("page", String(page));
      router.replace(`/admin/enrolments${params.size ? `?${params}` : ""}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, page, router]);

  // Manual grants sit alongside the sample rows, and status changes are laid over both,
  // so every count, filter and dialog below sees exactly what the table shows.
  const all = useMemo(() => {
    const merged = demo.length ? [...demo, ...enrolments] : enrolments;
    return Object.keys(changes).length ? withStatusChanges(merged, changes) : merged;
  }, [demo, enrolments, changes]);
  const sorted = useMemo(() => [...all].sort(byNewest), [all]);
  const summary = live?.summary ?? summariseEnrolments(sorted);
  const courses = live?.courses ?? courseOptions(sorted);
  const shown = {
    items: sorted,
    page,
    pageCount: Math.max(1, Math.ceil((live?.total ?? 0) / PAGE_SIZE)),
    total: live?.total ?? 0,
  };
  const details = sorted.find((enrolment) => enrolment.id === detailsId) ?? null;
  const revoking = sorted.find((enrolment) => enrolment.id === revokeId) ?? null;
  const reactivating = sorted.find((enrolment) => enrolment.id === reactivateId) ?? null;
  const unfiltered = filters.query.trim() === "" && filters.course === "all" && filters.status === "all" && filters.type === "all";

  const changeFilters = (next: EnrolmentFilters) => {
    setFilters(next);
    setPage(1);
  };

  const dismissToast = useCallback(() => setToast(null), []);

  /** Confirm Enrolment: build the record, add it to the list and say so. Nothing leaves the browser. */
  const enrol = (draft: ManualEnrolmentDraft) => {
    const student = manual?.students.find((one) => one.id === draft.studentId);
    const course = manual?.courses.find((one) => one.id === draft.courseId);
    if (!student || !course) return;

    const record = createManualEnrolment(student, course);
    const next = [record, ...demo];
    setDemo(next);
    setEnrolOpen(false);
    // Show the newest row straight away rather than leaving it on a page nobody is looking at.
    setFilters(NO_ENROLMENT_FILTERS);
    setPage(1);
    setToast("Student enrolled successfully (Demo).");
  };

  /**
   * Confirm Revocation: mark the record and keep everything else.
   *
   * The enrolment is never removed from the table and its progress, lesson
   * counts and certificates are untouched; only the status and the two
   * revocation fields change.
   */
  const revoke = (reason: string) => {
    if (!revoking) return;
    const next = pruneStatusChanges({ ...changes, [revoking.id]: revokedChange(newRevocation(reason)) }, all);
    setChanges(next);
    setRevokeId(null);
    setToast("Enrolment revoked successfully (Demo).");
  };

  /**
   * Confirm Reactivation: put a revoked enrolment back.
   *
   * The same record is reused — no new enrolment is created — and its
   * progress, enrolment date and revocation history are all kept. Only
   * the status changes, and the date it was put back is noted.
   */
  const reactivate = () => {
    if (!reactivating) return;
    const next = pruneStatusChanges(
      { ...changes, [reactivating.id]: reactivatedChange(changes[reactivating.id]) },
      all,
    );
    setChanges(next);
    setReactivateId(null);
    setToast("Student enrolment reactivated successfully (Demo).");
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        {/* basis-80 lets the heading text shrink so the button stays on the right until the screen is narrow. */}
        <div className="min-w-0 flex-1 basis-80">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Enrolment Management</h1>
          <p className="mt-2 text-lg text-ink-muted">View and track students enrolled in GrowPilot Academy courses.</p>
        </div>
        {canEnrol && (
          <Button size="lg" onClick={() => setEnrolOpen(true)} className="w-full sm:w-auto">
            <UserPlus aria-hidden="true" className="size-5" />
            Enrol Student
          </Button>
        )}
      </header>

      <section aria-label="Enrolment totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <h2 className="sr-only">Enrolment totals</h2>
        <AdminStatsCard
          icon={UserCheck}
          title="Total Enrolments"
          description="Every student on a course."
          value={summary.total}
          source="live"
        />
        <AdminStatsCard
          icon={CircleDot}
          title="Active Enrolments"
          description="Studying, not yet finished."
          value={summary.active}
          source="live"
        />
        <AdminStatsCard
          icon={GraduationCap}
          title="Completed Courses"
          description="Every lesson finished."
          value={summary.completed}
          source="live"
        />
        <AdminStatsCard
          icon={ShieldOff}
          title="Revoked Enrolments"
          description="Access withdrawn by an administrator."
          value={summary.revoked}
          source="live"
        />
      </section>

      <section aria-labelledby="all-enrolments-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="all-enrolments-heading" className="text-2xl font-bold tracking-tight text-ink">
            All Enrolments
          </h2>
          <p className="text-base text-ink-muted" aria-live="polite">
            {shown.total} {shown.total === 1 ? "enrolment" : "enrolments"} found
          </p>
        </div>
        <EnrolmentFiltersBar filters={filters} courses={courses} onChange={changeFilters} />
        <EnrolmentsTable
          enrolments={shown.items}
          unfiltered={unfiltered}
          onView={(enrolment) => setDetailsId(enrolment.id)}
          onRevoke={canChangeStatus ? (enrolment) => setRevokeId(enrolment.id) : undefined}
          onReactivate={canChangeStatus ? (enrolment) => setReactivateId(enrolment.id) : undefined}
        />
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

      <EnrolmentDetailsDialog enrolment={details} onClose={() => setDetailsId(null)} />
      {canChangeStatus && (
        <>
          <RevokeEnrolmentDialog enrolment={revoking} onCancel={() => setRevokeId(null)} onConfirm={revoke} />
          <ReactivateEnrolmentDialog
            enrolment={reactivating}
            onCancel={() => setReactivateId(null)}
            onConfirm={reactivate}
          />
        </>
      )}
      {canEnrol && manual && (
        <EnrolStudentDialog
          open={enrolOpen}
          students={manual.students}
          courses={manual.courses}
          existing={sorted}
          onCancel={() => setEnrolOpen(false)}
          onConfirm={enrol}
        />
      )}
      <DemoToast message={toast} onDismiss={dismissToast} />
    </div>
  );
}
