"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmail, type AuthResult } from "@/lib/auth";
import { DEFAULT_AFTER_LOGIN } from "@/lib/auth/redirect";
import { validateCurrentPassword, validateEmail } from "@/lib/auth/validation";
import { AuthDivider, FormNotice, SubmitButton, failureNotice, useNotice } from "./AuthParts";
import { AuthInput } from "./AuthInput";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { PasswordInput } from "./PasswordInput";
import { useFormFields } from "./useFormFields";

const linkClass =
  "inline-flex min-h-11 items-center rounded-lg px-1 font-semibold text-primary underline underline-offset-4 hover:text-primary-strong";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const { notice, show, ref } = useNotice();
  const { values, field, checkAll } = useFormFields({ email: "", password: "" }, (v) => ({
    email: validateEmail(v.email),
    password: validateCurrentPassword(v.password),
  }));

  const handleResult = (result: AuthResult, action: "login" | "google") => {
    if (result.ok) router.push(result.redirectTo);
    else show(failureNotice(result.reason, action));
  };

  const registerHref =
    redirectTo === DEFAULT_AFTER_LOGIN
      ? "/register"
      : `/register?next=${encodeURIComponent(redirectTo)}`;

  return (
    <div>
      <FormNotice ref={ref} notice={notice} />

      <GoogleSignInButton
        redirectTo={redirectTo}
        onResult={(result) => handleResult(result, "google")}
      />
      <AuthDivider>or log in with email</AuthDivider>

      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={async (event) => {
          event.preventDefault();
          show(null);
          if (!checkAll(event)) return;
          setPending(true);
          try {
            const result = await signInWithEmail({
              email: values.email.trim(),
              password: values.password,
              redirectTo,
            });
            handleResult(result, "login");
          } catch {
            show(failureNotice("network", "login"));
          } finally {
            setPending(false);
          }
        }}
      >
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
        <div>
          <PasswordInput {...field("password")} label="Password" autoComplete="current-password" />
          <p className="mt-2 text-right text-lg">
            <Link href="/forgot-password" className={linkClass}>
              Forgot your password?
            </Link>
          </p>
        </div>

        <SubmitButton pending={pending} pendingLabel="Logging in…">
          Log In
        </SubmitButton>
      </form>

      <p className="mt-8 text-center text-lg text-ink">
        Don&apos;t have an account?{" "}
        <Link href={registerHref} className={linkClass}>
          Create Account
        </Link>
      </p>
    </div>
  );
}
