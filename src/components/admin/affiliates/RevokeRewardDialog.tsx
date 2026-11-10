"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Ban, CircleAlert, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MAX_REWARD_REVOCATION_REASON, validateRewardRevocationReason } from "@/lib/admin/referral-revocations";
import { formatCertificateDate } from "@/lib/certificates/format";
import type { AdminReferral } from "@/types/admin-referrals";
import { ReferralRewardBadge } from "./badges";
import { closeDialog } from "@/lib/ui/close-dialog";

type RevokeRewardDialogProps = {
  /** The approved or claimed referral being revoked, or null when the dialog is closed. */
  referral: AdminReferral | null;
  /**
   * True when the free course was granted on this screen, so there is a
   * demonstration enrolment to revoke with the reward. The dialog says
   * so plainly either way.
   */
  hasGrantedEnrolment: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
};

/**
 * "Revoke Referral Reward?": the confirmation step before a reward that
 * was approved, or already swapped for a course, is taken back.
 *
 * A FRONTEND DEMONSTRATION. No real course access is withdrawn — there
 * is none to withdraw — the student's progress is left exactly as it
 * is, the records are kept rather than deleted, and nobody is notified
 * from here. A reason is required: someone who loses a reward they
 * earned must always be able to be told why.
 */
export function RevokeRewardDialog({
  referral,
  hasGrantedEnrolment,
  onCancel,
  onConfirm,
}: RevokeRewardDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const reasonId = useId();
  const errorId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (referral && !dialog.open) {
      setReason("");
      setError(null);
      dialog.showModal();
    }
    if (!referral && dialog.open) closeDialog(dialog);
  }, [referral]);

  const confirm = () => {
    const message = validateRewardRevocationReason(reason);
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
      {referral && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-canvas text-ink ring-1 ring-line">
                <Ban aria-hidden="true" className="size-5" />
              </span>
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Revoke Referral Reward?
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close without revoking"
              title="Close without revoking"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-secondary hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <p className="mt-4 text-base text-ink">
            Please provide a reason for revoking this referral reward. The referral, the approval and the course it
            was swapped for are all kept on record.
          </p>

          <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl bg-canvas p-4 text-base sm:grid-cols-2">
            <Detail label="Referrer name">{referral.referrerName}</Detail>
            <Detail label="Referral code">
              <span className="font-mono text-sm">{referral.referralCode}</span>
            </Detail>
            <Detail label="Reward status">
              <ReferralRewardBadge status={referral.rewardStatus} />
            </Detail>
            <Detail label="Referral ID">
              <span className="font-mono text-sm">{referral.id}</span>
            </Detail>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <dt className="text-sm font-semibold text-ink-muted">Free course granted</dt>
              <dd className="font-semibold text-ink">
                {referral.rewardStatus === "claimed" && referral.claimedCourseTitle ? (
                  <>
                    {referral.claimedCourseTitle}
                    {referral.claimedAt && <> &middot; {formatCertificateDate(referral.claimedAt)}</>}
                  </>
                ) : (
                  "None yet — the reward was approved but not granted"
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-5">
            <label htmlFor={reasonId} className="block text-base font-semibold text-ink">
              Revocation reason <span className="font-normal text-ink-muted">(required)</span>
            </label>
            <textarea
              id={reasonId}
              rows={3}
              maxLength={MAX_REWARD_REVOCATION_REASON}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) setError(validateRewardRevocationReason(event.target.value));
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              placeholder="Enter the reason for revoking this referral reward..."
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
              <p className="mt-1.5 text-sm text-ink-muted">This is kept with the referral and shown in its row.</p>
            )}
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            <span>
              {hasGrantedEnrolment ? (
                <>
                  The enrolment this reward created will be marked Revoked with it. Nothing else is touched: the
                  student keeps every lesson they have finished, and their other enrolments — paid or free — are left
                  alone.
                </>
              ) : (
                <>
                  Only the reward is revoked; no enrolment was created from it here. The student&rsquo;s other
                  enrolments — paid or free — are left alone.
                </>
              )}{" "}
              Frontend demonstration: no real course access is withdrawn, and nobody is notified from here.
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
              <Ban aria-hidden="true" className="size-5" />
              Confirm Revocation
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
