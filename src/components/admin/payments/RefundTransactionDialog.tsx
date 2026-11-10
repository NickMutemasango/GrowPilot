"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CircleAlert, Info, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MAX_REFUND_REASON, validateRefundReason } from "@/lib/admin/refunds";
import { formatMoney } from "@/lib/payments/money";
import type { AdminTransaction } from "@/types/admin-payments";
import { closeDialog } from "@/lib/ui/close-dialog";

type RefundTransactionDialogProps = {
  /** The transaction being refunded, or null when the dialog is closed. */
  transaction: AdminTransaction | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
};

/**
 * "Confirm Refund (Demo)": the confirmation step before a transaction is
 * marked as refunded.
 *
 * A FRONTEND DEMONSTRATION, and the dialog says so in its heading as well
 * as its body. No payment provider is connected, so no money can move;
 * the original transaction is kept and no second one is created. Full
 * refunds only in this step, so the refund amount is shown rather than
 * asked for — it is always the amount paid.
 */
export function RefundTransactionDialog({ transaction, onCancel, onConfirm }: RefundTransactionDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const reasonId = useId();
  const errorId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (transaction && !dialog.open) {
      setReason("");
      setError(null);
      dialog.showModal();
    }
    if (!transaction && dialog.open) closeDialog(dialog);
  }, [transaction]);

  const confirm = () => {
    const message = validateRefundReason(reason);
    setError(message);
    if (message) return;
    onConfirm(reason);
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-line bg-surface p-0 text-ink shadow-menu backdrop:bg-ink/50"
    >
      {transaction && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <RotateCcw aria-hidden="true" className="size-5" />
              </span>
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Confirm Refund (Demo)
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close without refunding"
              title="Close without refunding"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-secondary hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <p className="mt-4 text-base text-ink">
            Are you sure you want to mark this transaction as refunded? This will update the demonstration payment
            record. No actual funds will be transferred.
          </p>

          <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl bg-canvas p-4 text-base sm:grid-cols-2">
            <Detail label="Transaction ID">
              <span className="font-mono break-all">{transaction.id}</span>
            </Detail>
            <Detail label="Student name">{transaction.studentName}</Detail>
            <Detail label="Course title">{transaction.courseTitle}</Detail>
            <Detail label="Currency">{transaction.currency}</Detail>
            <Detail label="Original payment amount">
              {formatMoney(transaction.amountMinor, transaction.currency)}
            </Detail>
            <Detail label="Refund amount">
              <span className="text-lg">{formatMoney(transaction.amountMinor, transaction.currency)}</span>
              <span className="block text-sm font-normal text-ink-muted">
                Full refund. Part refunds aren&rsquo;t available in this step.
              </span>
            </Detail>
          </dl>

          <div className="mt-5">
            <label htmlFor={reasonId} className="block text-base font-semibold text-ink">
              Refund reason <span className="font-normal text-ink-muted">(required)</span>
            </label>
            <textarea
              id={reasonId}
              rows={3}
              maxLength={MAX_REFUND_REASON}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) setError(validateRefundReason(event.target.value));
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              placeholder="Enter the reason for this refund..."
              className={`mt-1.5 w-full rounded-xl border-2 bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-muted focus:border-primary ${
                error ? "border-[#9A3412]" : "border-line"
              }`}
            />
            {error ? (
              <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-2 text-sm font-semibold text-[#9A3412]">
                <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            ) : (
              <p className="mt-1.5 text-sm text-ink-muted">This is kept with the transaction and shown in its details.</p>
            )}
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            Frontend demonstration. No payment provider is connected, so no money moves. The original transaction is
            kept and no second one is created; the student&rsquo;s enrolment, course access and any affiliate
            commission are not affected.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="lg" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="lg" onClick={confirm}>
              <RotateCcw aria-hidden="true" className="size-5" />
              Confirm Refund
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm font-semibold text-ink-muted">{label}</dt>
      <dd className="font-semibold text-ink">{children}</dd>
    </div>
  );
}
