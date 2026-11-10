import { CircleCheck, CircleX, Clock, Wallet } from "lucide-react";
import type { CommissionStatus } from "@/types/rewards";

const commissionStatuses: Record<CommissionStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-accent/30 text-[#6b4e00]" },
  approved: { label: "Approved", icon: CircleCheck, className: "bg-secondary text-primary-strong" },
  paid: { label: "Paid", icon: Wallet, className: "bg-primary text-white" },
  reversed: { label: "Reversed", icon: CircleX, className: "bg-[#FDECEA] text-[#9A3412]" },
};

/** A commission's status in words and an icon, never by colour alone. */
export function CommissionStatusBadge({ status }: { status: CommissionStatus }) {
  const { label, icon: Icon, className } = commissionStatuses[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold whitespace-nowrap ${className}`}>
      <Icon aria-hidden="true" className="size-4" />
      {label}
    </span>
  );
}
