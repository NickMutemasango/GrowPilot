import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CircleCheck } from "lucide-react";
import { CheckoutPaymentPanel } from "@/components/checkout/CheckoutPaymentPanel";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ButtonLink } from "@/components/ui/Button";
import { getCourseBySlug } from "@/lib/courses";
import { formatMoney, getCheckoutQuote } from "@/lib/payments/money";
import { getCourseAccess, getPaymentOptions } from "@/lib/payments/service";

/*
 * Never prerendered and never cached: this page depends on who is signed
 * in, and it must be built fresh for each request so its Content Security
 * Policy can carry that request's nonce.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

type Props = { params: Promise<{ courseSlug: string }> };

/** Order summary and payment for one paid course. Anyone can look; paying needs a login. */
export default async function CheckoutPage({ params }: Props) {
  const course = await getCourseBySlug((await params).courseSlug);
  if (!course) notFound();
  const quote = getCheckoutQuote(course);
  // Free courses never go through checkout.
  if (!quote) redirect(`/courses/${course.slug}#enrol`);

  const access = await getCourseAccess(course);
  const totalLabel = `${formatMoney(quote.totalMinor, quote.currency)} ${quote.currency}`;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6 sm:pt-10 lg:px-8">
      <ButtonLink href={`/courses/${course.slug}`} variant="secondary">
        <ArrowLeft aria-hidden="true" className="size-5" />
        Back to Course
      </ButtonLink>

      <h1 className="mt-8 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Complete Your Enrolment</h1>
      <p className="mt-2 text-xl text-ink-muted">You&apos;re one step away from starting your learning journey.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-8">
        <OrderSummary course={course} quote={quote} />

        {access.enrolled ? (
          <section className="rounded-3xl border-2 border-primary bg-secondary p-6 sm:p-7">
            <p className="flex items-center gap-3 text-xl font-bold text-primary-strong">
              <CircleCheck aria-hidden="true" className="size-7 shrink-0 text-primary" />
              You already have this course.
            </p>
            <p className="mt-2 text-lg text-ink">There&apos;s nothing to pay. Pick up where you left off.</p>
            <ButtonLink href={access.continueHref} size="lg" className="mt-6 w-full">
              Continue Learning
              <ArrowRight aria-hidden="true" className="size-5" />
            </ButtonLink>
          </section>
        ) : (
          <CheckoutPaymentPanel courseSlug={course.slug} totalLabel={totalLabel} options={getPaymentOptions()} />
        )}
      </div>
    </div>
  );
}
