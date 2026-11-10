export const COURSE_CATEGORIES = [
  { id: "technology", label: "Technology" },
  { id: "business", label: "Business & Entrepreneurship" },
  { id: "digital-skills", label: "Digital Skills" },
  { id: "personal-development", label: "Personal Development" },
  { id: "creative", label: "Creative Skills" },
] as const;

export type CourseCategoryId = (typeof COURSE_CATEGORIES)[number]["id"];

export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export type CourseLevel = (typeof COURSE_LEVELS)[number];

export type CourseImage = {
  src: string;
  alt: string;
};

export type Instructor = {
  id: string;
  name: string;
  /** Plain-English role, e.g. "Digital skills tutor". */
  title: string;
  bio: string;
};

/**
 * A course as the interface needs it. Keep this shape when moving to a
 * database: map database rows to `Course` in `src/lib/courses.ts`.
 */
export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: CourseCategoryId;
  instructor: Instructor;
  level: CourseLevel;
  /** Human-readable length, e.g. "4 weeks". */
  duration: string;
  image: CourseImage;
  /** Price in US dollars; `null` means the course is free. */
  priceUsd: number | null;
  /** Only "published" courses are shown to students. Missing means published. */
  status?: "draft" | "pending_review" | "published" | "rejected" | "unpublished";
};

export type LessonType = "video" | "reading";

export type Lesson = {
  title: string;
  type: LessonType;
  minutes: number;
};

export type CourseModule = {
  title: string;
  lessons: Lesson[];
};

/** The longer content shown only on a course's own page. */
export type CourseDetails = {
  /** Short paragraphs for "About This Course". */
  overview: string[];
  outcomes: string[];
  modules: CourseModule[];
  /** "Before You Start" items. */
  requirements: string[];
  /** "Who Should Take This Course?" items. */
  audience: string[];
};

export function getCategoryLabel(id: CourseCategoryId): string {
  return COURSE_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

export function formatPrice(priceUsd: number | null): string {
  return priceUsd === null ? "Free" : `$${priceUsd}`;
}

export function countLessons(modules: CourseModule[]): number {
  return modules.reduce((total, module) => total + module.lessons.length, 0);
}

/** 45 → "45 min", 90 → "1 hr 30 min". */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}
