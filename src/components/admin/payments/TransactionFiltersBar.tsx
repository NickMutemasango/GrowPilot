"use client";

import { useId } from "react";
import { Search, X } from "lucide-react";
import { transactionStatusLabels } from "@/lib/admin/payments";
import { TRANSACTION_STATUSES, type TransactionFilters } from "@/types/admin-payments";

type TransactionFiltersBarProps = {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
};

const statusOptions = [
  { value: "all", label: "All Transactions" },
  ...TRANSACTION_STATUSES.map((status) => ({ value: status, label: transactionStatusLabels[status] })),
];

/** Search plus the status drop-down. They apply together. */
export function TransactionFiltersBar({ filters, onChange }: TransactionFiltersBarProps) {
  const id = useId();
  const set = (changes: Partial<TransactionFilters>) => onChange({ ...filters, ...changes });

  return (
    <div
      role="search"
      aria-label="Find transactions"
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5"
    >
      <div>
        <label htmlFor={`${id}-q`} className="sr-only">
          Search transactions, students or courses
        </label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
          <input
            id={`${id}-q`}
            type="search"
            value={filters.query}
            onChange={(event) => set({ query: event.target.value })}
            placeholder="Search transactions, students or courses..."
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
        <p className="mt-1.5 text-sm text-ink-muted">
          You can search by transaction reference, student name or course name. Results update as you type.
        </p>
      </div>

      <div className="sm:max-w-xs">
        <label htmlFor={`${id}-status`} className="text-sm font-semibold text-ink">
          Payment status
        </label>
        <select
          id={`${id}-status`}
          value={filters.status}
          onChange={(event) => set({ status: event.target.value as TransactionFilters["status"] })}
          className="mt-1 h-11 w-full rounded-xl border-2 border-line bg-surface px-3 text-base text-ink focus:border-primary"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
