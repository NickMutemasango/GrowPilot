import { stat } from "node:fs/promises";
import path from "node:path";
import { getCourseBySlug, getCourseDetails } from "@/lib/courses";
import { getLessonStore } from "@/lib/lesson-store";
import type {
  AvailableResource,
  CourseLesson,
  LearningModule,
  LessonPageData,
  LessonResource,
  LessonSummary,
} from "@/types/learning";

/*
 * Lesson player data. Server-only: it reads the file system to check that
 * downloads really exist.
 *
 * COURSE ACCESS: every lesson request goes through the lesson store, which
 * decides on the server whether this person may open the course and then
 * supplies the content. With no store configured nothing can be opened and
 * every lesson address returns `undefined`, which the page shows as "not
 * found" — see ./lesson-store.ts.
 */

/** "Switching a Computer On and Off" → "switching-a-computer-on-and-off". */
export function lessonSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function lessonHref(courseSlug: string, slug: string): string {
  return `/learn/${courseSlug}/${slug}`;
}

async function getOpenCourse(courseSlug: string) {
  const store = getLessonStore();
  if (!store) return undefined;

  // The access check comes first, so nothing about a course is read for
  // somebody who may not open it. There is no session yet, so the student
  // is null and only genuinely open courses can pass.
  if (!(await store.canOpen({ courseSlug, studentId: null }))) return undefined;

  const content = await store.findContent(courseSlug);
  if (!content) return undefined;

  const [course, details] = await Promise.all([
    getCourseBySlug(courseSlug),
    getCourseDetails(courseSlug),
  ]);
  if (!course || !details) return undefined;

  let number = 0;
  const modules: LearningModule[] = details.modules.map((courseModule) => ({
    title: courseModule.title,
    lessons: courseModule.lessons.map((lesson) => {
      number += 1;
      const slug = lessonSlug(lesson.title);
      return { ...lesson, slug, number, href: lessonHref(courseSlug, slug) };
    }),
  }));

  return { course, modules, content, totalLessons: number };
}

export async function getLessonPage(
  courseSlug: string,
  slug: string,
): Promise<LessonPageData | undefined> {
  const open = await getOpenCourse(courseSlug);
  if (!open) return undefined;

  const allLessons = open.modules.flatMap((courseModule) => courseModule.lessons);
  const index = allLessons.findIndex((lesson) => lesson.slug === slug);
  if (index === -1) return undefined;

  const moduleIndex = open.modules.findIndex((courseModule) =>
    courseModule.lessons.some((lesson) => lesson.slug === slug),
  );
  const content = open.content[slug] ?? null;

  return {
    course: open.course,
    modules: open.modules,
    totalLessons: open.totalLessons,
    lesson: {
      ...allLessons[index],
      moduleNumber: moduleIndex + 1,
      moduleTitle: open.modules[moduleIndex].title,
      content,
      resources: await getAvailableResources(content?.resources ?? []),
    },
    previous: allLessons[index - 1] ?? null,
    next: allLessons[index + 1] ?? null,
  };
}

/**
 * Every lesson of an open course in order, with its module title, so the
 * browser can work out progress. `undefined` if the course can't be opened here.
 */
export async function getCourseLessons(courseSlug: string): Promise<CourseLesson[] | undefined> {
  return (await getOpenCourse(courseSlug))?.modules.flatMap((courseModule) =>
    courseModule.lessons.map((lesson) => ({ ...lesson, moduleTitle: courseModule.title })),
  );
}

/** The first lesson of an open course, for /learn/[courseSlug]. */
export async function getFirstLesson(courseSlug: string): Promise<LessonSummary | undefined> {
  return (await getOpenCourse(courseSlug))?.modules[0]?.lessons[0];
}

/** Link to lesson number `number`, or `null` if the course can't be opened here. */
export async function getLessonHrefByNumber(
  courseSlug: string,
  number: number,
): Promise<string | null> {
  const open = await getOpenCourse(courseSlug);
  const lesson = open?.modules
    .flatMap((courseModule) => courseModule.lessons)
    .find((item) => item.number === number);
  return lesson?.href ?? null;
}

export async function getAllLessonParams(): Promise<{ courseSlug: string; lessonSlug: string }[]> {
  const slugs = (await getLessonStore()?.listOpenCourseSlugs()) ?? [];
  const courses = await Promise.all(slugs.map(getOpenCourse));
  return courses.flatMap((open) =>
    open
      ? open.modules.flatMap((courseModule) =>
          courseModule.lessons.map((lesson) => ({
            courseSlug: open.course.slug,
            lessonSlug: lesson.slug,
          })),
        )
      : [],
  );
}

/** Keeps only downloads whose file is really in /public, so no button is ever broken. */
async function getAvailableResources(resources: LessonResource[]): Promise<AvailableResource[]> {
  const checked = await Promise.all(
    resources.map(async (resource) => {
      if (!resource.href.startsWith("/")) return null;
      try {
        const file = await stat(path.join(process.cwd(), "public", resource.href));
        return file.isFile() ? { ...resource, sizeLabel: formatFileSize(file.size) } : null;
      } catch {
        return null;
      }
    }),
  );
  return checked.filter((resource): resource is AvailableResource => resource !== null);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
