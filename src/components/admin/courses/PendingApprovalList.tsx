import Image from "next/image";
import { Clock, ImageOff, PartyPopper } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { formatCoursePrice } from "@/lib/admin/courses";
import { formatCertificateDate } from "@/lib/certificates/format";
import { getCategoryLabel } from "@/types/course";
import type { AdminCourse } from "@/types/admin-courses";
import { AdminEmptyState } from "../AdminEmptyState";

/** The review queue: everything an instructor has submitted, oldest first. */
export function PendingApprovalList({ courses }: { courses: AdminCourse[] }) {
  return (
    <section aria-labelledby="pending-approvals" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="pending-approvals" className="text-2xl font-bold tracking-tight text-ink">
          Pending Approvals
        </h2>
        <p className="text-base text-ink-muted">
          {courses.length} {courses.length === 1 ? "course is" : "courses are"} waiting for a decision
        </p>
      </div>

      {courses.length === 0 ? (
        <AdminEmptyState icon={PartyPopper} title="You're all caught up!">
          No courses are waiting for review.
        </AdminEmptyState>
      ) : (
        <ul className="flex flex-col gap-4">
          {courses.map((course) => (
            <li key={course.id} className="overflow-hidden rounded-2xl border border-line bg-surface shadow-header">
              <div className="flex flex-col gap-5 p-5 md:flex-row">
                <span className="relative block aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-secondary md:w-56">
                  {course.thumbnailUrl ? (
                    <Image src={course.thumbnailUrl} alt="" fill sizes="(min-width: 768px) 224px, 100vw" className="object-cover" />
                  ) : (
                    <span className="flex size-full flex-col items-center justify-center gap-1 text-ink-muted">
                      <ImageOff aria-hidden="true" className="size-6" />
                      <span className="text-base">No picture yet</span>
                    </span>
                  )}
                </span>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-xl leading-snug font-bold text-ink">{course.title}</h3>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/35 px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap text-[#6b4e00]">
                      <Clock aria-hidden="true" className="size-4" />
                      Pending Review
                    </span>
                  </div>
                  <p className="mt-1 text-base text-ink-muted">
                    By {course.instructorName}
                    {course.submittedAt ? ` · Submitted ${formatCertificateDate(course.submittedAt)}` : ""}
                  </p>
                  <p className="mt-3 text-base text-ink">{course.shortDescription}</p>

                  <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-base sm:grid-cols-4">
                    <Fact label="Category">{course.category ? getCategoryLabel(course.category) : "Not chosen"}</Fact>
                    <Fact label="Difficulty">{course.level || "Not chosen"}</Fact>
                    <Fact label="Duration">{course.duration || "Not given"}</Fact>
                    <Fact label="Price">{formatCoursePrice(course.priceUsd, course.currency)}</Fact>
                  </dl>

                  <div className="mt-5">
                    <ButtonLink href={`/admin/courses/${course.id}/review`} size="lg" className="w-full sm:w-auto">
                      Review Course
                      <span className="sr-only">: {course.title}</span>
                    </ButtonLink>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-ink-muted">{label}</dt>
      <dd className="font-semibold text-ink">{children}</dd>
    </div>
  );
}
