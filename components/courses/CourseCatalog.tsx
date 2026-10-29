"use client";

import { useMemo } from "react";
import {
  CatalogResults,
  CatalogSearch,
  CatalogSelect,
  FilterPills,
} from "@/components/catalog/CatalogControls";
import { matchesQuery, parseOption, useUrlFilters } from "@/components/catalog/useUrlFilters";
import CourseCard from "@/components/courses/CourseCard";
import { courses, levels, type Course, type Level } from "@/lib/courses";
import { subjects, type Subject } from "@/lib/subjects";

const sorts = {
  popular: { label: "Most popular", compare: (a, b) => b.students - a.students },
  rating: { label: "Highest rated", compare: (a, b) => b.rating - a.rating },
  shortest: { label: "Shortest first", compare: (a, b) => a.hours - b.hours },
} satisfies Record<string, { label: string; compare: (a: Course, b: Course) => number }>;

type SortKey = keyof typeof sorts;
const sortKeys = Object.keys(sorts) as SortKey[];

/** Course grid with search, subject, level and sort — all mirrored in the URL so results are shareable. */
export default function CourseCatalog() {
  const { params, query, setQuery, update, clearAll } = useUrlFilters();

  const subject = parseOption<Subject>(params.get("subject"), subjects);
  const level = parseOption<Level>(params.get("level"), levels);
  const sort = parseOption(params.get("sort"), sortKeys) ?? "popular";

  const visible = useMemo(
    () =>
      courses
        .filter((c) => !subject || c.subject === subject)
        .filter((c) => !level || c.level === level)
        .filter((c) => matchesQuery(query, [c.title, c.subject, c.instructor, c.description]))
        .sort(sorts[sort].compare),
    [query, subject, level, sort],
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <CatalogSearch
          id="course-search"
          label="Search courses"
          placeholder="Search by title, topic or instructor"
          value={query}
          onChange={setQuery}
        />
        <div className="flex gap-3">
          <CatalogSelect
            id="course-level"
            label="Level"
            value={level ?? ""}
            onChange={(value) => update({ level: value || null })}
            options={[
              { value: "", label: "All levels" },
              ...levels.map((l) => ({ value: l, label: l })),
            ]}
          />
          <CatalogSelect
            id="course-sort"
            label="Sort by"
            value={sort}
            onChange={(value) => update({ sort: value === "popular" ? null : value })}
            options={sortKeys.map((key) => ({ value: key, label: sorts[key].label }))}
          />
        </div>
      </div>

      <FilterPills
        label="Filter by subject"
        options={subjects}
        value={subject}
        onChange={(value) => update({ subject: value })}
      />

      <CatalogResults
        shown={visible.length}
        total={courses.length}
        noun="courses"
        hasFilters={Boolean(query.trim() || subject || level)}
        onClear={clearAll}
      >
        {visible.map((course) => (
          <li key={course.slug}>
            <CourseCard course={course} />
          </li>
        ))}
      </CatalogResults>
    </div>
  );
}
