import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronLeft, Download, FileText, Tag } from "lucide-react";
import DetailFallback from "@/components/catalog/DetailFallback";
import CourseCard from "@/components/courses/CourseCard";
import ResourceCard, { kindStyle } from "@/components/library/ResourceCard";
import { ButtonLink } from "@/components/ui/Button";
import { courses } from "@/lib/courses";
import { getRelatedResources, getResource, resources } from "@/lib/library";
import { subjectStyle } from "@/lib/subjects";

export function generateStaticParams() {
  return resources.map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({ params }: PageProps<"/library/[slug]">): Promise<Metadata> {
  const resource = getResource((await params).slug);
  if (!resource) return {};
  return { title: `${resource.title} — GrowPilot Library`, description: resource.description };
}

const number = new Intl.NumberFormat("en");

// The route's shared shell can't depend on the URL, so the slug is read inside Suspense.
export default function ResourcePage({ params }: PageProps<"/library/[slug]">) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <ResourceDetail params={params} />
    </Suspense>
  );
}

async function ResourceDetail({ params }: Pick<PageProps<"/library/[slug]">, "params">) {
  const resource = getResource((await params).slug);
  if (!resource) notFound();

  const s = subjectStyle[resource.subject];
  const SubjectIcon = s.icon;
  const kind = kindStyle[resource.kind];
  const KindIcon = kind.icon;
  const related = getRelatedResources(resource);
  const relatedCourses = courses.filter((c) => c.subject === resource.subject).slice(0, 3);
  const contentsLabel = resource.kind === "Book" ? "Chapters" : "Sections";

  return (
    <>
      <div className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -z-10 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-accent-100/70 blur-3xl"
        />

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
          <div className="min-w-0">
            <nav aria-label="Breadcrumb">
              <Link
                href="/library"
                className="inline-flex items-center gap-1 rounded-md text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Library
              </Link>
            </nav>

            <header className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/library?subject=${encodeURIComponent(resource.subject)}`}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 uppercase ring-1 ring-slate-200 ring-inset hover:text-brand-700 hover:ring-brand-200"
                >
                  {resource.subject}
                </Link>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${kind.badge}`}
                >
                  <KindIcon className="size-3.5" aria-hidden="true" />
                  {resource.kind}
                </span>
              </div>
              <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance text-slate-900 sm:text-4xl lg:text-5xl">
                {resource.title}
              </h1>
              <p className="mt-3 text-slate-600">
                by <span className="font-semibold text-slate-900">{resource.author}</span>
              </p>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-slate-600">
                {resource.description}
              </p>

              <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Length</dt>
                  <FileText className="size-4 text-slate-400" aria-hidden="true" />
                  <dd>{resource.pages} pages</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Published</dt>
                  <Calendar className="size-4 text-slate-400" aria-hidden="true" />
                  <dd>Published {resource.year}</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Downloads</dt>
                  <Download className="size-4 text-slate-400" aria-hidden="true" />
                  <dd>{number.format(resource.downloads)} downloads</dd>
                </div>
              </dl>
            </header>

            <section aria-labelledby="contents-heading" className="mt-12">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2
                  id="contents-heading"
                  className="font-display text-2xl font-bold tracking-tight text-slate-900"
                >
                  What&apos;s inside
                </h2>
                <p className="text-sm text-slate-500">
                  {resource.contents.length} {contentsLabel.toLowerCase()} · {resource.pages} pages
                </p>
              </div>
              <ol
                aria-label={contentsLabel}
                className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
              >
                {resource.contents.map((item, i) => (
                  <li key={item} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-50 font-display text-sm font-bold text-accent-700">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 font-medium text-slate-900">{item}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Desktop read card; small screens get the sticky bar below instead. */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
              <div className={`grid h-52 place-items-center bg-linear-to-br ${s.tile}`}>
                <div className="grid h-36 w-28 place-items-center rounded-r-lg rounded-l-sm border-l-[6px] border-black/10 bg-white/90 shadow-lg">
                  <SubjectIcon className={`size-10 ${s.iconColor}`} aria-hidden="true" />
                </div>
              </div>
              <div className="p-6">
                <ButtonLink href="/signup" size="lg" className="w-full">
                  Read now
                </ButtonLink>
                <p className="mt-3 text-center text-xs text-slate-500">
                  Create a free account to read and download.
                </p>
                <h2 className="mt-6 text-sm font-semibold text-slate-900">Details</h2>
                <dl className="mt-3 space-y-2.5 text-sm">
                  {[
                    { icon: Tag, label: "Type", value: resource.kind },
                    { icon: FileText, label: "Format", value: `${resource.format} · ${resource.pages} pages` },
                    { icon: Calendar, label: "Published", value: resource.year },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <Icon className="size-4 text-slate-400" aria-hidden="true" />
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="ml-auto font-medium text-slate-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* On small screens the read action stays reachable at the bottom of the viewport. */}
      <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="min-w-0 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{resource.format}</span> ·{" "}
            {resource.pages} pages
          </p>
          <ButtonLink href="/signup" className="shrink-0">
            Read now
          </ButtonLink>
        </div>
      </div>

      {relatedCourses.length > 0 && (
        <section aria-labelledby="courses-heading" className="border-t border-slate-100">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <h2
              id="courses-heading"
              className="border-l-4 border-brand-500 pl-3 font-display text-2xl font-bold tracking-tight text-slate-900"
            >
              Learn it as a course
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCourses.map((c) => (
                <li key={c.slug}>
                  <CourseCard course={c} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <h2
              id="related-heading"
              className="border-l-4 border-accent-500 pl-3 font-display text-2xl font-bold tracking-tight text-slate-900"
            >
              More from the library
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <ResourceCard resource={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
