import { Ban, CircleCheck, CircleDot, Gift, ShieldPlus, Tag, Wallet } from "lucide-react";
import { enrolmentStatusLabels, enrolmentTypeLabels } from "@/lib/admin/enrolments";
import type { AdminEnrolmentStatus, AdminEnrolmentType } from "@/types/admin-enrolments";

const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap";

const statusStyles: Record<AdminEnrolmentStatus, { icon: typeof CircleDot; className: string }> = {
  active: { icon: CircleDot, className: "bg-secondary text-primary-strong" },
  completed: { icon: CircleCheck, className: "bg-primary text-white" },
  revoked: { icon: Ban, className: "bg-[#FDECEA] text-[#9A3412]" },
};

/** Active, Completed or Revoked, with a shape as well as a colour. */
export function EnrolmentStatusBadge({ status }: { status: AdminEnrolmentStatus }) {
  const { icon: Icon, className } = statusStyles[status];
  return (
    <span className={`${base} ${className}`}>
      <Icon aria-hidden="true" className="size-4" />
      {enrolmentStatusLabels[status]}
    </span>
  );
}

const typeStyles: Record<AdminEnrolmentType, { icon: typeof Tag; className: string }> = {
  free: { icon: Tag, className: "bg-canvas text-ink ring-1 ring-line" },
  paid: { icon: Wallet, className: "bg-secondary text-primary-strong" },
  referral: { icon: Gift, className: "bg-accent/35 text-[#6b4e00]" },
  grant: { icon: ShieldPlus, className: "bg-ink text-white" },
};

/** How the student got onto the course: Free, Paid, Referral Reward or Administrative Grant. */
export function EnrolmentTypeBadge({ type }: { type: AdminEnrolmentType }) {
  const { icon: Icon, className } = typeStyles[type];
  return (
    <span className={`${base} ${className}`}>
      <Icon aria-hidden="true" className="size-4" />
      {enrolmentTypeLabels[type]}
    </span>
  );
}
