"use client";

import { useEffect, useId, useRef } from "react";
import { Banknote, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { payoutMethodLabels } from "@/lib/admin/affiliate-payouts";
import { formatCertificateDate } from "@/lib/certificates/format";
import { formatMoney } from "@/lib/payments/money";
import type { AdminPayoutRequest } from "@/types/admin-affiliates";
import { closeDialog } from "@/lib/ui/close-dialog";

type MarkPayoutPaidDialogProps = {
  /** The approved request being marked as paid, or null when the dialog is closed. */
  request: AdminPayoutRequest | null;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * "Mark Payout as Paid?": the confirmation step before a payout is
 * recorded as sent.
 *
 * A FRONTEND DEMONSTRATION, and this is the one thing the screen must
 * never be mistaken for: NO MONEY MOVES. No payment service, bank or
 * wallet is connected to GrowPilot, so confirming records a simulated
 * payout — the status and a date — and the affiliate is not paid and
 * not notified from here.
 */
export function MarkPayoutPaidDialog({ request, onCancel, onConfirm }: MarkPayoutPaidDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (request && !dialog.open) dialog.showModal();
    if (!request && dialog.open) closeDialog(dialog);
  }, [request]);

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
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Banknote aria-hidden="true" className="size-5" />
              </span>
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Mark Payout as Paid?
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close without marking as paid"
              title="Close without marking as paid"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-secondary hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <p className="mt-4 text-base text-ink">
            This is a <span className="font-semibold">simulated payout</span>. The request will be marked as Paid
            and today&rsquo;s date recorded against it. No money is sent and no payment is made.
          </p>

          <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl bg-canvas p-4 text-base sm:grid-cols-2">
            <Detail label="Affiliate name">{request.affiliateName}</Detail>
            <Detail label="Request ID">
              <span className="font-mono text-sm">{request.id}</span>
            </Detail>
            <Detail label="Payout amount">
              <span className="tabular-nums">{formatMoney(request.amountMinor, request.currency)}</span>
            </Detail>
            <Detail label="Payout method">{payoutMethodLabels[request.method]}</Detail>
            <Detail label="Request date">{formatCertificateDate(request.requestedAt)}</Detail>
          </dl>

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            <span>
              Simulated payout — frontend demonstration only. No payment service is connected to GrowPilot, so no
              money is transferred, nothing leaves any account and the affiliate is not notified from here. This
              records that a payment was made elsewhere; it never makes one.
            </span>
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="lg" onClick={onCancel}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold whitespace-nowrap text-white shadow-button transition-colors duration-150 hover:bg-primary-hover"
            >
              <Banknote aria-hidden="true" className="size-5" />
              Confirm Simulated Payout
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
