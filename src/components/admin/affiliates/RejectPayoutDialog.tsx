"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CircleAlert, CircleX, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { payoutMethodLabels } from "@/lib/admin/affiliate-payouts";
import { MAX_PAYOUT_REJECTION_REASON, validatePayoutRejectionReason } from "@/lib/admin/payout-decisions";
import { formatCertificateDate } from "@/lib/certificates/format";
import { formatMoney } from "@/lib/payments/money";
import type { AdminPayoutRequest } from "@/types/admin-affiliates";
import { closeDialog } from "@/lib/ui/close-dialog";

type RejectPayoutDialogProps = {
  /** The pending request being rejected, or null when the dialog is closed. */
  request: AdminPayoutRequest | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
};

/**
 * "Reject Payout Request?": the confirmation step before a request is
 * turned down.
 *
 * A FRONTEND DEMONSTRATION. The request is kept, never deleted, and the
 * affiliate is not notified from here. A reason is required: someone
 * refused their own money must always be able to be told why.
 */
export function RejectPayoutDialog({ request, onCancel, onConfirm }: RejectPayoutDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const reasonId = useId();
  const errorId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (request && !dialog.open) {
      setReason("");
      setError(null);
      dialog.showModal();
    }
    if (!request && dialog.open) closeDialog(dialog);
  }, [request]);

  const confirm = () => {
    const message = validatePayoutRejectionReason(reason);
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
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-line bg-surface p-0 text-ink shadow-menu backdrop:bg-ink/50"
    >
      {request && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#FDECEA] text-[#9A3412]">
                <CircleX aria-hidden="true" className="size-5" />
              </span>
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Reject Payout Request?
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close without rejecting"
              title="Close without rejecting"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-secondary hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <p className="mt-4 text-base text-ink">Please provide a reason for rejecting this payout request.</p>

          <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl bg-canvas p-4 text-base sm:grid-cols-2">
            <Detail label="Affiliate name">{request.affiliateName}</Detail>
            <Detail label="Request ID">
              <span className="font-mono text-sm">{request.id}</span>
            </Detail>
            <Detail label="Requested amount">
              <span className="tabular-nums">{formatMoney(request.amountMinor, request.currency)}</span>
            </Detail>
            <Detail label="Payout method">{payoutMethodLabels[request.method]}</Detail>
            <Detail label="Request date">{formatCertificateDate(request.requestedAt)}</Detail>
          </dl>

          <div className="mt-5">
            <label htmlFor={reasonId} className="block text-base font-semibold text-ink">
              Rejection reason <span className="font-normal text-ink-muted">(required)</span>
            </label>
            <textarea
              id={reasonId}
              rows={3}
              maxLength={MAX_PAYOUT_REJECTION_REASON}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) setError(validatePayoutRejectionReason(event.target.value));
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              placeholder="Enter the reason for rejecting this payout request..."
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
              <p className="mt-1.5 text-sm text-ink-muted">This is kept with the request and shown in its row.</p>
            )}
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            <span>
              Frontend demonstration. The request is kept, not deleted, the amount asked for is unchanged, and the
              affiliate is not notified from here.
            </span>
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="lg" onClick={onCancel}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={confirm}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#9A3412] px-5 text-base font-semibold whitespace-nowrap text-white shadow-button transition-colors duration-150 hover:bg-[#7C2D12] active:bg-[#6B2710]"
            >
              <CircleX aria-hidden="true" className="size-5" />
              Confirm Rejection
            </button>
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
