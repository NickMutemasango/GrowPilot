"use client";

import { useEffect, useId, useRef } from "react";
import { CircleCheck, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { payoutMethodLabels } from "@/lib/admin/affiliate-payouts";
import { formatCertificateDate } from "@/lib/certificates/format";
import { formatMoney } from "@/lib/payments/money";
import type { AdminPayoutRequest } from "@/types/admin-affiliates";
import { closeDialog } from "@/lib/ui/close-dialog";

type ApprovePayoutDialogProps = {
  /** The pending request being approved, or null when the dialog is closed. */
  request: AdminPayoutRequest | null;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * "Approve Payout Request?": the confirmation step before a request is
 * agreed to.
 *
 * A FRONTEND DEMONSTRATION, and approving is NOT paying. The request
 * becomes Approved — money GrowPilot agrees is owed — and nothing else
 * happens: no transfer is made, the request is not marked as Paid, and
 * the affiliate is not notified from here.
 */
export function ApprovePayoutDialog({ request, onCancel, onConfirm }: ApprovePayoutDialogProps) {
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
                <CircleCheck aria-hidden="true" className="size-5" />
              </span>
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Approve Payout Request?
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close without approving"
              title="Close without approving"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-secondary hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <p className="mt-4 text-base text-ink">
            This request will be marked as Approved: GrowPilot agrees the amount is owed. It does{" "}
            <span className="font-semibold">not</span> pay it and does not mark it as Paid.
          </p>

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

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            <span>
              Frontend demonstration. No payment service is connected to GrowPilot, so no money moves and the
              affiliate is not notified from here.
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
              <CircleCheck aria-hidden="true" className="size-5" />
              Confirm Approval
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
