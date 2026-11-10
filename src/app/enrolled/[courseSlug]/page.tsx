import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EnrolmentConfirmation } from "@/components/checkout/EnrolmentConfirmation";
import { getCurrentStudent, loginHref } from "@/lib/auth/session";
import { getCourseBySlug } from "@/lib/courses";
import { getCourseAccess } from "@/lib/payments/service";

/*
 * Never prerendered and never cached: this page depends on who is signed
 * in, and it must be built fresh for each request so its Content Security
 * Policy can carry that request's nonce.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "You're Enrolled", robots: { index: false } };

type Props = {
  params: Promise<{ courseSlug: string }>;
};

/**
 * Shown after enrolling. Only for students the server confirms are enrolled;
 * everyone else goes back to the course page. No email is sent: email isn't
 * set up yet.
 */
export default async function EnrolledPage({ params }: Props) {
  const course = await getCourseBySlug((await params).courseSlug);
  if (!course) notFound();
  const access = await getCourseAccess(course);
  if (!(await getCurrentStudent())) redirect(loginHref(`/courses/${course.slug}#enrol`));
  if (!access.enrolled) redirect(`/courses/${course.slug}#enrol`);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <EnrolmentConfirmation course={course} startHref={access.continueHref} />
    </div>
  );
}
