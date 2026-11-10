import type { Course } from "@/types/course";
import type { CheckoutQuote, Currency } from "@/types/payments";

/** All course prices in the course data are US dollars. */
export const CHECKOUT_CURRENCY: Currency = "USD";

/** 2900 → "$29.00" */
export function formatMoney(amountMinor: number, currency: string = CHECKOUT_CURRENCY): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amountMinor / 100);
}

/**
 * The amount to charge, worked out on the server from the course data.
 * `null` for free courses. There are no fees: add any here, never in the
 * browser, so the total shown is always the total charged.
 */
export function getCheckoutQuote(course: Course): CheckoutQuote | null {
  if (course.priceUsd === null || !(course.priceUsd > 0)) return null;
  const priceMinor = Math.round(course.priceUsd * 100);
  const fees: CheckoutQuote["fees"] = [];
  return {
    courseId: course.id,
    courseSlug: course.slug,
    currency: CHECKOUT_CURRENCY,
    priceMinor,
    fees,
    totalMinor: priceMinor + fees.reduce((sum, fee) => sum + fee.amountMinor, 0),
  };
}
