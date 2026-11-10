"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { closeDialog } from "@/lib/ui/close-dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  /** Red confirm button for actions that restrict access. */
  danger?: boolean;
  /** Shows an optional "reason" box. */
  reasonLabel?: string;
  busy?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

/**
 * A real modal dialog (the browser's <dialog>): it keeps keyboard focus
 * inside, Escape cancels, and focus returns to the button that opened it.
 */
export function ConfirmDialog({ open, title, children, confirmLabel, danger, reasonLabel, busy, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const reasonId = useId();
  const [reason, setReason] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setReason("");
      dialog.showModal();
    } else if (!open && dialog.open) {
      closeDialog(dialog);
    }
  }, [open]);

  // The screen takes this dialog off the page once the action is done, rather
  // than closing it first. Close it here while the element still exists, so
  // the keyboard is handed back to the details panel underneath instead of
  // being dropped on the page body.
  useEffect(() => {
    const dialog = ref.current;
    return () => {
      if (dialog?.open) closeDialog(dialog);
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl border border-line bg-surface p-0 text-ink shadow-menu backdrop:bg-ink/50"
    >
      <div className="p-6 sm:p-7">
        <h2 id={titleId} className="text-2xl font-bold tracking-tight">
          {title}
        </h2>
        <div className="mt-3 text-lg leading-relaxed text-ink-muted">{children}</div>
        {reasonLabel && (
          <div className="mt-5">
            <label htmlFor={reasonId} className="text-base font-semibold text-ink">
              {reasonLabel} <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id={reasonId}
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-2 w-full rounded-xl border-2 border-line bg-surface px-4 py-3 text-base text-ink focus:border-primary"
            />
          </div>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(reason)}
            disabled={busy}
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
