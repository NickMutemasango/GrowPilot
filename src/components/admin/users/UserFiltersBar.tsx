"use client";

import { useId } from "react";
import { Search, X } from "lucide-react";
import type { UserFilters } from "@/types/admin-users";

type UserFiltersBarProps = {
  filters: UserFilters;
  onChange: (filters: UserFilters) => void;
};

const roles = [
  { value: "all", label: "All Users" },
  { value: "student", label: "Students" },
  { value: "instructor", label: "Instructors" },
  { value: "admin", label: "Administrators" },
];
const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];
const applications = [
  { value: "all", label: "Any application" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

/** Search plus three simple drop-downs. Account status and application status are kept separate. */
export function UserFiltersBar({ filters, onChange }: UserFiltersBarProps) {
  const id = useId();
  const set = (changes: Partial<UserFilters>) => onChange({ ...filters, ...changes });

  return (
    <div role="search" aria-label="Find users" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div>
        <label htmlFor={`${id}-q`} className="sr-only">
          Search users by name or email
        </label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
          <input
            id={`${id}-q`}
            type="search"
            value={filters.query}
            onChange={(event) => set({ query: event.target.value })}
            placeholder="Search users by name or email..."
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
        <Select id={`${id}-role`} label="Role" value={filters.role} options={roles} onChange={(role) => set({ role: role as UserFilters["role"] })} />
        <Select id={`${id}-status`} label="Account status" value={filters.status} options={statuses} onChange={(status) => set({ status: status as UserFilters["status"] })} />
        <Select
          id={`${id}-app`}
          label="Instructor application"
          value={filters.application}
          options={applications}
          onChange={(application) => set({ application: application as UserFilters["application"] })}
        />
      </div>
    </div>
  );
}

function Select({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
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
