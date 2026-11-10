"use client";

import { useEffect, useId, useRef } from "react";
import { CircleCheck, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCertificateDate } from "@/lib/certificates/format";
import { CHECKOUT_CURRENCY, formatMoney } from "@/lib/payments/money";
import type { AdminReferral } from "@/types/admin-referrals";
import { closeDialog } from "@/lib/ui/close-dialog";

type ApproveRewardDialogProps = {
  /** The eligible referral being approved, or null when the dialog is closed. */
  referral: AdminReferral | null;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * "Approve Referral Reward?": the confirmation step before a free-course
 * reward is agreed to.
 *
 * A FRONTEND DEMONSTRATION, and approving is NOT granting. The reward
 * becomes Approved — one GrowPilot agrees is owed — and nothing else
 * happens: no course is chosen, no access is given, the reward is not
 * marked as Claimed, and nobody is notified from here.
 */
export function ApproveRewardDialog({ referral, onCancel, onConfirm }: ApproveRewardDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (referral && !dialog.open) dialog.showModal();
    if (!referral && dialog.open) closeDialog(dialog);
  }, [referral]);

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
      {referral && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <CircleCheck aria-hidden="true" className="size-5" />
              </span>
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Approve Referral Reward?
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
            This reward will be marked as Approved: GrowPilot agrees a free course is owed. It does{" "}
            <span className="font-semibold">not</span> grant the course, does not choose one, and does not mark the
            reward as Claimed.
          </p>

          <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl bg-canvas p-4 text-base sm:grid-cols-2">
            <Detail label="Referrer name">{referral.referrerName}</Detail>
            <Detail label="Referred student">{referral.referredStudentName}</Detail>
            <Detail label="Referral code">
              <span className="font-mono text-sm">{referral.referralCode}</span>
            </Detail>
            <Detail label="Referral ID">
              <span className="font-mono text-sm">{referral.id}</span>
            </Detail>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <dt className="text-sm font-semibold text-ink-muted">Qualifying course purchase</dt>
              <dd className="font-semibold text-ink">
                {referral.purchasedCourseTitle ? (
                  <>
                    {referral.purchasedCourseTitle}
                    {referral.purchaseAmountMinor !== null && (
                      <>
                        {" "}
                        &middot;{" "}
                        <span className="tabular-nums">
                          {formatMoney(referral.purchaseAmountMinor, CHECKOUT_CURRENCY)}
                        </span>
                      </>
                    )}
                    {referral.purchasedAt && <> &middot; {formatCertificateDate(referral.purchasedAt)}</>}
                  </>
                ) : (
                  "No qualifying purchase on record"
                )}
              </dd>
            </div>
          </dl>

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            <span>
              Frontend demonstration. No reward mechanism is connected to GrowPilot, so no course access is given and
              nobody is notified from here. Choosing and claiming the free course stays with the referrer.
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
