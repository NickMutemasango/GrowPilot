"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { certificateFileName } from "@/lib/certificates/format";
import type { Certificate } from "@/types/student";

type CertificateDownloadButtonProps = {
  certificate: Certificate;
  variant?: "primary" | "secondary";
  className?: string;
};

/** Makes the certificate PDF in the browser and saves it. */
export function CertificateDownloadButton({ certificate, variant = "primary", className }: CertificateDownloadButtonProps) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const download = async () => {
    setBusy(true);
    setFailed(false);
    try {
      // Loaded only when needed, so the PDF library doesn't slow down the page.
      const { buildCertificatePdf } = await import("@/lib/certificates/pdf");
      const bytes = await buildCertificatePdf(certificate);
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = certificateFileName(certificate.courseTitle, certificate.isSample);
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <Button variant={variant} size="lg" className="w-full" onClick={download} disabled={busy}>
        {busy ? (
          <LoaderCircle aria-hidden="true" className="size-5 motion-safe:animate-spin" />
        ) : (
          <Download aria-hidden="true" className="size-5" />
        )}
        {busy ? "Preparing your PDF…" : "Download PDF"}
        <span className="sr-only">: certificate for {certificate.courseTitle}</span>
      </Button>
      <p role="alert" className="empty:hidden">
        {failed && (
          <span className="mt-2 block text-base text-[#9A3412]">
            We couldn&apos;t create the PDF. Please try again.
          </span>
        )}
      </p>
    </div>
  );
}
