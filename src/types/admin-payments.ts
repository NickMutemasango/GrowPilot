import type { CourseCategoryId } from "./course";
import type { Currency, PaymentStatus } from "./payments";

/*
 * Transactions as administrators see them (Step 12D.5: viewing only).
 *
 * This shape joins what a database would keep apart: the payment record,
 * the student account and the course. It carries only what an
 * administrator needs to recognise a transaction — never card numbers,
 * provider references, billing addresses or anything else that would let
 * this page leak a payment detail.
 *
 * The five statuses are the ones the rest of the project already uses
 * (src/types/payments.ts), so nothing here can drift from checkout:
 * "paid" is what this page labels Successful.
 */

export const TRANSACTION_STATUSES = ["paid", "pending", "failed", "cancelled", "refunded"] as const;

/** How the money was taken. Demonstration labels: no provider is connected. */
export const PAYMENT_METHODS = ["card", "mobile-money", "bank-transfer"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type AdminTransaction = {
  /** The reference an administrator would quote, for example "GP-TXN-001". */
  id: string;
  studentId: string;
  studentName: string;
  /** Shown in the details panel so two students with the same name can be told apart. */
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  courseCategory: CourseCategoryId;
  /**
   * What the course costs in the catalogue, and what this transaction was
   * for, both in the currency's smallest unit (cents for USD), as money is
   * held everywhere else in this project. Never a floating-point sum: see
   * src/lib/payments/money.ts.
   *
   * They are kept apart because they answer different questions — the list
   * price today, and the amount this payment was for — and a later step
   * (a discount, a part payment) will make them differ.
   */
  coursePriceMinor: number;
  amountMinor: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  /**
   * Set only on a refunded transaction (Step 12D.7). The original amount,
   * date and reference above are never touched, so the record always
   * shows what was paid as well as what was given back.
   */
  refundedAt?: string | null;
  refundReason?: string | null;
  /** Full refunds only in this step, so this always equals the amount paid. */
  refundAmountMinor?: number | null;
};

export type TransactionStatusFilter = "all" | PaymentStatus;

export type TransactionFilters = {
  query: string;
  status: TransactionStatusFilter;
};

export const NO_TRANSACTION_FILTERS: TransactionFilters = { query: "", status: "all" };

/**
 * The four figures above the table. Counts only: a count can be added up
 * across currencies, a sum of money cannot.
 */
export type PaymentSummary = {
  total: number;
  successful: number;
  pending: number;
  failed: number;
  refunded: number;
};

/*
 * Step 12D.7: refunding a transaction (frontend demonstration only).
 *
 * Marking a transaction refunded never deletes it and never creates a
 * second one: the original record stays, with the refund recorded
 * against it.
 */

/** Why and when a transaction was refunded, and for how much. */
export type TransactionRefund = { reason: string; refundedAt: string; amountMinor: number };

/** Refunds kept against transaction ids, so a sample record can be marked without rewriting it. */
export type RefundsById = Record<string, TransactionRefund>;
