import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/service";
import { SIGN_OUT_HREF } from "@/lib/auth/session";

// Check who is asking on every request; never build admin pages ahead of time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin | GrowPilot Academy" },
  robots: { index: false, follow: false },
};

/** AdminLayout: only administrators get past this, checked on the server. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin } = await requireAdmin("/admin");

  return (
    <AdminShell adminName={admin.name} firstName={admin.firstName} signOutHref={SIGN_OUT_HREF}>
      {children}
    </AdminShell>
  );
}
