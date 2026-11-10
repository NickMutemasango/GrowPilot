import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminEnrolment, StatusChangesById } from "@/types/admin-enrolments";
import { summariseEnrolments } from "./enrolments.ts";
import {
  REASON_REQUIRED,
  MAX_REVOCATION_REASON,
  applyReactivation,
  applyRevocation,
  canReactivate,
  canRevoke,
  cleanReason,
  newRevocation,
  pruneStatusChanges,
  reactivatedChange,
  revokedChange,
  validateRevocationReason,
  withStatusChanges,
} from "./enrolment-status.ts";

function enrolment(id: string, changes: Partial<AdminEnrolment> = {}): AdminEnrolment {
  return {
    id,
    studentId: `u-${id}`,
    studentName: `Student ${id}`,
    studentEmail: `${id}@example.com`,
    courseId: "c-001",
    courseSlug: "computer-basics-for-beginners",
    courseTitle: "Computer Basics for Beginners",
    enrolledAt: "2026-10-01T00:00:00Z",
    type: "free",
    status: "active",
    completedLessons: 3,
    totalLessons: 8,
    progress: 38,
    ...changes,
  };
}

const revocation = { reason: "Place given to another student.", revokedAt: "2026-11-05T12:00:00.000Z" };
const REACTIVATED_AT = "2026-11-06T09:00:00.000Z";

describe("canRevoke", () => {
  it("offers the action on active and completed enrolments", () => {
    assert.equal(canRevoke(enrolment("a")), true);
    assert.equal(canRevoke(enrolment("b", { status: "completed" })), true);
  });

  it("never offers it twice on the same enrolment", () => {
    assert.equal(canRevoke(enrolment("c", { status: "revoked" })), false);
  });
});

describe("canReactivate", () => {
  it("is offered only on a revoked enrolment", () => {
    assert.equal(canReactivate(enrolment("a", { status: "revoked" })), true);
    assert.equal(canReactivate(enrolment("b")), false);
    assert.equal(canReactivate(enrolment("c", { status: "completed" })), false);
  });

  it("is never offered at the same time as revoking", () => {
    for (const status of ["active", "completed", "revoked"] as const) {
      const row = enrolment("x", { status });
      assert.equal(canRevoke(row) && canReactivate(row), false);
    }
  });
});

describe("validateRevocationReason", () => {
  it("requires a reason", () => {
    assert.equal(validateRevocationReason(""), REASON_REQUIRED);
    assert.equal(validateRevocationReason("   \n  "), REASON_REQUIRED);
  });

  it("accepts a written reason", () => {
    assert.equal(validateRevocationReason("Duplicate enrolment."), null);
  });
});

describe("cleanReason", () => {
  it("trims the text and caps its length", () => {
    assert.equal(cleanReason("  Duplicate enrolment.  "), "Duplicate enrolment.");
    assert.equal(cleanReason("x".repeat(MAX_REVOCATION_REASON + 50)).length, MAX_REVOCATION_REASON);
  });
});

describe("applyRevocation", () => {
  const before = enrolment("a");
  const after = applyRevocation(before, revocation);

  it("marks the enrolment as revoked with the date and reason", () => {
    assert.equal(after.status, "revoked");
    assert.equal(after.revokedAt, revocation.revokedAt);
    assert.equal(after.revocationReason, revocation.reason);
  });

  it("keeps the student's learning progress exactly as it was", () => {
    assert.equal(after.completedLessons, before.completedLessons);
    assert.equal(after.totalLessons, before.totalLessons);
    assert.equal(after.progress, before.progress);
  });

  it("keeps the original enrolment, student, course and type", () => {
    assert.equal(after.id, before.id);
    assert.equal(after.studentId, before.studentId);
    assert.equal(after.courseId, before.courseId);
    assert.equal(after.enrolledAt, before.enrolledAt);
    assert.equal(after.type, before.type);
  });

  it("does not change the enrolment it was given", () => {
    assert.equal(before.status, "active");
    assert.equal(before.revokedAt, undefined);
  });
});

