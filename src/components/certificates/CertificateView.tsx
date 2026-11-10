import { ArrowLeft, Info, SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { formatCertificateDate } from "@/lib/certificates/format";
import type { Certificate } from "@/types/student";
import { CertificateDownloadButton } from "./CertificateDownloadButton";
import { CertificatePreview } from "./CertificatePreview";

type CertificateViewProps = {
  /** The certificate, read on the server, or null when there is none to show. */
  certificate: Certificate | null;
};

/** A certificate page: the certificate, its details in plain text, and the PDF download. */
export function CertificateView({ certificate }: CertificateViewProps) {
  const back = (
    <ButtonLink href="/dashboard#my-certificates" variant="secondary">
      <ArrowLeft aria-hidden="true" className="size-5" />
      Back to My Dashboard
    </ButtonLink>
  );

  if (certificate === null) {
    return (
      <section className="mx-auto max-w-2xl py-14 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
          <SearchX aria-hidden="true" className="size-10" />
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink">Certificate not found</h1>
        <p className="mt-4 text-xl leading-relaxed text-ink-muted">
          We couldn&apos;t find this certificate. Certificates appear in your dashboard once you have
          completed every lesson in a course.
        </p>
        <div className="mt-8 flex justify-center">{back}</div>
      </section>
    );
  }

  const details = [
    { label: "Awarded to", value: certificate.studentName },
    { label: "Course", value: certificate.courseTitle },
    { label: "Date of completion", value: formatCertificateDate(certificate.issuedAt) },
    { label: "Certificate ID", value: certificate.id },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>{back}</div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Your Certificate</h1>
        <p className="mt-2 text-xl text-ink-muted">{certificate.courseTitle}</p>
      </div>

      {certificate.isSample && (
        <p className="flex items-start gap-3 rounded-2xl border-2 border-accent bg-accent/15 p-4 text-lg text-ink">
          <Info aria-hidden="true" className="mt-1 size-6 shrink-0 text-[#6b4e00]" />
          <span>
            <strong className="font-semibold">This is a sample certificate.</strong> Progress in this
            preview is not saved to an account or checked by GrowPilot Academy, so it is marked
            SAMPLE and is not a real award.
          </span>
        </p>
      )}

      <CertificatePreview certificate={certificate} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section aria-labelledby="details-heading" className="rounded-2xl border border-line bg-surface p-6">
          <h2 id="details-heading" className="text-2xl font-bold text-ink">
            Certificate Details
          </h2>
          <dl className="mt-4 divide-y divide-line">
            {details.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-6">
                <dt className="text-lg text-ink-muted">{label}</dt>
                <dd className="text-lg font-semibold break-all text-ink sm:text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="flex flex-col gap-3">
          <CertificateDownloadButton certificate={certificate} />
          <p className="text-base text-ink-muted">
            The PDF is A4 landscape, ready to print or share.
          </p>
        </div>
      </div>
    </div>
  );
}
