import type { CheckoutQuote, EnrolmentRecord, Order, VerifiedPaymentEvent } from "@/types/payments";
import type { PaymentStore } from "./store";

/*
 * Enrolment and payment rules. These run on the server only, against a
 * PaymentStore, and are covered by enrolment.test.ts. Nothing here trusts
 * the browser: prices come from `getCheckoutQuote`, and access is granted
 * only by `applyPaymentEvent` for a payment the provider has verified.
 */

type CourseRef = { id: string; slug: string };

export async function hasCourseAccess(store: PaymentStore, studentId: string, courseId: string): Promise<boolean> {
  return (await store.findEnrolment(studentId, courseId))?.status === "active";
}

/** Enrols a student in a free course. Doing it twice changes nothing. */
export async function enrolInFreeCourse(
  store: PaymentStore,
  studentId: string,
  course: CourseRef & { priceUsd: number | null },
  now = new Date(),
): Promise<{ kind: "not-free" } | { kind: "enrolled"; alreadyEnrolled: boolean }> {
  if (course.priceUsd !== null) return { kind: "not-free" };
  if (await hasCourseAccess(store, studentId, course.id)) return { kind: "enrolled", alreadyEnrolled: true };

  await store.saveEnrolment({
    studentId,
    courseId: course.id,
    courseSlug: course.slug,
    status: "active",
    enrolledAt: now.toISOString(),
    paymentStatus: "free",
    paymentReference: null,
    amountMinor: 0,
    currency: null,
  });
  return { kind: "enrolled", alreadyEnrolled: false };
}

/**
 * Gets the order to pay for a course: the student's existing unpaid order
 * for the same amount if there is one (no duplicate orders), or a new one.
 */
export async function prepareOrder(
  store: PaymentStore,
  studentId: string,
  quote: CheckoutQuote,
  now = new Date(),
): Promise<{ kind: "already-enrolled" } | { kind: "order"; order: Order }> {
  if (await hasCourseAccess(store, studentId, quote.courseId)) return { kind: "already-enrolled" };

  const existing = await store.findPendingOrder(studentId, quote.courseId);
  if (existing && existing.amountMinor === quote.totalMinor && existing.currency === quote.currency) {
    return { kind: "order", order: existing };
  }
  if (existing) await store.updateOrder(existing.reference, { status: "cancelled", updatedAt: now.toISOString() });

  const order: Order = {
    reference: createOrderReference(),
    studentId,
    courseId: quote.courseId,
    courseSlug: quote.courseSlug,
    amountMinor: quote.totalMinor,
    currency: quote.currency,
    status: "pending",
    providerReference: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await store.insertOrder(order);

  const enrolment = await store.findEnrolment(studentId, quote.courseId);
  if (!enrolment || enrolment.status !== "active") {
    await store.saveEnrolment(pendingEnrolment(order, now));
  }
  return { kind: "order", order };
}

export type PaymentEventResult =
  | { kind: "unknown-order" }
  | { kind: "rejected"; reason: "amount-mismatch" | "currency-mismatch" }
  | { kind: "unchanged" }
  | { kind: "updated"; order: Order; accessGranted: boolean; alreadyHadAccess: boolean };

/**
 * Applies a verified payment update. Safe to run any number of times for the
 * same update (providers resend notifications). Access is granted only when
 * the payment is confirmed as paid for exactly the amount and currency of
 * the order; a paid order is never undone by a late "failed" or "cancelled".
 */
export async function applyPaymentEvent(
  store: PaymentStore,
  event: VerifiedPaymentEvent,
  now = new Date(),
): Promise<PaymentEventResult> {
  const order = await store.findOrder(event.orderReference);
  if (!order) return { kind: "unknown-order" };

  if (event.status === "paid" || event.status === "refunded") {
    if (event.currency !== order.currency) return { kind: "rejected", reason: "currency-mismatch" };
    if (event.amountMinor !== order.amountMinor) return { kind: "rejected", reason: "amount-mismatch" };
  }

  if (event.status === order.status) return { kind: "unchanged" };
  // Final states only move forward: paid → refunded. Nothing else changes them.
  if (order.status === "refunded") return { kind: "unchanged" };
  if (order.status === "paid" && event.status !== "refunded") return { kind: "unchanged" };
  if (event.status === "refunded" && order.status !== "paid") return { kind: "unchanged" };

  const updated = await store.updateOrder(order.reference, {
    status: event.status,
    providerReference: event.providerReference,
    updatedAt: now.toISOString(),
  });
  const enrolment = await store.findEnrolment(order.studentId, order.courseId);

  if (event.status === "paid") {
    const alreadyHadAccess = enrolment?.status === "active";
    // If the student already had access (e.g. paid twice), keep the first
    // enrolment; the second payment is recorded so it can be refunded.
    if (!alreadyHadAccess) {
      await store.saveEnrolment({
        ...pendingEnrolment(updated, now),
        status: "active",
        enrolledAt: now.toISOString(),
        paymentStatus: "paid",
      });
    }
    return { kind: "updated", order: updated, accessGranted: !alreadyHadAccess, alreadyHadAccess };
  }

  if (enrolment && enrolment.paymentReference === order.reference) {
    if (event.status === "refunded") {
      await store.saveEnrolment({ ...enrolment, status: "revoked", paymentStatus: "refunded" });
    } else if (enrolment.status === "pending_payment") {
      await store.saveEnrolment({
        ...enrolment,
        status: event.status === "pending" ? "pending_payment" : "cancelled",
        paymentStatus: event.status,
      });
    }
  }
  return { kind: "updated", order: updated, accessGranted: false, alreadyHadAccess: enrolment?.status === "active" };
}

function pendingEnrolment(order: Order, now: Date): EnrolmentRecord {
  return {
    studentId: order.studentId,
    courseId: order.courseId,
    courseSlug: order.courseSlug,
    status: "pending_payment",
    enrolledAt: now.toISOString(),
    paymentStatus: "pending",
    paymentReference: order.reference,
    amountMinor: order.amountMinor,
    currency: order.currency,
  };
}

/** "GPA-" + 12 easy-to-read characters (no 0/O or 1/I). */
export function createOrderReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return `GPA-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")}`;
}
