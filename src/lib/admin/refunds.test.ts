import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminTransaction, RefundsById } from "@/types/admin-payments";
import { summarisePayments, totalsByCurrency } from "./payments.ts";
import {
  MAX_REFUND_REASON,
  REFUND_REASON_REQUIRED,
  applyRefund,
  canRefund,
  cleanRefundReason,
  newRefund,
  pruneRefunds,
  validateRefundReason,
  whyNotRefundable,
  withRefunds,
} from "./refunds.ts";

function transaction(id: string, changes: Partial<AdminTransaction> = {}): AdminTransaction {
  return {
    id,
    studentId: "u-mary",
    studentName: "Mary Chikwanha",
    studentEmail: "mary.c@example.com",
    courseId: "c-003",
    courseTitle: "Microsoft Excel Made Easy",
    courseCategory: "digital-skills",
    coursePriceMinor: 2900,
    amountMinor: 2900,
    currency: "USD",
    paymentMethod: "card",
    status: "paid",
    createdAt: "2026-11-05T09:12:00Z",
    ...changes,
  };
}

const REFUNDED_AT = "2026-11-06T10:00:00.000Z";
const refund = { reason: "Student could not start the course.", refundedAt: REFUNDED_AT, amountMinor: 2900 };

describe("canRefund", () => {
  it("offers the action on a successful payment", () => {
    assert.equal(canRefund(transaction("a")), true);
  });

  it("never offers it on a payment that took no money or was already refunded", () => {
    for (const status of ["pending", "failed", "cancelled", "refunded"] as const) {
      assert.equal(canRefund(transaction("x", { status })), false, status);
    }
  });
});

describe("whyNotRefundable", () => {
  it("says nothing when the action is allowed", () => {
    assert.equal(whyNotRefundable(transaction("a")), null);
  });

  it("explains every status it refuses", () => {
    for (const status of ["pending", "failed", "cancelled", "refunded"] as const) {
      const reason = whyNotRefundable(transaction("x", { status }));
      assert.ok(reason && reason.length > 0, status);
    }
  });
});

describe("validateRefundReason", () => {
  it("requires a reason", () => {
    assert.equal(validateRefundReason(""), REFUND_REASON_REQUIRED);
    assert.equal(validateRefundReason("   \n  "), REFUND_REASON_REQUIRED);
  });

  it("accepts a written reason", () => {
    assert.equal(validateRefundReason("Duplicate charge."), null);
  });
});

describe("cleanRefundReason", () => {
  it("trims the text and caps its length", () => {
    assert.equal(cleanRefundReason("  Duplicate charge.  "), "Duplicate charge.");
    assert.equal(cleanRefundReason("x".repeat(MAX_REFUND_REASON + 50)).length, MAX_REFUND_REASON);
  });
});

describe("newRefund", () => {
  it("refunds the full amount paid, with the reason and the moment it happened", () => {
    const made = newRefund(transaction("a"), "  Duplicate charge.  ", new Date(REFUNDED_AT));
    assert.deepEqual(made, { reason: "Duplicate charge.", refundedAt: REFUNDED_AT, amountMinor: 2900 });
  });
});

describe("applyRefund", () => {
  const before = transaction("a");
  const after = applyRefund(before, refund);

  it("marks the transaction as refunded with the date, reason and amount", () => {
    assert.equal(after.status, "refunded");
    assert.equal(after.refundedAt, REFUNDED_AT);
    assert.equal(after.refundReason, refund.reason);
    assert.equal(after.refundAmountMinor, 2900);
  });

  it("keeps the original reference, amount and date", () => {
    assert.equal(after.id, "a");
    assert.equal(after.amountMinor, before.amountMinor);
    assert.equal(after.coursePriceMinor, before.coursePriceMinor);
    assert.equal(after.createdAt, before.createdAt);
    assert.equal(after.currency, before.currency);
    assert.equal(after.paymentMethod, before.paymentMethod);
  });

  it("keeps the student and the course", () => {
    assert.equal(after.studentId, before.studentId);
    assert.equal(after.studentEmail, before.studentEmail);
    assert.equal(after.courseId, before.courseId);
    assert.equal(after.courseTitle, before.courseTitle);
  });

  it("does not change the transaction it was given", () => {
    assert.equal(before.status, "paid");
    assert.equal(before.refundedAt, undefined);
  });
});

describe("withRefunds", () => {
  const rows = [transaction("a"), transaction("b"), transaction("c", { status: "pending" })];
  const marked = withRefunds(rows, { a: refund });

  it("marks only the transaction that was refunded", () => {
    assert.deepEqual(
      marked.map((row) => row.status),
      ["refunded", "paid", "pending"],
    );
  });

  it("creates no new transaction and removes none", () => {
    assert.equal(marked.length, rows.length);
    assert.deepEqual(
      marked.map((row) => row.id),
      ["a", "b", "c"],
    );
  });

  it("leaves the untouched rows exactly as they were", () => {
    assert.deepEqual(marked[1], rows[1]);
  });

  it("refuses a stored refund against a payment that was never successful", () => {
    const sneaky = withRefunds([transaction("c", { status: "pending" })], { c: refund });
    assert.equal(sneaky[0].status, "pending");
    assert.equal(sneaky[0].refundedAt, undefined);
  });

  it("refuses a second refund on a transaction that arrived refunded", () => {
    const already = withRefunds([transaction("d", { status: "refunded" })], { d: refund });
    assert.equal(already[0].refundReason, undefined);
  });
});

describe("pruneRefunds", () => {
  it("drops refunds whose transaction is no longer listed", () => {
    const stored: RefundsById = { a: refund, gone: refund };
    assert.deepEqual(pruneRefunds(stored, [transaction("a")]), { a: refund });
  });
});

describe("the figures after a refund", () => {
  const rows = [
    transaction("a"),
    transaction("b"),
    transaction("c", { status: "pending" }),
    transaction("d", { status: "failed" }),
  ];
  const before = summarisePayments(rows);
  const after = summarisePayments(withRefunds(rows, { a: refund }));

  it("keeps the total, pending and failed counts, and moves one from successful to refunded", () => {
    assert.deepEqual(before, { total: 4, successful: 2, pending: 1, failed: 1, refunded: 0 });
    assert.deepEqual(after, { total: 4, successful: 1, pending: 1, failed: 1, refunded: 1 });
  });

  it("takes the refunded amount out of the money held", () => {
    assert.deepEqual(totalsByCurrency(rows), [{ currency: "USD", amountMinor: 5800 }]);
    assert.deepEqual(totalsByCurrency(withRefunds(rows, { a: refund })), [{ currency: "USD", amountMinor: 2900 }]);
  });
});
