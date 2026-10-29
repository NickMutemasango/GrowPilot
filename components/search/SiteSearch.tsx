"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { CatalogSearch } from "@/components/catalog/CatalogControls";
import { matchesQuery, useUrlFilters } from "@/components/catalog/useUrlFilters";
import CourseCard from "@/components/courses/CourseCard";
import ResourceCard from "@/components/library/ResourceCard";
import ServiceCard from "@/components/marketplace/ServiceCard";
import { courses } from "@/lib/courses";
import { resources } from "@/lib/library";
import { services } from "@/lib/marketplace";

const popular = ["Python", "Design", "Calculus", "Marketing", "React", "SEO"];

/** Each section shows a preview; the full list lives on that catalog's own page. */
const PREVIEW = 6;

/** One search across courses, the library and the marketplace, with the query mirrored in the URL (?q=). */
export default function SiteSearch() {
  const { query, setQuery } = useUrlFilters();
  const q = query.trim();

  const courseHits = q
    ? courses.filter((c) => matchesQuery(q, [c.title, c.subject, c.instructor, c.description]))
    : [];
  const resourceHits = q
    ? resources.filter((r) =>
        matchesQuery(q, [r.title, r.subject, r.kind, r.author, r.description]),
      )
    : [];
  const serviceHits = q
    ? services.filter((s) =>
        matchesQuery(q, [s.title, s.description, s.provider.name, s.provider.role, ...s.tags]),
      )
    : [];
  const total = courseHits.length + resourceHits.length + serviceHits.length;
  const qs = `?q=${encodeURIComponent(q)}`;

  return (
    <div>
      <CatalogSearch
        id="site-search"
        label="Search GrowPilot"
        placeholder="Search courses, books, services or topics"
        value={query}
        onChange={setQuery}
        autoFocus
      />

      {!q ? (
        <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-slate-500">Popular:</span>
          {popular.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setQuery(term)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
            >
              {term}
            </button>
          ))}
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-slate-600" aria-live="polite">
            <span className="font-semibold text-slate-900">{total}</span>{" "}
            {total === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
          </p>

          {total === 0 ? (
            <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <SearchX className="size-10 text-slate-400" aria-hidden="true" />
              <p className="mt-4 font-display text-lg font-bold text-slate-900">Nothing matches</p>
              <p className="mt-1 text-sm text-slate-500">
                Try a shorter or different search, such as a subject or skill.
              </p>
            </div>
          ) : (
            <>
              <ResultSection
                title="Courses"
                count={courseHits.length}
                href={`/courses${qs}`}
              >
                {courseHits.slice(0, PREVIEW).map((course) => (
                  <li key={course.slug}>
                    <CourseCard course={course} />
                  </li>
                ))}
              </ResultSection>
              <ResultSection
                title="Library"
                count={resourceHits.length}
                href={`/library${qs}`}
              >
                {resourceHits.slice(0, PREVIEW).map((resource) => (
                  <li key={resource.slug}>
                    <ResourceCard resource={resource} />
                  </li>
                ))}
              </ResultSection>
              <ResultSection
                title="Services"
                count={serviceHits.length}
                href={`/marketplace${qs}`}
              >
                {serviceHits.slice(0, PREVIEW).map((service) => (
                  <li key={service.slug}>
                    <ServiceCard service={service} />
                  </li>
                ))}
              </ResultSection>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ResultSection({
  title,
  count,
  href,
  children,
}: {
  title: string;
  count: number;
  href: string;
  children: ReactNode;
}) {
  if (count === 0) return null;
  const id = `results-${title.toLowerCase()}`;

  return (
    <section aria-labelledby={id} className="mt-10">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id={id}
          className="border-l-4 border-brand-500 pl-3 font-display text-xl font-bold tracking-tight text-slate-900"
        >
          {title} <span className="font-sans text-base font-medium text-slate-500">({count})</span>
        </h2>
        {count > PREVIEW && (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1 rounded-md text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            See all {count}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
    </section>
  );
}
