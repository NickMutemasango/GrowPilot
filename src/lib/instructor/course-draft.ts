import type { Course, CourseDetails } from "@/types/course";
import type { CourseDraft, CoursePublishStatus, DraftLesson, DraftModule } from "@/types/instructor";

/*
 * Course editing rules, shared by the editor and the server. Covered by
 * course-draft.test.ts. Instructors can save drafts and submit for review;
 * only an administrator can publish (Step 12).
 */

export const MAX_PRICE_USD = 1000;

let counter = 0;
function newId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

export function createEmptyDraft(instructorId: string, now = new Date()): CourseDraft {
  return {
    id: newId("course"),
    instructorId,
    status: "draft",
    hasLiveVersion: false,
    title: "",
    shortDescription: "",
    description: "",
    category: "",
    level: "",
    duration: "",
    thumbnail: null,
    isFree: true,
    price: "",
    outcomes: [""],
    modules: [createModule()],
    updatedAt: now.toISOString(),
  };
}

export function createModule(): DraftModule {
  return { id: newId("module"), title: "", description: "", lessons: [createLesson()], live: false };
}

export function createLesson(): DraftLesson {
  return {
    id: newId("lesson"),
    title: "",
    description: "",
    type: "video",
    minutes: 10,
    video: null,
    notes: "",
    materials: [],
    live: false,
  };
}

/** An existing catalogue course as an editable draft. Everything in it is already live. */
export function draftFromCourse(course: Course, details: CourseDetails | undefined): CourseDraft {
  return {
    id: course.id,
    instructorId: course.instructor.id,
    status: "published",
    hasLiveVersion: true,
    title: course.title,
    shortDescription: course.description,
    description: details?.overview.join("\n\n") ?? "",
    category: course.category,
    level: course.level,
    duration: course.duration,
    thumbnail: { name: "Current course picture", sizeBytes: 0, mimeType: "image/jpeg", uploaded: true, url: course.image.src },
    isFree: course.priceUsd === null,
    price: course.priceUsd === null ? "" : String(course.priceUsd),
    outcomes: details?.outcomes ?? [],
    modules: (details?.modules ?? []).map((courseModule, moduleIndex) => ({
      id: `${course.id}-m${moduleIndex + 1}`,
      title: courseModule.title,
      description: "",
      live: true,
      lessons: courseModule.lessons.map((lesson, lessonIndex) => ({
        id: `${course.id}-m${moduleIndex + 1}-l${lessonIndex + 1}`,
        title: lesson.title,
        description: "",
        type: lesson.type,
        minutes: lesson.minutes,
        video: null,
        notes: "",
        materials: [],
        live: true,
      })),
    })),
    updatedAt: new Date(0).toISOString(),
  };
}

/** Moves an item one place up (-1) or down (+1). Out-of-range moves change nothing. */
export function moveItem<T>(list: readonly T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return [...list];
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export type InfoErrors = Partial<Record<"title" | "shortDescription" | "description" | "category" | "level" | "duration" | "price" | "outcomes", string>>;

/** Stage 1 checks, in plain English. */
export function validateCourseInfo(draft: CourseDraft): InfoErrors {
  const errors: InfoErrors = {};
  if (!draft.title.trim()) errors.title = "Please give your course a title.";
  else if (draft.title.trim().length > 100) errors.title = "Please keep the title under 100 characters.";
  if (!draft.shortDescription.trim()) errors.shortDescription = "Please write a short description.";
  else if (draft.shortDescription.trim().length > 200) errors.shortDescription = "Please keep the short description under 200 characters.";
  if (!draft.description.trim()) errors.description = "Please describe your course in a few sentences.";
  if (!draft.category) errors.category = "Please choose a category.";
  if (!draft.level) errors.level = "Please choose a difficulty level.";
  if (!draft.duration.trim()) errors.duration = "Please say roughly how long the course takes, for example \"4 weeks\".";
  if (!draft.isFree) {
    const price = parsePrice(draft.price);
    if (price === null) errors.price = `Please enter a price between $1 and $${MAX_PRICE_USD}, for example 29 or 29.99.`;
  }
  if (draft.outcomes.filter((item) => item.trim()).length === 0) {
    errors.outcomes = "Please add at least one thing students will learn.";
  }
  return errors;
}

/** "29" → 29, "29.99" → 29.99; anything else, or out of range, → null. */
export function parsePrice(value: string): number | null {
  const trimmed = value.trim().replace(/^\$/, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const price = Number(trimmed);
  return price >= 1 && price <= MAX_PRICE_USD ? price : null;
}

/** Stage 2 checks: each problem as a sentence that names the module or lesson. */
export function validateCurriculum(draft: CourseDraft): string[] {
  const problems: string[] = [];
  if (draft.modules.length === 0) problems.push("Please add at least one module.");
  draft.modules.forEach((courseModule, moduleIndex) => {
    const name = `Module ${moduleIndex + 1}`;
    if (!courseModule.title.trim()) problems.push(`${name} needs a title.`);
    if (courseModule.lessons.length === 0) problems.push(`${name} needs at least one lesson.`);
    courseModule.lessons.forEach((lesson, lessonIndex) => {
      const lessonName = `${name}, lesson ${lessonIndex + 1}`;
      if (!lesson.title.trim()) problems.push(`${lessonName} needs a title.`);
      if (!(lesson.minutes > 0 && lesson.minutes <= 600)) problems.push(`${lessonName} needs a length between 1 and 600 minutes.`);
    });
  });
  return problems;
}

/** A draft can be saved with just a title, so instructors never lose work. */
export function canSaveDraft(draft: CourseDraft): boolean {
  return draft.title.trim().length > 0;
}

/** Everything must be complete before an administrator is asked to review it. */
export function canSubmitForReview(draft: CourseDraft): boolean {
  return Object.keys(validateCourseInfo(draft)).length === 0 && validateCurriculum(draft).length === 0;
}

/**
 * The status after an instructor saves. Instructors can never publish: that
 * needs an administrator. Submitting while already waiting changes nothing.
 */
export function statusAfterSave(intent: "draft" | "review"): CoursePublishStatus {
  return intent === "review" ? "pending_review" : "draft";
}

export function summariseCurriculum(draft: CourseDraft): { modules: number; lessons: number; minutes: number } {
  const lessons = draft.modules.flatMap((courseModule) => courseModule.lessons);
  return {
    modules: draft.modules.length,
    lessons: lessons.length,
    minutes: lessons.reduce((sum, lesson) => sum + (Number.isFinite(lesson.minutes) ? lesson.minutes : 0), 0),
  };
}

/**
 * What to tell the instructor before removing a lesson or module. Removing
 * something students can already see never deletes their progress: it is
 * hidden from the new version once approved.
 */
export function removalWarning(item: { live: boolean }, kind: "lesson" | "module"): string {
  return item.live
    ? `Students may already be learning from this ${kind}. If you remove it, it will be hidden from the course after your changes are approved. Students' progress and certificates are kept. Remove it?`
    : `Remove this ${kind}? Anything you've written in it will be lost.`;
}
