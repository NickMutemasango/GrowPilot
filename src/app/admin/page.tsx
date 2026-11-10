import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { getAdminOverview, requireAdmin } from "@/lib/admin/service";

export const metadata: Metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  await requireAdmin("/admin");
  const data = await getAdminOverview();
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return <AdminOverview data={data} today={today} />;
}
