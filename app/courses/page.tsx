import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogFallback } from "@/components/catalog/CatalogControls";
import CourseCatalog from "@/components/courses/CourseCatalog";
import { courses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Courses — GrowPilot",
  description: "Browse expert-led courses across computer science, maths, science, business, history and design.",
};

export default function CoursesPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-slate-100">
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-brand-100/70 blur-3xl"
        />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-sm font-semibold text-brand-700">{courses.length} courses</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Find your next course
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-pretty text-slate-600">
            Learn at your own pace with expert-led lessons, from first steps to advanced topics.
          </p>
        </div>
      </section>

      <section aria-label="Course catalog" className="bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <Suspense fallback={<CatalogFallback />}>
            <CourseCatalog />
          </Suspense>
        </div>
      </section>
    </>
  );
}
