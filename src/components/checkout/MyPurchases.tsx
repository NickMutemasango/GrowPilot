import { ArrowRight, CircleCheck, CircleX, Clock, ReceiptText, Undo2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { formatCertificateDate } from "@/lib/certificates/format";
import { formatMoney } from "@/lib/payments/money";
import type { PaymentStatus, Purchase } from "@/types/payments";

const statuses: Record<PaymentStatus, { label: string; icon: typeof CircleCheck; className: string }> = {
  paid: { label: "Paid", icon: CircleCheck, className: "bg-secondary text-primary-strong" },
  pending: { label: "Being confirmed", icon: Clock, className: "bg-accent/30 text-[#6b4e00]" },
  failed: { label: "Not completed", icon: CircleX, className: "bg-[#FDECEA] text-[#9A3412]" },
  cancelled: { label: "Cancelled", icon: Undo2, className: "bg-canvas text-ink ring-1 ring-line" },
  refunded: { label: "Refunded", icon: Undo2, className: "bg-canvas text-ink ring-1 ring-line" },
};

/** "My Purchases": paid-course orders with their status and reference. Never shows card details. */
export function MyPurchases({ purchases }: { purchases: Purchase[] }) {
  return (
    <section id="my-purchases" aria-labelledby="purchases-heading" className="scroll-mt-28">
      <h2 id="purchases-heading" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        My Purchases
      </h2>

      {purchases.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-3xl border-2 border-dashed border-line bg-surface px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
            <ReceiptText aria-hidden="true" className="size-7" />
          </span>
          <h3 className="mt-4 text-xl font-bold text-ink">No Purchases Yet</h3>
          <p className="mt-1 text-lg text-ink-muted">Courses you purchase will appear here.</p>
        </div>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {purchases.map((purchase) => {
            const { label, icon: Icon, className } = statuses[purchase.status];
            return (
              <li
                key={purchase.reference}
                className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 md:flex-row md:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-ink">{purchase.courseTitle}</p>
                  <dl className="mt-1 grid gap-x-6 gap-y-1 text-base sm:grid-cols-3">
                    <div>
                      <dt className="text-ink-muted">Date</dt>
                      <dd className="font-semibold text-ink">{formatCertificateDate(purchase.purchasedAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">Amount</dt>
                      <dd className="font-semibold text-ink">
                        {formatMoney(purchase.amountMinor, purchase.currency)} {purchase.currency}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted">Reference</dt>
                      <dd className="font-semibold break-all text-ink">{purchase.reference}</dd>
                    </div>
                  </dl>
                </div>
                <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-base font-semibold md:self-center ${className}`}>
                  <Icon aria-hidden="true" className="size-5" />
                  <span className="sr-only">Payment status: </span>
                  {label}
                </span>
                <ButtonLink
                  href={`/checkout/${purchase.courseSlug}/status?ref=${encodeURIComponent(purchase.reference)}`}
                  variant="secondary"
                  className="w-full md:w-auto"
                >
                  View Details
                  <span className="sr-only">: {purchase.courseTitle}</span>
                  <ArrowRight aria-hidden="true" className="size-4" />
                </ButtonLink>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
