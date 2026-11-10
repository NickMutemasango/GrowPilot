import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { EXPORT_DISCLAIMER, type ReportDocument } from "./report-export";

/*
 * Drawing a report as a PDF (Step 12F.7), in GrowPilot's own colours.
 *
 * A4 portrait, vector text, no images: the file stays small, the text
 * stays selectable and searchable, and nothing has to be fetched to
 * open it.
 *
 * Runs in the browser from the export panel. If reports are ever
 * generated on a server, this same function can run there unchanged —
 * it only builds bytes.
 *
 * EVERY PAGE SAYS THE FIGURES ARE SIMULATED, in the footer beside the
 * page number, because a page printed on its own must still be
 * honest about what it is.
 */

const W = 595.28; // A4 portrait, in points
const H = 841.89;
const MARGIN = 48;
const CONTENT = W - MARGIN * 2;

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
  ink: hex("#1F2937"),
  muted: hex("#4B5563"),
  line: hex("#E2E5DF"),
  canvas: hex("#FAFAF7"),
  white: rgb(1, 1, 1),
};

type Fonts = { regular: PDFFont; bold: PDFFont };

/** Cuts text to fit a column, with an ellipsis, so a long title never runs into the next one. */
function fit(text: string, font: PDFFont, size: number, width: number): string {
  if (font.widthOfTextAtSize(text, size) <= width) return text;
  let cut = text;
  while (cut.length > 1 && font.widthOfTextAtSize(`${cut}…`, size) > width) cut = cut.slice(0, -1);
  return `${cut}…`;
}

/** Wraps text onto as many lines as it needs. */
function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * pdf-lib's WinAnsi fonts cannot draw every character our copy uses —
 * a curly quote, a dash, an ellipsis — so they are replaced rather
 * than left to throw. The text reads the same.
 */
function plain(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/[^\x20-\x7E]/g, "");
}

