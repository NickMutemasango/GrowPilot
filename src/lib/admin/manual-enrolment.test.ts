import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminEnrolment, EnrolmentCourseChoice, EnrolmentStudentOption } from "@/types/admin-enrolments";
import {
  DEMO_ENROLMENT_PREFIX,
  coursesFor,
  createManualEnrolment,
  demoEnrolmentId,
  isAlreadyEnrolled,
  isDemoEnrolment,
  matchesSearch,
  validateManualEnrolment,
} from "./manual-enrolment.ts";

const student: EnrolmentStudentOption = { id: "u-mary", fullName: "Mary Chikwanha", email: "mary.c@example.com" };

const course: EnrolmentCourseChoice = {
  id: "c-001",
  slug: "computer-basics-for-beginners",
  title: "Computer Basics for Beginners",
  totalLessons: 8,
};

function existing(studentId: string, courseId: string): AdminEnrolment {
  return {
    id: `${studentId}:${courseId}`,
    studentId,
    studentName: "Someone",
    studentEmail: "someone@example.com",
    courseId,
    courseSlug: "a-course",
    courseTitle: "A Course",
    enrolledAt: "2026-10-01T00:00:00Z",
    type: "free",
    status: "active",
    completedLessons: 0,
    totalLessons: 8,
    progress: 0,
  };
}

describe("validateManualEnrolment", () => {
  it("asks for a student and a course when neither is chosen", () => {
    const errors = validateManualEnrolment({ studentId: "", courseId: "", reason: "" }, []);
    assert.equal(errors.studentId, "Please choose a student.");
    assert.equal(errors.courseId, "Please choose a course.");
  });

  it("asks only for the missing one", () => {
    const errors = validateManualEnrolment({ studentId: "u-mary", courseId: "", reason: "" }, []);
    assert.equal(errors.studentId, undefined);
    assert.equal(errors.courseId, "Please choose a course.");
  });

  it("refuses a second enrolment on the same course", () => {
    const errors = validateManualEnrolment({ studentId: "u-mary", courseId: "c-001", reason: "" }, [
      existing("u-mary", "c-001"),
    ]);
    assert.equal(errors.courseId, "This student is already enrolled in the selected course.");
  });

  it("allows the same student on a different course", () => {
    const errors = validateManualEnrolment({ studentId: "u-mary", courseId: "c-002", reason: "" }, [
      existing("u-mary", "c-001"),
    ]);
    assert.deepEqual(errors, {});
  });

  it("allows a different student on the same course", () => {
    const errors = validateManualEnrolment({ studentId: "u-tom", courseId: "c-001", reason: "" }, [
      existing("u-mary", "c-001"),
    ]);
    assert.deepEqual(errors, {});
  });
});

describe("isAlreadyEnrolled", () => {
  it("counts a completed or revoked enrolment as already enrolled", () => {
    const completed = { ...existing("u-mary", "c-001"), status: "completed" as const };
    const revoked = { ...existing("u-tom", "c-001"), status: "revoked" as const };
    assert.equal(isAlreadyEnrolled("u-mary", "c-001", [completed]), true);
    assert.equal(isAlreadyEnrolled("u-tom", "c-001", [revoked]), true);
  });
});

describe("coursesFor", () => {
  it("marks the courses a student already has", () => {
    const second: EnrolmentCourseChoice = { ...course, id: "c-002", title: "Another Course" };
    const rows = coursesFor("u-mary", [course, second], [existing("u-mary", "c-001")]);
    assert.deepEqual(
      rows.map((row) => [row.course.id, row.enrolled]),
      [
        ["c-001", true],
        ["c-002", false],
      ],
    );
  });
});

describe("createManualEnrolment", () => {
  const record = createManualEnrolment(student, course, {
    now: new Date("2026-11-05T10:30:00Z"),
    id: "demo-enr-abc123",
  });

  it("records an active administrative grant with no progress", () => {
    assert.equal(record.type, "grant");
    assert.equal(record.status, "active");
    assert.equal(record.completedLessons, 0);
    assert.equal(record.progress, 0);
    assert.equal(record.totalLessons, 8);
  });

  it("copies the student and course the administrator picked", () => {
    assert.equal(record.studentId, "u-mary");
    assert.equal(record.studentName, "Mary Chikwanha");
    assert.equal(record.studentEmail, "mary.c@example.com");
    assert.equal(record.courseId, "c-001");
    assert.equal(record.courseSlug, "computer-basics-for-beginners");
    assert.equal(record.courseTitle, "Computer Basics for Beginners");
  });

  it("dates the enrolment now", () => {
    assert.equal(record.enrolledAt, "2026-11-05T10:30:00.000Z");
  });

  it("is recognisable as a demonstration record", () => {
    assert.equal(isDemoEnrolment(record), true);
    assert.equal(isDemoEnrolment(existing("u-mary", "c-001")), false);
  });

  it("gives every record its own id", () => {
    const first = createManualEnrolment(student, course);
    const second = createManualEnrolment(student, course);
    assert.notEqual(first.id, second.id);
    assert.ok(first.id.startsWith(`${DEMO_ENROLMENT_PREFIX}-`));
  });
});

describe("demoEnrolmentId", () => {
  it("always starts with the demonstration prefix", () => {
    assert.ok(demoEnrolmentId(() => 0.5).startsWith(`${DEMO_ENROLMENT_PREFIX}-`));
  });
});

describe("matchesSearch", () => {
  it("ignores case and matches part of a word", () => {
    assert.equal(matchesSearch(["Mary Chikwanha", "mary.c@example.com"], "CHIK"), true);
    assert.equal(matchesSearch(["Mary Chikwanha"], "tom"), false);
  });

  it("matches everything when nothing is typed", () => {
    assert.equal(matchesSearch(["Mary Chikwanha"], "   "), true);
  });
});
