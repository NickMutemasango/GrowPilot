import { Ban, CircleCheck, CircleX, Clock, PencilLine } from "lucide-react";
import type { CoursePublishStatus } from "@/types/instructor";

export const courseStatuses: Record<CoursePublishStatus, { label: string; icon: typeof Clock; className: string; help: string }> = {
  draft: {
    label: "Draft",
    icon: PencilLine,
    className: "bg-canvas text-ink ring-1 ring-line",
    help: "You're still preparing this course. Students can't see it.",
  },
  pending_review: {
    label: "Pending Review",
    icon: Clock,
    className: "bg-accent/35 text-[#6b4e00]",
    help: "Sent to GrowPilot for approval. We'll publish it once it's checked.",
  },
  published: {
    label: "Published",
    icon: CircleCheck,
    className: "bg-primary text-white",
    help: "Live in the course catalogue.",
  },
  rejected: {
    label: "Needs Changes",
    icon: CircleX,
    className: "bg-[#FDECEA] text-[#9A3412]",
    help: "Returned with feedback. Edit it and send it for review again — nothing was deleted.",
  },
  unpublished: {
    label: "Unpublished",
    icon: Ban,
    className: "bg-ink text-white",
    help: "Taken out of the catalogue. Students who already enrolled keep their access.",
  },
};

/** A course's status in words and an icon, never by colour alone. */
export function CourseStatusBadge({ status }: { status: CoursePublishStatus }) {
  const { label, icon: Icon, className } = courseStatuses[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold whitespace-nowrap ${className}`}>
      <Icon aria-hidden="true" className="size-4" />
      <span className="sr-only">Status: </span>
      {label}
    </span>
  );
}
