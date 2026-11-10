import type { Certificate } from "@/types/student";
import { CertificateCard } from "./CertificateCard";
import { EmptyCertificatesState } from "./EmptyCertificatesState";

/** "My Certificates" on the dashboard. */
export function MyCertificates({ certificates }: { certificates: Certificate[] }) {
  return (
    <section id="my-certificates" aria-labelledby="certificates-heading" className="scroll-mt-28">
      <h2 id="certificates-heading" className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        My Certificates
      </h2>
      {certificates.length === 0 ? (
        <EmptyCertificatesState />
      ) : (
        <>
          {certificates.some((certificate) => certificate.isSample) && (
            <p className="mt-2 text-lg text-ink-muted">
              These are sample certificates for this preview. Real certificates will be issued once
              accounts and saved progress are available.
            </p>
          )}
          <ul className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {certificates.map((certificate) => (
              <li key={certificate.id}>
                <CertificateCard certificate={certificate} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
