import Image from "next/image";
import { Eye, ImageOff, PencilLine, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { formatCertificateDate } from "@/lib/certificates/format";
import { getCategoryLabel } from "@/types/course";
import type { CourseDraft } from "@/types/instructor";
import { CourseStatusBadge } from "./CourseStatusBadge";

type InstructorCourseCardProps = {
  course: CourseDraft;
  /** Public course address, only for courses with a live version. */
  publicSlug: string | null;
  students: number;
};

/** One of the instructor's own courses. */
export function InstructorCourseCard({ course, publicSlug, students }: InstructorCourseCardProps) {
  const thumbnail = course.thumbnail?.url;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-header">
      <div className="relative aspect-[16/9] bg-secondary">
        {thumbnail ? (
          <Image src={thumbnail} alt="" fill sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 100vw" className="object-cover" />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-2 text-ink-muted">
            <ImageOff aria-hidden="true" className="size-8" />
            <span className="text-base">No picture yet</span>
          </span>
        )}
        <span className="absolute top-3 left-3">
          <CourseStatusBadge status={course.status} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-base font-semibold text-primary">
          {course.category ? getCategoryLabel(course.category) : "No category yet"}
        </p>
        <h3 className="mt-1 text-xl leading-snug font-bold text-ink">{course.title || "Untitled course"}</h3>
        {course.hasLiveVersion && course.status === "pending_review" && (
          <p className="mt-1 text-base text-ink-muted">The approved version stays live while your changes wait.</p>
        )}
        {(course.status === "rejected" || course.status === "unpublished") && (
          <div
            className={`mt-2 rounded-xl p-3 text-base ${
              course.status === "rejected" ? "bg-[#FDECEA] text-[#9A3412]" : "bg-canvas text-ink"
            }`}
          >
            <p className="font-semibold">
              {course.status === "rejected" ? "Returned for improvements" : "Taken out of the catalogue"}
              {course.review?.decidedAt ? ` on ${formatCertificateDate(course.review.decidedAt)}` : ""}
            </p>
            {course.review?.feedback && <p className="mt-1">{course.review.feedback}</p>}
            <p className="mt-1">
              {course.status === "rejected"
                ? "Edit your course and send it for review again. Nothing has been deleted."
                : "Students who already enrolled keep their access, progress and certificates."}
            </p>
          </div>
        )}
        <p className="mt-2 flex items-center gap-2 text-base text-ink-muted">
          <Users aria-hidden="true" className="size-5 text-primary" />
          {students} {students === 1 ? "student" : "students"} enrolled
        </p>
        {/* Stacked, full width, so both buttons always fit. */}
        <div className="mt-auto flex flex-col gap-3 pt-5">
          <ButtonLink href={`/instructor/courses/${course.id}/edit`} className="w-full">
            <PencilLine aria-hidden="true" className="size-4" />
            {course.status === "rejected" ? "Edit & Resubmit" : "Edit Course"}
            <span className="sr-only">: {course.title}</span>
          </ButtonLink>
          {publicSlug && course.status !== "unpublished" && (
            <ButtonLink href={`/courses/${publicSlug}`} variant="secondary" className="w-full">
              <Eye aria-hidden="true" className="size-4" />
              View Course
              <span className="sr-only">: {course.title}</span>
            </ButtonLink>
          )}
        </div>
      </div>
    </article>
  );
}
