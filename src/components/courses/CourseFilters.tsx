"use client";

import { Check } from "lucide-react";
import {
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  type CourseCategoryId,
  type CourseLevel,
} from "@/types/course";

type CourseFiltersProps = {
  category: CourseCategoryId | "all";
  level: CourseLevel | "all";
  onCategoryChange: (category: CourseCategoryId | "all") => void;
  onLevelChange: (level: CourseLevel | "all") => void;
};

const categoryOptions = [{ id: "all", label: "All Courses" } as const, ...COURSE_CATEGORIES];
const levelOptions = [
  { id: "all", label: "All levels" } as const,
  ...COURSE_LEVELS.map((level) => ({ id: level, label: level })),
];

/** Topic chips and a level selector. Every option is always visible. */
export function CourseFilters({
  category,
  level,
  onCategoryChange,
  onLevelChange,
}: CourseFiltersProps) {
  return (
    <div className="flex flex-col gap-7">
      <div role="group" aria-labelledby="topic-filter-label">
        <p id="topic-filter-label" className="text-lg font-semibold text-ink">
          Choose a topic
        </p>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {categoryOptions.map((option) => {
            const selected = option.id === category;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onCategoryChange(option.id)}
                className={`inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-5 text-lg font-semibold transition-colors ${
                  selected
                    ? "border-primary bg-primary text-white shadow-button"
                    : "border-line bg-surface text-ink hover:border-primary/50 hover:bg-secondary"
                }`}
              >
                {selected && <Check aria-hidden="true" className="size-5" strokeWidth={3} />}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div role="group" aria-labelledby="level-filter-label">
        <p id="level-filter-label" className="text-lg font-semibold text-ink">
          Choose a level
        </p>
        <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-2xl border-2 border-line bg-surface p-1.5 sm:inline-grid sm:grid-cols-4">
          {levelOptions.map((option) => {
            const selected = option.id === level;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onLevelChange(option.id)}
                className={`inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl px-3 text-lg font-semibold whitespace-nowrap transition-colors sm:px-5 ${
                  selected
                    ? "bg-primary text-white shadow-button"
                    : "text-ink hover:bg-secondary"
                }`}
              >
                {selected && <Check aria-hidden="true" className="size-5" strokeWidth={3} />}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
