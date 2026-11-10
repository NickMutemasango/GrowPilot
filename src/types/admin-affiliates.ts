import type { Currency } from "./payments";
import type { AffiliateStatus, CommissionStatus } from "./rewards";

/*
 * Affiliates as administrators see them (Step 12E.1: viewing only).
 *
 * The statuses and the underlying record come from the affiliate
 * programme built in Step 10 (src/types/rewards.ts), so nothing here can
 * drift from it. This shape adds what an administrator needs to scan a
 * list — how many sales the affiliate has made and what they have
 * earned — and nothing else: no bank details, no payout information and
 * no address, because this page must never be able to show one.
 */

export const AFFILIATE_STATUSES = ["approved", "pending", "rejected", "suspended"] as const;

export type AdminAffiliate = {
  id: string;
  /** The account behind the affiliate, so a later step can open it. */
  studentId: string;
  name: string;
  email: string;
  /** The code used in links: ?ref=CODE */
  referralCode: string;
  /** Sales that actually earned a commission. */
  successfulSales: number;
  /**
   * Commission earned, in the currency's smallest unit (cents for USD),
   * as money is held everywhere else in this project. Worked out from the
   * sales at the rate in src/config/rewards.ts, never typed in by hand:
   * see affiliate-service.ts.
   */
  commissionEarnedMinor: number;
  currency: Currency;
  status: AffiliateStatus;
  /** The original application date. Never changed by a decision. */
  joinedAt: string;
  /**
   * The decision made on the application (Step 12E.2), where one has
   * been. The record is always kept: a rejected application stays in the
   * list with its reason, it is never deleted.
   */
  decidedAt?: string | null;
  rejectionReason?: string | null;
  /**
   * Suspension (Step 12E.3), where an approved affiliate has been
   * suspended. The record is kept whole: the sales and the commission
   * already earned are never touched by a suspension.
   */
  suspendedAt?: string | null;
  suspensionReason?: string | null;
  /**
   * Reactivation (Step 12E.4), where a suspended affiliate has been let
   * back in. The suspension above is deliberately NOT cleared: it stays
   * as the history of why the account was stopped.
   */
  reactivatedAt?: string | null;
};

export type AffiliateStatusFilter = "all" | AffiliateStatus;

export type AffiliateFilters = {
  query: string;
  status: AffiliateStatusFilter;
};

export const NO_AFFILIATE_FILTERS: AffiliateFilters = { query: "", status: "all" };

/**
 * The four figures above the table. Counts only: a count can be added up
 * across currencies, a sum of money cannot.
 */
export type AffiliateCounts = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  suspended: number;
};

/*
 * Step 12E.2: deciding an application (frontend demonstration only).
 *
 * A decision is recorded against the application; it never deletes the
 * record, never activates real referral tracking and never creates a
 * commission.
 */

export type AffiliateDecision =
  | { outcome: "approved"; decidedAt: string }
  | { outcome: "rejected"; decidedAt: string; reason: string };

/** Decisions kept against affiliate ids, so a sample record can be decided without rewriting it. */
export type DecisionsById = Record<string, AffiliateDecision>;

/*
 * Step 12E.3: suspending an approved affiliate (frontend demonstration
 * only).
 *
 * A suspension is recorded against the affiliate. It never deletes the
 * account, never changes a commission already earned and never blocks
 * anybody's access: no access control exists in this project.
 */

export type AffiliateSuspension = { suspendedAt: string; reason: string };

/** Suspensions kept against affiliate ids, so a sample record can be suspended without rewriting it. */
export type SuspensionsById = Record<string, AffiliateSuspension>;

/*
 * Step 12E.4: reactivating a suspended affiliate (frontend
 * demonstration only).
 *
 * Reactivating puts the account back to Approved. It never deletes the
 * suspension that came before it, never changes a commission already
 * earned and never grants anybody access: no access control exists in
 * this project.
 */

export type AffiliateReactivation = { reactivatedAt: string };

/** Reactivations kept against affiliate ids, applied after the suspensions. */
export type ReactivationsById = Record<string, AffiliateReactivation>;

/*
 * Step 12E.5: affiliate sales and commissions (viewing only).
 *
 * One row per sale made through an affiliate's link. Everything here is
 * worked out from the sample sales and the catalogue price — no amount
 * is typed in by hand — and nothing on the screen approves, reverses or
 * pays a commission.
 */

export const COMMISSION_STATUSES = ["pending", "approved", "paid", "reversed"] as const;

export type AdminAffiliateSale = {
  id: string;
  affiliateId: string;
  affiliateName: string;
  /** The code used in links, so a sale can be traced back to its affiliate. */
  referralCode: string;
  courseSlug: string;
  courseTitle: string;
  /** The course price the commission is worked out from, in minor units. */
  saleAmountMinor: number;
  /** 6000 = 60%. Kept on the row, so an old sale never moves when the policy does. */
  rateBasisPoints: number;
  commissionMinor: number;
  currency: Currency;
  status: CommissionStatus;
  saleAt: string;
};

