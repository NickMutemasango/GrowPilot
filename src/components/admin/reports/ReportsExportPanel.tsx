"use client";

import { useId, useMemo, useState } from "react";
import { CircleAlert, Download, FileDown, Info } from "lucide-react";
import { affiliateCurrencies, filterSalesByRange, isBackwardsRange, type AffiliateSaleLike } from "@/lib/admin/affiliate-reports";
import {
  affiliatePerformanceDocument,
  coursePerformanceDocument,
  referralPerformanceDocument,
  revenueSalesDocument,
  studentGrowthDocument,
} from "@/lib/admin/report-documents";
import {
  EXPORT_FORMATS,
  EXPORT_REPORTS,
  exportFilename,
  exportFormatLabels,
  exportReportLabels,
  isEmptyReport,
  toCsv,
  type ExportFormat,
  type ExportReportId,
  type ReportDocument,
} from "@/lib/admin/report-export";
import { CHECKOUT_CURRENCY, formatMoney } from "@/lib/payments/money";
import type { AdminReports } from "@/lib/admin/report-service";
import type { AdminReferral } from "@/types/admin-referrals";
import type { AffiliateStatus } from "@/types/rewards";
import { useReportFilters } from "./ReportFiltersContext";

type ReportsExportPanelProps = {
  reports: AdminReports;
  affiliateSales: AffiliateSaleLike[];
  affiliateStatusById: Record<string, AffiliateStatus>;
  activeAffiliates: number;
  commissionRate: string;
  referrals: AdminReferral[];
  months: number;
};

/**
 * "Export Report": takes a copy of what is on this page away as a
 * file.
 *
 * FRONTEND ONLY. The file is built in the browser from the figures
 * already on screen and handed straight to the download — nothing is
 * sent anywhere, and no server generates anything.
 *
 * AN EXPORT MATCHES THE SCREEN. The affiliate and referral reports
 * are built under the filters chosen in those sections (shared
 * through ReportFiltersContext), and the panel says which filters are
 * in force before anything is downloaded, so a file can never quietly
 * disagree with the page it came from.
 */
