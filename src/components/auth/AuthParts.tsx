"use client";

import { forwardRef, useCallback, useRef, useState, type ReactNode } from "react";
import { CircleAlert, Info, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AuthFailureReason } from "@/lib/auth";

/** "or continue with email" line between Google and the email form. */
export function AuthDivider({ children }: { children: ReactNode }) {
  return (
    <div className="my-7 flex items-center gap-4" role="separator" aria-label={String(children)}>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
      <span aria-hidden="true" className="text-base font-medium text-ink-muted">
        {children}
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </div>
  );
}

export type Notice = { tone: "info" | "error"; title: string; message: string };

/** State for a form's notice, moving focus to it whenever it changes. */
export function useNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const show = useCallback((next: Notice | null) => {
    setNotice(next);
    if (next) requestAnimationFrame(() => ref.current?.focus());
  }, []);

  return { notice, show, ref };
}

/**
 * A message box at the top of a form. It receives focus when shown so that
 * it is read out and scrolled into view.
 */
export const FormNotice = forwardRef<HTMLDivElement, { notice: Notice | null }>(
  function FormNotice({ notice }, ref) {
    return (
      <div ref={ref} tabIndex={-1} role={notice?.tone === "error" ? "alert" : "status"} className="outline-none">
        {notice && (
          <div
            className={`mb-6 flex gap-3 rounded-2xl border-2 p-4 text-lg ${
              notice.tone === "error"
                ? "border-[#b42318]/40 bg-[#fef3f2] text-ink"
                : "border-accent bg-accent/15 text-ink"
            }`}
          >
            {notice.tone === "error" ? (
              <CircleAlert aria-hidden="true" className="mt-1 size-6 shrink-0 text-[#b42318]" />
            ) : (
              <Info aria-hidden="true" className="mt-1 size-6 shrink-0 text-[#6b4e00]" />
            )}
            <div>
              <p className="font-semibold">{notice.title}</p>
              <p className="mt-1 text-ink-muted">{notice.message}</p>
            </div>
          </div>
        )}
      </div>
    );
  },
);

/** Full-width primary submit button with a clear "working" state. */
export function SubmitButton({
  pending,
  pendingLabel,
  children,
}: {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
}) {
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? (
        <>
          <LoaderCircle aria-hidden="true" className="size-5 motion-safe:animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** Friendly, non-technical messages for each failure type. */
export function failureNotice(
  reason: AuthFailureReason,
  action: "register" | "login" | "google" | "reset",
): Notice {
  if (reason === "not-configured") {
    const titles = {
      register: "Creating an account is not available yet",
      login: "Logging in is not available yet",
      google: "Google sign-in is not available yet",
      reset: "Password reset is not available yet",
    };
    const messages = {
      register: "We are still setting up GrowPilot accounts. No account was created and nothing you typed has been saved. Please check back soon.",
      login: "We are still setting up GrowPilot accounts, so you cannot log in yet. Nothing you typed has been saved.",
      google: "We are still setting this up. Nothing has been shared with Google. Please check back soon.",
      reset: "We are still setting this up, so no email has been sent. Please check back soon.",
    };
    return { tone: "info", title: titles[action], message: messages[action] };
  }

  const errors: Record<Exclude<AuthFailureReason, "not-configured">, Notice> = {
    "invalid-credentials": {
      tone: "error",
      title: "We couldn't log you in",
      message: "The email address or password is not right. Please check them and try again.",
    },
    "email-in-use": {
      tone: "error",
      title: "This email address already has an account",
      message: "Try logging in instead, or reset your password if you have forgotten it.",
    },
    network: {
      tone: "error",
      title: "Something went wrong",
      message: "Please check your internet connection and try again.",
    },
  };
  return errors[reason];
}
