"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { WHOLE_PERIOD, type DateRange } from "@/lib/admin/affiliate-reports";
import {
  NO_REFERRAL_ANALYTICS_FILTERS,
  type ReferralAnalyticsFilters,
} from "@/lib/admin/referral-analytics";

/*
 * The filters the two filtered sections share with the export panel
 * (Step 12F.7).
 *
 * An export is meant to be a copy of what is on screen, so the filters
 * have to live somewhere both the sections and the Export button can
 * see. They live here, held once, rather than being duplicated as a
 * second set of controls in the export dialog that could quietly
 * disagree with the page.
 */

type ReportFiltersValue = {
  affiliateRange: DateRange;
  setAffiliateRange: (range: DateRange) => void;
  referralFilters: ReferralAnalyticsFilters;
  setReferralFilters: (filters: ReferralAnalyticsFilters) => void;
};

const ReportFiltersContext = createContext<ReportFiltersValue | null>(null);

export function ReportFiltersProvider({ children }: { children: ReactNode }) {
  const [affiliateRange, setAffiliateRange] = useState<DateRange>(WHOLE_PERIOD);
  const [referralFilters, setReferralFilters] = useState<ReferralAnalyticsFilters>(NO_REFERRAL_ANALYTICS_FILTERS);

  const value = useMemo(
    () => ({ affiliateRange, setAffiliateRange, referralFilters, setReferralFilters }),
    [affiliateRange, referralFilters],
  );

  return <ReportFiltersContext.Provider value={value}>{children}</ReportFiltersContext.Provider>;
}

/** Throws rather than guessing: a section outside the provider would silently export the wrong thing. */
export function useReportFilters(): ReportFiltersValue {
  const value = useContext(ReportFiltersContext);
  if (!value) throw new Error("useReportFilters must be used inside a ReportFiltersProvider.");
  return value;
}
