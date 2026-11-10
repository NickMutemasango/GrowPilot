"use client";

import { useActionState } from "react";
import { CreditCard, Info, LoaderCircle, LockKeyhole } from "lucide-react";
import { startCheckoutAction } from "@/app/checkout/actions";
import { Button } from "@/components/ui/Button";
import { ActionMessage } from "./ActionMessage";

type CheckoutPaymentPanelProps = {
  courseSlug: string;
  totalLabel: string;
  options: { available: boolean; providerName: string | null; methods: string[] };
};

/**
 * How to pay, and the one "Proceed to Payment" button. Payment happens on
 * the provider's own secure page; this site never asks for card details.
 */
export function CheckoutPaymentPanel({ courseSlug, totalLabel, options }: CheckoutPaymentPanelProps) {
  const [state, action, pending] = useActionState(startCheckoutAction, { message: null });

  return (
    <section aria-labelledby="payment-heading" className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-7">
      <h2 id="payment-heading" className="text-xl font-bold text-ink">
        How You&apos;ll Pay
      </h2>

      {options.available ? (
        <>
          <p className="mt-3 text-lg text-ink">You can pay with:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {options.methods.map((method) => (
              <li
                key={method}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-line px-3 py-2 text-base font-semibold text-ink"
              >
                <CreditCard aria-hidden="true" className="size-5 text-primary" />
                {method}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-start gap-2 text-base text-ink-muted">
            <LockKeyhole aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            You&apos;ll choose your payment method on {options.providerName}&apos;s secure page. GrowPilot
            Academy never sees or stores your card details.
          </p>
        </>
      ) : (
        <p className="mt-4 flex gap-3 rounded-2xl border-2 border-accent bg-accent/15 p-4 text-base text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
          <span>
            <strong className="font-semibold">Online payment isn&apos;t available yet.</strong> We&apos;re
            still setting it up, so you can&apos;t be charged. Please check back soon.
          </span>
        </p>
      )}

      <form action={action} className="mt-6">
        <input type="hidden" name="courseSlug" value={courseSlug} />
        <Button type="submit" size="lg" className="w-full" disabled={pending || !options.available}>
          {pending ? (
            <LoaderCircle aria-hidden="true" className="size-5 motion-safe:animate-spin" />
          ) : (
            <LockKeyhole aria-hidden="true" className="size-5" />
          )}
          {pending ? "Opening secure payment…" : "Proceed to Payment"}
          <span className="sr-only">: {totalLabel}</span>
        </Button>
        <ActionMessage message={state.message} />
      </form>
    </section>
  );
}
