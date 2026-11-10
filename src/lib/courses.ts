import { getCatalogueStore } from "@/lib/catalogue-store";
import type { Course, CourseDetails } from "@/types/course";

/*
 * Data access for the public course catalogue. Pages and every other
 * service call these functions rather than a database directly, so
 * connecting a backend means implementing one file: ./catalogue-store.ts.
 *
 * With no store configured they return nothing, and each page shows its
 * own empty state.
 */

export async function getAllCourses(): Promise<Course[]> {
  return (await getCatalogueStore()?.listPublished()) ?? [];
}

export async function getCourseBySlug(slug: string): Promise<Course | undefined> {
  return (await getCatalogueStore()?.findPublished(slug)) ?? undefined;
}

export async function getCourseDetails(slug: string): Promise<CourseDetails | undefined> {
  return (await getCatalogueStore()?.findDetails(slug)) ?? undefined;
}
