import {
  degrees,
  LineCapStyle,
  PDFDocument,
  rgb,
  setCharacterSpacing,
  StandardFonts,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import type { Certificate } from "@/types/student";
import { CERTIFICATE_DISCLAIMER, formatCertificateDate } from "./format";

/*
 * Builds the A4 landscape certificate PDF with pdf-lib (vector text and
 * shapes, so it prints sharply). It mirrors CertificatePreview.
 *
 * In this preview it runs in the browser and every certificate is a SAMPLE
 * with a watermark. For real certificates, run it on the server, only for a
 * certificate record that the server issued after checking the student's
 * stored progress.
 */

const W = 841.89; // A4 landscape, in points
const H = 595.28;

const hex = (value: string): RGB =>
  rgb(
    parseInt(value.slice(1, 3), 16) / 255,
    parseInt(value.slice(3, 5), 16) / 255,
    parseInt(value.slice(5, 7), 16) / 255,
  );

const colors = {
  green: hex("#176B52"),
  greenDark: hex("#0E4433"),
  sage: hex("#E8F3EC"),
  gold: hex("#F4C95D"),
  goldDeep: hex("#C9A13B"),
  ink: hex("#1F2937"),
  muted: hex("#4B5563"),
  ivory: hex("#FFFDF6"),
  white: rgb(1, 1, 1),
};

const LEAF_STEM = "M12 31.5c4.5-1 8.6-4.2 11.4-8.6 1.9-3 3.1-6.4 3.6-9.9";
const LEAF = "M23.4 22.9c-3.6.4-6.6-1.2-8-4.4 3.7-.9 6.9.5 8 4.4Z";
const ARROW = "M27 13l5.5 2.2M27 13l-2.6 5.3";
const ROUNDED_SQUARE = "M12 0H32A12 12 0 0 1 44 12V32A12 12 0 0 1 32 44H12A12 12 0 0 1 0 32V12A12 12 0 0 1 12 0Z";

export async function buildCertificatePdf(certificate: Certificate): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Certificate of Completion: ${certificate.courseTitle}${certificate.isSample ? " (SAMPLE)" : ""}`);
  pdf.setAuthor("GrowPilot Academy");
  pdf.setSubject(CERTIFICATE_DISCLAIMER);
  pdf.setCreator("GrowPilot Academy");

  const page = pdf.addPage([W, H]);
  const fonts = {
    serifBold: await pdf.embedFont(StandardFonts.TimesRomanBold),
    serifItalic: await pdf.embedFont(StandardFonts.TimesRomanItalic),
    sans: await pdf.embedFont(StandardFonts.Helvetica),
    sansBold: await pdf.embedFont(StandardFonts.HelveticaBold),
  };

  // Background and frame
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: colors.ivory });
  page.drawRectangle({ x: 22, y: 22, width: W - 44, height: H - 44, borderColor: colors.green, borderWidth: 9 });
  page.drawRectangle({ x: 36, y: 36, width: W - 72, height: H - 72, borderColor: colors.goldDeep, borderWidth: 1.4 });
  page.drawRectangle({ x: 41, y: 41, width: W - 82, height: H - 82, borderColor: colors.gold, borderWidth: 0.6 });
  for (const [x, y] of [[36, 36], [W - 36, 36], [36, H - 36], [W - 36, H - 36]]) {
    drawDiamond(page, x, y, 7, colors.gold, colors.goldDeep);
  }

  if (certificate.isSample) drawWatermark(page, fonts.sansBold);

  // Brand
  drawLogo(page, W / 2 - 17, H - 64, 34 / 44);
  centered(page, "GROWPILOT ACADEMY", fonts.sansBold, 11, H - 118, colors.green, 3);

  // Title
  centered(page, "CERTIFICATE OF COMPLETION", fonts.serifBold, 32, H - 166, colors.ink, 3.5);
  page.drawLine({ start: { x: W / 2 - 150, y: H - 186 }, end: { x: W / 2 - 14, y: H - 186 }, thickness: 1, color: colors.goldDeep });
  page.drawLine({ start: { x: W / 2 + 14, y: H - 186 }, end: { x: W / 2 + 150, y: H - 186 }, thickness: 1, color: colors.goldDeep });
  drawDiamond(page, W / 2, H - 186, 5, colors.gold, colors.goldDeep);

  // Recipient and course
  centered(page, "This certificate is proudly presented to", fonts.serifItalic, 16, H - 222, colors.muted);
  const nameSize = fitSize(certificate.studentName, fonts.serifBold, 44, 26, W - 220);
  centered(page, certificate.studentName, fonts.serifBold, nameSize, H - 272, colors.green);
  const underline = Math.max(200, textWidth(certificate.studentName, fonts.serifBold, nameSize) / 2 + 24);
  page.drawLine({ start: { x: W / 2 - underline, y: H - 286 }, end: { x: W / 2 + underline, y: H - 286 }, thickness: 1.2, color: colors.gold });
  centered(page, "For successfully completing the course", fonts.serifItalic, 16, H - 318, colors.muted);
  const courseSize = fitSize(certificate.courseTitle, fonts.sansBold, 24, 15, W - 220);
  centered(page, certificate.courseTitle, fonts.sansBold, courseSize, H - 352, colors.ink);
  centered(page, "Awarded by GrowPilot Academy", fonts.serifItalic, 14, H - 380, colors.muted);

  // Footer: date, medallion, certificate ID
  const footerY = 118;
  labelled(page, fonts, "DATE OF COMPLETION", formatCertificateDate(certificate.issuedAt), 190, footerY);
  labelled(page, fonts, "CERTIFICATE ID", certificate.id, W - 190, footerY);
  drawMedallion(page, W / 2, footerY + 8);

  centered(page, CERTIFICATE_DISCLAIMER, fonts.sans, 8.5, 56, colors.muted);

  return pdf.save();
}

function textWidth(text: string, font: PDFFont, size: number, spacing = 0) {
  return font.widthOfTextAtSize(text, size) + spacing * Math.max(0, text.length - 1);
}

/** Largest size from `max` down to `min` that fits `maxWidth`. */
function fitSize(text: string, font: PDFFont, max: number, min: number, maxWidth: number) {
  let size = max;
  while (size > min && textWidth(text, font, size) > maxWidth) size -= 1;
  return size;
}

function centered(page: PDFPage, text: string, font: PDFFont, size: number, y: number, color: RGB, spacing = 0, centerX = W / 2) {
  const x = centerX - textWidth(text, font, size, spacing) / 2;
  if (spacing) page.pushOperators(setCharacterSpacing(spacing));
  page.drawText(text, { x, y, size, font, color });
  if (spacing) page.pushOperators(setCharacterSpacing(0));
}

function labelled(page: PDFPage, fonts: { sans: PDFFont; sansBold: PDFFont }, label: string, value: string, centerX: number, y: number) {
  page.drawLine({ start: { x: centerX - 105, y: y + 22 }, end: { x: centerX + 105, y: y + 22 }, thickness: 0.8, color: colors.goldDeep });
  centered(page, value, fonts.sansBold, 13, y, colors.ink, 0, centerX);
  centered(page, label, fonts.sans, 8.5, y - 18, colors.muted, 1.5, centerX);
}

function drawDiamond(page: PDFPage, x: number, y: number, r: number, fill: RGB, border: RGB) {
  page.drawSvgPath(`M0 ${-r}L${r} 0L0 ${r}L${-r} 0Z`, { x, y, color: fill, borderColor: border, borderWidth: 0.8 });
}

function drawLogo(page: PDFPage, x: number, top: number, scale: number) {
  page.drawSvgPath(ROUNDED_SQUARE, { x, y: top, scale, color: colors.green });
  page.drawSvgPath(LEAF_STEM, { x, y: top, scale, borderColor: colors.white, borderWidth: 2.75, borderLineCap: LineCapStyle.Round });
  page.drawSvgPath(LEAF, { x, y: top, scale, color: colors.white });
  page.drawSvgPath(ARROW, { x, y: top, scale, borderColor: colors.gold, borderWidth: 2.75, borderLineCap: LineCapStyle.Round });
}

/** A decorative rosette with the logo; not a seal of any outside body. */
function drawMedallion(page: PDFPage, cx: number, cy: number) {
  page.drawCircle({ x: cx, y: cy, size: 40, color: colors.gold, borderColor: colors.goldDeep, borderWidth: 1 });
  page.drawCircle({ x: cx, y: cy, size: 33, color: colors.green });
  page.drawCircle({ x: cx, y: cy, size: 29, borderColor: colors.gold, borderWidth: 0.8 });
  const scale = 54 / 44;
  const x = cx - 22 * scale;
  const top = cy + 22 * scale;
  page.drawSvgPath(LEAF_STEM, { x, y: top, scale, borderColor: colors.white, borderWidth: 2.75, borderLineCap: LineCapStyle.Round });
  page.drawSvgPath(LEAF, { x, y: top, scale, color: colors.white });
  page.drawSvgPath(ARROW, { x, y: top, scale, borderColor: colors.gold, borderWidth: 2.75, borderLineCap: LineCapStyle.Round });
}

function drawWatermark(page: PDFPage, font: PDFFont) {
  const text = "SAMPLE";
  const size = 150;
  const angle = 24;
  const width = font.widthOfTextAtSize(text, size);
  const height = font.heightAtSize(size, { descender: false });
  const rad = (angle * Math.PI) / 180;
  // Start point that puts the middle of the word at the middle of the page.
  const x = W / 2 - (width / 2) * Math.cos(rad) + (height / 2) * Math.sin(rad);
  const y = H / 2 - (width / 2) * Math.sin(rad) - (height / 2) * Math.cos(rad);
  page.drawText(text, { x, y, size, font, color: colors.ink, opacity: 0.08, rotate: degrees(angle) });
  centered(page, "SAMPLE CERTIFICATE - PREVIEW ONLY - NOT A REAL AWARD", font, 9, H - 34, hex("#9A3412"), 1.5);
}
