import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogFallback } from "@/components/catalog/CatalogControls";
import SiteSearch from "@/components/search/SiteSearch";

export const metadata: Metadata = {
  title: "Search — GrowPilot",
  description: "Search GrowPilot's courses, digital library and services marketplace in one place.",
  robots: { index: false },
};

export default function SearchPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-slate-100">
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl"
        />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-sm font-semibold text-brand-700">Search</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Find what you need
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-pretty text-slate-600">
            Search courses, the digital library and the services marketplace at once.
          </p>
        </div>
      </section>

      <section aria-label="Search results" className="bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <Suspense fallback={<CatalogFallback />}>
            <SiteSearch />
          </Suspense>
        </div>
      </section>
    </>
  );
}
