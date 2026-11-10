import { Award, CalendarCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { certificateHref } from "@/lib/certificates/links";
import { formatCertificateDate } from "@/lib/certificates/format";
import type { Certificate } from "@/types/student";
import { CertificateDownloadButton } from "./CertificateDownloadButton";

/** One earned certificate in "My Certificates". */
export function CertificateCard({ certificate }: { certificate: Certificate }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-header">
      <div className="flex items-start gap-4">
        <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-primary bg-[#FFFDF6] text-primary">
          <Award aria-hidden="true" className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          {certificate.isSample && (
            <p className="mb-1 inline-block rounded-full bg-accent/35 px-2.5 py-0.5 text-sm font-bold tracking-wide text-[#6b4e00]">
              SAMPLE
            </p>
          )}
          <h3 className="text-xl leading-snug font-bold text-ink">{certificate.courseTitle}</h3>
          <p className="mt-1 flex items-center gap-2 text-base text-ink-muted">
            <CalendarCheck aria-hidden="true" className="size-5 shrink-0 text-primary" />
            Completed on {formatCertificateDate(certificate.issuedAt)}
          </p>
        </div>
      </div>

      {/* Stacked, so both full-width buttons fit however narrow the card is. */}
      <div className="mt-auto flex flex-col gap-3 pt-6">
        <ButtonLink href={certificateHref(certificate.id)} size="lg" className="w-full">
          View Certificate
          <span className="sr-only">: {certificate.courseTitle}</span>
        </ButtonLink>
        <CertificateDownloadButton certificate={certificate} variant="secondary" className="w-full" />
      </div>
    </article>
  );
}
