import { ChevronRight, SearchX, ShieldOff, UserCheck } from "lucide-react";
import { formatCertificateDate } from "@/lib/certificates/format";
import { canReactivate, canRevoke } from "@/lib/admin/enrolment-status";
import type { AdminEnrolment } from "@/types/admin-enrolments";
import { AdminEmptyState } from "../AdminEmptyState";
import { EnrolmentStatusBadge, EnrolmentTypeBadge } from "./badges";

type EnrolmentsTableProps = {
  enrolments: AdminEnrolment[];
  /** True when nothing has been searched or filtered, so an empty list really means "none yet". */
  unfiltered: boolean;
  onView: (enrolment: AdminEnrolment) => void;
  /** Left out where revoking isn't offered (the live table), and the action simply isn't shown. */
  onRevoke?: (enrolment: AdminEnrolment) => void;
  /** The opposite action, offered only on revoked rows. Left out the same way. */
  onReactivate?: (enrolment: AdminEnrolment) => void;
};

/** The list of enrolments: a table on wide screens, cards on narrow ones. */
export function EnrolmentsTable({ enrolments, unfiltered, onView, onRevoke, onReactivate }: EnrolmentsTableProps) {
  if (enrolments.length === 0) {
    return unfiltered ? (
      <AdminEmptyState icon={UserCheck} title="No Enrolments Yet">
        Students who enrol in courses will appear here.
      </AdminEmptyState>
    ) : (
      <AdminEmptyState icon={SearchX} title="No enrolments found">
        Try adjusting your search or filters.
      </AdminEmptyState>
    );
  }

  return (
    <>
      {/*
        Seven columns only read well on a genuinely wide screen, so the
        table waits for one (2xl). Below that — including a normal laptop,
        or a wide screen at 125–150% zoom — the same enrolments are shown as
        cards, two across where there's room. That way nothing is ever
        squeezed into a column too narrow for it.
      */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface 2xl:block">
        <table className="w-full min-w-[62rem] text-left text-base">
          <thead className="bg-secondary/60 text-ink">
            <tr>
              <th scope="col" className="w-48 px-5 py-4 font-semibold">Student Name</th>
              <th scope="col" className="w-52 px-5 py-4 font-semibold">Course Name</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Enrolment Date</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Enrolment Type</th>
              <th scope="col" className="w-52 px-5 py-4 font-semibold whitespace-nowrap">Learning Progress</th>
              <th scope="col" className="px-5 py-4 font-semibold whitespace-nowrap">Enrolment Status</th>
              <th scope="col" className="px-5 py-4 font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {enrolments.map((enrolment) => (
              <tr key={enrolment.id} className="align-middle hover:bg-canvas">
                {/* The email address is in the details panel, not on every row: it crowds the
                    table and isn't needed to scan it. Searching by email still works. */}
                <th scope="row" className="px-5 py-5 font-semibold whitespace-nowrap text-ink">
                  {enrolment.studentName}
                </th>
                <td className="px-5 py-5 text-ink">{enrolment.courseTitle}</td>
                <td className="px-5 py-5 whitespace-nowrap text-ink">{formatCertificateDate(enrolment.enrolledAt)}</td>
                <td className="px-5 py-5"><EnrolmentTypeBadge type={enrolment.type} /></td>
                <td className="px-5 py-5"><ProgressCell enrolment={enrolment} /></td>
                <td className="px-5 py-5"><EnrolmentStatusBadge status={enrolment.status} /></td>
                <td className="px-5 py-5">
                  <div className="flex justify-end gap-2">
                    <ViewButton enrolment={enrolment} onView={onView} />
                    {onRevoke && canRevoke(enrolment) && <RevokeButton enrolment={enrolment} onRevoke={onRevoke} />}
                    {onReactivate && canReactivate(enrolment) && (
                      <ReactivateButton enrolment={enrolment} onReactivate={onReactivate} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-4 md:grid-cols-2 2xl:hidden">
        {enrolments.map((enrolment) => (
          <li key={enrolment.id} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
            <p className="text-lg font-bold text-ink">{enrolment.studentName}</p>
            <p className="text-base break-words text-ink-muted">{enrolment.studentEmail}</p>
            <p className="mt-3 text-base font-semibold text-ink">{enrolment.courseTitle}</p>
            <p className="mt-1 text-base text-ink-muted">Enrolled {formatCertificateDate(enrolment.enrolledAt)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <EnrolmentTypeBadge type={enrolment.type} />
              <EnrolmentStatusBadge status={enrolment.status} />
            </div>
            <div className="mt-4">
              <ProgressCell enrolment={enrolment} />
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <ViewButton enrolment={enrolment} onView={onView} full />
              {onRevoke && canRevoke(enrolment) && <RevokeButton enrolment={enrolment} onRevoke={onRevoke} full />}
              {onReactivate && canReactivate(enrolment) && (
                <ReactivateButton enrolment={enrolment} onReactivate={onReactivate} full />
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** A small bar with the figures beside it, so progress reads the same on a phone or a monitor. */
function ProgressCell({ enrolment }: { enrolment: AdminEnrolment }) {
  const detail = `${enrolment.completedLessons} of ${enrolment.totalLessons} lessons done`;
  return (
    <div className="min-w-36">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={enrolment.progress}
        aria-valuetext={`${enrolment.progress}% complete, ${detail}`}
        aria-label={`${enrolment.studentName} on ${enrolment.courseTitle}`}
        className="h-3 overflow-hidden rounded-full bg-secondary ring-1 ring-primary/10"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${enrolment.progress}%` }} />
      </div>
      <p className="mt-1.5 text-sm whitespace-nowrap text-ink-muted">
        <span className="font-semibold text-ink">{enrolment.progress}%</span> · {enrolment.completedLessons} of{" "}
        {enrolment.totalLessons} lessons
      </p>
    </div>
  );
}

function ViewButton({ enrolment, onView, full }: { enrolment: AdminEnrolment; onView: (enrolment: AdminEnrolment) => void; full?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onView(enrolment)}
      className={`inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border-2 border-primary px-3 text-base font-semibold whitespace-nowrap text-primary hover:bg-secondary ${full ? "w-full" : ""}`}
    >
      View Details
      <span className="sr-only">
        : {enrolment.studentName} on {enrolment.courseTitle}
      </span>
      <ChevronRight aria-hidden="true" className="size-4" />
    </button>
  );
}

/**
 * The destructive action, in red so it never reads as an ordinary one.
 * Only rendered for enrolments that can be revoked, so nobody is offered
 * an action that would then be refused.
 */
function RevokeButton({
  enrolment,
  onRevoke,
  full,
}: {
  enrolment: AdminEnrolment;
  onRevoke: (enrolment: AdminEnrolment) => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onRevoke(enrolment)}
      className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-[#9A3412] px-3 text-base font-semibold whitespace-nowrap text-[#9A3412] hover:bg-[#FDECEA] ${full ? "w-full" : ""}`}
    >
      <ShieldOff aria-hidden="true" className="size-4" />
      Revoke
      <span className="sr-only">
        {" "}
        enrolment: {enrolment.studentName} on {enrolment.courseTitle}
      </span>
    </button>
  );
}

/**
 * Putting a revoked enrolment back. Forest green, because it restores
 * rather than removes, and only rendered on rows that are revoked.
 */
function ReactivateButton({
  enrolment,
  onReactivate,
  full,
}: {
  enrolment: AdminEnrolment;
  onReactivate: (enrolment: AdminEnrolment) => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onReactivate(enrolment)}
      className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 border-primary bg-secondary px-3 text-base font-semibold whitespace-nowrap text-primary-strong hover:bg-secondary-hover ${full ? "w-full" : ""}`}
    >
      <UserCheck aria-hidden="true" className="size-4" />
      Reactivate
      <span className="sr-only">
        {" "}
        enrolment: {enrolment.studentName} on {enrolment.courseTitle}
      </span>
    </button>
  );
}
