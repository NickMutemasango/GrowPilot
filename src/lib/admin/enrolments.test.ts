import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminEnrolment, EnrolmentFilters } from "@/types/admin-enrolments";
import {
  byNewest,
  courseOptions,
  enrolmentProgress,
  enrolmentStatus,
  enrolmentType,
  filterEnrolments,
  summariseEnrolments,
} from "./enrolments.ts";

const NO_ENROLMENT_FILTERS: EnrolmentFilters = { query: "", course: "all", status: "all", type: "all" };

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
    completedLessons: 2,
    totalLessons: 10,
    progress: 20,
    ...changes,
  };
}

describe("enrolmentStatus", () => {
  it("shows revoked and cancelled access as revoked, whatever the progress", () => {
    assert.equal(enrolmentStatus("revoked", 10, 10), "revoked");
    assert.equal(enrolmentStatus("cancelled", 0, 10), "revoked");
  });

  it("is completed only when every lesson is finished", () => {
    assert.equal(enrolmentStatus("active", 9, 10), "active");
    assert.equal(enrolmentStatus("active", 10, 10), "completed");
  });

  it("never completes a course that has no lessons", () => {
    assert.equal(enrolmentStatus("active", 0, 0), "active");
  });

  it("leaves out enrolments still waiting for payment", () => {
    assert.equal(enrolmentStatus("pending_payment", 0, 10), null);
  });
});

describe("enrolmentType", () => {
  it("uses the recorded source when there is one", () => {
    assert.equal(enrolmentType("referral", "free"), "referral");
    assert.equal(enrolmentType("grant", "free"), "grant");
  });

  it("falls back to the payment status, never guessing a reward or a grant", () => {
    assert.equal(enrolmentType(null, "paid"), "paid");
    assert.equal(enrolmentType(null, "free"), "free");
    assert.equal(enrolmentType(null, "refunded"), "free");
  });
});

describe("enrolmentProgress", () => {
  it("works out a whole percentage and stays within 0 to 100", () => {
    assert.equal(enrolmentProgress(0, 8), 0);
    assert.equal(enrolmentProgress(2, 8), 25);
    assert.equal(enrolmentProgress(8, 8), 100);
    assert.equal(enrolmentProgress(9, 8), 100);
    assert.equal(enrolmentProgress(1, 0), 0);
  });
});

describe("filterEnrolments", () => {
  const list = [
    enrolment("a", { studentName: "Mary Chikwanha", studentEmail: "mary.c@example.com", type: "paid" }),
    enrolment("b", { studentName: "Samuel Ochieng", studentEmail: "samuel.o@example.com", courseId: "c-007", courseTitle: "Financial Literacy", status: "completed", type: "referral" }),
    enrolment("c", { studentName: "Ruth Kamau", studentEmail: "ruth.k@example.com", status: "revoked", type: "grant" }),
  ];

  it("returns everything when nothing is set", () => {
    assert.equal(filterEnrolments(list, NO_ENROLMENT_FILTERS).length, 3);
  });

  it("searches the student name, the email address and the course name", () => {
    const search = (query: string) => filterEnrolments(list, { ...NO_ENROLMENT_FILTERS, query }).map((item) => item.id);
    assert.deepEqual(search("mary"), ["a"]);
    assert.deepEqual(search("SAMUEL.O@EXAMPLE.COM"), ["b"]);
    assert.deepEqual(search("financial"), ["b"]);
    assert.deepEqual(search("  ruth  "), ["c"]);
    assert.deepEqual(search("nobody"), []);
  });

  it("filters by course, status and type", () => {
    assert.deepEqual(filterEnrolments(list, { ...NO_ENROLMENT_FILTERS, course: "c-007" }).map((item) => item.id), ["b"]);
    assert.deepEqual(filterEnrolments(list, { ...NO_ENROLMENT_FILTERS, status: "revoked" }).map((item) => item.id), ["c"]);
    assert.deepEqual(filterEnrolments(list, { ...NO_ENROLMENT_FILTERS, type: "referral" }).map((item) => item.id), ["b"]);
  });

  it("applies the search and every filter together", () => {
    const filters = { query: "ochieng", course: "c-007", status: "completed" as const, type: "referral" as const };
    assert.deepEqual(filterEnrolments(list, filters).map((item) => item.id), ["b"]);
    assert.deepEqual(filterEnrolments(list, { ...filters, type: "paid" as const }), []);
  });
});

describe("summariseEnrolments", () => {
  it("counts each status separately, so the three add up to the total", () => {
    const summary = summariseEnrolments([
      enrolment("a"),
      enrolment("b", { status: "completed" }),
      enrolment("c", { status: "completed" }),
      enrolment("d", { status: "revoked" }),
    ]);
    assert.deepEqual(summary, { total: 4, active: 1, completed: 2, revoked: 1 });
  });
});

describe("courseOptions", () => {
  it("lists each course once, in alphabetical order", () => {
    const options = courseOptions([
      enrolment("a", { courseId: "c-007", courseTitle: "Financial Literacy" }),
      enrolment("b"),
      enrolment("c", { courseId: "c-007", courseTitle: "Financial Literacy" }),
    ]);
    assert.deepEqual(options, [
      { id: "c-001", title: "Computer Basics for Beginners" },
      { id: "c-007", title: "Financial Literacy" },
    ]);
  });
});

describe("byNewest", () => {
  it("puts the most recent enrolment first", () => {
    const sorted = [
      enrolment("old", { enrolledAt: "2026-09-01T00:00:00Z" }),
      enrolment("new", { enrolledAt: "2026-11-01T00:00:00Z" }),
    ].sort(byNewest);
    assert.deepEqual(sorted.map((item) => item.id), ["new", "old"]);
  });
});
