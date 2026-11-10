"use client";

import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";

/*
 * Labelled fields for the course editor, with hints and errors linked for
 * screen readers. They match the sign-up form's fields.
 */

type FieldShellProps = { label: string; hint?: ReactNode; error?: string; optional?: boolean; children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode };

function FieldShell({ label, hint, error, optional, children }: FieldShellProps) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-lg font-semibold text-ink">
        {label} {optional && <span className="font-normal text-ink-muted">(optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-0.5 text-base text-ink-muted">
          {hint}
        </p>
      )}
      <div className="mt-2">{children({ id, describedBy, invalid: Boolean(error) })}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-2 text-base font-medium text-[#b42318]">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (invalid: boolean) =>
  `w-full rounded-xl border-2 bg-surface px-4 text-lg text-ink transition-colors hover:border-primary/40 focus:border-primary ${
    invalid ? "border-[#b42318]" : "border-line"
  }`;

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  placeholder?: string;
  type?: "text" | "number";
  inputMode?: "decimal" | "numeric";
  maxLength?: number;
};

export function TextField({ label, value, onChange, hint, error, optional, placeholder, type = "text", inputMode, maxLength }: TextFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`h-12 ${inputClass(invalid)}`}
        />
      )}
    </FieldShell>
  );
}

export function TextArea({ label, value, onChange, hint, error, optional, rows = 4, maxLength }: Omit<TextFieldProps, "type" | "inputMode" | "placeholder"> & { rows?: number }) {
  return (
    <FieldShell label={label} hint={hint} error={error} optional={optional}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          rows={rows}
          value={value}
          maxLength={maxLength}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`py-3 ${inputClass(invalid)}`}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  error,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  hint?: ReactNode;
}) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          value={value}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`h-12 ${inputClass(invalid)}`}
        >
          <option value="">Choose…</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

/** Small icon buttons for moving and removing, each with a full spoken name. */
export function IconButton({ label, onClick, disabled, children, danger }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex size-11 items-center justify-center rounded-xl border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger ? "border-[#f3c7c2] text-[#b42318] hover:bg-[#FDECEA]" : "border-line text-ink hover:border-primary/50 hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
