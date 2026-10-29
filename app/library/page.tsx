import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogFallback } from "@/components/catalog/CatalogControls";
import LibraryCatalog from "@/components/library/LibraryCatalog";
import { resources } from "@/lib/library";

export const metadata: Metadata = {
  title: "Library — GrowPilot",
  description: "Books, study notes and research papers across every subject, free to read and download.",
};

export default function LibraryPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-slate-100">
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-accent-100/70 blur-3xl"
        />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-sm font-semibold text-accent-700">{resources.length} resources</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Explore the digital library
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-pretty text-slate-600">
            Books, study notes and research papers to support every course — and every curiosity.
          </p>
        </div>
      </section>

      <section aria-label="Library catalog" className="bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <Suspense fallback={<CatalogFallback />}>
            <LibraryCatalog />
          </Suspense>
        </div>
      </section>
    </>
  );
}
