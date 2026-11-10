import {
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  getCategoryLabel,
  type Course,
  type CourseCategoryId,
  type CourseLevel,
} from "@/types/course";

/* Pure catalogue filtering, safe to use in client components. */

export type CourseFilters = {
  query: string;
  category: CourseCategoryId | "all";
  level: CourseLevel | "all";
};

export const defaultFilters: CourseFilters = {
  query: "",
  category: "all",
  level: "all",
};

export function hasActiveFilters(filters: CourseFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.category !== "all" ||
    filters.level !== "all"
  );
}

/**
 * Case-insensitive search across title, description and category. Every word
 * typed must appear somewhere, so "excel beginner" style searches narrow down.
 */
export function filterCourses(courses: Course[], filters: CourseFilters): Course[] {
  const words = filters.query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return courses.filter((course) => {
    if (filters.category !== "all" && course.category !== filters.category) return false;
    if (filters.level !== "all" && course.level !== filters.level) return false;
    if (words.length === 0) return true;

    const text = [course.title, course.description, getCategoryLabel(course.category)]
      .join(" ")
      .toLowerCase();
    return words.every((word) => text.includes(word));
  });
}

/** Reads filters from URL search params, ignoring unknown values. */
export function parseFilters(params: URLSearchParams): CourseFilters {
  const category = params.get("category");
  const level = params.get("level");

  return {
    query: params.get("q") ?? "",
    category: COURSE_CATEGORIES.some((c) => c.id === category)
      ? (category as CourseCategoryId)
      : "all",
    level: COURSE_LEVELS.includes(level as CourseLevel) ? (level as CourseLevel) : "all",
  };
}

export function filtersToSearch(filters: CourseFilters): string {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.level !== "all") params.set("level", filters.level);
  const search = params.toString();
  return search ? `?${search}` : "";
}
