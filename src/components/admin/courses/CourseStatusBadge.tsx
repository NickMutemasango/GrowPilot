import { Ban, CircleCheck, CircleX, Clock, PencilLine, type LucideIcon } from "lucide-react";
import type { AdminCourseStatus } from "@/types/admin-courses";

export const adminCourseStatuses: Record<AdminCourseStatus, { label: string; icon: LucideIcon; className: string; help: string }> = {
  draft: {
    label: "Draft",
    icon: PencilLine,
    className: "bg-canvas text-ink ring-1 ring-line",
    help: "The instructor is still preparing this course.",
  },
  pending_review: {
    label: "Pending Review",
    icon: Clock,
    className: "bg-accent/35 text-[#6b4e00]",
    help: "Submitted for approval and waiting for a decision.",
  },
  published: {
    label: "Published",
    icon: CircleCheck,
    className: "bg-primary text-white",
    help: "Approved and available in the public course catalogue.",
  },
  rejected: {
    label: "Rejected",
    icon: CircleX,
    className: "bg-[#FDECEA] text-[#9A3412]",
    help: "Returned to the instructor for improvements. Nothing was deleted.",
  },
  unpublished: {
    label: "Unpublished",
    icon: Ban,
    className: "bg-ink text-white",
    help: "Removed from the catalogue. Students already enrolled keep their access.",
  },
};

/** A course's status in words and an icon, never by colour alone. */
export function CourseStatusBadge({ status, size = "md" }: { status: AdminCourseStatus; size?: "sm" | "md" }) {
  const { label, icon: Icon, className } = adminCourseStatuses[status];
  const scale = size === "sm" ? "px-2.5 py-0.5 text-sm" : "px-3 py-1 text-base";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${scale} ${className}`}>
      <Icon aria-hidden="true" className="size-4" />
      <span className="sr-only">Status: </span>
      {label}
    </span>
  );
}
