"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { closeDialog } from "@/lib/ui/close-dialog";

type CourseActionDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  /** Red confirm button for actions that take a course away from students. */
  danger?: boolean;
  confirmDisabled?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * The shell every course dialog uses: a real modal (the browser's
 * <dialog>), so keyboard focus stays inside, Escape cancels, and focus
 * returns to the button that opened it.
 */
export function CourseActionDialog({
  open,
  title,
  children,
  confirmLabel,
  danger,
  confirmDisabled,
  busy,
  onConfirm,
  onCancel,
}: CourseActionDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) closeDialog(dialog);
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-line bg-surface p-0 text-ink shadow-menu backdrop:bg-ink/50"
    >
      <div className="p-6 sm:p-7">
        <h2 id={titleId} className="text-2xl font-bold tracking-tight">
          {title}
        </h2>
        <div className="mt-3 flex flex-col gap-4 text-lg leading-relaxed text-ink-muted">{children}</div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={busy || confirmDisabled}
            // "!" so the red wins over the button's usual green.
            className={danger ? "bg-[#b42318]! shadow-none! hover:bg-[#912018]! active:bg-[#7a1b14]!" : undefined}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

/** A labelled reason box. Course decisions always keep the reason with the course. */
export function ReasonField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-base font-semibold text-ink">
        {label} <span className="font-normal text-ink-muted">(required)</span>
      </label>
      {hint && <p className="text-base text-ink-muted">{hint}</p>}
      <textarea
        id={id}
        rows={4}
        maxLength={500}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border-2 border-line bg-surface px-4 py-3 text-base text-ink focus:border-primary"
      />
    </div>
  );
}