export function ReportsExportPanel({
  reports,
  affiliateSales,
  affiliateStatusById,
  activeAffiliates,
  commissionRate,
  referrals,
  months,
}: ReportsExportPanelProps) {
  const id = useId();
  const { affiliateRange, referralFilters } = useReportFilters();
  const [report, setReport] = useState<ExportReportId>("student-growth");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const document = useMemo((): ReportDocument => {
    const money = (amountMinor: number, currency: string) => formatMoney(amountMinor, currency);

    switch (report) {
      case "course-performance":
        return coursePerformanceDocument({
          publishedCourses: reports.publishedCourses,
          enrolments: reports.enrolments,
          completedEnrolments: reports.completedCourses,
          overallCompletionRate: reports.overallCompletionRate,
          courses: reports.courses,
        });
      case "revenue-sales":
        return revenueSalesDocument(reports.sales, money, { months });
      case "affiliate-performance": {
        // The same dates the affiliate section is showing, so the file matches it.
        const shown = isBackwardsRange(affiliateRange) ? [] : filterSalesByRange(affiliateSales, affiliateRange);
        return affiliatePerformanceDocument(
          {
            sales: shown,
            statusById: affiliateStatusById,
            activeAffiliates,
            rateLabel: commissionRate,
            currencies: affiliateCurrencies(shown),
          },
          affiliateRange,
          money,
        );
      }
      case "referral-performance":
        return referralPerformanceDocument(referrals, referralFilters, money, { currency: CHECKOUT_CURRENCY });
      case "student-growth":
      default:
        return studentGrowthDocument(reports.growth, { months });
    }
  }, [
    report,
    reports,
    months,
    affiliateSales,
    affiliateRange,
    affiliateStatusById,
    activeAffiliates,
    commissionRate,
    referrals,
    referralFilters,
  ]);

  const empty = isEmptyReport(document);
  const filterNote = document.meta
    .filter(([label]) => label === "Date range" || label === "Reward status" || label === "Filters")
    .map(([label, value]) => `${label}: ${value}`)
    .join(" · ");

  const save = (bytes: BlobPart, type: string, filename: string) => {
    const url = URL.createObjectURL(new Blob([bytes], { type }));
    const link = window.document.createElement("a");
    link.href = url;
    link.download = filename;
    window.document.body.append(link);
    link.click();
    link.remove();
    // Freed on the next tick: revoking immediately can cancel the download in some browsers.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportNow = async () => {
    setMessage(null);
    setError(null);
    if (empty) {
      setError("There is nothing to export under the current filters. Widen them and try again.");
      return;
    }

    setBusy(true);
    try {
      const filename = exportFilename(report, format);
      if (format === "csv") {
        // The byte-order mark keeps accented names readable when the file is opened in Excel.
        save(`﻿${toCsv(document)}`, "text/csv;charset=utf-8", filename);
      } else {
        // Loaded only when a PDF is actually asked for, so the page does not
        // carry the PDF library for everybody who never exports one.
        const { buildReportPdf } = await import("@/lib/admin/report-pdf");
        const bytes = await buildReportPdf(document);
        save(bytes as BlobPart, "application/pdf", filename);
      }
      setMessage(`${exportReportLabels[report]} downloaded as ${format.toUpperCase()} (Demo): ${filename}`);
    } catch {
      setError("The file could not be built in this browser. Try the other format.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-labelledby="export-reports-heading"
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:p-6"
    >
      <div>
        <h2 id="export-reports-heading" className="text-xl font-bold tracking-tight text-ink">
          Export Report
        </h2>
        <p className="mt-1 text-base text-ink-muted">
          Take a copy of any section away as a spreadsheet or a formatted PDF. The file is built in your browser and
          carries the report&rsquo;s title, its date range and the day you exported it.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-56 flex-1 sm:max-w-72">
          <label htmlFor={`${id}-report`} className="text-sm font-semibold text-ink">
            Report
          </label>
          <select
            id={`${id}-report`}
            value={report}
            onChange={(event) => {
              setReport(event.target.value as ExportReportId);
              setMessage(null);
              setError(null);
            }}
            className="mt-1 h-12 w-full rounded-xl border-2 border-line bg-surface px-3 text-base text-ink focus:border-primary"
          >
            {EXPORT_REPORTS.map((one) => (
              <option key={one} value={one}>
                {exportReportLabels[one]}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-44 flex-1 sm:max-w-56">
          <label htmlFor={`${id}-format`} className="text-sm font-semibold text-ink">
            Format
          </label>
          <select
            id={`${id}-format`}
            value={format}
            onChange={(event) => {
              setFormat(event.target.value as ExportFormat);
              setMessage(null);
              setError(null);
            }}
            className="mt-1 h-12 w-full rounded-xl border-2 border-line bg-surface px-3 text-base text-ink focus:border-primary"
          >
            {EXPORT_FORMATS.map((one) => (
              <option key={one} value={one}>
                {exportFormatLabels[one]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={exportNow}
          disabled={busy}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold whitespace-nowrap text-white shadow-button transition-colors duration-150 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Download aria-hidden="true" className="size-5" />
          {busy ? "Preparing..." : "Export Report"}
        </button>
      </div>

      <p className="flex items-start gap-2 text-sm text-ink-muted">
        <FileDown aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          {filterNote || "This report covers the whole period."}
          {empty && " Nothing matches, so there is nothing to export yet."}
        </span>
      </p>

      {/*
        Both messages are announced, so somebody using a screen reader
        hears the outcome: a download gives no visible feedback of its
        own.
      */}
      <div aria-live="polite" className="flex flex-col gap-2 empty:hidden">
        {message && (
          <p className="flex items-start gap-2 rounded-xl bg-secondary p-3 text-sm font-semibold text-primary">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl bg-[#FDECEA] p-3 text-sm font-semibold text-[#9A3412]">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
