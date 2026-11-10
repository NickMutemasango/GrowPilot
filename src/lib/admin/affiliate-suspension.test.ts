import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminAffiliate, ReactivationsById, SuspensionsById } from "@/types/admin-affiliates";
import { summariseAffiliates } from "./affiliates.ts";
import {
  MAX_SUSPENSION_REASON,
  SUSPENSION_REASON_REQUIRED,
  applyReactivation,
  applySuspension,
  canReactivate,
  canSuspend,
  cleanSuspensionReason,
  pruneReactivations,
  pruneSuspensions,
  reactivationRecord,
  suspensionRecord,
  validateSuspensionReason,
  withReactivations,
  withSuspensions,
  withoutReactivation,
} from "./affiliate-suspension.ts";

function affiliate(id: string, changes: Partial<AdminAffiliate> = {}): AdminAffiliate {
  return {
    id,
    studentId: `u-${id}`,
    name: "Esther Njeri",
    email: "esther.n@example.com",
    referralCode: "GP-AFF-009",
    successfulSales: 4,
    commissionEarnedMinor: 12_000,
    currency: "USD",
    status: "approved",
    joinedAt: "2026-10-28T15:10:00Z",
    ...changes,
  };
}

const SUSPENDED_AT = "2026-11-06T12:00:00.000Z";

describe("canSuspend", () => {
  it("offers the action on an approved affiliate", () => {
    assert.equal(canSuspend(affiliate("a")), true);
  });

  it("never offers it on an affiliate who is not approved", () => {
    for (const status of ["pending", "rejected", "suspended"] as const) {
      assert.equal(canSuspend(affiliate("x", { status })), false, status);
    }
  });
});

describe("validateSuspensionReason", () => {
  it("requires a reason", () => {
    assert.equal(validateSuspensionReason(""), SUSPENSION_REASON_REQUIRED);
    assert.equal(validateSuspensionReason("   \n  "), SUSPENSION_REASON_REQUIRED);
  });

  it("accepts a written reason", () => {
    assert.equal(validateSuspensionReason("Promoting the courses with misleading claims."), null);
  });
});

describe("cleanSuspensionReason", () => {
  it("trims the text and caps its length", () => {
    assert.equal(cleanSuspensionReason("  Misleading adverts.  "), "Misleading adverts.");
    assert.equal(cleanSuspensionReason("x".repeat(MAX_SUSPENSION_REASON + 50)).length, MAX_SUSPENSION_REASON);
  });
});

describe("applySuspension", () => {
  it("marks the account suspended and keeps the reason and the date", () => {
    const suspended = applySuspension(affiliate("a"), { suspendedAt: SUSPENDED_AT, reason: "Misleading adverts." });
    assert.equal(suspended.status, "suspended");
    assert.equal(suspended.suspendedAt, SUSPENDED_AT);
    assert.equal(suspended.suspensionReason, "Misleading adverts.");
  });

  it("never touches the account's own details, sales or earnings", () => {
    const before = affiliate("a", { decidedAt: "2026-10-30T09:00:00Z" });
    const after = applySuspension(before, { suspendedAt: SUSPENDED_AT, reason: "Misleading adverts." });
    assert.equal(after.id, before.id);
    assert.equal(after.name, before.name);
    assert.equal(after.email, before.email);
    assert.equal(after.referralCode, before.referralCode);
    assert.equal(after.joinedAt, before.joinedAt);
    assert.equal(after.decidedAt, before.decidedAt);
    assert.equal(after.successfulSales, before.successfulSales);
    assert.equal(after.commissionEarnedMinor, before.commissionEarnedMinor);
  });
});

describe("suspensionRecord", () => {
  it("records the date and the tidied reason", () => {
    const record = suspensionRecord("  Misleading adverts.  ", new Date(SUSPENDED_AT));
    assert.deepEqual(record, { suspendedAt: SUSPENDED_AT, reason: "Misleading adverts." });
  });
});

describe("withSuspensions", () => {
  const suspensions: SuspensionsById = { a: { suspendedAt: SUSPENDED_AT, reason: "Misleading adverts." } };

  it("lays a suspension over the matching affiliate and leaves the rest alone", () => {
    const list = withSuspensions([affiliate("a"), affiliate("b")], suspensions);
    assert.equal(list[0].status, "suspended");
    assert.equal(list[1].status, "approved");
    assert.equal(list[1].suspensionReason, undefined);
  });

  it("ignores a stored suspension on someone who was never approved", () => {
    for (const status of ["pending", "rejected", "suspended"] as const) {
      const [only] = withSuspensions([affiliate("a", { status })], suspensions);
      assert.equal(only.status, status, status);
      assert.equal(only.suspensionReason, undefined, status);
    }
  });

  it("moves the affiliate from Approved to Suspended without changing the total", () => {
    const before = summariseAffiliates([affiliate("a"), affiliate("b", { status: "pending" })]);
    const after = summariseAffiliates(
      withSuspensions([affiliate("a"), affiliate("b", { status: "pending" })], suspensions),
    );
    assert.equal(after.total, before.total);
    assert.equal(after.approved, before.approved - 1);
    assert.equal(after.suspended, before.suspended + 1);
    assert.equal(after.pending, before.pending);
    assert.equal(after.rejected, before.rejected);
  });
});

describe("pruneSuspensions", () => {
  it("keeps suspensions for affiliates still on the page and drops the rest", () => {
    const stored: SuspensionsById = {
      a: { suspendedAt: SUSPENDED_AT, reason: "Misleading adverts." },
      gone: { suspendedAt: SUSPENDED_AT, reason: "No longer listed." },
    };
    assert.deepEqual(Object.keys(pruneSuspensions(stored, [affiliate("a")])), ["a"]);
  });
});

