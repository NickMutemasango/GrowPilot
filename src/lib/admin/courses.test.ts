import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminCourse, AdminCourseLesson } from "@/types/admin-courses";
import {
  approveCourse,
  changeCoursePrice,
  filterCourses,
  formatCoursePrice,
  meetsPublishingRequirements,
  pendingCourses,
  publishingProblems,
  rejectCourse,
  summariseCourses,
  unpublishCourse,
} from "./courses.ts";

const ADMIN = { id: "u-admin" };

function lesson(changes: Partial<AdminCourseLesson> = {}): AdminCourseLesson {
  return {
    id: "l1",
    title: "Lesson one",
    description: "What this lesson covers.",
    type: "video",
    minutes: 10,
    notes: "Some written notes.",
    materials: [],
    ...changes,
  };
}

function course(id: string, changes: Partial<AdminCourse> = {}): AdminCourse {
  return {
    id,
    title: `Course ${id}`,
    slug: null,
    instructorId: "i-1",
    instructorName: "Grace Okafor",
    instructorTitle: "Tutor",
    category: "digital-skills",
    level: "Beginner",
    duration: "3 weeks",
    shortDescription: "A short description.",
    description: "A longer description of the course.",
    thumbnailUrl: null,
    thumbnailAlt: "",
    priceUsd: null,
    currency: "USD",
    status: "pending_review",
    submittedAt: "2026-11-01T09:00:00Z",
    reviewedAt: null,
    reviewedBy: null,
    reviewFeedback: null,
    unpublishedAt: null,
    unpublishReason: null,
    modules: [{ id: "m1", title: "Module one", description: "", lessons: [lesson()] }],
    enrolment: null,
    ...changes,
  };
}

describe("search, filters and summaries", () => {
  const courses = [
    course("a", { title: "Microsoft Excel Made Easy", instructorName: "Peter Ndlovu", status: "published", priceUsd: 29 }),
    course("b", { title: "Writing a Great CV", instructorName: "Grace Okafor", category: "personal-development" }),
    course("c", { title: "Growing Vegetables", instructorName: "John Moyo", status: "draft" }),
  ];

  it("finds courses by title, instructor and category", () => {
    assert.deepEqual(filterCourses(courses, { query: "excel", status: "all", category: "all", pricing: "all" }).map((c) => c.id), ["a"]);
    assert.deepEqual(filterCourses(courses, { query: "grace", status: "all", category: "all", pricing: "all" }).map((c) => c.id), ["b"]);
    assert.deepEqual(filterCourses(courses, { query: "digital skills", status: "all", category: "all", pricing: "all" }).map((c) => c.id), ["a", "c"]);
  });

  it("combines status, category and pricing filters", () => {
    assert.deepEqual(filterCourses(courses, { query: "", status: "published", category: "all", pricing: "paid" }).map((c) => c.id), ["a"]);
    assert.deepEqual(filterCourses(courses, { query: "", status: "all", category: "all", pricing: "free" }).map((c) => c.id), ["b", "c"]);
    assert.deepEqual(filterCourses(courses, { query: "", status: "published", category: "all", pricing: "free" }), []);
  });

  it("counts each status and lists pending courses oldest first", () => {
    const summary = summariseCourses(courses);
    assert.equal(summary.total, 3);
    assert.equal(summary.published, 1);
    assert.equal(summary.pending, 1);
    assert.equal(summary.draft, 1);

    const queue = pendingCourses([
      course("new", { submittedAt: "2026-11-04T09:00:00Z" }),
      course("old", { submittedAt: "2026-10-01T09:00:00Z" }),
      course("published", { status: "published" }),
    ]);
    assert.deepEqual(queue.map((item) => item.id), ["old", "new"]);
  });
});

describe("publishing requirements", () => {
  it("accepts a complete course", () => {
    assert.deepEqual(publishingProblems(course("ok")), []);
    assert.equal(meetsPublishingRequirements(course("ok")), true);
  });

  it("names what is missing", () => {
    const problems = publishingProblems(
      course("bad", { title: "  ", description: "", category: "", modules: [] }),
    );
    assert.equal(problems.length, 5);
    assert.ok(problems.some((problem) => problem.includes("title")));
    assert.ok(problems.some((problem) => problem.includes("description")));
    assert.ok(problems.some((problem) => problem.includes("category")));
    assert.ok(problems.some((problem) => problem.includes("module")));
    assert.ok(problems.some((problem) => problem.includes("lesson")));
  });

  it("needs at least one lesson with content", () => {
    const empty = course("empty", { modules: [{ id: "m1", title: "Module one", description: "", lessons: [lesson({ notes: "", materials: [] })] }] });
    assert.ok(publishingProblems(empty).some((problem) => problem.includes("written notes")));

    const withFile = course("file", {
      modules: [{ id: "m1", title: "M", description: "", lessons: [lesson({ notes: "", materials: [{ name: "a.mp4", kind: "video", url: null }] })] }],
    });
    assert.deepEqual(publishingProblems(withFile), []);
  });

  it("rejects a price outside the allowed range", () => {
    assert.ok(publishingProblems(course("p", { priceUsd: -5 })).some((problem) => problem.includes("Free")));
  });
});

