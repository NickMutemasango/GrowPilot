import { Clock, PartyPopper } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { formatCertificateDate } from "@/lib/certificates/format";
import type { PendingCourse } from "@/lib/admin/service";
import { AdminEmptyState } from "./AdminEmptyState";
import { SampleTag } from "./RecentActivityList";

/** "Courses Awaiting Review": a short queue, with a link into the full review page. */
export function PendingCoursesPreview({ courses, sample }: { courses: PendingCourse[]; sample: boolean }) {
  return (
    <section aria-labelledby="pending-heading" className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-header sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="pending-heading" className="text-xl font-bold text-ink">
          Courses Awaiting Review
        </h2>
        {sample && courses.length > 0 && <SampleTag />}
      </div>
      {courses.length === 0 ? (
        <div className="mt-4">
          <AdminEmptyState icon={PartyPopper} title="You're all caught up! No courses are awaiting review." />
        </div>
      ) : (
        <>
          <ul className="mt-4 flex flex-col gap-3">
            {courses.slice(0, 5).map((course) => (
              <li key={course.id} className="rounded-xl border border-line p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-ink">{course.title}</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/35 px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap text-[#6b4e00]">
                    <Clock aria-hidden="true" className="size-4" />
                    Pending Review
                  </span>
                </div>
                <p className="mt-1 text-base text-ink-muted">
                  By {course.instructorName} · Submitted {formatCertificateDate(course.submittedAt)}
                </p>
                <ButtonLink href={`/admin/courses/${course.id}/review`} variant="secondary" className="mt-3 w-full sm:w-auto">
                  Review Course
                  <span className="sr-only">: {course.title}</span>
                </ButtonLink>
              </li>
            ))}
          </ul>
          <ButtonLink href="/admin/courses" className="mt-4 self-start">
            Go to Course Management
          </ButtonLink>
        </>
      )}
    </section>
  );
}
