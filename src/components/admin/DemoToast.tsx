"use client";

import { useEffect } from "react";
import { CircleCheck, X } from "lucide-react";

type DemoToastProps = {
  message: string | null;
  onDismiss: () => void;
  /** How long it stays before fading away, in milliseconds. */
  duration?: number;
};

/**
 * A short confirmation that appears after an action and goes away by
 * itself. Announced politely, so a screen reader hears it without losing
 * its place, and dismissible by hand for anyone who reads more slowly.
 */
export function DemoToast({ message, onDismiss, duration = 6000 }: DemoToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      {message && (
        <div className="pointer-events-auto flex max-w-[28rem] items-start gap-3 rounded-2xl bg-primary px-4 py-3 text-white shadow-menu">
          <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p className="text-base font-semibold">{message}</p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss message"
            className="-my-1 -mr-1 inline-flex size-11 shrink-0 items-center justify-center rounded-xl hover:bg-white/15"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
