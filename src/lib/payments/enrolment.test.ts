import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CheckoutQuote, VerifiedPaymentEvent } from "@/types/payments";
import { applyPaymentEvent, enrolInFreeCourse, hasCourseAccess, prepareOrder } from "./enrolment.ts";
import { createMemoryPaymentStore } from "./memory-store.ts";

const STUDENT = "student-1";
const freeCourse = { id: "c-001", slug: "computer-basics-for-beginners", priceUsd: null };
const paidCourse = { id: "c-003", slug: "microsoft-excel-made-easy", priceUsd: 29 };
const quote: CheckoutQuote = {
  courseId: paidCourse.id,
  courseSlug: paidCourse.slug,
  currency: "USD",
  priceMinor: 2900,
  fees: [],
  totalMinor: 2900,
};

async function pendingOrder() {
  const store = createMemoryPaymentStore();
  const result = await prepareOrder(store, STUDENT, quote);
  assert.equal(result.kind, "order");
  if (result.kind !== "order") throw new Error("unreachable");
  return { store, order: result.order };
}

function event(reference: string, changes: Partial<VerifiedPaymentEvent> = {}): VerifiedPaymentEvent {
  return {
    orderReference: reference,
    providerReference: "provider-123",
    status: "paid",
    amountMinor: 2900,
    currency: "USD",
    ...changes,
  };
}

describe("free enrolment", () => {
  it("enrols once, and a second click changes nothing", async () => {
    const store = createMemoryPaymentStore();
    assert.deepEqual(await enrolInFreeCourse(store, STUDENT, freeCourse), { kind: "enrolled", alreadyEnrolled: false });
    assert.deepEqual(await enrolInFreeCourse(store, STUDENT, freeCourse), { kind: "enrolled", alreadyEnrolled: true });
    assert.equal(await hasCourseAccess(store, STUDENT, freeCourse.id), true);
  });

  it("refuses to enrol for free in a paid course", async () => {
    const store = createMemoryPaymentStore();
    assert.deepEqual(await enrolInFreeCourse(store, STUDENT, paidCourse), { kind: "not-free" });
    assert.equal(await hasCourseAccess(store, STUDENT, paidCourse.id), false);
  });
});

describe("paid checkout", () => {
  it("gives no access while the payment is pending", async () => {
    const { store } = await pendingOrder();
    assert.equal(await hasCourseAccess(store, STUDENT, paidCourse.id), false);
    assert.equal((await store.findEnrolment(STUDENT, paidCourse.id))?.status, "pending_payment");
  });

  it("reuses the unpaid order instead of creating a duplicate", async () => {
    const { store, order } = await pendingOrder();
    const again = await prepareOrder(store, STUDENT, quote);
    assert.equal(again.kind === "order" && again.order.reference, order.reference);
    assert.equal((await store.listOrders(STUDENT)).length, 1);
  });

  it("grants access only after a verified paid event", async () => {
    const { store, order } = await pendingOrder();
    const result = await applyPaymentEvent(store, event(order.reference));
    assert.equal(result.kind === "updated" && result.accessGranted, true);
    assert.equal(await hasCourseAccess(store, STUDENT, paidCourse.id), true);
    const enrolment = await store.findEnrolment(STUDENT, paidCourse.id);
    assert.equal(enrolment?.paymentStatus, "paid");
    assert.equal(enrolment?.paymentReference, order.reference);
  });

  it("handles duplicate notifications without changing anything", async () => {
    const { store, order } = await pendingOrder();
    await applyPaymentEvent(store, event(order.reference));
    const before = await store.findEnrolment(STUDENT, paidCourse.id);
    assert.deepEqual(await applyPaymentEvent(store, event(order.reference)), { kind: "unchanged" });
    assert.deepEqual(await store.findEnrolment(STUDENT, paidCourse.id), before);
  });

  it("rejects a payment for the wrong amount", async () => {
    const { store, order } = await pendingOrder();
    const result = await applyPaymentEvent(store, event(order.reference, { amountMinor: 100 }));
    assert.deepEqual(result, { kind: "rejected", reason: "amount-mismatch" });
    assert.equal(await hasCourseAccess(store, STUDENT, paidCourse.id), false);
  });

  it("rejects a payment in the wrong currency", async () => {
    const { store, order } = await pendingOrder();
    const result = await applyPaymentEvent(store, event(order.reference, { currency: "ZWG" }));
    assert.deepEqual(result, { kind: "rejected", reason: "currency-mismatch" });
    assert.equal(await hasCourseAccess(store, STUDENT, paidCourse.id), false);
  });

  it("ignores payments for orders it doesn't know", async () => {
    const store = createMemoryPaymentStore();
    assert.deepEqual(await applyPaymentEvent(store, event("GPA-UNKNOWN")), { kind: "unknown-order" });
  });

  for (const status of ["failed", "cancelled"] as const) {
    it(`gives no access when the payment is ${status}`, async () => {
      const { store, order } = await pendingOrder();
      await applyPaymentEvent(store, event(order.reference, { status }));
      assert.equal(await hasCourseAccess(store, STUDENT, paidCourse.id), false);
      assert.equal((await store.findOrder(order.reference))?.status, status);
      assert.equal((await store.findEnrolment(STUDENT, paidCourse.id))?.status, "cancelled");
    });
  }

  it("never undoes a confirmed payment because of a late failure notice", async () => {
    const { store, order } = await pendingOrder();
    await applyPaymentEvent(store, event(order.reference));
    assert.deepEqual(await applyPaymentEvent(store, event(order.reference, { status: "failed" })), { kind: "unchanged" });
    assert.equal(await hasCourseAccess(store, STUDENT, paidCourse.id), true);
  });

  it("lets a student try again after a failed payment", async () => {
    const { store, order } = await pendingOrder();
    await applyPaymentEvent(store, event(order.reference, { status: "failed" }));
    const retry = await prepareOrder(store, STUDENT, quote);
    assert.equal(retry.kind, "order");
    if (retry.kind !== "order") return;
    assert.notEqual(retry.order.reference, order.reference);
    await applyPaymentEvent(store, event(retry.order.reference));
    assert.equal(await hasCourseAccess(store, STUDENT, paidCourse.id), true);
  });

  it("does not sell a course the student already has", async () => {
    const { store, order } = await pendingOrder();
    await applyPaymentEvent(store, event(order.reference));
    assert.deepEqual(await prepareOrder(store, STUDENT, quote), { kind: "already-enrolled" });
  });

  it("removes access when a payment is refunded", async () => {
    const { store, order } = await pendingOrder();
    await applyPaymentEvent(store, event(order.reference));
    await applyPaymentEvent(store, event(order.reference, { status: "refunded" }));
    assert.equal(await hasCourseAccess(store, STUDENT, paidCourse.id), false);
    assert.equal((await store.findEnrolment(STUDENT, paidCourse.id))?.status, "revoked");
  });

  it("keeps one student's payment from unlocking the course for anyone else", async () => {
    const { store, order } = await pendingOrder();
    await applyPaymentEvent(store, event(order.reference));
    assert.equal(await hasCourseAccess(store, "student-2", paidCourse.id), false);
  });
});