export async function buildReportPdf(document: ReportDocument, now: Date = new Date()): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${document.title} — GrowPilot Academy (simulated)`);
  pdf.setAuthor("GrowPilot Academy");
  pdf.setSubject(EXPORT_DISCLAIMER);
  pdf.setCreator("GrowPilot Academy");
  pdf.setCreationDate(now);

  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
  };

  const pages: PDFPage[] = [];
  let page = pdf.addPage([W, H]);
  pages.push(page);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: colors.canvas });
  let y = drawHeader(page, fonts, document);

  /** Moves to a new page when the next block will not fit, and returns where to draw. */
  const room = (needed: number): number => {
    if (y - needed > MARGIN + 36) return y;
    page = pdf.addPage([W, H]);
    pages.push(page);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: colors.canvas });
    y = H - MARGIN;
    return y;
  };

  const text = (value: string, x: number, size: number, font: PDFFont, color: RGB) =>
    page.drawText(plain(value), { x, y, size, font, color });

  // The title block: what the report covers, and when it was taken.
  for (const [label, value] of document.meta) {
    room(18);
    text(`${label}:`, MARGIN, 10, fonts.bold, colors.muted);
    text(value, MARGIN + 96, 10, fonts.regular, colors.ink);
    y -= 15;
  }

  y -= 10;

  if (document.summary.length > 0) {
    room(30);
    text("Summary", MARGIN, 13, fonts.bold, colors.greenDark);
    y -= 20;

    for (const [label, value] of document.summary) {
      room(20);
      page.drawRectangle({ x: MARGIN, y: y - 5, width: CONTENT, height: 18, color: colors.white });
      text(fit(label, fonts.regular, 10, CONTENT - 160), MARGIN + 8, 10, fonts.regular, colors.ink);
      const shown = plain(value);
      page.drawText(shown, {
        x: W - MARGIN - 8 - fonts.bold.widthOfTextAtSize(shown, 10),
        y,
        size: 10,
        font: fonts.bold,
        color: colors.ink,
      });
      y -= 20;
    }
    y -= 10;
  }

  for (const table of document.tables) {
    room(50);
    text(table.heading, MARGIN, 13, fonts.bold, colors.greenDark);
    y -= 20;

    if (table.rows.length === 0) {
      room(20);
      text(table.emptyNote ?? "No rows for this period.", MARGIN, 10, fonts.regular, colors.muted);
      y -= 24;
      continue;
    }

    // Columns share the width evenly, with the first one given more room:
    // it is almost always a name, and names are the longest thing here.
    const count = table.columns.length;
    const firstWidth = count > 2 ? CONTENT * 0.26 : CONTENT * 0.5;
    const otherWidth = (CONTENT - firstWidth) / Math.max(1, count - 1);
    const xFor = (index: number) => MARGIN + (index === 0 ? 0 : firstWidth + otherWidth * (index - 1));
    const widthFor = (index: number) => (index === 0 ? firstWidth : otherWidth) - 8;

    const drawHeadRow = () => {
      page.drawRectangle({ x: MARGIN, y: y - 5, width: CONTENT, height: 18, color: colors.sage });
      table.columns.forEach((column, index) => {
        page.drawText(plain(fit(column, fonts.bold, 9, widthFor(index))), {
          x: xFor(index) + 4,
          y,
          size: 9,
          font: fonts.bold,
          color: colors.greenDark,
        });
      });
      y -= 20;
    };

    drawHeadRow();

    for (const row of table.rows) {
      const before = y;
      if (room(18) !== before) drawHeadRow(); // Repeat the headings on a new page.
      row.forEach((cell, index) => {
        page.drawText(plain(fit(cell, fonts.regular, 9, widthFor(index))), {
          x: xFor(index) + 4,
          y,
          size: 9,
          font: fonts.regular,
          color: colors.ink,
        });
      });
      page.drawLine({
        start: { x: MARGIN, y: y - 5 },
        end: { x: W - MARGIN, y: y - 5 },
        thickness: 0.5,
        color: colors.line,
      });
      y -= 18;
    }

    y -= 14;
  }

  pages.forEach((one, index) => drawFooter(one, fonts, index + 1, pages.length));

  return pdf.save();
}

/** The brand band at the top of the first page. */
function drawHeader(page: PDFPage, fonts: Fonts, document: ReportDocument): number {
  page.drawRectangle({ x: 0, y: H - 108, width: W, height: 108, color: colors.green });
  page.drawRectangle({ x: 0, y: H - 112, width: W, height: 4, color: colors.greenDark });

  page.drawText("GROWPILOT ACADEMY", {
    x: MARGIN,
    y: H - 44,
    size: 11,
    font: fonts.bold,
    color: colors.white,
    opacity: 0.85,
  });
  page.drawText(plain(document.title), {
    x: MARGIN,
    y: H - 70,
    size: 19,
    font: fonts.bold,
    color: colors.white,
  });

  const description = wrap(plain(document.description), fonts.regular, 9, CONTENT);
  description.slice(0, 2).forEach((line, index) => {
    page.drawText(line, { x: MARGIN, y: H - 88 - index * 11, size: 9, font: fonts.regular, color: colors.sage });
  });

  return H - 142;
}

/** The footer: the page number, and the reminder that none of this is real. */
function drawFooter(page: PDFPage, fonts: Fonts, index: number, total: number): void {
  page.drawLine({
    start: { x: MARGIN, y: MARGIN + 22 },
    end: { x: W - MARGIN, y: MARGIN + 22 },
    thickness: 0.5,
    color: colors.line,
  });
  page.drawText(plain(EXPORT_DISCLAIMER), {
    x: MARGIN,
    y: MARGIN + 8,
    size: 7.5,
    font: fonts.regular,
    color: colors.muted,
  });
  const label = `Page ${index} of ${total}`;
  page.drawText(label, {
    x: W - MARGIN - fonts.bold.widthOfTextAtSize(label, 7.5),
    y: MARGIN - 4,
    size: 7.5,
    font: fonts.bold,
    color: colors.muted,
  });
}
