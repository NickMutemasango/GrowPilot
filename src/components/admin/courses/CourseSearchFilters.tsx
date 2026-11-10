"use client";

import { useId } from "react";
import { Search, X } from "lucide-react";
import { COURSE_CATEGORIES } from "@/types/course";
import type { AdminCourseFilters } from "@/types/admin-courses";

type CourseSearchFiltersProps = {
  filters: AdminCourseFilters;
  onChange: (filters: AdminCourseFilters) => void;
};

const statuses = [
  { value: "all", label: "All Courses" },
  { value: "published", label: "Published" },
  { value: "pending_review", label: "Pending Review" },
  { value: "draft", label: "Draft" },
  { value: "rejected", label: "Rejected" },
  { value: "unpublished", label: "Unpublished" },
];

const categories = [{ value: "all", label: "All Categories" }, ...COURSE_CATEGORIES.map((category) => ({ value: category.id, label: category.label }))];

const pricing = [
  { value: "all", label: "Free and paid" },
  { value: "free", label: "Free only" },
  { value: "paid", label: "Paid only" },
];

/** Search plus three drop-downs. They combine: each one narrows what the others leave. */
export function CourseSearchFilters({ filters, onChange }: CourseSearchFiltersProps) {
  const id = useId();
  const set = (changes: Partial<AdminCourseFilters>) => onChange({ ...filters, ...changes });

  return (
    <div role="search" aria-label="Find courses" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div>
        <label htmlFor={`${id}-q`} className="sr-only">
          Search courses by title or instructor
        </label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
          <input
            id={`${id}-q`}
            type="search"
            value={filters.query}
            onChange={(event) => set({ query: event.target.value })}
            placeholder="Search courses by title or instructor..."
            className="h-12 w-full rounded-xl border-2 border-line bg-surface pr-12 pl-12 text-base text-ink placeholder:text-ink-muted focus:border-primary [&::-webkit-search-cancel-button]:hidden"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => set({ query: "" })}
              aria-label="Clear search"
              title="Clear search"
              className="absolute top-1/2 right-1 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted hover:bg-secondary hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          id={`${id}-status`}
          label="Status"
          value={filters.status}
          options={statuses}
          onChange={(status) => set({ status: status as AdminCourseFilters["status"] })}
        />
        <Select
          id={`${id}-category`}
          label="Category"
          value={filters.category}
          options={categories}
          onChange={(category) => set({ category: category as AdminCourseFilters["category"] })}
        />
        <Select
          id={`${id}-pricing`}
          label="Price"
          value={filters.pricing}
          options={pricing}
          onChange={(value) => set({ pricing: value as AdminCourseFilters["pricing"] })}
        />
      </div>
    </div>
  );
}

function Select({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-xl border-2 border-line bg-surface px-3 text-base text-ink focus:border-primary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
