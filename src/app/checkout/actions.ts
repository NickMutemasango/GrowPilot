"use server";

import { redirect } from "next/navigation";
import { getCurrentStudent, loginHref } from "@/lib/auth/session";
import { getCourseBySlug } from "@/lib/courses";
import { enrolInFreeCourse, prepareOrder } from "@/lib/payments/enrolment";
import { getCheckoutQuote } from "@/lib/payments/money";
import { getPaymentProvider } from "@/lib/payments/provider";
import { getStartLearningHref } from "@/lib/payments/service";
import { attributeOrder } from "@/lib/rewards/service";
import { getPaymentStore } from "@/lib/payments/store";
import { getSiteUrl } from "@/lib/site";

/*
 * Enrol and pay. The form sends only the course slug: the student comes
 * from the server session and the price from the course data, so neither
 * can be changed in the browser.
 */

export type ActionState = { message: string | null };

export async function enrolInFreeCourseAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const course = await getCourseBySlug(String(formData.get("courseSlug") ?? ""));
  if (!course) return { message: "We couldn't find that course. Please go back and try again." };
  if (course.priceUsd !== null) redirect(`/checkout/${course.slug}`);

  const student = await getCurrentStudent();
  if (!student) redirect(loginHref(`/courses/${course.slug}#enrol`));

  const store = getPaymentStore();
  if (!store) {
    return { message: "Enrolment isn't open yet. You have not been signed up for anything. Please check back soon." };
  }

  await enrolInFreeCourse(store, student.id, course);
  redirect(`/enrolled/${course.slug}`);
}

export async function startCheckoutAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const course = await getCourseBySlug(String(formData.get("courseSlug") ?? ""));
  if (!course) return { message: "We couldn't find that course. Please go back and try again." };
  const quote = getCheckoutQuote(course);
  if (!quote) redirect(`/courses/${course.slug}#enrol`);

  const student = await getCurrentStudent();
  if (!student) redirect(loginHref(`/checkout/${course.slug}`));

  const provider = getPaymentProvider();
  const store = getPaymentStore();
  if (!provider || !store) {
    return { message: "Online payment isn't available yet, so we can't take payments. You have not been charged." };
  }

  const prepared = await prepareOrder(store, student.id, quote);
  if (prepared.kind === "already-enrolled") redirect(await getStartLearningHref(course));
  // Link the order to an affiliate if the student arrived through an affiliate link.
  await attributeOrder(prepared.order);

  const origin = await getSiteUrl();
  const status = `${origin}/checkout/${course.slug}/status?ref=${encodeURIComponent(prepared.order.reference)}`;
  let redirectUrl: string;
  try {
    const payment = await provider.createPayment({
      order: prepared.order,
      courseTitle: course.title,
      returnUrl: status,
      cancelUrl: `${status}&cancelled=1`,
    });
    if (payment.providerReference) {
      await store.updateOrder(prepared.order.reference, { providerReference: payment.providerReference });
    }
    redirectUrl = payment.redirectUrl;
  } catch {
    return {
      message: "We couldn't reach the payment service. You have not been charged. Please try again in a few minutes.",
    };
  }
  redirect(redirectUrl);
}
