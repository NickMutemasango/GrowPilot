import { CERTIFICATE_DISCLAIMER, formatCertificateDate } from "@/lib/certificates/format";
import type { Certificate } from "@/types/student";

const serif = { fontFamily: '"Times New Roman", Times, Georgia, serif' };

/**
 * The certificate as it looks on A4 landscape paper. Every size is a share
 * of the certificate's width (cqw), so it scales to any screen. Mirrors the
 * PDF in src/lib/certificates/pdf.ts.
 */
export function CertificatePreview({ certificate }: { certificate: Certificate }) {
  return (
    <div className="@container">
      <div
        role="group"
        aria-label={`${certificate.isSample ? "Sample certificate" : "Certificate"} for ${certificate.courseTitle}`}
        className="relative aspect-[297/210] overflow-hidden bg-[#FFFDF6] text-ink shadow-card"
      >
        {/* Frame */}
        <div aria-hidden="true" className="absolute inset-[2.6cqw] border-[1.05cqw] border-primary" />
        <div aria-hidden="true" className="absolute inset-[4.3cqw] border-[0.17cqw] border-[#C9A13B]" />
        <div aria-hidden="true" className="absolute inset-[4.9cqw] border-[0.07cqw] border-accent" />
        {["top-[4.3cqw] left-[4.3cqw]", "top-[4.3cqw] right-[4.3cqw]", "bottom-[4.3cqw] left-[4.3cqw]", "bottom-[4.3cqw] right-[4.3cqw]"].map(
          (position) => (
            <span
              key={position}
              aria-hidden="true"
              className={`absolute ${position} size-[1.6cqw] rotate-45 border-[0.1cqw] border-[#C9A13B] bg-accent ${
                position.includes("left") ? "-translate-x-1/2" : "translate-x-1/2"
              } ${position.includes("top") ? "-translate-y-1/2" : "translate-y-1/2"}`}
            />
          ),
        )}

        {certificate.isSample && (
          <>
            <p className="absolute inset-x-0 top-[0.9cqw] text-center text-[1.1cqw] font-bold tracking-[0.18em] text-[#9A3412]">
              SAMPLE CERTIFICATE · PREVIEW ONLY · NOT A REAL AWARD
            </p>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-[17cqw] font-black tracking-[0.04em] text-ink/[0.07] select-none"
              style={{ transform: "rotate(-24deg)" }}
            >
              SAMPLE
            </span>
          </>
        )}

        {/* Content */}
        <div className="absolute inset-[6cqw] flex flex-col items-center text-center">
          <p className="text-[1.35cqw] font-bold tracking-[0.3em] text-primary">GROWPILOT ACADEMY</p>

          <h2 className="mt-[2cqw] text-[3.9cqw] leading-none font-bold tracking-[0.12em]" style={serif}>
            CERTIFICATE OF COMPLETION
          </h2>
          <div aria-hidden="true" className="mt-[1.6cqw] flex items-center gap-[1.2cqw]">
            <span className="h-[0.12cqw] w-[16cqw] bg-[#C9A13B]" />
            <span className="size-[0.9cqw] rotate-45 border-[0.1cqw] border-[#C9A13B] bg-accent" />
            <span className="h-[0.12cqw] w-[16cqw] bg-[#C9A13B]" />
          </div>

          <p className="mt-[2cqw] text-[1.95cqw] text-ink-muted italic" style={serif}>
            This certificate is proudly presented to
          </p>
          <p
            className="mt-[0.6cqw] max-w-full border-b-[0.15cqw] border-accent px-[3cqw] pb-[0.6cqw] text-[5.2cqw] leading-tight font-bold break-words text-primary"
            style={serif}
          >
            {certificate.studentName}
          </p>
          <p className="mt-[1.6cqw] text-[1.95cqw] text-ink-muted italic" style={serif}>
            For successfully completing the course
          </p>
          <p className="mt-[0.6cqw] max-w-[80%] text-[2.85cqw] leading-tight font-bold">{certificate.courseTitle}</p>
          <p className="mt-[0.9cqw] text-[1.7cqw] text-ink-muted italic" style={serif}>
            Awarded by GrowPilot Academy
          </p>

          <div className="mt-auto grid w-full grid-cols-[1fr_auto_1fr] items-end gap-[3cqw] px-[6cqw]">
            <FooterItem label="Date of completion" value={formatCertificateDate(certificate.issuedAt)} />
            <Medallion />
            <FooterItem label="Certificate ID" value={certificate.id} />
          </div>
          <p className="mt-[1.4cqw] text-[1.05cqw] text-ink-muted">{CERTIFICATE_DISCLAIMER}</p>
        </div>
      </div>
    </div>
  );
}

function FooterItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t-[0.1cqw] border-[#C9A13B] pt-[0.7cqw]">
      <p className="text-[1.55cqw] font-bold break-all">{value}</p>
      <p className="text-[1.05cqw] tracking-[0.15em] text-ink-muted uppercase">{label}</p>
    </div>
  );
}

/** Decorative rosette; not the seal of any outside body. */
function Medallion() {
  return (
    <span
      aria-hidden="true"
      className="flex size-[9.5cqw] items-center justify-center rounded-full border-[0.12cqw] border-[#C9A13B] bg-accent"
    >
      <span className="flex size-[7.8cqw] items-center justify-center rounded-full bg-primary ring-[0.1cqw] ring-accent ring-inset">
        <span className="text-[2.6cqw] font-bold tracking-[0.1em] text-white">GP</span>
      </span>
    </span>
  );
}
