import Image from "next/image";
import Link from "next/link";
import { ChevronRight, DollarSign, ImageOff, SearchX } from "lucide-react";
import { formatCoursePrice } from "@/lib/admin/courses";
import { formatCertificateDate } from "@/lib/certificates/format";
import { getCategoryLabel } from "@/types/course";
import type { AdminCourse } from "@/types/admin-courses";
import { AdminEmptyState } from "../AdminEmptyState";
import { CourseStatusBadge } from "./CourseStatusBadge";

type AdminCourseTableProps = {
  courses: AdminCourse[];
  onEditPrice: (course: AdminCourse) => void;
};

/** Every course: a table on wide screens, cards on narrow ones, so nothing scrolls sideways. */
export function AdminCourseTable({ courses, onEditPrice }: AdminCourseTableProps) {
  if (courses.length === 0) {
    return (
      <AdminEmptyState icon={SearchX} title="No Courses Found">
        Try changing your search or filters.
      </AdminEmptyState>
    );
  }

  return (
    <>
      {/*
        The course picture and the instructor's name sit with the title, so
        the row needs five short columns instead of seven cramped ones. Every
        other column stays on one line and the title takes the space left
        over, which keeps rows an even height with nothing clipped.

        Six columns, a sidebar and comfortable padding need about 1500px.
        Below that the cards below are shown instead — two to a row on a
        laptop — rather than a table squeezed into too little space.
      */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface min-[1500px]:block">
        <table className="w-full text-left text-base">
          <thead className="bg-secondary/60 text-ink">
            <tr>
              <th scope="col" className="w-full py-3.5 pr-4 pl-6 font-semibold">Course</th>
              <th scope="col" className="px-4 py-3.5 font-semibold whitespace-nowrap">Category</th>
              <th scope="col" className="px-4 py-3.5 font-semibold whitespace-nowrap">Price</th>
              <th scope="col" className="px-4 py-3.5 font-semibold whitespace-nowrap">Status</th>
              <th scope="col" className="px-4 py-3.5 font-semibold whitespace-nowrap">Submitted</th>
              <th scope="col" className="py-3.5 pr-6 pl-4 font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {courses.map((course) => (
              <tr key={course.id} className="align-middle hover:bg-canvas">
                <th scope="row" className="py-5 pr-4 pl-6 font-semibold text-ink">
                  <span className="flex items-center gap-4">
                    <Thumbnail course={course} className="h-12 w-20" />
                    <span className="min-w-0">
                      <span className="block leading-snug text-balance">{course.title}</span>
                      <span className="block text-base font-normal text-ink-muted">By {course.instructorName}</span>
                    </span>
                  </span>
                </th>
                <td className="px-4 py-5 whitespace-nowrap text-ink-muted">{course.category ? getCategoryLabel(course.category) : "Not chosen"}</td>
                <td className="px-4 py-5 whitespace-nowrap text-ink">{formatCoursePrice(course.priceUsd, course.currency)}</td>
                <td className="px-4 py-5"><CourseStatusBadge status={course.status} size="sm" /></td>
                <td className="px-4 py-5 whitespace-nowrap text-ink-muted">{shortSubmitted(course)}</td>
                <td className="py-5 pr-6 pl-4">
                  <div className="flex items-center justify-end gap-2">
                    <PriceButton course={course} onEditPrice={onEditPrice} compact />
                    <ReviewLink course={course} short />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2 min-[1500px]:hidden">
        {courses.map((course) => (
          <li key={course.id} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex gap-4">
              <Thumbnail course={course} className="h-16 w-24 shrink-0" />
              <div className="min-w-0">
                <p className="text-lg leading-snug font-bold text-ink">{course.title}</p>
                <p className="text-base text-ink-muted">By {course.instructorName}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CourseStatusBadge status={course.status} size="sm" />
              <span className="rounded-full bg-canvas px-2.5 py-0.5 text-sm font-semibold text-ink ring-1 ring-line">
                {formatCoursePrice(course.priceUsd, course.currency)}
              </span>
              {course.category && (
                <span className="rounded-full bg-canvas px-2.5 py-0.5 text-sm font-semibold text-ink ring-1 ring-line">
                  {getCategoryLabel(course.category)}
                </span>
              )}
            </div>
            <p className="mt-2 text-base text-ink-muted">{submittedLabel(course)}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <ReviewLink course={course} full />
              <PriceButton course={course} onEditPrice={onEditPrice} full />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function submittedLabel(course: AdminCourse): string {
  if (course.submittedAt) return `Submitted ${formatCertificateDate(course.submittedAt)}`;
  return "Already in the catalogue";
}

/** The table's own column already says "Submitted", so the cell only needs the date. */
function shortSubmitted(course: AdminCourse): string {
  if (!course.submittedAt) return "In the catalogue";
  const date = new Date(course.submittedAt);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

function Thumbnail({ course, className }: { course: AdminCourse; className: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-lg bg-secondary ${className}`}>
      {course.thumbnailUrl ? (
        <Image src={course.thumbnailUrl} alt="" fill sizes="160px" className="object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center text-ink-muted">
          <ImageOff aria-hidden="true" className="size-5" />
          <span className="sr-only">No course picture yet</span>
        </span>
      )}
    </span>
  );
}

function ReviewLink({ course, full, short }: { course: AdminCourse; full?: boolean; short?: boolean }) {
  const pending = course.status === "pending_review";
  return (
    <Link
      href={`/admin/courses/${course.id}/review`}
      className={`inline-flex min-h-11 items-center justify-center gap-1 rounded-xl px-4 text-base font-semibold whitespace-nowrap ${
        pending ? "bg-primary text-white shadow-button hover:bg-primary-hover" : "border-2 border-primary text-primary hover:bg-secondary"
      } ${full ? "w-full" : ""}`}
    >
      {pending ? "Review" : "View"}
      {/* The table has narrow columns, so there the word "Course" is read out but not printed. */}
      <span className={short ? "sr-only" : "ml-1"}>Course</span>
      <span className="sr-only">: {course.title}</span>
      <ChevronRight aria-hidden="true" className="size-4" />
    </Link>
  );
}

function PriceButton({
  course,
  onEditPrice,
  full,
  compact,
}: {
  course: AdminCourse;
  onEditPrice: (course: AdminCourse) => void;
  full?: boolean;
  /** In the table, the price button is the icon only, so the row stays roomy. */
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onEditPrice(course)}
      title={compact ? "Edit price" : undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border-2 border-line text-base font-semibold whitespace-nowrap text-ink hover:bg-secondary ${
        compact ? "w-11 shrink-0" : "px-4"
      } ${full ? "w-full" : ""}`}
    >
      <DollarSign aria-hidden="true" className="size-4" />
      <span className={compact ? "sr-only" : undefined}>Edit Price</span>
      <span className="sr-only">: {course.title}</span>
    </button>
  );
}
