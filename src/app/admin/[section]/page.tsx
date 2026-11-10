import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Hammer } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { adminSections } from "@/components/admin/sections";
import { ButtonLink } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin/service";

type Props = { params: Promise<{ section: string }> };

function findSection(slug: string) {
  return adminSections.find((section) => section.slug === slug && slug !== "");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: findSection((await params).section)?.label ?? "Not found" };
}

/** Sections that aren't built yet: a clear "Coming Soon", never a broken page. */
export default async function AdminSectionPage({ params }: Props) {
  const { section: slug } = await params;
  await requireAdmin(`/admin/${slug}`);
  const section = findSection(slug);
  if (!section) notFound();

  const Icon = section.icon;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-ink">{section.label}</h1>
      </header>
      <AdminEmptyState icon={Hammer} title="Coming Soon">
        <p>{section.description}</p>
        <p className="mt-1">This section will be added in a later step.</p>
      </AdminEmptyState>
      <div>
        <ButtonLink href="/admin" variant="secondary">
          <ArrowLeft aria-hidden="true" className="size-5" />
          Back to Overview
        </ButtonLink>
      </div>
    </div>
  );
}
