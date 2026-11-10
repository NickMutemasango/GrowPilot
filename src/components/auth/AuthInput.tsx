"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";

export type AuthInputProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  /** Always-visible help under the label, e.g. an example. */
  hint?: ReactNode;
  error?: string;
  /** Extra content inside the field on the right, e.g. a Show button. */
  endAdornment?: ReactNode;
  /** Extra content under the field, e.g. password rules. */
  children?: ReactNode;
};

/** Labelled text field with hint and error message wired up for screen readers. */
export function AuthInput({
  label,
  hint,
  error,
  endAdornment,
  children,
  className = "",
  ...inputProps
}: AuthInputProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div>
      <label htmlFor={id} className="block text-lg font-semibold text-ink">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-base text-ink-muted">
          {hint}
        </p>
      )}
      <div className="relative mt-2">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`h-14 w-full rounded-xl border-2 bg-surface px-4 text-lg text-ink transition-colors placeholder:text-ink-muted/70 hover:border-primary/40 focus:border-primary ${
            error ? "border-[#b42318]" : "border-line"
          } ${endAdornment ? "pr-28" : ""} ${className}`}
          {...inputProps}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-1.5 flex items-center">{endAdornment}</div>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-2 flex items-start gap-2 text-base font-medium text-[#b42318]">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          {error}
        </p>
      )}
      {children}
    </div>
  );
}
