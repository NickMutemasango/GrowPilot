import type { Metadata } from "next";
import { DatabaseZap } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { requireAdmin } from "@/lib/admin/service";

export const metadata: Metadata = { title: "Reports & Analytics" };

/*
 * /admin/reports: administrators only, checked on the server (and again by
 * the admin layout).
 *
 * There is nothing to report on yet: no sign-in and no database are
 * connected, so there are no students, enrolments or payments to count.
 * Saying so is the honest answer — far better than charts drawn from
 * figures nobody can stand behind.
 *
 * The sections that draw this page are all still here, in
 * src/components/admin/reports: StudentGrowthSection,
 * CoursePerformanceSection, RevenueSalesSection,
 * AffiliatePerformanceSection, ReferralPerformanceSection, the two charts
 * and ReportsExportPanel (CSV and PDF). They take the shapes declared in
 * src/lib/admin/report-service.ts. Build an AdminReports object from the
 * database — the user, enrolment, payment and affiliate stores each
 * document the queries — and render them here.
 */
export default async function AdminReportsPage() {
  await requireAdmin("/admin/reports");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Reports &amp; Analytics</h1>
      <p className="text-lg text-ink-muted">
        How GrowPilot Academy is doing: learners, enrolments and course sales at a glance.
      </p>
      <AdminEmptyState icon={DatabaseZap} title="Reports aren&rsquo;t connected yet">
        Figures and charts will appear here once sign-in and the database are set up.
      </AdminEmptyState>
    </div>
  );
}
