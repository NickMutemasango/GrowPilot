import type { AdminAffiliate, AffiliateDecision, DecisionsById } from "@/types/admin-affiliates";

/*
 * Deciding an affiliate application (Step 12E.2).
 * FRONTEND DEMONSTRATION ONLY.
 *
 * Pure functions, so the same rules run in the dialogs and in the tests
 * (affiliate-decisions.test.ts).
 *
 * What a decision does here: it records the outcome against the
 * application. What it deliberately does NOT do:
 *
 *  - It never deletes a record. A rejected application stays in the
 *    list, with its reason, so the decision is always on record.
 *  - It never activates real referral tracking, creates a commission or
 *    changes anyone's earnings. Approving marks the application; it does
 *    not pay anybody.
 *  - It never notifies the applicant. No email or message is sent from
 *    this project.
 *
 * When this is real, the same checks must run again on the server, and
 * each decision needs an audit entry naming the administrator.
 */

/** The longest reason we keep. Long enough to explain, short enough to read. */
export const MAX_REJECTION_REASON = 500;

/** A reason is required: an applicant turned away without one can never be told why. */
export const REJECTION_REASON_REQUIRED = "Please say why this application is being rejected.";

/**
 * Whether this application is still waiting for a decision.
 *
 * Only a pending one can be decided, so an application that has already
 * been approved, rejected or suspended can never be decided twice.
 */
export function canDecide(affiliate: AdminAffiliate): boolean {
  return affiliate.status === "pending";
}

/** Checks the reason typed into the reject dialog. Returns a message, or null when it will do. */
export function validateRejectionReason(reason: string): string | null {
  return reason.trim().length === 0 ? REJECTION_REASON_REQUIRED : null;
}

/** Tidies a typed reason into the form that gets stored. */
export function cleanRejectionReason(reason: string): string {
  return reason.trim().slice(0, MAX_REJECTION_REASON);
}

/** The decision recorded when an application is approved now. */
export function approvalDecision(now: Date = new Date()): AffiliateDecision {
  return { outcome: "approved", decidedAt: now.toISOString() };
}

/** The decision recorded when an application is rejected now. */
export function rejectionDecision(reason: string, now: Date = new Date()): AffiliateDecision {
  return { outcome: "rejected", decidedAt: now.toISOString(), reason: cleanRejectionReason(reason) };
}

/**
 * Records one decision against an application, keeping everything else
 * as it was: the same id, name, email address, referral code and
 * original application date. Only the status and the decision fields
 * change.
 */
export function applyDecision(affiliate: AdminAffiliate, decision: AffiliateDecision): AdminAffiliate {
  return {
    ...affiliate,
    status: decision.outcome,
    decidedAt: decision.decidedAt,
    rejectionReason: decision.outcome === "rejected" ? decision.reason : null,
  };
}

/**
 * Lays the decisions made in this browser over the affiliates the page
 * was given, so a sample record can be decided without the sample data
 * being rewritten. Affiliates with no decision come back untouched.
 */
export function withDecisions(affiliates: readonly AdminAffiliate[], decisions: DecisionsById): AdminAffiliate[] {
  return affiliates.map((affiliate) => {
    const decision = decisions[affiliate.id];
    // The rule is checked here too, not only in the dialogs: stored data must
    // never be able to re-decide an application that was already settled.
    return decision && canDecide(affiliate) ? applyDecision(affiliate, decision) : affiliate;
  });
}

/** Drops decisions whose application is no longer on the page, so the stored set can't grow stale. */
export function pruneDecisions(decisions: DecisionsById, affiliates: readonly AdminAffiliate[]): DecisionsById {
  const ids = new Set(affiliates.map((affiliate) => affiliate.id));
  const kept: DecisionsById = {};
  for (const [id, decision] of Object.entries(decisions)) if (ids.has(id)) kept[id] = decision;
  return kept;
}
