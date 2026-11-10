import type { Metadata } from "next";
import { DatabaseZap } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { requireAdmin } from "@/lib/admin/service";

export const metadata: Metadata = { title: "Payments" };

/** /admin/payments: administrators only, checked on the server (and again by the admin layout). */
export default async function AdminPaymentsPage() {
  await requireAdmin("/admin/payments");

  /*
   * There is nothing to show: no payment provider and no database are
   * connected. src/lib/admin/payment-store.ts documents the queries to
   * write when they are, and `getPaymentStore()` returns null until then.
   *
   * The screen itself is still here: PaymentManagement in
   * src/components/admin/payments, with its filters, transactions table
   * and refund dialog. Pass it the store's transactions and it works.
   */
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Payment Management</h1>
      <p className="text-lg text-ink-muted">
        View and monitor course payment transactions across GrowPilot Academy.
      </p>
      <AdminEmptyState icon={DatabaseZap} title="Payments aren't connected yet">
        Transactions will appear here once a payment provider and the database are set up.
      </AdminEmptyState>
    </div>
  );
}
