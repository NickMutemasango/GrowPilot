"use client";

import type { ReactNode } from "react";
import { Search, SearchX, X } from "lucide-react";

export function CatalogSearch({
  id,
  label,
  placeholder,
  value,
  onChange,
  autoFocus,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <div className="group/search flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-soft transition-[border-color,box-shadow] focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100">
      <Search
        className="size-5 shrink-0 text-slate-400 group-focus-within/search:text-brand-600"
        aria-hidden="true"
      />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        className="h-11 min-w-0 flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="grid size-7 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function CatalogSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-soft sm:flex-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
}

function pillClasses(selected: boolean) {
  return `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
    selected
      ? "border-brand-600 bg-brand-600 text-white"
      : "border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:text-brand-700"
  }`;
}

/** "All" plus one pill per option; clicking the selected pill clears it. */
export function FilterPills<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T | null) => void;
}) {
  return (
    // Scrolls sideways on small screens instead of wrapping into many rows.
    <div
      role="group"
      aria-label={label}
      className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      <button
        type="button"
        aria-pressed={!value}
        onClick={() => onChange(null)}
        className={pillClasses(!value)}
      >
        All
      </button>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(value === option ? null : option)}
          className={pillClasses(value === option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function CatalogResults({
  shown,
  total,
  noun,
  hasFilters,
  onClear,
  children,
}: {
  shown: number;
  total: number;
  /** Plural, e.g. "courses". */
  noun: string;
  hasFilters: boolean;
  onClear: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <div className="mt-6 flex items-center justify-between gap-4 text-sm">
        <p className="text-slate-600" aria-live="polite">
          Showing <span className="font-semibold text-slate-900">{shown}</span> of {total} {noun}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md font-semibold text-brand-700 hover:text-brand-800"
          >
            Clear filters
          </button>
        )}
      </div>

      {shown > 0 ? (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
      ) : (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <SearchX className="size-10 text-slate-400" aria-hidden="true" />
          <p className="mt-4 font-display text-lg font-bold text-slate-900">No {noun} match</p>
          <p className="mt-1 text-sm text-slate-500">Try a different search or remove a filter.</p>
          <button
            type="button"
            onClick={onClear}
            className="mt-5 rounded-md text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}

/** Placeholder shown while a catalog reads its filters from the URL. */
export function CatalogFallback() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="h-11 rounded-xl bg-slate-200/70" />
      <div className="mt-5 flex gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-slate-200/70" />
        ))}
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-80 rounded-2xl bg-slate-200/70" />
        ))}
      </div>
    </div>
  );
}
