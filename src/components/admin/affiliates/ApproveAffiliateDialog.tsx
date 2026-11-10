"use client";

import { useEffect, useId, useRef } from "react";
import { CircleCheck, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCertificateDate } from "@/lib/certificates/format";
import type { AdminAffiliate } from "@/types/admin-affiliates";
import { closeDialog } from "@/lib/ui/close-dialog";

type ApproveAffiliateDialogProps = {
  /** The pending application being approved, or null when the dialog is closed. */
  affiliate: AdminAffiliate | null;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * "Approve Affiliate Application?": the confirmation step before an
 * application is marked approved.
 *
 * A FRONTEND DEMONSTRATION. It records the decision on this screen: it
 * does not switch on referral tracking, create a commission, pay anybody
 * or send the applicant a message.
 */
export function ApproveAffiliateDialog({ affiliate, onCancel, onConfirm }: ApproveAffiliateDialogProps) {
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
                <CircleCheck aria-hidden="true" className="size-5" />
              </span>
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Approve Affiliate Application?
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

          <p className="mt-4 text-base text-ink">Are you sure you want to approve this affiliate application?</p>

          <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl bg-canvas p-4 text-base sm:grid-cols-2">
            <Detail label="Affiliate name">{affiliate.name}</Detail>
            <Detail label="Email address">
              <span className="break-all">{affiliate.email}</span>
            </Detail>
            <Detail label="Referral code">
              <span className="font-mono">{affiliate.referralCode}</span>
            </Detail>
            <Detail label="Application date">{formatCertificateDate(affiliate.joinedAt)}</Detail>
          </dl>

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            Frontend demonstration. The decision is recorded on this screen only: no referral tracking is switched on,
            no commission is created and the applicant is not notified.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="lg" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="lg" onClick={onConfirm}>
              <CircleCheck aria-hidden="true" className="size-5" />
              Confirm Approval
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
