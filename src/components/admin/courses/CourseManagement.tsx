"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, CircleCheck, CircleX, Clock, Info, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { pendingCourses, summariseCourses } from "@/lib/admin/courses";
import { NO_COURSE_FILTERS, type AdminCourse, type AdminCourseFilters } from "@/types/admin-courses";
import { AdminStatsCard } from "../AdminStatsCard";
import { AdminCourseTable } from "./AdminCourseTable";
import { CourseSearchFilters } from "./CourseSearchFilters";
import { EditCoursePriceDialog } from "./EditCoursePriceDialog";
import { PendingApprovalList } from "./PendingApprovalList";
import { useCourseDecisions } from "./useCourseDecisions";

const PAGE_SIZE = 10;

type CourseManagementProps = {
  courses: AdminCourse[];
  actorId: string;
  /** Live mode only: totals and paging worked out on the server. */
  live?: {
    total: number;
    page: number;
    filters: AdminCourseFilters;
    summary: ReturnType<typeof summariseCourses>;
    pending: AdminCourse[];
  };
};

/** "Course Management": review, approve and manage courses across GrowPilot Academy. */
export function CourseManagement({ courses: serverCourses, actorId, live }: CourseManagementProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<AdminCourseFilters>(live?.filters ?? NO_COURSE_FILTERS);
  const [page, setPage] = useState(live?.page ?? 1);
  const [pricing, setPricing] = useState<AdminCourse | null>(null);
  const { busy, notice, noticeRef, run } = useCourseDecisions({ actorId });

  const courses = serverCourses;

  // Live mode: search, filters and paging run on the server (the address
  // changes), so the browser never receives every course.
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.query.trim()) params.set("q", filters.query.trim());
      for (const key of ["status", "category", "pricing"] as const) if (filters[key] !== "all") params.set(key, filters[key]);
      if (page > 1) params.set("page", String(page));
      router.replace(`/admin/courses${params.size ? `?${params}` : ""}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, page, router]);

  const summary = live?.summary ?? summariseCourses(courses);
  const waiting = live?.pending ?? pendingCourses(courses);
  const shown = {
    items: courses,
    page,
    pageCount: Math.max(1, Math.ceil((live?.total ?? 0) / PAGE_SIZE)),
    total: live?.total ?? 0,
  };
  const source = "live" as const;

  const changeFilters = (next: AdminCourseFilters) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Course Management</h1>
        <p className="mt-2 text-lg text-ink-muted">Review, approve and manage courses across GrowPilot Academy.</p>
      </header>

      <div ref={noticeRef} tabIndex={-1} role="status" className="empty:hidden focus:outline-none">
        {notice && (
          <p
            className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-base ${
              notice.ok ? "border-primary bg-secondary text-primary-strong" : "border-[#f3c7c2] bg-[#FDECEA] text-[#9A3412]"
            }`}
          >
            {notice.ok ? <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" /> : <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />}
            {notice.text}
          </p>
        )}
      </div>

      <section aria-label="Course totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <h2 className="sr-only">Course totals</h2>
        <AdminStatsCard icon={BookOpen} title="Total Courses" description="Every course on the platform." value={summary.total} source={source} />
        <AdminStatsCard icon={CircleCheck} title="Published Courses" description="Live in the catalogue." value={summary.published} source={source} />
        <AdminStatsCard icon={Clock} title="Pending Approvals" description="Waiting for your decision." value={summary.pending} source={source} />
        <AdminStatsCard icon={PencilLine} title="Draft Courses" description="Instructors are still writing these." value={summary.draft} source={source} />
        <AdminStatsCard icon={CircleX} title="Rejected Courses" description="Returned for improvements." value={summary.rejected} source={source} />
      </section>

      <PendingApprovalList courses={waiting} />

      <section aria-labelledby="all-courses-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="all-courses-heading" className="text-2xl font-bold tracking-tight text-ink">
            All Courses
          </h2>
          <p className="text-base text-ink-muted" aria-live="polite">
            {shown.total} {shown.total === 1 ? "course" : "courses"} found
          </p>
        </div>
        <CourseSearchFilters filters={filters} onChange={changeFilters} />
        <AdminCourseTable courses={shown.items} onEditPrice={setPricing} />
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

      <EditCoursePriceDialog
        course={pricing}
        busy={busy}
        onCancel={() => setPricing(null)}
        onConfirm={async (price) => {
          if (!pricing) return;
          const ok = await run({ kind: "price", course: pricing, price });
          if (ok) setPricing(null);
        }}
      />
    </div>
  );
}
