import type {
  AdminEnrolment,
  EnrolmentRevocation,
  EnrolmentStatusChange,
  StatusChangesById,
} from "@/types/admin-enrolments";

/*
 * The enrolment status lifecycle an administrator controls: revoking
 * (Step 12D.3) and putting an enrolment back (Step 12D.4).
 * FRONTEND DEMONSTRATION ONLY.
 *
 * Pure functions, so the same rules run in the dialogs and in the tests
 * (enrolment-status.test.ts).
 *
 * Two things hold for both actions:
 *
 *  - Nothing is ever deleted or reset. The student's progress, lesson
 *    counts, certificates, enrolment date, course and payment records are
 *    untouched; only the status and the history fields change.
 *  - Nothing is enforced. Real course access is a server concern; these
 *    functions only change what the admin table says.
 *
 * The history is cumulative: a reactivated enrolment keeps the revocation
 * that came before it, because that is what explains how it got here.
 *
 * When this becomes real, the same checks must run again on the server,
 * and each change needs an audit entry naming the administrator.
 */

/** The longest reason we keep. Long enough for a proper explanation, short enough to read. */
export const MAX_REVOCATION_REASON = 500;

/** A reason is required: revoking without one leaves nobody able to explain it later. */
export const REASON_REQUIRED = "Please say why this enrolment is being revoked.";

/** A change with nothing recorded yet. */
export const NO_STATUS_CHANGE: EnrolmentStatusChange = { revocation: null, reactivatedAt: null };

/**
 * Whether this enrolment can be revoked. Anything already revoked cannot
 * be revoked again, so the action is hidden on those rows rather than
 * shown and refused.
 */
export function canRevoke(enrolment: AdminEnrolment): boolean {
  return enrolment.status !== "revoked";
}

/** Whether this enrolment can be put back: only a revoked one can. */
export function canReactivate(enrolment: AdminEnrolment): boolean {
  return enrolment.status === "revoked";
}

/** Checks the reason typed into the revoke dialog. Returns a message, or null when it will do. */
export function validateRevocationReason(reason: string): string | null {
  return reason.trim().length === 0 ? REASON_REQUIRED : null;
}

/** Tidies a typed reason into the form that gets stored. */
export function cleanReason(reason: string): string {
  return reason.trim().slice(0, MAX_REVOCATION_REASON);
}

/**
 * Marks one enrolment as revoked, keeping everything else as it was:
 * the same student, course, enrolment date, type, lesson counts and
 * progress. Only the status and the two revocation fields change.
 */
export function applyRevocation(enrolment: AdminEnrolment, revocation: EnrolmentRevocation): AdminEnrolment {
  return {
    ...enrolment,
    status: "revoked",
    revokedAt: revocation.revokedAt,
    revocationReason: revocation.reason,
    reactivatedAt: null,
  };
}

/**
 * Puts a revoked enrolment back, keeping its history.
 *
 * The status it returns to is worked out from the student's own progress,
 * exactly as it is everywhere else on this page: "Completed" once every
 * lesson is finished, "Active" until then. The revocation that came
 * before is kept and shown as history, never erased.
 */
export function applyReactivation(enrolment: AdminEnrolment, reactivatedAt: string): AdminEnrolment {
  const finished = enrolment.totalLessons > 0 && enrolment.completedLessons >= enrolment.totalLessons;
  return {
    ...enrolment,
    status: finished ? "completed" : "active",
    reactivatedAt,
  };
}

/** Builds the record of a revocation made now. */
export function newRevocation(reason: string, now: Date = new Date()): EnrolmentRevocation {
  return { reason: cleanReason(reason), revokedAt: now.toISOString() };
}

/** The change left after revoking: the revocation stands, nothing has undone it. */
export function revokedChange(revocation: EnrolmentRevocation): EnrolmentStatusChange {
  return { revocation, reactivatedAt: null };
}

/** The change left after reactivating: the same revocation, now undone at this moment. */
export function reactivatedChange(
  change: EnrolmentStatusChange | undefined,
  now: Date = new Date(),
): EnrolmentStatusChange {
  return { revocation: change?.revocation ?? null, reactivatedAt: now.toISOString() };
}

/**
 * Lays the changes made in this browser over the enrolments the page was
 * given, so a sample row can be changed without the sample data being
 * rewritten. Enrolments with no change come back untouched.
 *
 * A reactivation wins over the revocation it undid, including over a row
 * that arrived revoked in the first place — that is how a sample revoked
 * enrolment can be put back.
 */
export function withStatusChanges(
  enrolments: readonly AdminEnrolment[],
  changes: StatusChangesById,
): AdminEnrolment[] {
  return enrolments.map((enrolment) => {
    const change = changes[enrolment.id];
    if (!change) return enrolment;

    const revoked = change.revocation ? applyRevocation(enrolment, change.revocation) : enrolment;
    if (!change.reactivatedAt) return revoked;
    return applyReactivation(revoked, change.reactivatedAt);
  });
}

/** Drops changes whose enrolment is no longer on the page, so the stored set can't grow stale. */
export function pruneStatusChanges(
  changes: StatusChangesById,
  enrolments: readonly AdminEnrolment[],
): StatusChangesById {
  const ids = new Set(enrolments.map((enrolment) => enrolment.id));
  const kept: StatusChangesById = {};
  for (const [id, change] of Object.entries(changes)) if (ids.has(id)) kept[id] = change;
  return kept;
}
