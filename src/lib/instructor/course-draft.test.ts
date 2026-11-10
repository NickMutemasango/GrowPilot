import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CourseDraft } from "@/types/instructor";
import {
  canSaveDraft,
  canSubmitForReview,
  createEmptyDraft,
  createLesson,
  createModule,
  moveItem,
  parsePrice,
  removalWarning,
  statusAfterSave,
  summariseCurriculum,
  validateCourseInfo,
  validateCurriculum,
} from "./course-draft.ts";
import { checkFile, formatBytes } from "./files.ts";

function completeDraft(): CourseDraft {
  const draft = createEmptyDraft("instructor-1");
  const lesson = { ...createLesson(), title: "Using a Mouse", minutes: 12 };
  return {
    ...draft,
    title: "Computer Basics for Beginners",
    shortDescription: "Learn to use a computer with confidence.",
    description: "A gentle, step-by-step course.",
    category: "digital-skills",
    level: "Beginner",
    duration: "4 weeks",
    isFree: false,
    price: "29",
    outcomes: ["Use a mouse and keyboard."],
    modules: [{ ...createModule(), title: "Getting Started", lessons: [lesson] }],
  };
}

describe("course drafts", () => {
  it("start empty, as a draft with no live version", () => {
    const draft = createEmptyDraft("instructor-1");
    assert.equal(draft.status, "draft");
    assert.equal(draft.hasLiveVersion, false);
    assert.equal(draft.modules.length, 1);
    assert.equal(draft.modules[0].lessons.length, 1);
  });

  it("can be saved with just a title, so no work is lost", () => {
    const draft = createEmptyDraft("instructor-1");
    assert.equal(canSaveDraft(draft), false);
    assert.equal(canSaveDraft({ ...draft, title: "My course" }), true);
    assert.equal(canSubmitForReview({ ...draft, title: "My course" }), false);
  });

  it("can be submitted for review only when complete", () => {
    assert.equal(canSubmitForReview(completeDraft()), true);
  });

  it("are never published by the instructor", () => {
    assert.equal(statusAfterSave("draft"), "draft");
    assert.equal(statusAfterSave("review"), "pending_review");
  });
});

describe("course information checks", () => {
  it("explains each missing field in plain English", () => {
    const errors = validateCourseInfo(createEmptyDraft("instructor-1"));
    assert.deepEqual(Object.keys(errors).sort(), ["category", "description", "duration", "level", "outcomes", "shortDescription", "title"]);
    assert.equal(errors.title, "Please give your course a title.");
  });

  it("asks for a price only for paid courses", () => {
    const draft = completeDraft();
    assert.equal(validateCourseInfo({ ...draft, isFree: true, price: "" }).price, undefined);
    assert.ok(validateCourseInfo({ ...draft, price: "" }).price);
    assert.ok(validateCourseInfo({ ...draft, price: "abc" }).price);
  });

  it("accepts sensible prices only", () => {
    assert.equal(parsePrice("29"), 29);
    assert.equal(parsePrice("$29.99"), 29.99);
    assert.equal(parsePrice("0"), null);
    assert.equal(parsePrice("-5"), null);
    assert.equal(parsePrice("29.999"), null);
    assert.equal(parsePrice("5000"), null);
  });
});

describe("curriculum", () => {
  it("names the module and lesson that need attention", () => {
    const draft = completeDraft();
    draft.modules[0].lessons.push({ ...createLesson(), title: "", minutes: 0 });
    assert.deepEqual(validateCurriculum(draft), [
      "Module 1, lesson 2 needs a title.",
      "Module 1, lesson 2 needs a length between 1 and 600 minutes.",
    ]);
    assert.deepEqual(validateCurriculum({ ...draft, modules: [] }), ["Please add at least one module."]);
  });

  it("moves items up and down, and ignores moves past either end", () => {
    assert.deepEqual(moveItem(["a", "b", "c"], 0, 1), ["b", "a", "c"]);
    assert.deepEqual(moveItem(["a", "b", "c"], 2, -1), ["a", "c", "b"]);
    assert.deepEqual(moveItem(["a", "b", "c"], 0, -1), ["a", "b", "c"]);
    assert.deepEqual(moveItem(["a", "b", "c"], 2, 1), ["a", "b", "c"]);
  });

  it("adds up modules, lessons and minutes", () => {
    const draft = completeDraft();
    draft.modules.push({ ...createModule(), lessons: [{ ...createLesson(), minutes: 8 }, { ...createLesson(), minutes: 5 }] });
    assert.deepEqual(summariseCurriculum(draft), { modules: 2, lessons: 3, minutes: 25 });
  });

  it("warns that removing live lessons keeps student progress", () => {
    assert.match(removalWarning({ live: true }, "lesson"), /progress and certificates are kept/);
    assert.match(removalWarning({ live: false }, "module"), /will be lost/);
  });
});

describe("file checks", () => {
  it("accepts allowed videos and materials", () => {
    assert.equal(checkFile({ name: "lesson.mp4", type: "video/mp4", size: 50 * 1024 ** 2 }, "video"), null);
    assert.equal(checkFile({ name: "notes.pdf", type: "application/pdf", size: 200_000 }, "material"), null);
  });

  it("explains wrong types, empty files and files that are too big", () => {
    assert.match(checkFile({ name: "song.mp3", type: "audio/mpeg", size: 1000 }, "video")!, /isn't a file type we accept/);
    assert.match(checkFile({ name: "empty.pdf", type: "application/pdf", size: 0 }, "material")!, /is empty/);
    assert.match(checkFile({ name: "huge.pdf", type: "application/pdf", size: 30 * 1024 ** 2 }, "material")!, /too large \(30 MB\)\. The limit is 25 MB/);
  });

  it("shows sizes in everyday units", () => {
    assert.equal(formatBytes(500), "500 bytes");
    assert.equal(formatBytes(1536), "1.5 KB");
    assert.equal(formatBytes(2 * 1024 ** 3), "2.0 GB");
  });
});
