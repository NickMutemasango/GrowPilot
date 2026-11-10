"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CircleAlert, Info, ShieldOff, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MAX_REVOCATION_REASON, validateRevocationReason } from "@/lib/admin/enrolment-status";
import type { AdminEnrolment } from "@/types/admin-enrolments";
import { EnrolmentStatusBadge } from "./badges";
import { closeDialog } from "@/lib/ui/close-dialog";

type RevokeEnrolmentDialogProps = {
  /** The enrolment being revoked, or null when the dialog is closed. */
  enrolment: AdminEnrolment | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
};

/**
 * "Revoke Student Enrolment?": the confirmation step before an enrolment
 * is marked as revoked.
 *
 * A FRONTEND DEMONSTRATION. It marks the record on this screen; it does
 * not withdraw course access, delete progress or certificates, or touch
 * payments — the dialog says so plainly, and a reason is required so the
 * decision can always be explained afterwards.
 */
export function RevokeEnrolmentDialog({ enrolment, onCancel, onConfirm }: RevokeEnrolmentDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const reasonId = useId();
  const errorId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (enrolment && !dialog.open) {
      setReason("");
      setError(null);
      dialog.showModal();
    }
    if (!enrolment && dialog.open) closeDialog(dialog);
  }, [enrolment]);

  const confirm = () => {
    const message = validateRevocationReason(reason);
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
      {enrolment && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#FDECEA] text-[#9A3412]">
                <ShieldOff aria-hidden="true" className="size-5" />
              </span>
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Revoke Student Enrolment?
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
            Are you sure you want to revoke this student&rsquo;s enrolment? The enrolment will be marked as revoked, but
            the student&rsquo;s learning progress will be preserved.
          </p>

          <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl bg-canvas p-4 text-base sm:grid-cols-2">
            <Detail label="Student name">{enrolment.studentName}</Detail>
            <Detail label="Course title">{enrolment.courseTitle}</Detail>
            <Detail label="Current enrolment status">
              <EnrolmentStatusBadge status={enrolment.status} />
            </Detail>
            <Detail label="Learning progress">
              {enrolment.progress}% · {enrolment.completedLessons} of {enrolment.totalLessons} lessons
            </Detail>
          </dl>

          <div className="mt-5">
            <label htmlFor={reasonId} className="block text-base font-semibold text-ink">
              Reason for revoking <span className="font-normal text-ink-muted">(required)</span>
            </label>
            <textarea
              id={reasonId}
              rows={3}
              maxLength={MAX_REVOCATION_REASON}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) setError(validateRevocationReason(event.target.value));
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              placeholder="Enter the reason for revoking this enrolment..."
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
              <p className="mt-1.5 text-sm text-ink-muted">
                This is kept with the enrolment and shown in its details.
              </p>
            )}
          </div>

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            Frontend demonstration. The record is marked on this screen only: nothing is deleted, no certificate or
            payment is affected, no refund is made and no course access is actually withdrawn.
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
              <ShieldOff aria-hidden="true" className="size-5" />
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
