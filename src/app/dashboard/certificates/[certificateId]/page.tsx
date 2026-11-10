import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CertificateView } from "@/components/certificates/CertificateView";
import { getCurrentStudent, loginHref } from "@/lib/auth/session";
import { getStudentStore } from "@/lib/student-store";

/*
 * Never prerendered and never cached: this page depends on who is signed
 * in, and it must be built fresh for each request so its Content Security
 * Policy can carry that request's nonce.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Certificate",
  robots: { index: false },
};

type Props = { params: Promise<{ certificateId: string }> };

/**
 * One certificate, looked up on the server. The page shows "not found"
 * rather than anything about a certificate that does not exist, so an
 * address cannot be guessed to learn whether somebody completed a course.
 */
export default async function CertificatePage({ params }: Props) {
  const certificateId = decodeURIComponent((await params).certificateId);
  const student = await getCurrentStudent();
  if (!student) redirect(loginHref(`/dashboard/certificates/${encodeURIComponent(certificateId)}`));

  const certificate = (await getStudentStore()?.findCertificate(certificateId)) ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6 sm:pt-10 lg:px-8">
      <CertificateView certificate={certificate} />
    </div>
  );
}