/* Step 12E.4: reactivating a suspended affiliate. */

const REACTIVATED_AT = "2026-11-09T09:30:00.000Z";

function suspended(id: string, changes: Partial<AdminAffiliate> = {}): AdminAffiliate {
  return affiliate(id, {
    status: "suspended",
    suspendedAt: SUSPENDED_AT,
    suspensionReason: "Misleading adverts.",
    ...changes,
  });
}

describe("canReactivate", () => {
  it("offers the action on a suspended affiliate", () => {
    assert.equal(canReactivate(suspended("a")), true);
  });

  it("never offers it on an affiliate who is not suspended", () => {
    for (const status of ["approved", "pending", "rejected"] as const) {
      assert.equal(canReactivate(affiliate("x", { status })), false, status);
    }
  });

  it("is never offered at the same time as Suspend", () => {
    for (const status of ["approved", "pending", "rejected", "suspended"] as const) {
      const one = affiliate("x", { status });
      assert.equal(canSuspend(one) && canReactivate(one), false, status);
    }
  });
});

describe("applyReactivation", () => {
  it("puts the account back to Approved and records when", () => {
    const back = applyReactivation(suspended("a"), { reactivatedAt: REACTIVATED_AT });
    assert.equal(back.status, "approved");
    assert.equal(back.reactivatedAt, REACTIVATED_AT);
  });

  it("keeps the suspension on the record as history", () => {
    const back = applyReactivation(suspended("a"), { reactivatedAt: REACTIVATED_AT });
    assert.equal(back.suspendedAt, SUSPENDED_AT);
    assert.equal(back.suspensionReason, "Misleading adverts.");
  });

  it("never touches the account's own details, sales or earnings", () => {
    const before = suspended("a");
    const after = applyReactivation(before, { reactivatedAt: REACTIVATED_AT });
    assert.equal(after.id, before.id);
    assert.equal(after.name, before.name);
    assert.equal(after.email, before.email);
    assert.equal(after.referralCode, before.referralCode);
    assert.equal(after.joinedAt, before.joinedAt);
    assert.equal(after.successfulSales, before.successfulSales);
    assert.equal(after.commissionEarnedMinor, before.commissionEarnedMinor);
  });
});

describe("reactivationRecord", () => {
  it("records only the date", () => {
    assert.deepEqual(reactivationRecord(new Date(REACTIVATED_AT)), { reactivatedAt: REACTIVATED_AT });
  });
});

describe("withReactivations", () => {
  const reactivations: ReactivationsById = { a: { reactivatedAt: REACTIVATED_AT } };

  it("lays a reactivation over the matching affiliate and leaves the rest alone", () => {
    const list = withReactivations([suspended("a"), suspended("b")], reactivations);
    assert.equal(list[0].status, "approved");
    assert.equal(list[1].status, "suspended");
  });

  it("ignores a stored reactivation on someone who is not suspended", () => {
    for (const status of ["approved", "pending", "rejected"] as const) {
      const [only] = withReactivations([affiliate("a", { status })], reactivations);
      assert.equal(only.status, status, status);
      assert.equal(only.reactivatedAt, undefined, status);
    }
  });

  it("reads after the suspensions, so an affiliate suspended here can be let back in", () => {
    const suspensions: SuspensionsById = { a: { suspendedAt: SUSPENDED_AT, reason: "Misleading adverts." } };
    const [only] = withReactivations(withSuspensions([affiliate("a")], suspensions), reactivations);
    assert.equal(only.status, "approved");
    assert.equal(only.suspensionReason, "Misleading adverts.");
  });

  it("moves the affiliate from Suspended to Approved without changing the total", () => {
    const people = [suspended("a"), affiliate("b", { status: "pending" })];
    const before = summariseAffiliates(people);
    const after = summariseAffiliates(withReactivations(people, reactivations));
    assert.equal(after.total, before.total);
    assert.equal(after.suspended, before.suspended - 1);
    assert.equal(after.approved, before.approved + 1);
    assert.equal(after.pending, before.pending);
    assert.equal(after.rejected, before.rejected);
  });
});

describe("withoutReactivation", () => {
  it("lets a reactivated affiliate be suspended again", () => {
    const suspensions: SuspensionsById = { a: { suspendedAt: SUSPENDED_AT, reason: "Misleading adverts." } };
    const reactivations: ReactivationsById = { a: { reactivatedAt: REACTIVATED_AT } };
    const again = withReactivations(
      withSuspensions([affiliate("a")], suspensions),
      withoutReactivation(reactivations, "a"),
    );
    assert.equal(again[0].status, "suspended");
  });

  it("leaves other affiliates' reactivations alone", () => {
    const stored: ReactivationsById = { a: { reactivatedAt: REACTIVATED_AT }, b: { reactivatedAt: REACTIVATED_AT } };
    assert.deepEqual(Object.keys(withoutReactivation(stored, "a")), ["b"]);
  });
});

describe("pruneReactivations", () => {
  it("keeps reactivations for affiliates still on the page and drops the rest", () => {
    const stored: ReactivationsById = {
      a: { reactivatedAt: REACTIVATED_AT },
      gone: { reactivatedAt: REACTIVATED_AT },
    };
    assert.deepEqual(Object.keys(pruneReactivations(stored, [affiliate("a")])), ["a"]);
  });
});
