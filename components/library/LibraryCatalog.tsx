"use client";

import { useMemo } from "react";
import {
  CatalogResults,
  CatalogSearch,
  CatalogSelect,
  FilterPills,
} from "@/components/catalog/CatalogControls";
import { matchesQuery, parseOption, useUrlFilters } from "@/components/catalog/useUrlFilters";
import ResourceCard from "@/components/library/ResourceCard";
import { resourceKinds, resources, type Resource, type ResourceKind } from "@/lib/library";
import { subjects, type Subject } from "@/lib/subjects";

const sorts = {
  popular: { label: "Most downloaded", compare: (a, b) => b.downloads - a.downloads },
  newest: { label: "Newest first", compare: (a, b) => b.year - a.year },
  shortest: { label: "Shortest first", compare: (a, b) => a.pages - b.pages },
} satisfies Record<string, { label: string; compare: (a: Resource, b: Resource) => number }>;

type SortKey = keyof typeof sorts;
const sortKeys = Object.keys(sorts) as SortKey[];

/** Library grid with search, subject, type and sort — all mirrored in the URL so results are shareable. */
export default function LibraryCatalog() {
  const { params, query, setQuery, update, clearAll } = useUrlFilters();

  const subject = parseOption<Subject>(params.get("subject"), subjects);
  const kind = parseOption<ResourceKind>(params.get("type"), resourceKinds);
  const sort = parseOption(params.get("sort"), sortKeys) ?? "popular";

  const visible = useMemo(
    () =>
      resources
        .filter((r) => !subject || r.subject === subject)
        .filter((r) => !kind || r.kind === kind)
        .filter((r) => matchesQuery(query, [r.title, r.subject, r.kind, r.author, r.description]))
        .sort(sorts[sort].compare),
    [query, subject, kind, sort],
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <CatalogSearch
          id="library-search"
          label="Search the library"
          placeholder="Search by title, topic or author"
          value={query}
          onChange={setQuery}
        />
        <div className="flex gap-3">
          <CatalogSelect
            id="library-type"
            label="Type"
            value={kind ?? ""}
            onChange={(value) => update({ type: value || null })}
            options={[
              { value: "", label: "All types" },
              ...resourceKinds.map((k) => ({ value: k, label: k })),
            ]}
          />
          <CatalogSelect
            id="library-sort"
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
        total={resources.length}
        noun="resources"
        hasFilters={Boolean(query.trim() || subject || kind)}
        onClear={clearAll}
      >
        {visible.map((resource) => (
          <li key={resource.slug}>
            <ResourceCard resource={resource} />
          </li>
        ))}
      </CatalogResults>
    </div>
  );
}
