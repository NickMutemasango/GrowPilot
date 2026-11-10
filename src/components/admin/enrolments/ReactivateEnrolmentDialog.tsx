"use client";

import { useEffect, useId, useRef } from "react";
import { Info, ShieldOff, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCertificateDate } from "@/lib/certificates/format";
import type { AdminEnrolment } from "@/types/admin-enrolments";
import { EnrolmentStatusBadge } from "./badges";
import { closeDialog } from "@/lib/ui/close-dialog";

type ReactivateEnrolmentDialogProps = {
  /** The revoked enrolment being put back, or null when the dialog is closed. */
  enrolment: AdminEnrolment | null;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * "Reactivate Student Enrolment?": the confirmation step before a revoked
 * enrolment is put back.
 *
 * A FRONTEND DEMONSTRATION. It changes what the admin table says; it does
 * not restore real course access, and it creates nothing — the same
 * record is reused, with its progress and its revocation history intact.
 */
export function ReactivateEnrolmentDialog({ enrolment, onCancel, onConfirm }: ReactivateEnrolmentDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (enrolment && !dialog.open) dialog.showModal();
    if (!enrolment && dialog.open) closeDialog(dialog);
  }, [enrolment]);

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
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <UserCheck aria-hidden="true" className="size-5" />
              </span>
              <h2 id={titleId} className="text-2xl font-bold tracking-tight">
                Reactivate Student Enrolment?
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
            This will restore the student&rsquo;s enrolment status to Active while keeping their previous learning
            progress.
          </p>

          <dl className="mt-5 grid gap-x-6 gap-y-3 rounded-2xl bg-canvas p-4 text-base sm:grid-cols-2">
            <Detail label="Student name">{enrolment.studentName}</Detail>
            <Detail label="Course title">{enrolment.courseTitle}</Detail>
            <Detail label="Current status">
              <EnrolmentStatusBadge status={enrolment.status} />
            </Detail>
            <Detail label="Previous learning progress">
              {enrolment.progress}% · {enrolment.completedLessons} of {enrolment.totalLessons} lessons
            </Detail>
            <Detail label="Original enrolment date">{formatCertificateDate(enrolment.enrolledAt)}</Detail>
            {enrolment.revokedAt && <Detail label="Revoked on">{formatCertificateDate(enrolment.revokedAt)}</Detail>}
          </dl>

          {enrolment.revocationReason && (
            <section aria-label="Why it was revoked" className="mt-4 flex items-start gap-3 rounded-2xl bg-[#FDECEA] p-4">
              <ShieldOff aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#9A3412]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#9A3412]">Why it was revoked</p>
                <p className="mt-1 text-base break-words whitespace-pre-line text-ink">{enrolment.revocationReason}</p>
              </div>
            </section>
          )}

          <p className="mt-5 flex items-start gap-2 rounded-2xl bg-accent/25 p-3 text-sm text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
            Frontend demonstration. No new enrolment is created and nothing is reset: the same record is put back, its
            progress and its revocation history are kept, and no real course access is restored.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="lg" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="lg" onClick={onConfirm}>
              <UserCheck aria-hidden="true" className="size-5" />
              Confirm Reactivation
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