describe("applyReactivation", () => {
  const revoked = applyRevocation(enrolment("a"), revocation);
  const after = applyReactivation(revoked, REACTIVATED_AT);

  it("puts the enrolment back and notes when", () => {
    assert.equal(after.status, "active");
    assert.equal(after.reactivatedAt, REACTIVATED_AT);
  });

  it("keeps the revocation that came before it", () => {
    assert.equal(after.revokedAt, revocation.revokedAt);
    assert.equal(after.revocationReason, revocation.reason);
  });

  it("keeps the original enrolment date, course, student and progress", () => {
    assert.equal(after.id, revoked.id);
    assert.equal(after.enrolledAt, "2026-10-01T00:00:00Z");
    assert.equal(after.courseId, revoked.courseId);
    assert.equal(after.studentId, revoked.studentId);
    assert.equal(after.completedLessons, 3);
    assert.equal(after.totalLessons, 8);
    assert.equal(after.progress, 38);
  });

  it("returns a student who had finished every lesson to Completed, not Active", () => {
    const finished = applyRevocation(enrolment("b", { completedLessons: 8, totalLessons: 8, progress: 100 }), revocation);
    assert.equal(applyReactivation(finished, REACTIVATED_AT).status, "completed");
  });

  it("puts back a row that arrived revoked, with no revocation of its own", () => {
    const sample = enrolment("c", { status: "revoked" });
    const after = applyReactivation(sample, REACTIVATED_AT);
    assert.equal(after.status, "active");
    assert.equal(after.revocationReason, undefined);
  });
});

describe("newRevocation", () => {
  it("records the tidied reason and the moment it happened", () => {
    const made = newRevocation("  Course withdrawn.  ", new Date("2026-11-05T12:00:00Z"));
    assert.deepEqual(made, { reason: "Course withdrawn.", revokedAt: "2026-11-05T12:00:00.000Z" });
  });
});

describe("reactivatedChange", () => {
  it("keeps the revocation it undoes", () => {
    const change = reactivatedChange(revokedChange(revocation), new Date(REACTIVATED_AT));
    assert.deepEqual(change, { revocation, reactivatedAt: REACTIVATED_AT });
  });

  it("works for a row that was revoked in the data itself", () => {
    const change = reactivatedChange(undefined, new Date(REACTIVATED_AT));
    assert.deepEqual(change, { revocation: null, reactivatedAt: REACTIVATED_AT });
  });
});

describe("withStatusChanges", () => {
  const rows = [enrolment("a"), enrolment("b"), enrolment("c", { status: "completed" })];
  const marked = withStatusChanges(rows, { a: revokedChange(revocation) });

  it("marks only the enrolment that was revoked", () => {
    assert.deepEqual(
      marked.map((row) => row.status),
      ["revoked", "active", "completed"],
    );
  });

  it("never removes an enrolment from the list", () => {
    assert.equal(marked.length, rows.length);
    assert.deepEqual(
      marked.map((row) => row.id),
      ["a", "b", "c"],
    );
  });

  it("leaves the untouched rows as they were", () => {
    assert.deepEqual(marked[1], rows[1]);
  });

  it("lets a reactivation undo the revocation above it", () => {
    const back = withStatusChanges(rows, { a: { revocation, reactivatedAt: REACTIVATED_AT } });
    assert.equal(back[0].status, "active");
    assert.equal(back[0].reactivatedAt, REACTIVATED_AT);
    assert.equal(back[0].revocationReason, revocation.reason);
  });

  it("creates no new rows when an enrolment is put back", () => {
    const back = withStatusChanges(rows, { a: { revocation, reactivatedAt: REACTIVATED_AT } });
    assert.equal(back.length, rows.length);
    assert.deepEqual(
      back.map((row) => row.id),
      ["a", "b", "c"],
    );
  });

  it("puts back a row that arrived revoked in the data", () => {
    const sample = [enrolment("d", { status: "revoked" })];
    const back = withStatusChanges(sample, { d: { revocation: null, reactivatedAt: REACTIVATED_AT } });
    assert.equal(back[0].status, "active");
    assert.equal(back[0].enrolledAt, sample[0].enrolledAt);
  });
});

describe("pruneStatusChanges", () => {
  it("drops changes whose enrolment is no longer listed", () => {
    const stored: StatusChangesById = { a: revokedChange(revocation), gone: revokedChange(revocation) };
    assert.deepEqual(pruneStatusChanges(stored, [enrolment("a")]), { a: revokedChange(revocation) });
  });
});

describe("the figures through a revocation and back", () => {
  const rows = [enrolment("a"), enrolment("b"), enrolment("c", { status: "completed" })];
  const start = summariseEnrolments(rows);
  const revoked = summariseEnrolments(withStatusChanges(rows, { a: revokedChange(revocation) }));
  const back = summariseEnrolments(withStatusChanges(rows, { a: { revocation, reactivatedAt: REACTIVATED_AT } }));

  it("moves one from active to revoked, then back again", () => {
    assert.deepEqual(start, { total: 3, active: 2, completed: 1, revoked: 0 });
    assert.deepEqual(revoked, { total: 3, active: 1, completed: 1, revoked: 1 });
    assert.deepEqual(back, start);
  });

  it("never changes the total or the completed count", () => {
    for (const figures of [revoked, back]) {
      assert.equal(figures.total, start.total);
      assert.equal(figures.completed, start.completed);
    }
  });
});
