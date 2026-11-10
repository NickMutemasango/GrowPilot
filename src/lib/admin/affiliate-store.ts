import type { AdminAffiliate, AffiliateCounts, AffiliateFilters } from "@/types/admin-affiliates";

/*
 * Where affiliates are read for administrators.
 *
 * NO DATABASE IS CONFIGURED, so `getAffiliateStore` returns null and the
 * Affiliates page says so on the live site. When affiliates live in a
 * database, implement this against it:
 *
 *  - `listAffiliates` searches, filters and pages on the server, so the
 *    browser never receives every affiliate.
 *  - Join the affiliate record (src/types/rewards.ts) to its commissions
 *    and work the earnings out there, at the stored rate on each
 *    commission — never at today's rate, or old commissions would change
 *    whenever the policy does.
 *  - Count only commissions that actually earned: a reversed one is not
 *    a successful sale.
 *  - Return the least that does the job: a name, an email address, a
 *    code, a count and an amount. NEVER bank details, payout accounts or
 *    addresses.
 *  - Keep this store read-only. Approving, suspending and paying an
 *    affiliate are separate steps with their own rules and audit log.
 */
export type AffiliateStore = {
  listAffiliates(
    filters: AffiliateFilters,
    page: number,
    pageSize: number,
  ): Promise<{ affiliates: AdminAffiliate[]; total: number }>;
  /** Counts for the summary cards, worked out by the database. */
  summary(): Promise<AffiliateCounts>;
};

export function getAffiliateStore(): AffiliateStore | null {
  return null;
}
