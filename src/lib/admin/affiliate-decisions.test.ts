import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminAffiliate, DecisionsById } from "@/types/admin-affiliates";
import { summariseAffiliates } from "./affiliates.ts";
import {
  MAX_REJECTION_REASON,
  REJECTION_REASON_REQUIRED,
  applyDecision,
  approvalDecision,
  canDecide,
  cleanRejectionReason,
  pruneDecisions,
  rejectionDecision,
  validateRejectionReason,
  withDecisions,
} from "./affiliate-decisions.ts";

function affiliate(id: string, changes: Partial<AdminAffiliate> = {}): AdminAffiliate {
  return {
    id,
    studentId: `u-${id}`,
    name: "Esther Njeri",
    email: "esther.n@example.com",
    referralCode: "GP-AFF-009",
    successfulSales: 0,
    commissionEarnedMinor: 0,
    currency: "USD",
    status: "pending",
    joinedAt: "2026-10-28T15:10:00Z",
    ...changes,
  };
}

const DECIDED_AT = "2026-11-05T12:00:00.000Z";

describe("canDecide", () => {
  it("offers the actions only while an application is pending", () => {
    assert.equal(canDecide(affiliate("a")), true);
  });

  it("never offers them on an application that has already been settled", () => {
    for (const status of ["approved", "rejected", "suspended"] as const) {
      assert.equal(canDecide(affiliate("x", { status })), false, status);
    }
  });
});

describe("validateRejectionReason", () => {
  it("requires a reason", () => {
    assert.equal(validateRejectionReason(""), REJECTION_REASON_REQUIRED);
    assert.equal(validateRejectionReason("   \n  "), REJECTION_REASON_REQUIRED);
  });

  it("accepts a written reason", () => {
    assert.equal(validateRejectionReason("Not enough detail in the application."), null);
  });
});

describe("cleanRejectionReason", () => {
  it("trims the text and caps its length", () => {
    assert.equal(cleanRejectionReason("  Not enough detail.  "), "Not enough detail.");
    assert.equal(cleanRejectionReason("x".repeat(MAX_REJECTION_REASON + 50)).length, MAX_REJECTION_REASON);
  });
});

describe("approvalDecision and rejectionDecision", () => {
  it("records an approval with the moment it happened", () => {
    assert.deepEqual(approvalDecision(new Date(DECIDED_AT)), { outcome: "approved", decidedAt: DECIDED_AT });
  });

  it("records a rejection with its tidied reason", () => {
    assert.deepEqual(rejectionDecision("  Not enough detail.  ", new Date(DECIDED_AT)), {
      outcome: "rejected",
      decidedAt: DECIDED_AT,
      reason: "Not enough detail.",
    });
  });
});

describe("applyDecision", () => {
  const before = affiliate("a");

  it("approves without leaving a rejection reason behind", () => {
    const after = applyDecision(before, approvalDecision(new Date(DECIDED_AT)));
    assert.equal(after.status, "approved");
    assert.equal(after.decidedAt, DECIDED_AT);
    assert.equal(after.rejectionReason, null);
  });

  it("rejects and keeps the reason", () => {
    const after = applyDecision(before, rejectionDecision("Not enough detail.", new Date(DECIDED_AT)));
    assert.equal(after.status, "rejected");
    assert.equal(after.decidedAt, DECIDED_AT);
    assert.equal(after.rejectionReason, "Not enough detail.");
  });

  it("keeps the id, name, email, referral code and original application date", () => {
    const after = applyDecision(before, rejectionDecision("Not enough detail.", new Date(DECIDED_AT)));
    assert.equal(after.id, before.id);
    assert.equal(after.name, before.name);
    assert.equal(after.email, before.email);
    assert.equal(after.referralCode, before.referralCode);
    assert.equal(after.joinedAt, "2026-10-28T15:10:00Z");
  });

  it("does not change the application it was given", () => {
    applyDecision(before, approvalDecision());
    assert.equal(before.status, "pending");
    assert.equal(before.decidedAt, undefined);
  });
});

describe("withDecisions", () => {
  const rows = [affiliate("a"), affiliate("b"), affiliate("c", { status: "approved" })];
  const decided = withDecisions(rows, { a: approvalDecision(new Date(DECIDED_AT)) });

  it("decides only the application that was decided", () => {
    assert.deepEqual(
      decided.map((row) => row.status),
      ["approved", "pending", "approved"],
    );
  });

  it("never removes an application from the list", () => {
    assert.equal(decided.length, rows.length);
    assert.deepEqual(
      decided.map((row) => row.id),
      ["a", "b", "c"],
    );
  });

  it("keeps a rejected application in the list, with its reason", () => {
    const rejected = withDecisions(rows, { b: rejectionDecision("Not enough detail.", new Date(DECIDED_AT)) });
    assert.equal(rejected.length, 3);
    assert.equal(rejected[1].status, "rejected");
    assert.equal(rejected[1].rejectionReason, "Not enough detail.");
  });

  it("leaves the untouched rows exactly as they were", () => {
    assert.deepEqual(decided[1], rows[1]);
  });

  it("refuses a stored decision on an application that was already settled", () => {
    const already = withDecisions([affiliate("c", { status: "approved" })], {
      c: rejectionDecision("Changed my mind.", new Date(DECIDED_AT)),
    });
    assert.equal(already[0].status, "approved");
    assert.equal(already[0].rejectionReason, undefined);
  });
});

describe("pruneDecisions", () => {
  it("drops decisions whose application is no longer listed", () => {
    const approval = approvalDecision(new Date(DECIDED_AT));
    const stored: DecisionsById = { a: approval, gone: approval };
    assert.deepEqual(pruneDecisions(stored, [affiliate("a")]), { a: approval });
  });
});

describe("the figures after a decision", () => {
  const rows = [
    affiliate("a"),
    affiliate("b"),
    affiliate("c", { status: "approved" }),
    affiliate("d", { status: "suspended" }),
  ];
  const before = summariseAffiliates(rows);
  const afterApproval = summariseAffiliates(withDecisions(rows, { a: approvalDecision() }));
  const afterRejection = summariseAffiliates(withDecisions(rows, { a: rejectionDecision("No.") }));

  it("moves one from pending to approved, leaving the total alone", () => {
    assert.deepEqual(before, { total: 4, approved: 1, pending: 2, rejected: 0, suspended: 1 });
    assert.deepEqual(afterApproval, { total: 4, approved: 2, pending: 1, rejected: 0, suspended: 1 });
  });

  it("moves one from pending to rejected, leaving the total alone", () => {
    assert.deepEqual(afterRejection, { total: 4, approved: 1, pending: 1, rejected: 1, suspended: 1 });
  });

  it("never changes the suspended count", () => {
    for (const figures of [afterApproval, afterRejection]) assert.equal(figures.suspended, before.suspended);
  });
});
