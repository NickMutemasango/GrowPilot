"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import {
  PasswordField,
  PreviewNotice,
  TextField,
  emailPattern,
  focusFirstInvalid,
} from "@/components/auth/FormFields";
import GoogleButton from "@/components/auth/GoogleButton";
import { buttonClasses } from "@/components/ui/Button";

type Values = { name: string; email: string; password: string };
type Errors = Partial<Record<keyof Values, string>>;

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "A letter", test: (p: string) => /[a-z]/i.test(p) },
  { label: "A number", test: (p: string) => /\d/.test(p) },
];

function validate({ name, email, password }: Values): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = "Enter your name.";
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!emailPattern.test(email.trim())) errors.email = "Enter a valid email, like name@example.com.";
  if (!password) errors.password = "Create a password.";
  else if (!passwordRules.every((rule) => rule.test(password)))
    errors.password = "Use at least 8 characters, including a letter and a number.";
  return errors;
}

function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1" aria-label="Password requirements">
      {passwordRules.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 ${met ? "text-success-600" : "text-slate-500"}`}
          >
            {met ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Circle className="size-3" aria-hidden="true" />
            )}
            {rule.label}
            <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function SignupForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", password: "" });
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
          <p className="font-semibold">Google sign-up isn&apos;t available yet</p>
          <p className="mt-1">GrowPilot accounts are coming soon, including signing up with Google.</p>
        </PreviewNotice>
      )}

      <TextField
        name="name"
        label="Full name"
        autoComplete="name"
        placeholder="Alex Morgan"
        value={values.name}
        onChange={(e) => change("name", e.target.value)}
        error={errors.name}
      />
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
        autoComplete="new-password"
        value={values.password}
        onChange={(e) => change("password", e.target.value)}
        error={errors.password}
        hint={<PasswordChecklist password={values.password} />}
      />

      {notice === "email" && (
        <PreviewNotice>
          <p className="font-semibold">Sign up isn&apos;t available yet</p>
          <p className="mt-1">
            GrowPilot accounts are coming soon. Nothing you entered was sent or saved — in the
            meantime, you can still{" "}
            <Link href="/courses" className="font-semibold underline underline-offset-2">
              browse every course
            </Link>
            .
          </p>
        </PreviewNotice>
      )}

      <button type="submit" className={buttonClasses("primary", "lg", "w-full")}>
        Create account
      </button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="rounded-md font-semibold text-brand-700 hover:text-brand-800">
          Log in
        </Link>
      </p>
    </form>
  );
}
