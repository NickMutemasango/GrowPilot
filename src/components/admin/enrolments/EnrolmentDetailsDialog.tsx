"use client";

import { useEffect, useId, useRef } from "react";
import { ShieldOff, X } from "lucide-react";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Button } from "@/components/ui/Button";
import { formatCertificateDate } from "@/lib/certificates/format";
import type { AdminEnrolment } from "@/types/admin-enrolments";
import { EnrolmentStatusBadge, EnrolmentTypeBadge } from "./badges";
import { closeDialog } from "@/lib/ui/close-dialog";

type EnrolmentDetailsDialogProps = {
  enrolment: AdminEnrolment | null;
  onClose: () => void;
};

/**
 * One enrolment in full: the student, the course, how far they got, and —
 * when it has been revoked — when that happened and why.
 *
 * Revoking is done from the table, not from here. The original enrolment
 * date, course, student and progress are always shown, revoked or not, so
 * the record of what the student did is never lost.
 */
export function EnrolmentDetailsDialog({ enrolment, onClose }: EnrolmentDetailsDialogProps) {
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
        onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(38rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-line bg-surface p-0 text-ink shadow-menu backdrop:bg-ink/50"
    >
      {enrolment && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id={titleId} className="text-2xl font-bold tracking-tight break-words">
                {enrolment.studentName}
              </h2>
              <p className="text-base break-all text-ink-muted">{enrolment.studentEmail}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              title="Close details"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink-muted hover:bg-secondary hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <section aria-label="Course progress" className="mt-5 rounded-2xl bg-canvas p-4">
            <p className="text-lg font-bold text-ink">{enrolment.courseTitle}</p>
            <div className="mt-3">
              <ProgressBar
                value={enrolment.progress}
                label={`${enrolment.studentName} on ${enrolment.courseTitle}`}
                detail={`${enrolment.completedLessons} of ${enrolment.totalLessons} lessons done`}
              />
            </div>
          </section>

          <dl className="mt-5 grid gap-x-6 gap-y-3 text-base sm:grid-cols-2">
            <Detail label="Student name">{enrolment.studentName}</Detail>
            <Detail label="Course title">{enrolment.courseTitle}</Detail>
            <Detail label="Enrolment date">{formatCertificateDate(enrolment.enrolledAt)}</Detail>
            <Detail label="Enrolment type">
              <EnrolmentTypeBadge type={enrolment.type} />
            </Detail>
            <Detail label="Enrolment status">
              <EnrolmentStatusBadge status={enrolment.status} />
            </Detail>
            <Detail label="Course progress">{enrolment.progress}% complete</Detail>
            <Detail label="Completed lessons">{enrolment.completedLessons}</Detail>
            <Detail label="Total lessons">{enrolment.totalLessons}</Detail>
            {enrolment.revokedAt && <Detail label="Revocation date">{formatCertificateDate(enrolment.revokedAt)}</Detail>}
            {enrolment.reactivatedAt && (
              <Detail label="Reactivation date">{formatCertificateDate(enrolment.reactivatedAt)}</Detail>
            )}
          </dl>

          {/*
            The reason is kept after an enrolment is put back, because the history is
            what explains the record. Only the heading changes: while it stands it is
            why access was withdrawn; afterwards it is why it had been.
          */}
          {enrolment.revocationReason && (
            <section
              aria-label="Revocation"
              className={`mt-5 flex items-start gap-3 rounded-2xl p-4 text-ink ${
                enrolment.status === "revoked" ? "bg-[#FDECEA]" : "bg-canvas"
              }`}
            >
              <ShieldOff
                aria-hidden="true"
                className={`mt-0.5 size-5 shrink-0 ${enrolment.status === "revoked" ? "text-[#9A3412]" : "text-ink-muted"}`}
              />
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold ${enrolment.status === "revoked" ? "text-[#9A3412]" : "text-ink-muted"}`}
                >
                  {enrolment.status === "revoked" ? "Reason for revoking" : "Previously revoked — reason given"}
                </p>
                <p className="mt-1 text-base break-words whitespace-pre-line">{enrolment.revocationReason}</p>
                <p className="mt-2 text-sm text-ink-muted">
                  {enrolment.status === "revoked"
                    ? "The lessons above are what the student had completed. Their progress and any certificate they earned are kept."
                    : "This enrolment has since been reactivated. The record was kept throughout, along with the student's progress."}
                </p>
              </div>
            </section>
          )}

          <p className="mt-5 text-sm text-ink-muted">
            This panel is for viewing only. Revoking and reactivating are done from the table; course access and
            payments are not changed from this page.
          </p>

          <div className="mt-5 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line pb-2">
      <dt className="text-sm font-semibold text-ink-muted">{label}</dt>
      <dd className="font-semibold text-ink">{children}</dd>
    </div>
  );
}
