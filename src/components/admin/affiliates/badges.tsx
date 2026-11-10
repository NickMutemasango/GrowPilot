import { Ban, Banknote, CircleCheck, CircleX, Clock, Gift, Undo2 } from "lucide-react";
import { affiliateStatusLabels } from "@/lib/admin/affiliates";
import { commissionStatusLabels } from "@/lib/admin/affiliate-sales";
import { payoutStatusLabels } from "@/lib/admin/affiliate-payouts";
import { referralPurchaseStatusLabels, referralRewardStatusLabels } from "@/lib/admin/referral-rewards";
import type { PayoutStatus } from "@/types/admin-affiliates";
import type { ReferralPurchaseStatus, ReferralRewardStatus } from "@/types/admin-referrals";
import type { AffiliateStatus, CommissionStatus } from "@/types/rewards";

const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap";

/*
 * Every badge carries an icon and a word as well as a colour, so the
 * status is readable to someone who can't tell the colours apart, and
 * still readable if the page is printed in black and white. The same
 * three colours are used wherever these statuses appear.
 */
const statusStyles: Record<AffiliateStatus, { icon: typeof CircleCheck; className: string }> = {
  approved: { icon: CircleCheck, className: "bg-primary text-white" },
  pending: { icon: Clock, className: "bg-accent/35 text-[#6b4e00]" },
  rejected: { icon: CircleX, className: "bg-[#FDECEA] text-[#9A3412]" },
  suspended: { icon: Ban, className: "bg-canvas text-ink ring-1 ring-line" },
};

/** Approved, Pending, Rejected or Suspended, with a shape as well as a colour. */
export function AffiliateStatusBadge({ status }: { status: AffiliateStatus }) {
  const { icon: Icon, className } = statusStyles[status];
  return (
    <span className={`${base} ${className}`}>
      <Icon aria-hidden="true" className="size-4" />
      {affiliateStatusLabels[status]}
    </span>
  );
}

/*
 * The same idea for a commission: an icon and a word as well as a
 * colour. A reversal is the one that must never be mistaken for the
 * others, so it keeps the red used for undone things everywhere else.
 */
const commissionStyles: Record<CommissionStatus, { icon: typeof CircleCheck; className: string }> = {
  pending: { icon: Clock, className: "bg-accent/35 text-[#6b4e00]" },
  approved: { icon: CircleCheck, className: "bg-secondary text-primary ring-1 ring-primary/30" },
  paid: { icon: Banknote, className: "bg-primary text-white" },
  reversed: { icon: Undo2, className: "bg-[#FDECEA] text-[#9A3412]" },
};

/** Pending, Approved, Paid or Reversed, with a shape as well as a colour. */
export function CommissionStatusBadge({ status }: { status: CommissionStatus }) {
  const { icon: Icon, className } = commissionStyles[status];
  return (
    <span className={`${base} ${className}`}>
      <Icon aria-hidden="true" className="size-4" />
      {commissionStatusLabels[status]}
    </span>
  );
}

/*
 * And the same for a payout request. A rejected request keeps the red
 * used for turned-down things everywhere else, and "Paid" uses the solid
 * green — in this project a label on a sample row, never a transfer that
 * happened.
 */
const payoutStyles: Record<PayoutStatus, { icon: typeof CircleCheck; className: string }> = {
  pending: { icon: Clock, className: "bg-accent/35 text-[#6b4e00]" },
  approved: { icon: CircleCheck, className: "bg-secondary text-primary ring-1 ring-primary/30" },
  rejected: { icon: CircleX, className: "bg-[#FDECEA] text-[#9A3412]" },
  paid: { icon: Banknote, className: "bg-primary text-white" },
};

/** Pending, Approved, Rejected or Paid, with a shape as well as a colour. */
export function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const { icon: Icon, className } = payoutStyles[status];
  return (
    <span className={`${base} ${className}`}>
      <Icon aria-hidden="true" className="size-4" />
      {payoutStatusLabels[status]}
    </span>
  );
}

/*
 * And the same for a referral reward (Steps 12E.9 and 12E.10).
 * "Eligible" uses the soft green of something earned and still waiting
 * on a decision; "Approved" and "Claimed" the solid green of something
 * settled, told apart by their icons — in this project labels on a
 * sample row, never a course anybody was actually given.
 */
const referralRewardStyles: Record<ReferralRewardStatus, { icon: typeof CircleCheck; className: string }> = {
  pending: { icon: Clock, className: "bg-accent/35 text-[#6b4e00]" },
  eligible: { icon: Clock, className: "bg-secondary text-primary ring-1 ring-primary/30" },
  approved: { icon: CircleCheck, className: "bg-primary text-white" },
  claimed: { icon: Gift, className: "bg-primary text-white" },
  revoked: { icon: Ban, className: "bg-canvas text-ink ring-1 ring-line" },
  rejected: { icon: CircleX, className: "bg-[#FDECEA] text-[#9A3412]" },
};

/** Pending, Eligible, Claimed or Rejected, with a shape as well as a colour. */
export function ReferralRewardBadge({ status }: { status: ReferralRewardStatus }) {
  const { icon: Icon, className } = referralRewardStyles[status];
  return (
    <span className={`${base} ${className}`}>
      <Icon aria-hidden="true" className="size-4" />
      {referralRewardStatusLabels[status]}
    </span>
  );
}

/*
 * The friend's purchase, which is what decides whether a referral
 * counted. It is deliberately quieter than the reward badge: no colour
 * carries meaning on its own here, because a refund is a fact about the
 * order, not a judgement about the person.
 */
const purchaseStyles: Record<ReferralPurchaseStatus, string> = {
  none: "bg-canvas text-ink-muted ring-1 ring-line",
  completed: "bg-secondary text-primary ring-1 ring-primary/30",
  refunded: "bg-[#FDECEA] text-[#9A3412]",
};

const purchaseIcons: Record<ReferralPurchaseStatus, typeof CircleCheck> = {
  none: Clock,
  completed: CircleCheck,
  refunded: Undo2,
};

/** No purchase yet, Purchase completed or Refunded. */
export function ReferralPurchaseBadge({ status }: { status: ReferralPurchaseStatus }) {
  const Icon = purchaseIcons[status];
  return (
    <span className={`${base} ${purchaseStyles[status]}`}>
      <Icon aria-hidden="true" className="size-4" />
      {referralPurchaseStatusLabels[status]}
    </span>
  );
}
