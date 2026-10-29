"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, Info } from "lucide-react";

type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name"> & {
  name: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  /** Rendered beside the label, e.g. a "Forgot password?" link. */
  labelAside?: ReactNode;
};

const inputClasses =
  "h-11 w-full rounded-xl border bg-white px-3.5 text-slate-900 shadow-soft transition-[border-color,box-shadow] placeholder:text-slate-400 focus:outline-none focus:ring-4";

function fieldIds(name: string) {
  return { id: `field-${name}`, errorId: `field-${name}-error`, hintId: `field-${name}-hint` };
}

function FieldFrame({
  name,
  label,
  error,
  hint,
  labelAside,
  children,
}: Pick<FieldProps, "name" | "label" | "error" | "hint" | "labelAside"> & { children: ReactNode }) {
  const { id, errorId, hintId } = fieldIds(name);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-800">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
      {hint && (
        <div id={hintId} className="mt-1.5 text-sm text-slate-500">
          {hint}
        </div>
      )}
    </div>
  );
}

function describedBy(name: string, error?: string, hint?: ReactNode) {
  const { errorId, hintId } = fieldIds(name);
  const ids = [error && errorId, hint && hintId].filter(Boolean).join(" ");
  return ids || undefined;
}

function stateClasses(error?: string) {
  return error
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-slate-200 focus:border-brand-300 focus:ring-brand-100";
}

export function TextField({ name, label, error, hint, labelAside, className = "", ...props }: FieldProps) {
  return (
    <FieldFrame name={name} label={label} error={error} hint={hint} labelAside={labelAside}>
      <input
        id={fieldIds(name).id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={`${inputClasses} ${stateClasses(error)} ${className}`}
        {...props}
      />
    </FieldFrame>
  );
}

export function PasswordField({ name, label, error, hint, labelAside, ...props }: Omit<FieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <FieldFrame name={name} label={label} error={error} hint={hint} labelAside={labelAside}>
      <div className="relative">
        <input
          id={fieldIds(name).id}
          name={name}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(name, error, hint)}
          className={`${inputClasses} ${stateClasses(error)} pr-11`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-1 my-auto grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          {visible ? (
            <EyeOff className="size-4.5" aria-hidden="true" />
          ) : (
            <Eye className="size-4.5" aria-hidden="true" />
          )}
        </button>
      </div>
    </FieldFrame>
  );
}

/** Shown after a valid submit, since accounts don't exist yet. */
export function PreviewNotice({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="flex gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900"
    >
      <Info className="mt-0.5 size-4.5 shrink-0 text-brand-600" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Moves focus to the first field with an error, in DOM order. */
export function focusFirstInvalid(form: HTMLFormElement) {
  requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
}
