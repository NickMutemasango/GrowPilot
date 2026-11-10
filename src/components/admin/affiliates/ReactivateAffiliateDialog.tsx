"use client";

import { useEffect, useId, useRef } from "react";
import { Info, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCertificateDate } from "@/lib/certificates/format";
import type { AdminAffiliate } from "@/types/admin-affiliates";
import { closeDialog } from "@/lib/ui/close-dialog";

type ReactivateAffiliateDialogProps = {
  /** The suspended affiliate being reactivated, or null when the dialog is closed. */
  affiliate: AdminAffiliate | null;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * "Reactivate Affiliate Account?": the confirmation step before a
 * suspended affiliate is let back in.
 *
 * A FRONTEND DEMONSTRATION. The account goes back to Approved and
 * nothing else changes: the suspension stays on the record as history,
 * and the sales and commission already earned are untouched. No reason
 * is asked for — the suspension already says why the account was
 * stopped, and lifting it needs no second explanation.
 */
export function ReactivateAffiliateDialog({ affiliate, onCancel, onConfirm }: ReactivateAffiliateDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (affiliate && !dialog.open) dialog.showModal();
    if (!affiliate && dialog.open) closeDialog(dialog);
  }, [affiliate]);

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
      {affiliate && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <RotateCcw aria-hidden="true" className="size-5" />
              </span>
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Reactivate Affiliate Account?
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close without reactivating"
              title="Close without reactivating"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-secondary hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <p className="mt-4 text-base text-ink">
            This affiliate&rsquo;s account status will be changed back to Approved. Their existing sales, commission and
            suspension history are kept exactly as they are.
          </p>

          <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl bg-canvas p-4 text-base sm:grid-cols-2">
            <Detail label="Affiliate name">{affiliate.name}</Detail>
            <Detail label="Email address">
              <span className="break-all">{affiliate.email}</span>
            </Detail>
            <Detail label="Referral code">
              <span className="font-mono text-sm">{affiliate.referralCode}</span>
            </Detail>
          </dl>

          {affiliate.suspensionReason && (
            <p className="mt-4 rounded-2xl bg-[#FDECEA] p-3 text-sm break-words text-ink">
              <span className="font-semibold text-[#9A3412]">
                Suspended{affiliate.suspendedAt ? ` on ${formatCertificateDate(affiliate.suspendedAt)}` : ""}:
              </span>{" "}
              {affiliate.suspensionReason}
            </p>
          )}

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            Frontend demonstration. The suspension stays on the record, no earnings change, and the affiliate is not
            notified from here.
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
              <RotateCcw aria-hidden="true" className="size-5" />
              Confirm Reactivation
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
