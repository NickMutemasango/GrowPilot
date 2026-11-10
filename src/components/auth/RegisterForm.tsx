"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Circle } from "lucide-react";
import { registerWithEmail, type AuthResult } from "@/lib/auth";
import { DEFAULT_AFTER_LOGIN } from "@/lib/auth/redirect";
import {
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validateFullName,
  validateNewPassword,
  validatePasswordConfirmation,
} from "@/lib/auth/validation";
import { AuthDivider, FormNotice, SubmitButton, failureNotice, useNotice } from "./AuthParts";
import { AuthInput } from "./AuthInput";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { PasswordInput } from "./PasswordInput";
import { useFormFields } from "./useFormFields";

export function RegisterForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const { notice, show, ref } = useNotice();
  const { values, field, checkAll } = useFormFields(
    { fullName: "", email: "", password: "", confirmPassword: "" },
    (v) => ({
      fullName: validateFullName(v.fullName),
      email: validateEmail(v.email),
      password: validateNewPassword(v.password),
      confirmPassword: validatePasswordConfirmation(v.password, v.confirmPassword),
    }),
  );

  const handleResult = (result: AuthResult, action: "register" | "google") => {
    if (result.ok) router.push(result.redirectTo);
    else show(failureNotice(result.reason, action));
  };

  const longEnough = values.password.length >= MIN_PASSWORD_LENGTH;
  const { error: passwordError, ...passwordField } = field("password");

  return (
    <div>
      <FormNotice ref={ref} notice={notice} />

      <GoogleSignInButton
        redirectTo={redirectTo}
        onResult={(result) => handleResult(result, "google")}
      />
      <AuthDivider>or continue with email</AuthDivider>

      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={async (event) => {
          event.preventDefault();
          show(null);
          if (!checkAll(event)) return;
          setPending(true);
          try {
            const result = await registerWithEmail({
              fullName: values.fullName.trim(),
              email: values.email.trim(),
              password: values.password,
              redirectTo,
            });
            handleResult(result, "register");
          } catch {
            show(failureNotice("network", "register"));
          } finally {
            setPending(false);
          }
        }}
      >
        <AuthInput
          {...field("fullName")}
          label="Full Name"
          placeholder="e.g. John Moyo"
          autoComplete="name"
          autoCapitalize="words"
        />
        <AuthInput
          {...field("email")}
          label="Email Address"
          type="email"
          inputMode="email"
          placeholder="e.g. name@example.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
        />
        <PasswordInput
          {...passwordField}
          error={passwordError}
          label="Password"
          hint="Choose something you will remember. Longer is safer."
          autoComplete="new-password"
        >
          <p
            className={`mt-2 flex items-center gap-2 text-base ${
              longEnough ? "font-medium text-primary" : "text-ink-muted"
            }`}
          >
            {longEnough ? (
              <Check aria-hidden="true" className="size-5" strokeWidth={3} />
            ) : (
              <Circle aria-hidden="true" className="size-5" />
            )}
            At least {MIN_PASSWORD_LENGTH} characters
            <span className="sr-only">{longEnough ? " (done)" : ""}</span>
          </p>
        </PasswordInput>
        <PasswordInput
          {...field("confirmPassword")}
          label="Confirm Password"
          hint="Type the same password again."
          autoComplete="new-password"
        />

        <SubmitButton pending={pending} pendingLabel="Creating your account…">
          Create My Account
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-lg text-ink">
        Already have an account?{" "}
        <Link
          href={redirectTo === DEFAULT_AFTER_LOGIN ? "/login" : `/login?next=${encodeURIComponent(redirectTo)}`}
          className="inline-flex min-h-11 items-center rounded-lg px-1 font-semibold text-primary underline underline-offset-4 hover:text-primary-strong"
        >
          Log In
        </Link>
      </p>
    </div>
  );
}
