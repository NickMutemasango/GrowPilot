"use client";

import { useEffect, useId, useRef } from "react";
import { BookOpen, Info, Receipt, RotateCcw, User, Wallet, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCertificateDate } from "@/lib/certificates/format";
import { canRefund, whyNotRefundable } from "@/lib/admin/refunds";
import { formatMoney } from "@/lib/payments/money";
import { getCategoryLabel } from "@/types/course";
import type { AdminTransaction } from "@/types/admin-payments";
import { PaymentMethodLabel, TransactionStatusBadge } from "./badges";
import { closeDialog } from "@/lib/ui/close-dialog";

type TransactionDetailsDialogProps = {
  transaction: AdminTransaction | null;
  onClose: () => void;
  /**
   * Opens the refund confirmation. Left out where refunding isn't
   * offered, and then the action simply isn't shown.
   */
  onRefund?: (transaction: AdminTransaction) => void;
};

/**
 * One transaction in full: what it was, who paid, what for and how it
 * ended.
 *
 * The panel itself shows, it does not edit: no amount, status or date can
 * be typed here, nothing can be re-run or downloaded, and no card number,
 * provider reference or billing detail is held in this data, so none can
 * be shown. The one action is "Mark as Refunded" (Step 12D.7), offered
 * only on a successful payment and only through its own confirmation
 * step. Everything shown comes from the transaction the administrator
 * picked; nothing is looked up elsewhere.
 */
export function TransactionDetailsDialog({ transaction, onClose, onRefund }: TransactionDetailsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (transaction && !dialog.open) dialog.showModal();
    if (!transaction && dialog.open) closeDialog(dialog);
  }, [transaction]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // Escape: the browser's own close, caught here so the page's state stays in step.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // A click on the backdrop lands on the dialog element itself, never on its contents.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-line bg-surface p-0 text-ink shadow-menu backdrop:bg-ink/50"
    >
      {transaction && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Transaction Details
              </h2>
              <p className="mt-1 text-base text-ink-muted">View the complete information for this payment.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close transaction details"
              title="Close transaction details"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-secondary hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas p-4">
            <p className="font-mono text-base font-semibold break-all text-ink">{transaction.id}</p>
            <TransactionStatusBadge status={transaction.status} />
          </div>

          <Section icon={Receipt} title="Transaction information">
            <Detail label="Transaction ID">
              <span className="font-mono break-all">{transaction.id}</span>
            </Detail>
            <Detail label="Transaction date">{formatCertificateDate(transaction.createdAt)}</Detail>
            <Detail label="Payment status">
              <TransactionStatusBadge status={transaction.status} />
            </Detail>
            <Detail label="Payment method">
              <PaymentMethodLabel method={transaction.paymentMethod} />
            </Detail>
          </Section>

          <Section icon={User} title="Student information">
            <Detail label="Student name">{transaction.studentName}</Detail>
            <Detail label="Student email">
              <span className="break-all">{transaction.studentEmail}</span>
            </Detail>
          </Section>

          <Section icon={BookOpen} title="Course information">
            <Detail label="Course title">{transaction.courseTitle}</Detail>
            <Detail label="Course category">{getCategoryLabel(transaction.courseCategory)}</Detail>
          </Section>

          <Section icon={Wallet} title="Payment information">
            <Detail label="Course price">
              {formatMoney(transaction.coursePriceMinor, transaction.currency)}
            </Detail>
            <Detail label="Amount paid">
              <span className="text-lg">{formatMoney(transaction.amountMinor, transaction.currency)}</span>
            </Detail>
            <Detail label="Currency">{transaction.currency}</Detail>
            <Detail label="Payment status">
              <TransactionStatusBadge status={transaction.status} />
            </Detail>
            {transaction.refundAmountMinor != null && (
              <Detail label="Refund amount">{formatMoney(transaction.refundAmountMinor, transaction.currency)}</Detail>
            )}
            {transaction.refundedAt && (
              <Detail label="Refund date">{formatCertificateDate(transaction.refundedAt)}</Detail>
            )}
          </Section>

          {transaction.refundReason && (
            <section aria-label="Refund" className="mt-5 flex items-start gap-3 rounded-2xl bg-secondary p-4">
              <RotateCcw aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary-strong" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary-strong">Reason for the refund</p>
                <p className="mt-1 text-base break-words whitespace-pre-line text-ink">{transaction.refundReason}</p>
                <p className="mt-2 text-sm text-ink-muted">
                  The original payment above is kept exactly as it was. No transaction was deleted and no second one
                  was created.
                </p>
              </div>
            </section>
          )}

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            Demonstration transaction. No payment provider is connected and nobody was charged. Nothing above can be
            edited, and marking a payment refunded records it on this screen only — no money is returned.
          </p>

          {/*
            The action is offered only where it is allowed. Where it isn't, the
            reason is said plainly instead of showing a button that would be refused.
          */}
          {onRefund && !canRefund(transaction) && (
            <p className="mt-4 text-sm text-ink-muted">{whyNotRefundable(transaction)}</p>
          )}

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            {onRefund && canRefund(transaction) && (
              <Button onClick={() => onRefund(transaction)}>
                <RotateCcw aria-hidden="true" className="size-5" />
                Mark as Refunded (Demo)
              </Button>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

/** One labelled group. Two columns where there's room, one on a phone. */
function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
        <Icon aria-hidden="true" className="size-5 text-primary" />
        {title}
      </h3>
      <dl className="mt-3 grid gap-x-6 gap-y-3 text-base sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line pb-2">
      <dt className="text-sm font-semibold text-ink-muted">{label}</dt>
      <dd className="font-semibold break-words text-ink">{children}</dd>
    </div>
  );
}
