/*
 * Payment and enrolment records, shaped as a database would store them.
 * Money is always in minor units (cents) to avoid rounding errors.
 */

export type Currency = "USD";

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded";

export type EnrolmentStatus = "active" | "pending_payment" | "cancelled" | "revoked";

export type CheckoutFee = { label: string; amountMinor: number };

/** The price worked out on the server. The browser never sends a price. */
export type CheckoutQuote = {
  courseId: string;
  courseSlug: string;
  currency: Currency;
  priceMinor: number;
  fees: CheckoutFee[];
  totalMinor: number;
};

export type Order = {
  /** Our reference, shown to the student, e.g. "GPA-7K2M9Q4TXW3H". */
  reference: string;
  studentId: string;
  courseId: string;
  courseSlug: string;
  amountMinor: number;
  currency: Currency;
  status: PaymentStatus;
  /** The payment provider's own transaction ID, once known. */
  providerReference: string | null;
  createdAt: string;
  updatedAt: string;
};

/** One per student and course (enforce with a unique constraint). */
export type EnrolmentRecord = {
  studentId: string;
  courseId: string;
  courseSlug: string;
  status: EnrolmentStatus;
  enrolledAt: string;
  /** "free" for free courses. */
  paymentStatus: PaymentStatus | "free";
  paymentReference: string | null;
  amountMinor: number;
  currency: Currency | null;
};

/**
 * A payment update that the provider integration has already verified
 * (signature checked, or fetched from the provider's API on the server).
 */
export type VerifiedPaymentEvent = {
  orderReference: string;
  providerReference: string;
  status: PaymentStatus;
  amountMinor: number;
  currency: string;
};

/** A row in "My Purchases". No card or account details, ever. */
export type Purchase = {
  reference: string;
  courseTitle: string;
  courseSlug: string;
  purchasedAt: string;
  amountMinor: number;
  currency: Currency;
  status: PaymentStatus;
};
