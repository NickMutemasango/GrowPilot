/** "2026-10-20T15:40:00Z" → "20 October 2026" (UTC, so every device shows the same date). */
export function formatCertificateDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** "Computer Basics for Beginners" → "GrowPilot-Certificate-Computer-Basics-for-Beginners-SAMPLE.pdf" */
export function certificateFileName(courseTitle: string, isSample: boolean): string {
  const name = courseTitle.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `GrowPilot-Certificate-${name}${isSample ? "-SAMPLE" : ""}.pdf`;
}

/** Plain-language line printed on every certificate. */
export const CERTIFICATE_DISCLAIMER =
  "Confirms completion of an online course from GrowPilot Academy. It is not an accredited qualification.";
