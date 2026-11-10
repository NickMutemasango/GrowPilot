import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PaymentStatusView, type PaymentView } from "@/components/checkout/PaymentStatusView";
import { getCurrentStudent, loginHref } from "@/lib/auth/session";
import { getCourseBySlug } from "@/lib/courses";
import { formatMoney, getCheckoutQuote } from "@/lib/payments/money";
import { getStartLearningHref, getStudentOrder } from "@/lib/payments/service";

/*
 * Never prerendered and never cached: this page depends on who is signed
 * in, and it must be built fresh for each request so its Content Security
 * Policy can carry that request's nonce.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };

type Props = {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ ref?: string; cancelled?: string }>;
};

/**
 * Where the payment provider sends the student back. Arriving here proves
 * nothing: the result shown is the order's status as stored on the server
 * (updated by verified provider notifications or a server-side status check).
 */
export default async function PaymentStatusPage({ params, searchParams }: Props) {
  const { courseSlug } = await params;
  const query = await searchParams;
  const course = await getCourseBySlug(courseSlug);
  const quote = course && getCheckoutQuote(course);
  if (!course || !quote) notFound();
  const startHref = await getStartLearningHref(course);

  const reference = query.ref ?? "";
  const here = `/checkout/${course.slug}/status?ref=${encodeURIComponent(reference)}`;
  const student = await getCurrentStudent();
  if (!student) redirect(loginHref(here));

  const order = reference ? await getStudentOrder(reference, student.id, course.slug) : null;
  let view: PaymentView = order ? order.status === "refunded" ? "not-found" : order.status : "not-found";
  // Leaving the provider's page isn't a payment result, so it's only shown while nothing was paid.
  if (order?.status === "pending" && query.cancelled === "1") view = "cancelled";

  return (
    <Frame>
      <PaymentStatusView
        view={view}
        course={course}
        startHref={startHref}
        amountLabel={order ? `${formatMoney(order.amountMinor, order.currency)} ${order.currency}` : undefined}
        reference={order?.reference}
        refreshHref={here}
      />
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">{children}</div>;
}
