"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type SearchableOption = {
  value: string;
  /** The main line, and the text the input shows once it is chosen. */
  label: string;
  /** A quieter second line, for example an email address. */
  hint?: string;
  /** Extra words the search should match but which are not shown. */
  keywords?: string[];
  /** Shown but not choosable, with the note below explaining why. */
  disabled?: boolean;
  disabledNote?: string;
};

type SearchableSelectProps = {
  label: string;
  placeholder: string;
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  /** Validation message shown under the control; also marks it invalid. */
  error?: string;
  /** Quiet help text under the control. */
  help?: string;
  emptyText?: string;
};

/**
 * A drop-down you can type in: a text box that filters the list, plus a
 * list you can walk with the arrow keys.
 *
 * Built as a WAI-ARIA combobox rather than a plain `<select>` because the
 * student list is long and each entry needs two lines (name and email).
 * The keyboard does everything the mouse does: Down/Up move, Home/End jump,
 * Enter chooses, Escape closes and leaves the current choice alone.
 */
export function SearchableSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  help,
  emptyText = "No matches. Try a different word.",
}: SearchableSelectProps) {
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = options.find((option) => option.value === value) ?? null;

  const shown = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return options;
    return options.filter((option) =>
      [option.label, option.hint ?? "", ...(option.keywords ?? [])].some((text) => text.toLocaleLowerCase().includes(needle)),
    );
  }, [options, query]);

  // While closed the box shows the chosen item; typing replaces it only while the list is open.
  const text = open ? query : (selected?.label ?? "");

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Filtering can leave the highlight on an option that can't be chosen: move it to one that can.
  useEffect(() => {
    if (!open) return;
    if (!shown[active]?.disabled) return;
    const enabled = shown.findIndex((option) => !option.disabled);
    if (enabled >= 0) setActive(enabled);
  }, [open, shown, active]);

  useEffect(() => {
    if (!open) return;
    const activeOption = listRef.current?.querySelector('li[data-active="true"]');
    activeOption?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  /** The first option the keyboard should land on: the chosen one, or the first that can be chosen. */
  const firstActive = (list: SearchableOption[]) => {
    const chosen = list.findIndex((option) => option.value === value && !option.disabled);
    if (chosen >= 0) return chosen;
    return Math.max(0, list.findIndex((option) => !option.disabled));
  };

  const start = () => {
    setQuery("");
    setActive(firstActive(options));
    setOpen(true);
  };

  const choose = (option: SearchableOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
    setQuery("");
    inputRef.current?.focus();
  };

  const move = (step: number) => {
    if (!open) {
      start();
      return;
    }
    if (shown.length === 0) return;
    setActive((current) => {
      // Walk past options that can't be chosen, and stop where we started if none can.
      for (let hop = 1; hop <= shown.length; hop += 1) {
        const next = (current + step * hop + shown.length * hop) % shown.length;
        if (!shown[next].disabled) return next;
      }
      return current;
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        move(-1);
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActive(Math.max(0, shown.findIndex((option) => !option.disabled)));
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActive(Math.max(0, shown.map((option) => !option.disabled).lastIndexOf(true)));
        }
        break;
      case "Enter":
        if (open && shown[active]) {
          event.preventDefault();
          choose(shown[active]);
        }
        break;
      case "Escape":
        if (open) {
          // Keep the dialog open: Escape closes this list first.
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          setQuery("");
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = [error ? errorId : null, help ? helpId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={`${id}-input`} className="block text-base font-semibold text-ink">
        {label}
      </label>

      <div className="relative mt-1.5">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open && shown[active] ? `${id}-option-${shown[active].value}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          value={text}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={start}
          onClick={start}
          onKeyDown={onKeyDown}
          className={`h-12 w-full rounded-xl border-2 bg-surface pr-12 pl-12 text-base text-ink placeholder:text-ink-muted focus:border-primary ${
            error ? "border-[#9A3412]" : "border-line"
          }`}
        />
        <ChevronDown
          aria-hidden="true"
          className={`pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border-2 border-line bg-surface py-1 shadow-menu"
        >
          {shown.length === 0 && <li className="px-4 py-3 text-base text-ink-muted">{emptyText}</li>}
          {shown.map((option, index) => {
            const isActive = index === active;
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                id={`${id}-option-${option.value}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                data-active={isActive}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
                onMouseMove={() => setActive(index)}
                className={`flex items-start gap-2 px-4 py-2.5 ${
                  option.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                } ${isActive ? "bg-secondary" : ""}`}
              >
                <Check aria-hidden="true" className={`mt-0.5 size-5 shrink-0 text-primary ${isSelected ? "" : "invisible"}`} />
                <span className="min-w-0">
                  <span className="block text-base font-semibold break-words text-ink">{option.label}</span>
                  {option.hint && <span className="block text-sm break-all text-ink-muted">{option.hint}</span>}
                  {option.disabled && option.disabledNote && (
                    <span className="block text-sm font-semibold text-[#9A3412]">{option.disabledNote}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {help && !error && (
        <p id={helpId} className="mt-1.5 text-sm text-ink-muted">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-semibold text-[#9A3412]">
          {error}
        </p>
      )}
    </div>
  );
}
