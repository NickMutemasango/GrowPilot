/*
 * Exporting a report (Step 12F.7).
 * Pure functions only, so the same documents are built in the browser
 * and in the tests (report-export.test.ts), and nothing here touches
 * the DOM, the network or a server.
 *
 * AN EXPORT IS A COPY OF WHAT IS ON SCREEN. It carries the same
 * figures, under the same filters, with the date range and the day it
 * was taken written at the top — so a file that outlives the screen
 * can still be read honestly months later.
 *
 * EVERY EXPORT SAYS IT IS SIMULATED. These figures come from sample
 * records; a spreadsheet that left that out could be mistaken for a
 * real statement of the business.
 */

/** The reports an administrator can take away. */
export const EXPORT_REPORTS = [
  "student-growth",
  "course-performance",
  "revenue-sales",
  "affiliate-performance",
  "referral-performance",
] as const;

export type ExportReportId = (typeof EXPORT_REPORTS)[number];

export const exportReportLabels: Record<ExportReportId, string> = {
  "student-growth": "Student Growth Report",
  "course-performance": "Course Performance Report",
  "revenue-sales": "Revenue & Sales Report",
  "affiliate-performance": "Affiliate Performance Report",
  "referral-performance": "Referral Performance Report",
};

export const EXPORT_FORMATS = ["csv", "pdf"] as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const exportFormatLabels: Record<ExportFormat, string> = {
  csv: "CSV (spreadsheet)",
  pdf: "PDF (formatted)",
};

/** One table in a report. */
export type ReportTable = {
  heading: string;
  columns: string[];
  rows: string[][];
  /** Said in place of the table when there are no rows. */
  emptyNote?: string;
};

/** A whole report, ready to be written as CSV or drawn as a PDF. */
export type ReportDocument = {
  id: ExportReportId;
  title: string;
  /** One line under the title saying what the report covers. */
  description: string;
  /** Title-block facts: the period, the filters, the day it was taken. */
  meta: [label: string, value: string][];
  /** The figures from the cards. */
  summary: [label: string, value: string][];
  tables: ReportTable[];
};

/** Said on every export, so a file can never be mistaken for a real statement. */
export const EXPORT_DISCLAIMER =
  "Simulated data from GrowPilot Academy's development preview. These figures are not a record of real students, sales or money.";

/** How a date range reads in a title block. Either end may be open. */
export function describeRange(from: string, to: string): string {
  if (!from && !to) return "The whole period";
  if (from && to) return `${from} to ${to}`;
  if (from) return `${from} onwards`;
  return `Up to ${to}`;
}

/**
 * The day an export was taken, as an ISO date.
 *
 * Read in the reader's own time zone, not UTC: east of Greenwich an
 * export taken in the morning would otherwise be stamped and named with
 * yesterday's date.
 */
export function exportDate(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * A filename that says what the file is and when it was taken, so a
 * folder of exports stays readable: growpilot-student-growth-report-2026-11-09.csv
 */
export function exportFilename(id: ExportReportId, format: ExportFormat, now: Date = new Date()): string {
  return `growpilot-${id}-report-${exportDate(now)}.${format}`;
}

/**
 * One CSV field.
 *
 * Quoted whenever it holds a comma, a quote, a line break or leading
 * or trailing spaces, with inner quotes doubled, as RFC 4180 has it. A
 * field that begins with =, +, - or @ is prefixed with a quote
 * character as well: spreadsheets treat those as formulas, and a
 * report should never execute anything when somebody opens it.
 */
export function csvField(value: string): string {
  const text = value ?? "";
  const risky = /^[=+\-@\t\r]/.test(text);
  const safe = risky ? `'${text}` : text;
  return /[",\n\r]|^\s|\s$/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** One CSV row. */
export function csvRow(values: readonly string[]): string {
  return values.map(csvField).join(",");
}

/**
 * The whole report as CSV: the title block, the summary figures, then
 * each table under its own heading, separated by blank lines so a
 * spreadsheet shows them as distinct blocks.
 *
 * Lines end with CRLF, which is what RFC 4180 asks for and what
 * Excel expects.
 */
export function toCsv(document: ReportDocument): string {
  const lines: string[] = [];

  lines.push(csvRow([document.title]));
  lines.push(csvRow([document.description]));
  for (const [label, value] of document.meta) lines.push(csvRow([label, value]));
  lines.push(csvRow([EXPORT_DISCLAIMER]));

  if (document.summary.length > 0) {
    lines.push("");
    lines.push(csvRow(["Summary"]));
    lines.push(csvRow(["Figure", "Value"]));
    for (const [label, value] of document.summary) lines.push(csvRow([label, value]));
  }

  for (const table of document.tables) {
    lines.push("");
    lines.push(csvRow([table.heading]));
    if (table.rows.length === 0) {
      lines.push(csvRow([table.emptyNote ?? "No rows for this period."]));
      continue;
    }
    lines.push(csvRow(table.columns));
    for (const row of table.rows) lines.push(csvRow(row));
  }

  return `${lines.join("\r\n")}\r\n`;
}

/**
 * True when a report has no rows at all, so the screen can say so
 * rather than hand somebody a file.
 *
 * The summary is deliberately ignored: a report whose filters match
 * nothing still has summary figures, but they are all zero, and a
 * spreadsheet of zeroes is the kind of thing that gets quoted later as
 * though it meant something. Better to say plainly that nothing
 * matches and let the filters be widened.
 */
export function isEmptyReport(document: ReportDocument): boolean {
  return document.tables.every((table) => table.rows.length === 0);
}
