import type {
  AdminAffiliate,
  AffiliateReactivation,
  AffiliateSuspension,
  ReactivationsById,
  SuspensionsById,
} from "@/types/admin-affiliates";

/*
 * Suspending an affiliate account (Step 12E.3).
 * FRONTEND DEMONSTRATION ONLY.
 *
 * Pure functions, so the same rules run in the dialog and in the tests
 * (affiliate-suspension.test.ts).
 *
 * What a suspension does here: it marks an approved affiliate as
 * suspended and keeps the reason and the date with the record. What it
 * deliberately does NOT do:
 *
 *  - It never deletes the account. The affiliate stays in the list with
 *    their id, name, email address, referral code and registration date
 *    exactly as they were.
 *  - It never touches money. The sales already made and the commission
 *    already earned are carried over untouched; nothing is reversed,
 *    recalculated or paid.
 *  - It never blocks anybody. No access control exists in this project,
 *    so this marks a status on a screen and nothing more.
 *  - It never notifies the affiliate. No email or message is sent from
 *    this project.
 *  - Reactivating is the other half of this file (Step 12E.4). It puts
 *    the account back to Approved and leaves the suspension on the
 *    record as history.
 *
 * When this is real, the same checks must run again on the server, each
 * suspension needs an audit entry naming the administrator, and the
 * referral links must actually stop earning.
 */

/** The longest reason we keep. Long enough to explain, short enough to read. */
export const MAX_SUSPENSION_REASON = 500;

/** A reason is required: an account suspended without one can never be explained afterwards. */
export const SUSPENSION_REASON_REQUIRED = "Please say why this affiliate is being suspended.";

/**
 * Whether this affiliate can be suspended.
 *
 * Only an approved affiliate can be: a pending application has not been
 * accepted yet, a rejected one never was, and an already suspended one
 * cannot be suspended twice.
 */
export function canSuspend(affiliate: AdminAffiliate): boolean {
  return affiliate.status === "approved";
}

/** Checks the reason typed into the suspend dialog. Returns a message, or null when it will do. */
export function validateSuspensionReason(reason: string): string | null {
  return reason.trim().length === 0 ? SUSPENSION_REASON_REQUIRED : null;
}

/** Tidies a typed reason into the form that gets stored. */
export function cleanSuspensionReason(reason: string): string {
  return reason.trim().slice(0, MAX_SUSPENSION_REASON);
}

/** The suspension recorded when an approved affiliate is suspended now. */
export function suspensionRecord(reason: string, now: Date = new Date()): AffiliateSuspension {
  return { suspendedAt: now.toISOString(), reason: cleanSuspensionReason(reason) };
}

/**
 * Records one suspension against an affiliate, keeping everything else
 * as it was: the same id, name, email address, referral code,
 * registration date, successful sales and commission earned. Only the
 * status and the two suspension fields change.
 */
export function applySuspension(affiliate: AdminAffiliate, suspension: AffiliateSuspension): AdminAffiliate {
  return {
    ...affiliate,
    status: "suspended",
    suspendedAt: suspension.suspendedAt,
    suspensionReason: suspension.reason,
  };
}

/**
 * Lays the suspensions made in this browser over the affiliates the page
 * was given, so a sample record can be suspended without the sample data
 * being rewritten. Affiliates with no suspension come back untouched.
 *
 * Run this AFTER the decisions overlay, so an application approved in
 * this browser can then be suspended in the same session.
 */
export function withSuspensions(
  affiliates: readonly AdminAffiliate[],
  suspensions: SuspensionsById,
): AdminAffiliate[] {
  return affiliates.map((affiliate) => {
    const suspension = suspensions[affiliate.id];
    // The rule is checked here too, not only in the dialog: stored data must
    // never be able to suspend someone who was never approved.
    return suspension && canSuspend(affiliate) ? applySuspension(affiliate, suspension) : affiliate;
  });
}

/** Drops suspensions whose affiliate is no longer on the page, so the stored set can't grow stale. */
export function pruneSuspensions(
  suspensions: SuspensionsById,
  affiliates: readonly AdminAffiliate[],
): SuspensionsById {
  const ids = new Set(affiliates.map((affiliate) => affiliate.id));
  const kept: SuspensionsById = {};
  for (const [id, suspension] of Object.entries(suspensions)) if (ids.has(id)) kept[id] = suspension;
  return kept;
}


/*
 * Reactivating a suspended affiliate (Step 12E.4).
 * FRONTEND DEMONSTRATION ONLY.
 *
 * Reactivating is the plain opposite of suspending, and no more than
 * that: the status goes back to Approved. It never deletes the
 * suspension that came before — that stays on the record as the history
 * of why the account was stopped — never touches the sales or the
 * commission already earned, never pays anybody and never grants real
 * access, because no access control exists in this project.
 */

/**
 * Whether this affiliate can be reactivated.
 *
 * Only a suspended one can be: an approved affiliate is already active,
 * and a pending or rejected application was never approved in the first
 * place.
 */
export function canReactivate(affiliate: AdminAffiliate): boolean {
  return affiliate.status === "suspended";
}

/** The reactivation recorded when a suspended affiliate is let back in now. */
export function reactivationRecord(now: Date = new Date()): AffiliateReactivation {
  return { reactivatedAt: now.toISOString() };
}

/**
 * Puts one affiliate back to Approved, keeping everything else as it
 * was: the same id, name, email address, referral code, registration
 * date, successful sales and commission earned — and the suspension
 * date and reason, which stay as history.
 */
export function applyReactivation(
  affiliate: AdminAffiliate,
  reactivation: AffiliateReactivation,
): AdminAffiliate {
  return { ...affiliate, status: "approved", reactivatedAt: reactivation.reactivatedAt };
}

/**
 * Lays the reactivations made in this browser over the affiliates.
 *
 * Run this AFTER the suspensions, so an affiliate suspended in this
 * browser can be let back in again, and a sample record that starts out
 * suspended can be reactivated too.
 */
export function withReactivations(
  affiliates: readonly AdminAffiliate[],
  reactivations: ReactivationsById,
): AdminAffiliate[] {
  return affiliates.map((affiliate) => {
    const reactivation = reactivations[affiliate.id];
    // The rule is checked here too, not only in the dialog: stored data must
    // never be able to approve someone who was never suspended.
    return reactivation && canReactivate(affiliate) ? applyReactivation(affiliate, reactivation) : affiliate;
  });
}

/** Drops reactivations whose affiliate is no longer on the page, so the stored set can't grow stale. */
export function pruneReactivations(
  reactivations: ReactivationsById,
  affiliates: readonly AdminAffiliate[],
): ReactivationsById {
  const ids = new Set(affiliates.map((affiliate) => affiliate.id));
  const kept: ReactivationsById = {};
  for (const [id, reactivation] of Object.entries(reactivations)) if (ids.has(id)) kept[id] = reactivation;
  return kept;
}

/**
 * Forgets one affiliate's reactivation.
 *
 * Needed when a reactivated affiliate is suspended again: the two
 * overlays are read in order, so the later suspension can only take
 * effect once the earlier reactivation is out of the way. The
 * suspension's own reason and date are replaced by the new ones.
 */
export function withoutReactivation(reactivations: ReactivationsById, id: string): ReactivationsById {
  const kept = { ...reactivations };
  delete kept[id];
  return kept;
}
