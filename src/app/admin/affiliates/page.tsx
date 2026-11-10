import type { Metadata } from "next";
import { DatabaseZap } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { requireAdmin } from "@/lib/admin/service";

export const metadata: Metadata = { title: "Affiliates" };

/*
 * /admin/affiliates: administrators only, checked on the server (and again
 * by the admin layout).
 *
 * There is nothing to show: no sign-in and no database are connected, so
 * nobody can have applied. src/lib/admin/affiliate-store.ts documents the
 * queries to write when they are, and `getAffiliateStore()` returns null
 * until then.
 *
 * The screens are all still here, in src/components/admin/affiliates:
 * AffiliateManagement with its affiliates, sales, payout request and
 * referral reward sections, and the approve, reject, suspend, reactivate,
 * mark-paid, grant and revoke dialogs. Pass it the store's rows and it
 * works as before.
 */
export default async function AdminAffiliatesPage() {
  await requireAdmin("/admin/affiliates");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Affiliate Management</h1>
      <p className="text-lg text-ink-muted">View and monitor affiliates promoting GrowPilot Academy courses.</p>
      <AdminEmptyState icon={DatabaseZap} title="Affiliates aren't connected yet">
        Affiliates will appear here once sign-in and the database are set up.
      </AdminEmptyState>
    </div>
  );
}
