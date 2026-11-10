"use client";

import { useActionState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { applyAffiliateAction, type FormState } from "@/app/earn/actions";
import { AuthInput } from "@/components/auth/AuthInput";
import { ActionMessage } from "@/components/checkout/ActionMessage";
import { Button } from "@/components/ui/Button";

type AffiliateApplyFormProps = {
  defaults: { fullName: string; email: string };
};

/** "Apply to Become an Affiliate": name, email and an optional reason. */
export function AffiliateApplyForm({ defaults }: AffiliateApplyFormProps) {
  const [state, action, pending] = useActionState<FormState, FormData>(applyAffiliateAction, {
    message: null,
    errors: {},
  });

  return (
    <form action={action} noValidate className="flex flex-col gap-6">
      <AuthInput
        label="Full name"
        name="fullName"
        autoComplete="name"
        defaultValue={defaults.fullName}
        error={state.errors.fullName}
        required
      />
      <AuthInput
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={defaults.email}
        hint="We'll use this to tell you when your application is reviewed."
        error={state.errors.email}
        required
      />
      <div>
        <label htmlFor="reason" className="text-lg font-semibold text-ink">
          Why would you like to join? <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={4}
          maxLength={1000}
          className="mt-2 block w-full rounded-xl border-2 border-line bg-surface px-4 py-3 text-lg text-ink"
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-start" disabled={pending}>
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-5 motion-safe:animate-spin" />
        ) : (
          <Send aria-hidden="true" className="size-5" />
        )}
        Apply to Become an Affiliate
      </Button>
      <ActionMessage message={state.message} />
    </form>
  );
}
