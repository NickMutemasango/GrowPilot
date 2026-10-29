"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Form from "next/form";
import { Search } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

type SearchBarProps = {
  placeholder: string;
  /** Accessible name for the field. */
  label?: string;
  /** Quick-pick terms shown under the field; clicking one fills the input. */
  suggestions?: string[];
  /** Results page the query is sent to as ?q=. */
  action?: string;
  className?: string;
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export default function SearchBar({
  placeholder,
  label = "Search",
  suggestions,
  action = "/search",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Press "/" anywhere on the page to jump into search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Non-empty queries navigate to the results page; an empty one just refocuses the field.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (query.trim()) return;
    e.preventDefault();
    inputRef.current?.focus();
  }

  function pickSuggestion(term: string) {
    setQuery(term);
    inputRef.current?.focus();
  }

  return (
    <div className={className}>
      <Form
        action={action}
        role="search"
        onSubmit={handleSubmit}
        className="group/search flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-float transition-[border-color,box-shadow] duration-200 focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100"
      >
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
        <Search
          className="ml-2.5 size-5 shrink-0 text-slate-400 transition-colors group-focus-within/search:text-brand-600 sm:ml-3 sm:size-6"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          aria-keyshortcuts="/"
          className="h-12 min-w-0 flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-lg [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd
          aria-hidden="true"
          className="hidden h-7 min-w-7 place-items-center rounded-md border border-slate-200 bg-slate-50 px-2 font-sans text-xs font-semibold text-slate-500 md:grid"
        >
          /
        </kbd>
        <button type="submit" className={buttonClasses("primary", "lg", "shrink-0 px-4 sm:px-6")}>
          <Search className="size-5 sm:hidden" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Search</span>
        </button>
      </Form>

      {suggestions && suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="font-medium text-slate-500">Popular:</span>
          {suggestions.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => pickSuggestion(term)}
              className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 font-medium text-slate-600 transition-colors duration-200 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
