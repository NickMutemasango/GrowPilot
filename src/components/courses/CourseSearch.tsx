"use client";

import { useId, useRef } from "react";
import { Search, X } from "lucide-react";

type CourseSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Large search box. Results update as you type; "Clear" empties it. */
export function CourseSearch({ value, onChange }: CourseSearchProps) {
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form role="search" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor={inputId} className="block text-lg font-semibold text-ink">
        Search for a course
      </label>
      <p id={hintId} className="sr-only">
        Results update as you type.
      </p>
      <div className="relative mt-2">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-6 sm:left-5 -translate-y-1/2 text-ink-muted"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && value) {
              event.preventDefault();
              onChange("");
            }
          }}
          placeholder="What would you like to learn?"
          aria-describedby={hintId}
          autoComplete="off"
          enterKeyHint="search"
          className={`h-16 w-full rounded-2xl border-2 border-line bg-surface pl-12 text-lg text-ink shadow-header transition-colors placeholder:text-base placeholder:text-ink-muted/80 sm:pl-14 sm:placeholder:text-xl hover:border-primary/40 focus:border-primary focus-visible:outline-offset-2 sm:text-xl [&::-webkit-search-cancel-button]:appearance-none ${
            value ? "pr-32" : "pr-3"
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className="absolute top-1/2 right-2.5 inline-flex min-h-11 -translate-y-1/2 items-center gap-1.5 rounded-xl px-3.5 text-lg font-semibold text-primary hover:bg-secondary"
          >
            <X aria-hidden="true" className="size-5" />
            Clear
            <span className="sr-only"> search</span>
          </button>
        )}
      </div>
    </form>
  );
}
