"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  PasswordField,
  PreviewNotice,
  TextField,
  emailPattern,
  focusFirstInvalid,
} from "@/components/auth/FormFields";
import GoogleButton from "@/components/auth/GoogleButton";
import { buttonClasses } from "@/components/ui/Button";

type Values = { email: string; password: string };
type Errors = Partial<Record<keyof Values, string>>;

function validate({ email, password }: Values): Errors {
  const errors: Errors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!emailPattern.test(email.trim())) errors.email = "Enter a valid email, like name@example.com.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export default function LoginForm() {
  const [values, setValues] = useState<Values>({ email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState<"email" | "google" | null>(null);

  function change(field: keyof Values, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    setNotice(null);
    // Only re-check as people type once they've tried to submit.
    if (submitted) setErrors(validate(next));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstInvalid(e.currentTarget);
      return;
    }
    // No accounts exist yet: nothing is sent anywhere.
    setNotice("email");
    setValues((v) => ({ ...v, password: "" }));
    setSubmitted(false);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-5">
      <GoogleButton onClick={() => setNotice("google")} />
      {notice === "google" && (
        <PreviewNotice>
          <p className="font-semibold">Google sign-in isn&apos;t available yet</p>
          <p className="mt-1">GrowPilot accounts are coming soon, including logging in with Google.</p>
        </PreviewNotice>
      )}

      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(e) => change("email", e.target.value)}
        error={errors.email}
      />
      <PasswordField
        name="password"
        label="Password"
        autoComplete="current-password"
        value={values.password}
        onChange={(e) => change("password", e.target.value)}
        error={errors.password}
      />

      {notice === "email" && (
        <PreviewNotice>
          <p className="font-semibold">Log in isn&apos;t available yet</p>
          <p className="mt-1">
            GrowPilot accounts are coming soon. Nothing you entered was sent or saved.
          </p>
        </PreviewNotice>
      )}

      <button type="submit" className={buttonClasses("primary", "lg", "w-full")}>
        Log in
      </button>

      <p className="text-center text-sm text-slate-600">
        New to GrowPilot?{" "}
        <Link href="/signup" className="rounded-md font-semibold text-brand-700 hover:text-brand-800">
          Create an account
        </Link>
      </p>
    </form>
  );
}