export type CommissionStatusFilter = "all" | CommissionStatus;

export type AffiliateSaleFilters = {
  /** Searches the affiliate's name. */
  query: string;
  status: CommissionStatusFilter;
};

export const NO_SALE_FILTERS: AffiliateSaleFilters = { query: "", status: "all" };

/**
 * The four figures above the sales table.
 *
 * `totalSales` counts only sales that still earn: a reversed sale is a
 * refund or a failed payment, so it is not a sale in any sense that
 * matters here. Every amount is in the one checkout currency.
 */
export type AffiliateSalesTotals = {
  /** Eligible sales — reversed ones are not counted. */
  totalSales: number;
  /** Pending + approved + paid. Never includes a reversed commission. */
  totalCommissionMinor: number;
  pendingCommissionMinor: number;
  approvedCommissionMinor: number;
  /** Shown for honesty, not added into anything. */
  reversedCommissionMinor: number;
  reversedSales: number;
  currency: Currency;
};

/*
 * Step 12E.6: affiliate payout requests (viewing only).
 *
 * A request is what an affiliate asked for. Nothing on the screen
 * approves one, rejects one, marks one as paid or moves any money: no
 * payment service is connected to this project.
 *
 * NO BANK DETAILS. A payout method is the KIND of payout only. There is
 * deliberately no field here for an account number, a sort code, a
 * wallet address or a phone number, so the page cannot show one even by
 * accident. When payouts are real those details belong with the payment
 * provider, not in this page's data.
 */

export const PAYOUT_STATUSES = ["pending", "approved", "rejected", "paid"] as const;

export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];

export type PayoutMethod = "bank-transfer" | "mobile-money" | "paypal";

export type AdminPayoutRequest = {
  /** The reference an administrator and an affiliate would both quote. */
  id: string;
  affiliateId: string;
  affiliateName: string;
  /** The code used in links, so a request can be traced back to its affiliate. */
  referralCode: string;
  /** What was asked for, in the currency's smallest unit. */
  amountMinor: number;
  currency: Currency;
  /** The kind of payout only — never an account, a number or an address. */
  method: PayoutMethod;
  requestedAt: string;
  status: PayoutStatus;
  /** Why a request was turned down, where it was. Kept with the record. */
  rejectionReason?: string | null;
  /**
   * When the request was approved or rejected (Step 12E.7), where it has
   * been. The request itself is never rewritten beyond its status and
   * these two fields.
   */
  decidedAt?: string | null;
  /**
   * When the request was marked as paid (Step 12E.8), where it has been.
   * A DEMONSTRATION date only: no payment service is connected to this
   * project, so this records that an administrator says a transfer was
   * made elsewhere, never a transfer made from here.
   */
  paidAt?: string | null;
};

export type PayoutStatusFilter = "all" | PayoutStatus;

export type PayoutFilters = {
  /** Searches the affiliate's name and the request id. */
  query: string;
  status: PayoutStatusFilter;
};

export const NO_PAYOUT_FILTERS: PayoutFilters = { query: "", status: "all" };

/**
 * The four figures above the payout table. Counts, each with the money
 * behind it, because "three requests" and "$180 requested" answer
 * different questions.
 */
export type PayoutTotals = {
  total: number;
  totalAmountMinor: number;
  pending: number;
  pendingAmountMinor: number;
  approved: number;
  approvedAmountMinor: number;
  /** Requests marked paid. In this project that is a label, never a transfer. */
  paid: number;
  paidAmountMinor: number;
  rejected: number;
  rejectedAmountMinor: number;
  currency: Currency;
};

/*
 * Step 12E.7: deciding a payout request (frontend demonstration only).
 *
 * A decision is recorded against the request. Approving says the money
 * is owed; it does NOT pay it and never marks the request as Paid —
 * paying is a separate act, and no payment service is connected to this
 * project at all.
 */

export type PayoutDecision =
  | { outcome: "approved"; decidedAt: string }
  | { outcome: "rejected"; decidedAt: string; reason: string };

/** Decisions kept against request ids, so a sample request can be decided without rewriting it. */
export type PayoutDecisionsById = Record<string, PayoutDecision>;

/*
 * Step 12E.8: marking an approved payout request as paid (frontend
 * demonstration only).
 *
 * This records that the money was sent somewhere else; it NEVER sends
 * it. No payment service, bank or wallet is connected to this project,
 * so "Paid" stays what it has always been here — a label on a sample
 * row. Only an approved request can be marked paid, and only once.
 */

export type PayoutPayment = { paidAt: string };

/** Payments kept against request ids, applied after the approve/reject decisions. */
export type PayoutPaymentsById = Record<string, PayoutPayment>;
