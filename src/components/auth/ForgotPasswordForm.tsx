"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth";
import { validateEmail } from "@/lib/auth/validation";
import { FormNotice, SubmitButton, failureNotice, useNotice } from "./AuthParts";
import { AuthInput } from "./AuthInput";
import { useFormFields } from "./useFormFields";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const { notice, show, ref } = useNotice();
  const { values, field, checkAll } = useFormFields({ email: "" }, (v) => ({
    email: validateEmail(v.email),
  }));

  return (
    <div>
      <FormNotice ref={ref} notice={notice} />

      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={async (event) => {
          event.preventDefault();
          show(null);
          if (!checkAll(event)) return;
          setPending(true);
          try {
            const result = await requestPasswordReset({ email: values.email.trim() });
            show(
              result.ok
                ? {
                    // Same message whether or not the address has an account.
                    tone: "info",
                    title: "Check your email",
                    message:
                      "If an account uses this email address, we have sent a link to reset your password. It may take a few minutes to arrive.",
                  }
                : failureNotice(result.reason, "reset"),
            );
          } catch {
            show(failureNotice("network", "reset"));
          } finally {
            setPending(false);
          }
        }}
      >
        <AuthInput
          {...field("email")}
          label="Email Address"
          hint="Use the email address you signed up with."
          type="email"
          inputMode="email"
          placeholder="e.g. name@example.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
        />
        <SubmitButton pending={pending} pendingLabel="Sending…">
          Send Reset Link
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-lg">
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 font-semibold text-primary underline underline-offset-4 hover:text-primary-strong"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
          Back to Login
        </Link>
      </p>
    </div>
  );
}
