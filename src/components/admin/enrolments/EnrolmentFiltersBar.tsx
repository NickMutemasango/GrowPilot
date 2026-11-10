"use client";

import { useId } from "react";
import { Search, X } from "lucide-react";
import { enrolmentStatusLabels, enrolmentTypeLabels } from "@/lib/admin/enrolments";
import {
  ENROLMENT_STATUSES,
  ENROLMENT_TYPES,
  type EnrolmentCourseOption,
  type EnrolmentFilters,
} from "@/types/admin-enrolments";

type EnrolmentFiltersBarProps = {
  filters: EnrolmentFilters;
  courses: EnrolmentCourseOption[];
  onChange: (filters: EnrolmentFilters) => void;
};

const statusOptions = [
  { value: "all", label: "All Statuses" },
  ...ENROLMENT_STATUSES.map((status) => ({ value: status, label: enrolmentStatusLabels[status] })),
];

const typeOptions = [
  { value: "all", label: "All Types" },
  ...ENROLMENT_TYPES.map((type) => ({ value: type, label: enrolmentTypeLabels[type] })),
];

/** Search plus the Course, Status and Enrolment Type drop-downs. They all apply together. */
export function EnrolmentFiltersBar({ filters, courses, onChange }: EnrolmentFiltersBarProps) {
  const id = useId();
  const set = (changes: Partial<EnrolmentFilters>) => onChange({ ...filters, ...changes });
  const courseOptions = [{ value: "all", label: "All Courses" }, ...courses.map((course) => ({ value: course.id, label: course.title }))];

  return (
    <div role="search" aria-label="Find enrolments" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div>
        <label htmlFor={`${id}-q`} className="sr-only">
          Search by student or course name
        </label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
          <input
            id={`${id}-q`}
            type="search"
            value={filters.query}
            onChange={(event) => set({ query: event.target.value })}
            placeholder="Search by student or course name..."
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
        <p className="mt-1.5 text-sm text-ink-muted">You can search by student name, student email address or course name.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select id={`${id}-course`} label="Course" value={filters.course} options={courseOptions} onChange={(course) => set({ course })} />
        <Select
          id={`${id}-status`}
          label="Enrolment status"
          value={filters.status}
          options={statusOptions}
          onChange={(status) => set({ status: status as EnrolmentFilters["status"] })}
        />
        <Select
          id={`${id}-type`}
          label="Enrolment type"
          value={filters.type}
          options={typeOptions}
          onChange={(type) => set({ type: type as EnrolmentFilters["type"] })}
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
