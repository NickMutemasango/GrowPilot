import type { Course, CourseDetails } from "@/types/course";

/*
 * Where the public course catalogue is read from.
 *
 * NO DATABASE OR CMS IS CONFIGURED YET, so `getCatalogueStore` returns null
 * and the catalogue is empty: /courses shows its "no courses" state and any
 * course address returns "not found". Nothing is invented.
 *
 * When courses live in a database, implement this against it:
 *
 *  - `listPublished` returns only courses an administrator has published.
 *    Draft, submitted, rejected and unpublished courses must never reach a
 *    student, so filter on the server, not in the browser.
 *  - `findPublished` does the same for one course, by its address (slug).
 *    Return null rather than a hidden course, so a draft can't be read by
 *    guessing its address.
 *  - `findDetails` returns the long description, outcomes, modules,
 *    requirements and audience for a course page. It is separate from the
 *    card data above because the catalogue page needs twelve cards but no
 *    curriculum, and fetching both together would be wasteful.
 *  - Prices are whole US dollars, or null for a free course. Keep the
 *    currency with the amount if more than one is ever added.
 *  - Slugs are unique and stable: they appear in addresses students may
 *    have bookmarked, and in certificates.
 */
export type CatalogueStore = {
  listPublished(): Promise<Course[]>;
  findPublished(slug: string): Promise<Course | null>;
  findDetails(slug: string): Promise<CourseDetails | null>;
};

export function getCatalogueStore(): CatalogueStore | null {
  return null;
}
