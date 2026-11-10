"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  defaultFilters,
  filterCourses,
  filtersToSearch,
  hasActiveFilters,
  parseFilters,
  type CourseFilters as Filters,
} from "@/lib/course-filters";
import type { Course } from "@/types/course";
import { CourseFilters } from "./CourseFilters";
import { CourseGrid } from "./CourseGrid";
import { CourseSearch } from "./CourseSearch";

type CourseCatalogueProps = {
  courses: Course[];
  initialFilters?: Filters;
  /** Keep filters in the address bar so Back from a course restores them. */
  syncUrl?: boolean;
};

/** Search, filters and results for the course catalogue. */
export function CourseCatalogue({
  courses,
  initialFilters = defaultFilters,
  syncUrl = false,
}: CourseCatalogueProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [urlRead, setUrlRead] = useState(!syncUrl);
  const results = useMemo(() => filterCourses(courses, filters), [courses, filters]);
  const filtered = hasActiveFilters(filters);

  // Start from any filters already in the address (e.g. after pressing Back).
  useEffect(() => {
    if (!syncUrl) return;
    setFilters(parseFilters(new URLSearchParams(window.location.search)));
    setUrlRead(true);
  }, [syncUrl]);

  // Then keep the address up to date as filters change.
  useEffect(() => {
    if (!syncUrl || !urlRead) return;
    const url = `${window.location.pathname}${filtersToSearch(filters)}`;
    window.history.replaceState(window.history.state, "", url);
  }, [filters, syncUrl, urlRead]);

  const update = (patch: Partial<Filters>) => setFilters((current) => ({ ...current, ...patch }));
  const reset = () => setFilters(defaultFilters);

  return (
    <div>
      <div className="rounded-3xl border border-line bg-surface/70 p-4 shadow-header sm:p-8">
        <CourseSearch value={filters.query} onChange={(query) => update({ query })} />
        <div className="mt-7 border-t border-line pt-7">
          <CourseFilters
            category={filters.category}
            level={filters.level}
            onCategoryChange={(category) => update({ category })}
            onLevelChange={(level) => update({ level })}
          />
        </div>
      </div>

      <div className="mt-10 flex min-h-12 flex-wrap items-center justify-between gap-4">
        <p role="status" className="text-xl font-semibold text-ink">
          Showing {results.length} {results.length === 1 ? "course" : "courses"}
        </p>
        {filtered && results.length > 0 && (
          <Button variant="secondary" onClick={reset}>
            <RotateCcw aria-hidden="true" className="size-5" />
            Show all courses
          </Button>
        )}
      </div>

      <div className="mt-6">
        {results.length > 0 ? (
          <>
            <h2 className="sr-only">Courses</h2>
            <CourseGrid courses={results} />
          </>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-line bg-surface px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <SearchX aria-hidden="true" className="size-8" />
            </span>
            {/* With nothing in the catalogue at all, telling somebody to
                search differently would send them in circles. */}
            <h2 className="mt-5 text-2xl font-bold text-ink">
              {courses.length === 0 ? "No courses yet." : "No courses found."}
            </h2>
            <p className="mt-2 max-w-md text-lg text-ink-muted">
              {courses.length === 0
                ? "Our courses are being prepared. Please check back soon."
                : "Try searching for something else, or choose a different topic or level."}
            </p>
            {courses.length > 0 && (
              <Button size="lg" onClick={reset} className="mt-6">
                <RotateCcw aria-hidden="true" className="size-5" />
                Show all courses
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