describe("approving a course", () => {
  it("publishes a submitted course that meets the requirements", () => {
    const result = approveCourse([course("a")], ADMIN, "a", new Date("2026-11-05T10:00:00Z"));
    assert.ok(result.ok);
    assert.equal(result.course.status, "published");
    assert.equal(result.course.reviewedBy, "u-admin");
    assert.equal(result.course.reviewedAt, "2026-11-05T10:00:00.000Z");
    assert.equal(result.audit.action, "course-approved");
    assert.equal(result.audit.previousValue, "pending_review");
    assert.equal(result.audit.newValue, "published");
  });

  it("refuses a second approval", () => {
    const result = approveCourse([course("a", { status: "published" })], ADMIN, "a");
    assert.equal(result.ok, false);
  });

  it("refuses a draft, and an incomplete course", () => {
    assert.equal(approveCourse([course("a", { status: "draft" })], ADMIN, "a").ok, false);
    const incomplete = course("a", { modules: [{ id: "m1", title: "M", description: "", lessons: [] }] });
    const result = approveCourse([incomplete], ADMIN, "a");
    assert.equal(result.ok, false);
    assert.ok(!result.ok && result.message.includes("can't be published yet"));
  });

  it("never lets an instructor approve their own course", () => {
    const result = approveCourse([course("a", { instructorId: "u-admin" })], ADMIN, "a");
    assert.equal(result.ok, false);
    assert.ok(!result.ok && result.message.includes("your own course"));
  });

  it("puts an unpublished course back in the catalogue", () => {
    const result = approveCourse([course("a", { status: "unpublished", unpublishReason: "Old" })], ADMIN, "a");
    assert.ok(result.ok);
    assert.equal(result.course.status, "published");
    assert.equal(result.course.unpublishReason, null);
    assert.equal(result.audit.action, "course-republished");
  });
});

describe("rejecting a course", () => {
  it("keeps the course and saves the feedback", () => {
    const result = rejectCourse([course("a")], ADMIN, "a", "  Please improve the video quality in Module 2.  ");
    assert.ok(result.ok);
    assert.equal(result.course.status, "rejected");
    assert.equal(result.course.reviewFeedback, "Please improve the video quality in Module 2.");
    assert.equal(result.courses.length, 1);
    assert.equal(result.audit.reason, "Please improve the video quality in Module 2.");
  });

  it("requires a reason", () => {
    assert.equal(rejectCourse([course("a")], ADMIN, "a", "   ").ok, false);
  });

  it("only applies to a course waiting for review", () => {
    assert.equal(rejectCourse([course("a", { status: "published" })], ADMIN, "a", "No").ok, false);
  });
});

describe("unpublishing a course", () => {
  it("removes a published course from the catalogue and keeps its enrolments", () => {
    const published = course("a", { status: "published", enrolment: { enrolled: 10, inProgress: 6, completed: 4, completionPercent: 40 } });
    const result = unpublishCourse([published], ADMIN, "a", "Replaced by a newer course.");
    assert.ok(result.ok);
    assert.equal(result.course.status, "unpublished");
    assert.equal(result.course.unpublishReason, "Replaced by a newer course.");
    assert.deepEqual(result.course.enrolment, published.enrolment);
    assert.equal(result.audit.action, "course-unpublished");
  });

  it("needs a reason, and only works on a published course", () => {
    assert.equal(unpublishCourse([course("a", { status: "published" })], ADMIN, "a", " ").ok, false);
    assert.equal(unpublishCourse([course("a", { status: "draft" })], ADMIN, "a", "Why").ok, false);
  });
});

describe("course pricing", () => {
  it("sets a new price and records the change", () => {
    const result = changeCoursePrice([course("a", { priceUsd: 29 })], ADMIN, "a", { free: false, amount: "39.50" });
    assert.ok(result.ok);
    assert.equal(result.course.priceUsd, 39.5);
    assert.equal(result.audit.previousValue, "$29");
    assert.equal(result.audit.newValue, "$39.50");
    assert.ok(result.message.includes("keep the price they paid"));
  });

  it("makes a course free", () => {
    const result = changeCoursePrice([course("a", { priceUsd: 29 })], ADMIN, "a", { free: true });
    assert.ok(result.ok);
    assert.equal(result.course.priceUsd, null);
  });

  it("refuses negative, zero and nonsense amounts", () => {
    for (const amount of ["-5", "0", "abc", "", "1e3"]) {
      assert.equal(changeCoursePrice([course("a", { priceUsd: 29 })], ADMIN, "a", { free: false, amount }).ok, false, amount);
    }
  });

  it("refuses a change that changes nothing", () => {
    assert.equal(changeCoursePrice([course("a", { priceUsd: 29 })], ADMIN, "a", { free: false, amount: "29" }).ok, false);
  });

  it("formats prices", () => {
    assert.equal(formatCoursePrice(null), "Free");
    assert.equal(formatCoursePrice(29), "$29");
    assert.equal(formatCoursePrice(29.5), "$29.50");
  });
});
