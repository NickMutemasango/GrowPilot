import { Ban, Clock, CircleCheck, CircleX, Landmark, RotateCcw, Smartphone, CreditCard } from "lucide-react";
import { paymentMethodLabels, transactionStatusLabels } from "@/lib/admin/payments";
import type { PaymentMethod } from "@/types/admin-payments";
import type { PaymentStatus } from "@/types/payments";

const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap";

/*
 * Every badge carries an icon and a word as well as a colour, so the
 * status is readable to someone who can't tell the colours apart, and
 * still readable if the page is printed in black and white.
 */
const statusStyles: Record<PaymentStatus, { icon: typeof CircleCheck; className: string }> = {
  paid: { icon: CircleCheck, className: "bg-primary text-white" },
  pending: { icon: Clock, className: "bg-accent/35 text-[#6b4e00]" },
  failed: { icon: CircleX, className: "bg-[#FDECEA] text-[#9A3412]" },
  cancelled: { icon: Ban, className: "bg-canvas text-ink ring-1 ring-line" },
  refunded: { icon: RotateCcw, className: "bg-secondary text-primary-strong" },
};

/** Successful, Pending, Failed, Cancelled or Refunded, with a shape as well as a colour. */
export function TransactionStatusBadge({ status }: { status: PaymentStatus }) {
  const { icon: Icon, className } = statusStyles[status];
  return (
    <span className={`${base} ${className}`}>
      <Icon aria-hidden="true" className="size-4" />
      {transactionStatusLabels[status]}
    </span>
  );
}

const methodIcons: Record<PaymentMethod, typeof CreditCard> = {
  card: CreditCard,
  "mobile-money": Smartphone,
  "bank-transfer": Landmark,
};

/** How the money was taken. Always says "(Demo)": no provider is connected. */
export function PaymentMethodLabel({ method }: { method: PaymentMethod }) {
  const Icon = methodIcons[method];
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-ink">
      <Icon aria-hidden="true" className="size-4 shrink-0 text-ink-muted" />
      {paymentMethodLabels[method]}
    </span>
  );
}
