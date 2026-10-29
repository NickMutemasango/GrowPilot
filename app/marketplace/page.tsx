import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogFallback } from "@/components/catalog/CatalogControls";
import ServiceCatalog from "@/components/marketplace/ServiceCatalog";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Services Marketplace — GrowPilot",
  description:
    "Discover skilled professionals — developers, UI/UX designers and other service providers — ready to help with your next project.",
};

export default function MarketplacePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-slate-100">
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl"
        />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-sm font-semibold text-brand-700">Services Marketplace</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Find skilled professionals
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-pretty text-slate-600">
            Discover developers, UI/UX designers and other service providers ready to help bring
            your next project to life.
          </p>
        </div>
      </section>

      <section aria-label="Service categories" className="bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <Suspense fallback={<CatalogFallback />}>
            <ServiceCatalog />
          </Suspense>

          <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-slate-700">
              Professional profiles are coming soon. Create an account to be notified when they
              launch.
            </p>
            <ButtonLink href="/signup" size="md">
              Sign Up
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
