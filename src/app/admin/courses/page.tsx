import type { Metadata } from "next";
import { DatabaseZap } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { CourseManagement } from "@/components/admin/courses/CourseManagement";
import { getAdminCourseStore } from "@/lib/admin/course-store";
import { requireAdmin } from "@/lib/admin/service";
import { getCurrentStudent } from "@/lib/auth/session";
import { ADMIN_COURSE_STATUSES, type AdminCourseFilters } from "@/types/admin-courses";
import { COURSE_CATEGORIES } from "@/types/course";

export const metadata: Metadata = { title: "Courses" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const PAGE_SIZE = 10;

/** /admin/courses: administrators only, checked on the server (and again by the admin layout). */
export default async function AdminCoursesPage({ searchParams }: Props) {
  await requireAdmin("/admin/courses");

  const store = getAdminCourseStore();
  const me = await getCurrentStudent();
  if (!store || !me) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Course Management</h1>
        <AdminEmptyState icon={DatabaseZap} title="Courses aren't connected yet">
          Reviewing, approving and pricing courses will work once sign-in and the course database are set up.
        </AdminEmptyState>
      </div>
    );
  }

  // Search, filters and paging all happen in the database, never in the browser.
  const params = await searchParams;
  const one = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]) ?? "";
  const pick = <T extends string>(value: string, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback;
  const filters: AdminCourseFilters = {
    query: one("q").slice(0, 100),
    status: pick(one("status"), ["all", ...ADMIN_COURSE_STATUSES], "all"),
    category: pick(one("category"), ["all", ...COURSE_CATEGORIES.map((category) => category.id)], "all"),
    pricing: pick(one("pricing"), ["all", "free", "paid"], "all"),
  };
  const page = Math.max(1, Number.parseInt(one("page"), 10) || 1);
  const [{ courses, total }, summary, pending] = await Promise.all([
    store.listCourses(filters, page, PAGE_SIZE),
    store.summary(),
    store.pendingCourses(),
  ]);

  return <CourseManagement courses={courses} actorId={me.id} live={{ total, page, filters, summary, pending }} />;
}
