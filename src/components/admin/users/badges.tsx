import { Ban, CircleCheck, CircleX, Clock, GraduationCap, ShieldCheck, UserRound } from "lucide-react";
import type { Role } from "@/lib/auth/session";
import type { AccountStatus, ApplicationStatus } from "@/types/admin-users";

const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap";

export const roleLabels: Record<Role, string> = { student: "Student", instructor: "Instructor", admin: "Administrator" };

export function RoleBadge({ role }: { role: Role }) {
  const Icon = role === "admin" ? ShieldCheck : role === "instructor" ? GraduationCap : UserRound;
  return (
    <span className={`${base} ${role === "admin" ? "bg-ink text-white" : role === "instructor" ? "bg-secondary text-primary-strong" : "bg-canvas text-ink ring-1 ring-line"}`}>
      <Icon aria-hidden="true" className="size-4" />
      {roleLabels[role]}
    </span>
  );
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return status === "active" ? (
    <span className={`${base} bg-secondary text-primary-strong`}>
      <CircleCheck aria-hidden="true" className="size-4" />
      Active
    </span>
  ) : (
    <span className={`${base} bg-[#FDECEA] text-[#9A3412]`}>
      <Ban aria-hidden="true" className="size-4" />
      Suspended
    </span>
  );
}

const applications: Record<ApplicationStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-accent/35 text-[#6b4e00]" },
  approved: { label: "Approved", icon: CircleCheck, className: "bg-secondary text-primary-strong" },
  rejected: { label: "Rejected", icon: CircleX, className: "bg-canvas text-ink ring-1 ring-line" },
};

export function ApplicationBadge({ status }: { status: ApplicationStatus }) {
  const { label, icon: Icon, className } = applications[status];
  return (
    <span className={`${base} ${className}`}>
      <Icon aria-hidden="true" className="size-4" />
      <span className="sr-only">Application </span>
      {label}
    </span>
  );
}
