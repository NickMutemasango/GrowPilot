import assert from "node:assert/strict";
import { describe, it } from "node:test";
// Relative paths: only type imports may use the "@/" alias in these tests.
import { averageProgress, completionRate, coursePerformance, type ReportCourse } from "./reports.ts";

const courses: ReportCourse[] = [
  { id: "c-001", title: "Computer Basics for Beginners", instructorName: "John Moyo" },
  { id: "c-003", title: "Microsoft Excel Made Easy", instructorName: "Grace Okafor" },
  { id: "c-009", title: "Graphic Design for Beginners", instructorName: "Peter Ndlovu" },
];

function enrolment(courseId: string, status: string, progress: number) {
  return { courseId, status, progress };
}

describe("completionRate", () => {
  it("is completed divided by total, as a whole percentage", () => {
    assert.equal(completionRate(1, 4), 25);
    assert.equal(completionRate(3, 3), 100);
    assert.equal(completionRate(0, 5), 0);
  });

  it("rounds to the nearest whole percent", () => {
    assert.equal(completionRate(1, 3), 33);
    assert.equal(completionRate(2, 3), 67);
  });

  it("gives no rate when nobody has enrolled, and never divides by zero", () => {
    assert.equal(completionRate(0, 0), null);
    assert.equal(completionRate(2, 0), null);
    assert.equal(completionRate(0, -1), null);
  });
});

describe("averageProgress", () => {
  it("is the mean, rounded", () => {
    assert.equal(averageProgress([0, 50, 100]), 50);
    assert.equal(averageProgress([33, 34]), 34);
    assert.equal(averageProgress([100]), 100);
  });

  it("is null for nobody at all, rather than zero", () => {
    assert.equal(averageProgress([]), null);
  });
});

describe("coursePerformance", () => {
  const enrolments = [
    enrolment("c-001", "completed", 100),
    enrolment("c-001", "active", 50),
    enrolment("c-001", "active", 0),
    enrolment("c-003", "completed", 100),
    enrolment("c-003", "completed", 100),
  ];

  const rows = coursePerformance(courses, enrolments);
  const byId = Object.fromEntries(rows.map((row) => [row.courseId, row]));

  it("counts enrolments and completions per course", () => {
    assert.equal(byId["c-001"].enrolments, 3);
    assert.equal(byId["c-001"].completed, 1);
    assert.equal(byId["c-003"].enrolments, 2);
    assert.equal(byId["c-003"].completed, 2);
  });

  it("works out the rate from those two figures", () => {
    assert.equal(byId["c-001"].completionRate, 33);
    assert.equal(byId["c-003"].completionRate, 100);
  });

  it("averages the progress of everybody on the course", () => {
    assert.equal(byId["c-001"].averageProgress, 50);
    assert.equal(byId["c-003"].averageProgress, 100);
  });

  it("keeps a course nobody has enrolled in, with no rate rather than zero", () => {
    assert.equal(byId["c-009"].enrolments, 0);
    assert.equal(byId["c-009"].completed, 0);
    assert.equal(byId["c-009"].completionRate, null);
    assert.equal(byId["c-009"].averageProgress, null);
  });

  it("carries the course title and its instructor through", () => {
    assert.equal(byId["c-003"].courseTitle, "Microsoft Excel Made Easy");
    assert.equal(byId["c-003"].instructorName, "Grace Okafor");
  });

  it("puts the busiest course first, breaking ties by title", () => {
    assert.deepEqual(
      rows.map((row) => row.courseId),
      ["c-001", "c-003", "c-009"],
    );
    const tied = coursePerformance(courses, []);
    assert.deepEqual(
      tied.map((row) => row.courseTitle),
      ["Computer Basics for Beginners", "Graphic Design for Beginners", "Microsoft Excel Made Easy"],
    );
  });

  it("counts a revoked enrolment in the total: it still happened", () => {
    const [row] = coursePerformance([courses[0]], [
      enrolment("c-001", "revoked", 20),
      enrolment("c-001", "completed", 100),
    ]);
    assert.equal(row.enrolments, 2);
    assert.equal(row.completed, 1);
    assert.equal(row.completionRate, 50);
  });

  it("ignores enrolments on a course that is not published", () => {
    const rowsNow = coursePerformance([courses[0]], [enrolment("c-999", "completed", 100)]);
    assert.equal(rowsNow.length, 1);
    assert.equal(rowsNow[0].enrolments, 0);
  });

  it("stays consistent with the figures above it: the rows add up to the whole", () => {
    const total = rows.reduce((sum, row) => sum + row.enrolments, 0);
    const completed = rows.reduce((sum, row) => sum + row.completed, 0);
    assert.equal(total, enrolments.length);
    assert.equal(completed, enrolments.filter((one) => one.status === "completed").length);
    assert.equal(completionRate(completed, total), 60);
  });
});
