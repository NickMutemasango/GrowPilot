"use client";

import { useMemo } from "react";
import { CatalogResults, CatalogSearch } from "@/components/catalog/CatalogControls";
import { matchesQuery, useUrlFilters } from "@/components/catalog/useUrlFilters";
import ServiceCard from "@/components/marketplace/ServiceCard";
import { services } from "@/lib/marketplace";

/** Service listings with a search box mirrored in the URL (?q=) so results are shareable. */
export default function ServiceCatalog() {
  const { query, setQuery, clearAll } = useUrlFilters();

  const visible = useMemo(
    () =>
      services.filter((s) =>
        matchesQuery(query, [s.title, s.description, s.provider.name, s.provider.role, ...s.tags]),
      ),
    [query],
  );

  return (
    <div>
      <CatalogSearch
        id="marketplace-search"
        label="Search services"
        placeholder="Search by service, skill or provider, e.g. React, Figma, SEO"
        value={query}
        onChange={setQuery}
      />

      <CatalogResults
        shown={visible.length}
        total={services.length}
        noun="services"
        hasFilters={Boolean(query.trim())}
        onClear={clearAll}
      >
        {visible.map((service) => (
          <li key={service.slug}>
            <ServiceCard service={service} />
          </li>
        ))}
      </CatalogResults>
    </div>
  );
}
