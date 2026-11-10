import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, DatabaseZap } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminCourseReview } from "@/components/admin/courses/AdminCourseReview";
import { ButtonLink } from "@/components/ui/Button";
import { getAdminCourseStore } from "@/lib/admin/course-store";
import { requireAdmin } from "@/lib/admin/service";
import { getCurrentStudent } from "@/lib/auth/session";

type Props = { params: Promise<{ courseId: string }> };

export const metadata: Metadata = { title: "Course Review" };

/**
 * /admin/courses/[courseId]/review: the whole course, including material
 * students can't see yet. Administrators only, checked on the server here
 * and again in the admin layout.
 */
export default async function AdminCourseReviewPage({ params }: Props) {
  const { courseId } = await params;
  await requireAdmin(`/admin/courses/${courseId}/review`);

  const store = getAdminCourseStore();
  const me = await getCurrentStudent();
  if (!store || !me) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Course Review</h1>
        <AdminEmptyState icon={DatabaseZap} title="Courses aren't connected yet">
          Course submissions will appear here once the course database is set up.
        </AdminEmptyState>
        <div>
          <ButtonLink href="/admin/courses" variant="secondary">
            <ArrowLeft aria-hidden="true" className="size-5" />
            Back to Course Management
          </ButtonLink>
        </div>
      </div>
    );
  }

  const course = await store.getCourse(courseId);
  if (!course) notFound();
  return <AdminCourseReview course={course} actorId={me.id} />;
}
