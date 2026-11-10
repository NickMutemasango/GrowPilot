import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { getCurrentStudent, loginHref } from "@/lib/auth/session";
import { getStudentPurchases } from "@/lib/payments/service";
import { getCertificates, getDashboard } from "@/lib/student";

/*
 * Never prerendered and never cached: this page depends on who is signed
 * in, and it must be built fresh for each request so its Content Security
 * Policy can carry that request's nonce.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Dashboard",
  robots: { index: false },
};

/**
 * The signed-in student's dashboard. The session decides whose data this
 * is — never the address bar — and everything on it is read on the server.
 * With no sign-in provider configured, visitors are sent to log in.
 */
export default async function DashboardPage() {
  const student = await getCurrentStudent();
  if (!student) redirect(loginHref("/dashboard"));

  const [dashboard, purchases] = await Promise.all([
    getDashboard(student.id),
    getStudentPurchases(student.id),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 pt-8 pb-20 sm:px-6 sm:pt-10 lg:gap-14 lg:px-8">
      <DashboardContent
        student={dashboard.student}
        courses={dashboard.courses}
        certificates={getCertificates(dashboard)}
        purchases={purchases}
      />
    </div>
  );
}
