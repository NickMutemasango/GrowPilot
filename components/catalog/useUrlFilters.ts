"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function parseOption<T extends string>(value: string | null, allowed: readonly T[]): T | null {
  return allowed.includes(value as T) ? (value as T) : null;
}

/**
 * Catalog filters kept in the URL so results are shareable. The search text also lives in
 * local state so typing stays responsive while the URL catches up.
 * Must render inside a <Suspense> boundary (it reads search params).
 */
export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQueryState] = useState(params.get("q") ?? "");

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function setQuery(value: string) {
    setQueryState(value);
    update({ q: value.trim() || null });
  }

  function clearAll() {
    setQueryState("");
    router.replace(pathname, { scroll: false });
  }

  return { params, query, setQuery, update, clearAll };
}

/** Case-insensitive match of the query against any of the given fields. */
export function matchesQuery(query: string, fields: string[]) {
  const q = query.trim().toLowerCase();
  return !q || fields.some((field) => field.toLowerCase().includes(q));
}
